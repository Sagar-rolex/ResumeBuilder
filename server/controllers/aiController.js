import Resume from "../models/Resume.js";
import ai, { aiConfigStatus, aiModel, aiProvider } from "../configs/ai.js";
import { hasResumeContent, sanitizeResumeData } from "../utils/resumeData.js";
import { getAiProviderFailure, sendAiProviderFailure } from "../utils/aiProviderErrors.js";

const MAX_INPUT_LENGTH = 25000;

const sanitizeInput = (text) => {
  if (typeof text !== "string") return "";
  return text.trim().slice(0, MAX_INPUT_LENGTH);
};

// POST: /api/ai/enhance-pro-sum
export const enhanceProfessionalSummary = async (req, res) => {
  try {
    const { userContent } = req.body || {};
    if (typeof userContent === "string" && userContent.trim().length > MAX_INPUT_LENGTH) {
      return res.status(413).json({ message: `Summary must be ${MAX_INPUT_LENGTH} characters or fewer` });
    }
    const sanitized = sanitizeInput(userContent);

    if (!sanitized) {
      return res.status(400).json({ message: "Professional summary content is required" });
    }

    const response = await ai.chat.completions.create({
      model: aiModel,
      messages: [
        {
          role: "system",
          content:
            "You are an expert resume writer. Improve clarity, concision, and ATS readability while preserving the user's meaning. Use only facts explicitly present in the supplied text. Never add or infer experience, qualifications, skills, achievements, outcomes, or metrics. Return only the revised text.",
        },
        { role: "user", content: sanitized },
      ],
    });

    const enhancedContent = response.choices?.[0]?.message?.content?.trim();
    if (!enhancedContent) throw new Error("AI provider returned an empty response");
    return res.status(200).json({ enhancedContent });
  } catch (error) {
    return sendAiProviderFailure(res, error, "enhance professional summary");
  }
};

// POST: /api/ai/enhance-job-desc
export const enhanceJobDescription = async (req, res) => {
  try {
    const { userContent } = req.body || {};
    if (typeof userContent === "string" && userContent.trim().length > MAX_INPUT_LENGTH) {
      return res.status(413).json({ message: `Description must be ${MAX_INPUT_LENGTH} characters or fewer` });
    }
    const sanitized = sanitizeInput(userContent);

    if (!sanitized) {
      return res.status(400).json({ message: "Job description content is required" });
    }

    const response = await ai.chat.completions.create({
      model: aiModel,
      messages: [
        {
          role: "system",
          content:
            "You are an expert resume writer. Improve the supplied resume description for clarity, action, and ATS readability. Preserve the original facts and meaning. Never invent responsibilities, tools, skills, outcomes, achievements, or numerical metrics. Return only the revised text.",
        },
        { role: "user", content: sanitized },
      ],
    });

    const enhancedContent = response.choices?.[0]?.message?.content?.trim();
    if (!enhancedContent) throw new Error("AI provider returned an empty response");
    return res.status(200).json({ enhancedContent });
  } catch (error) {
    return sendAiProviderFailure(res, error, "enhance resume description");
  }
};

// POST: /api/ai/upload-resume
export const uploadResume = async (req, res) => {
  const { resumeText, title } = req.body || {};
  const sanitizedText = sanitizeInput(resumeText);
  const sanitizedTitle = sanitizeInput(title) || "Uploaded Resume";

  if (!sanitizedText) {
    return res.status(400).json({ message: "No readable text was extracted from the PDF. Try a text-based PDF or enter your details manually." });
  }

  const systemPrompt = "Extract resume facts faithfully. Return only a valid JSON object. Do not invent missing details.";
  const userPrompt = `Extract the resume into this JSON structure. Use empty strings and arrays for information that is absent:

{
  "professional_summary": "",
  "skills": [],
  "personal_info": {
    "full_name": "",
    "profession": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "website": ""
  },
  "experience": [
    {
      "company": "",
      "position": "",
      "start_date": "",
      "end_date": "",
      "description": "",
      "is_current": false
    }
  ],
  "project": [
    {
      "name": "",
      "type": "",
      "description": ""
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "graduation_date": "",
      "gpa": ""
    }
  ],
  "certifications": [],
  "languages": [],
  "achievements": []
}

Resume text:
${sanitizedText}`;

  let content;
  try {
    const response = await ai.chat.completions.create({
      model: aiModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
    content = response.choices?.[0]?.message?.content;
  } catch (error) {
    console.error("uploadResume parser failure", {
      name: error?.name,
      code: error?.code,
      status: error?.status,
    });
    return res.status(502).json({
      code: "RESUME_PARSER_UNAVAILABLE",
      message: "Resume parsing is temporarily unavailable. Please try again shortly.",
    });
  }

  let parsedData;
  try {
    if (typeof content !== "string" || !content.trim()) throw new Error("Empty parser response");
    const jsonText = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    parsedData = JSON.parse(jsonText);
  } catch {
    return res.status(422).json({
      code: "RESUME_PARSE_INVALID",
      message: "The parser could not read the extracted resume text. Try another PDF or enter your details manually.",
    });
  }

  const resumeData = sanitizeResumeData(parsedData);
  if (!hasResumeContent(resumeData)) {
    return res.status(422).json({
      code: "RESUME_CONTENT_NOT_FOUND",
      message: "No resume details could be identified in this PDF. Try a text-based PDF or enter your details manually.",
    });
  }

  try {
    const newResume = await Resume.create({ ...resumeData, userId: req.userId, title: sanitizedTitle });
    return res.status(201).json({ message: "Resume imported successfully", resumeId: newResume._id, resume: newResume });
  } catch (error) {
    console.error("uploadResume persistence failure", { name: error?.name, code: error?.code });
    return res.status(500).json({
      code: "RESUME_SAVE_FAILED",
      message: "The resume was parsed, but could not be saved. Please try again.",
    });
  }
};

// GET: /api/ai/status
export const aiStatus = async (_req, res) => {
  try {
    const config = aiConfigStatus();
    if (!config.configured) {
      const failure = getAiProviderFailure({
        code: config.configurationCode,
        status: 503,
        message: "AI configuration validation failed",
      });
      return res.status(failure.status).json({
        status: "not_configured",
        code: failure.code,
        message: failure.message,
        provider: aiProvider,
        model: aiModel || null,
        endpoint: config.endpoint,
        apiKeyPresent: config.apiKeyPresent,
        apiKeyVariable: config.apiKeyVariable,
      });
    }
    const response = await ai.chat.completions.create({
      model: aiModel,
      messages: [
        { role: "system", content: "You are a simple assistant. Reply with 'pong' when you receive 'ping'." },
        { role: "user", content: "ping" },
      ],
      max_tokens: 5,
    });

    const text = response.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) {
      return res.status(502).json({ status: "error", code: "AI_EMPTY_RESPONSE" });
    }
    return res.status(200).json({
      status: "ok",
      provider: aiProvider,
      model: aiModel,
      endpoint: config.endpoint,
      apiKeyPresent: config.apiKeyPresent,
      apiKeyVariable: config.apiKeyVariable,
      reply: text.trim(),
    });
  } catch (error) {
    const failure = sendAiProviderFailure(res, error, "provider status check");
    return failure;
  }
};

// POST: /api/ai/chat
export const chatSupport = async (req, res) => {
  try {
    const { message, history } = req.body || {};
    if (typeof message === "string" && message.trim().length > 4000) {
      return res.status(413).json({ message: "Message must be 4000 characters or fewer" });
    }
    const sanitized = sanitizeInput(message);

    if (!sanitized) {
      return res.status(400).json({ message: "Message is required" });
    }

    const conversation = Array.isArray(history)
      ? history.slice(-10).flatMap((item) => {
          if (!item || !["user", "assistant"].includes(item.role)) return [];
          const content = sanitizeInput(item.content).slice(0, 2000);
          return content ? [{ role: item.role, content }] : [];
        })
      : [];

    const response = await ai.chat.completions.create({
      model: aiModel,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful chatbot for a resume builder application. Answer questions about resume writing, career advice, job applications, and using the resume builder. Keep responses concise and helpful. Redirect non-resume topics politely.",
        },
        ...conversation,
        { role: "user", content: sanitized },
      ],
    });

    const botResponse = response.choices?.[0]?.message?.content?.trim();
    if (!botResponse) throw new Error("AI provider returned an empty response");
    return res.status(200).json({ response: botResponse });
  } catch (error) {
    return sendAiProviderFailure(res, error, "resume assistant chat");
  }
};

// POST: /api/ai/interview-prep
export const generateInterviewPrep = async (req, res) => {
  try {
    const { resumeText, jobTitle } = req.body;
    const sanitizedText = sanitizeInput(resumeText);
    const sanitizedJob = sanitizeInput(jobTitle) || "Target Position";

    if (!sanitizedText) {
      return res.status(400).json({ message: "Resume content is required for interview prep" });
    }

    const prompt = `Based on the following resume and target job title "${sanitizedJob}", generate 6 tailored interview questions (a mix of technical, behavioral, and situational questions) along with detailed suggested talking points or answers for each.

Return ONLY a JSON object in this exact structure (no markdown fences, no extra text):
{
  "role": "${sanitizedJob}",
  "questions": [
    {
      "category": "Behavioral",
      "question": "...",
      "suggested_answer": "...",
      "key_tips": "..."
    }
  ]
}

Resume text:
${sanitizedText}`;

    const response = await ai.chat.completions.create({
      model: aiModel,
      messages: [
        { role: "system", content: "You are an expert technical interviewer and career coach. Always return valid JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const data = JSON.parse(response.choices[0].message.content);
    return res.status(200).json(data);
  } catch (error) {
    return sendAiProviderFailure(res, error, "interview preparation");
  }
};
