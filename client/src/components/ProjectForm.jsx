import { Plus, Trash2, Loader2, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import api from "../api";
import toast from "react-hot-toast";
import AiSuggestionReview from "./AiSuggestionReview";

const ProjectForm = ({ data, onChange }) => {
  const [generatingIndex, setGeneratingIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState({});

  const addProject = () =>{
      const newProject = {
          name: "",
          type: "",
          description: "",
      };
      onChange([...data, newProject])
  }

  const removeProject = (index)=>{
      const updated = data.filter((_, i)=> i !== index);
      onChange(updated)
      setSuggestions((previous) => Object.fromEntries(
        Object.entries(previous)
          .filter(([key]) => Number(key) !== index)
          .map(([key, value]) => [Number(key) > index ? Number(key) - 1 : Number(key), value]),
      ));
  }

  const updateProject = (index, field, value)=>{
      const updated = [...data];
      updated[index] = {...updated[index], [field]: value}
      onChange(updated)
  }

  const generateProjectDescription = async (index) => {
    setGeneratingIndex(index);
    const project = data[index];
    if (!project.description?.trim()) {
      toast.error("Add a project description before asking AI to enhance it.");
      setGeneratingIndex(-1);
      return;
    }

    try {
      const { data: resData } = await api.post(
        "/ai/enhance-job-desc",
        { userContent: project.description },
      );
      setSuggestions((previous) => ({ ...previous, [index]: resData.enhancedContent }));
      toast.success("Review the AI suggestion before applying it.");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setGeneratingIndex(-1);
    }
  };

  return (
    <div>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
            <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'> Projects </h3>
            <p className='text-sm text-gray-500'>Add your key projects</p>
        </div>
        <button onClick={addProject} className='flex min-h-11 w-fit items-center gap-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors'>
            <Plus className="size-4"/>
            Add Project
        </button>
      </div>

        <div className='space-y-4 mt-6'>
            {data.map((project, index)=>(
                <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className='flex justify-between items-start'>
                        <h4>Project #{index + 1}</h4>
                        <button onClick={()=> removeProject(index)} className='text-red-500 hover:text-red-700 transition-colors'>
                            <Trash2 className="size-4"/>
                        </button>
                    </div>

                    <div className='grid gap-3'>

                        <input value={project.name || ""} onChange={(e)=>updateProject(index, "name", e.target.value)} type="text" placeholder="Project Name" className="px-3 py-2 text-sm rounded-lg border border-gray-300"/>

                        <input value={project.type || ""} onChange={(e)=>updateProject(index, "type", e.target.value)} type="text" placeholder="Project Type / Technologies (e.g. React, Node.js)" className="px-3 py-2 text-sm rounded-lg border border-gray-300"/>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-gray-600">Project Description</label>
                            <button
                              onClick={() => generateProjectDescription(index)}
                              disabled={generatingIndex === index || !project.name || !project.description?.trim()}
                              className="flex min-h-10 shrink-0 items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50"
                            >
                              {generatingIndex === index ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Sparkles className="w-3 h-3" />
                              )}
                              Words that match what you do
                            </button>
                          </div>
                          <textarea rows={4} value={project.description || ""} onChange={(e)=>updateProject(index, "description", e.target.value)} placeholder="Describe your project, features, and impact..." className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 resize-none"/>
                          {suggestions[index] && (
                            <AiSuggestionReview
                              value={suggestions[index]}
                              onChange={(value) => setSuggestions((previous) => ({ ...previous, [index]: value }))}
                              onReject={() => setSuggestions((previous) => {
                                const next = { ...previous };
                                delete next[index];
                                return next;
                              })}
                              onAccept={() => {
                                updateProject(index, "description", suggestions[index]);
                                setSuggestions((previous) => {
                                  const next = { ...previous };
                                  delete next[index];
                                  return next;
                                });
                              }}
                            />
                          )}
                        </div>

                    </div>


                </div>
            ))}
        </div>

    </div>
  )
}

export default ProjectForm
