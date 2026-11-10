import React from "react";
import { Link } from "react-router-dom";
import Hero from "../components/home/Hero";
import Features from "../components/home/Features";
import Testimonial from "../components/home/Testimonial";
import CallToAction from "../components/home/CallToAction";
import Footer from "../components/home/Footer";
import { Sparkles, ArrowRight, FileText } from "lucide-react";

const Home = () => {
  const sampleTemplates = [
    { id: "template-1", name: "Modern Professional", desc: "Clean blue accent header with structured sections." },
    { id: "template-2", name: "Classic Executive", desc: "Traditional layout tailored for senior leadership." },
    { id: "template-3", name: "Tech Innovator", desc: "Optimized for software engineers and IT professionals." },
    { id: "template-17", name: "Executive Grid", desc: "Modern two-column grid layout with clean borders." },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Hero />

      {/* Templates Showcase Section */}
      <div id="templates" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-3">
            <Sparkles className="size-3.5" />
            <span>Recruiter Approved</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Explore Professional Templates</h2>
          <p className="text-slate-600 text-sm mt-3">
            Select any template to instantly start building your resume as a guest without signing up immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sampleTemplates.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="size-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileText className="size-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">{t.name}</h3>
                <p className="text-xs text-slate-500 mt-2">{t.desc}</p>
              </div>

              <Link
                to={`/app/builder/guest?template=${t.id}`}
                className="mt-6 w-full py-2.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <span>Use Template</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      <Features />
      <Testimonial />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Home;
