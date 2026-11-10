import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import ResumePreview from "../components/ResumePreview";
import Loader from "../components/Loader";
import { ArrowLeftIcon } from "lucide-react";
import api from "../api";

const Preview = ({ privatePreview = false }) => {
  const { resumeId } = useParams();
  const { token } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const loadResume = async () => {
      try {
        const { data } = privatePreview
          ? await api.get(`/resumes/get/${resumeId}`, { headers: { Authorization: token } })
          : await api.get(`/resumes/public/${resumeId}`);
        if (mountedRef.current) {
          setResumeData(data.resume);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err?.response?.data?.message || "Resume not found");
        }
      } finally {
        if (mountedRef.current) setIsLoading(false);
      }
    };

    loadResume();
    return () => { mountedRef.current = false; };
  }, [resumeId, privatePreview, token]);

  if (isLoading) return <Loader />;

  if (!resumeData) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-4 py-8">
        <p className="break-words text-center text-3xl sm:text-6xl text-slate-400 font-medium">
          {error || "Resume not found"}
        </p>
        <a
          href="/"
          className="mt-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6 h-9 m-1 ring-offset-1 ring-1 ring-blue-400 flex items-center transition-colors"
        >
          <ArrowLeftIcon className="mr-2 size-4" />
          Go to home page
        </a>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen">
      {privatePreview && (
        <div className="max-w-3xl mx-auto pt-4 sm:pt-6 px-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link to={`/app/builder/${resumeId}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">Back to editor</Link>
          <button onClick={() => window.print()} className="text-sm font-medium text-slate-700 hover:text-blue-600">Print / Save as PDF</button>
        </div>
      )}
      <div className="max-w-3xl mx-auto px-2 sm:px-4 py-4 sm:py-10">
        <ResumePreview
          data={resumeData}
          template={resumeData.template}
          accentColor={resumeData.accent_color}
          classes="py-4 bg-white"
        />
      </div>
    </div>
  );
};

export default Preview;
