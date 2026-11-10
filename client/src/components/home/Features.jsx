import React from "react";
import { ArrowRight, SearchCheck, Sparkles, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const featureImage = "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/features/group-image-1.png";

const Features = () => {
  const user = useSelector((state) => state.auth.user);
  const buildPath = user ? "/app" : "/app?state=register";

  const features = [
    {
      icon: <SearchCheck className="size-5" aria-hidden="true" />,
      title: "Real-Time ATS Insights",
      description: "Check your resume against ATS best practices and spot formatting or content gaps before you apply.",
      action: "Try ATS scoring",
      to: buildPath,
    },
    {
      icon: <Sparkles className="size-5" aria-hidden="true" />,
      title: "AI Writing Assistance",
      description: "Turn rough notes into clear, achievement-focused summaries and experience bullets.",
      action: "Use AI tools",
      to: buildPath,
    },
    {
      icon: <Target className="size-5" aria-hidden="true" />,
      title: "Job Matching & Interview Prep",
      description: "Tailor your resume to a role, find relevant skills, and prepare for interview questions.",
      action: "Build your resume",
      to: buildPath,
    },
  ];

  return (
    <section id="features" className="scroll-mt-20 bg-slate-50 px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            <Sparkles className="size-4" aria-hidden="true" />
            <span>Built for your next opportunity</span>
          </div>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Everything you need to build a stronger resume
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            Create, improve, and tailor your resume with practical tools designed for every step of your job search.
          </p>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="relative mx-auto w-full max-w-2xl">
            <div className="absolute -inset-5 rounded-[2rem] bg-violet-100/70 blur-2xl" aria-hidden="true" />
            <img
              src={featureImage}
              alt="Professionals working on resumes and career documents"
              loading="lazy"
              className="relative block h-auto w-full rounded-[2rem] object-cover shadow-xl shadow-slate-200/70"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {features.map(({ icon, title, description, action, to }) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    {icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-slate-900 sm:text-lg">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                    <Link
                      to={to}
                      className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                    >
                      {action}
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
