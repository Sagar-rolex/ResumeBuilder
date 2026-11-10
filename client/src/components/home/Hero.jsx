import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Sparkles, Star, ShieldCheck, Zap, FileText, Award, ChevronRight, Menu, X } from "lucide-react";

const Hero = () => {
  const { user } = useSelector((state) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30 text-slate-900 pb-20">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 flex items-center justify-between gap-3 w-full py-3 sm:py-4 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24">
        <a href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-blue-600">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm">
            <FileText className="size-5" />
          </div>
          <span>ResumeCraft<span className="text-slate-900">.ai</span></span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#home" className="hover:text-blue-600 transition">Home</a>
          <a href="#features" className="hover:text-blue-600 transition">Features</a>
          <a href="#templates" className="hover:text-blue-600 transition">Templates</a>
          <a href="#testimonials" className="hover:text-blue-600 transition">Testimonials</a>
        </div>

        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link
                to="/app?state=login"
                className="hidden md:block text-sm font-medium px-5 py-2.5 text-slate-700 hover:text-blue-600 transition"
              >
                Sign In
              </Link>
              <Link
                to="/app?state=register"
                className="min-h-11 px-3 sm:px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all rounded-full text-white text-xs sm:text-sm font-medium shadow-md shadow-blue-500/20 flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>Build Resume</span>
                <ArrowRight className="size-4" />
              </Link>
            </>
          ) : (
            <Link
              to="/app"
                className="hidden sm:flex min-h-11 items-center px-3 sm:px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all rounded-full text-xs sm:text-sm font-medium shadow-md shadow-blue-500/20 whitespace-nowrap"
            >
              Dashboard
            </Link>
          )}
                  </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden min-h-11 min-w-11 p-2 text-slate-700 rounded-lg hover:bg-slate-100" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation">
          {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div id="mobile-navigation" className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center text-lg gap-4 px-6 md:hidden">
          <button onClick={() => setMenuOpen(false)} className="absolute top-5 right-5 flex min-h-11 min-w-11 items-center justify-center p-2 text-slate-500 rounded-lg hover:bg-slate-100" aria-label="Close navigation menu">
            <X className="size-5" />
          </button>
          <a href="#home" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center font-medium text-slate-800">Home</a>
          <a href="#features" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center font-medium text-slate-800">Features</a>
          <a href="#templates" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center font-medium text-slate-800">Templates</a>
          <a href="#testimonials" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center font-medium text-slate-800">Testimonials</a>
          {!user && <Link to="/login" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center font-medium text-blue-700">Sign In</Link>}
          <Link to={user ? "/app" : "/app?state=register"} onClick={() => setMenuOpen(false)} className="mt-2 flex min-h-11 items-center px-8 py-3 bg-blue-600 text-white rounded-full font-medium">
            {user ? "Dashboard" : "Get Started Free"}
          </Link>
        </div>
      )}

      {/* Hero Content */}
      <div id="home" className="relative flex flex-col items-center text-center px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 pt-12 sm:pt-16 md:pt-24 max-w-6xl mx-auto">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[min(500px,100vw)] h-[500px] bg-blue-400/15 blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="size-3.5 fill-blue-600 text-blue-600" />
          <span>AI-Powered Resume Builder & ATS Optimizer</span>
        </div>

        {/* Title */}
        <h1 className="text-[clamp(2rem,8vw,3rem)] sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl leading-[1.15] break-words">
          Create a Professional Resume That Gets You Hired Fast
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl font-normal">
          Land interviews 3x faster with expert-designed templates, AI bullet point generator, and real-time ATS resume scoring.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Link
            to="/app?state=register"
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Create Your Resume Now</span>
            <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <span>See How It Works</span>
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-14 pt-8 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-blue-600" />
            <span>ATS-Friendly Formats</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-blue-600" />
            <span>Instant Word & PDF Export</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-blue-600" />
            <span>AI Bullet Generator</span>
          </div>
        </div>

        {/* Hero Preview Card / Image Mockup */}
        <div className="mt-16 w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 bg-white p-3 overflow-hidden">
          <div className="bg-slate-100 rounded-xl p-4 flex items-center justify-between border border-slate-200/60 mb-3">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-red-400 inline-block"></span>
              <span className="size-3 rounded-full bg-amber-400 inline-block"></span>
              <span className="size-3 rounded-full bg-blue-400 inline-block"></span>
              <span className="ml-2 text-xs font-medium text-slate-500">resume-preview.pdf</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
              <ShieldCheck className="size-3.5" /> ATS Score: 98/100
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left p-6 bg-gradient-to-br from-slate-50 to-blue-50/20 rounded-xl border border-slate-100">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/70">
              <div className="size-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                <Sparkles className="size-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Smart AI Tailoring</h3>
              <p className="text-sm text-slate-600 mt-1">Paste any job description and let AI tailor your resume bullets instantly.</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/70">
              <div className="size-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                <Award className="size-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Recruiter Approved</h3>
              <p className="text-sm text-slate-600 mt-1">Designed by hiring managers to pass automated applicant tracking systems.</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/70">
              <div className="size-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
                <Zap className="size-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">One-Click Exports</h3>
              <p className="text-sm text-slate-600 mt-1">Download instantly in Word (.doc), PDF, or print directly with perfect margins.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Hero;
