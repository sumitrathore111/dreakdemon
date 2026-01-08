import { ArrowRight, Award, BookOpen, Code, Play, Rocket, Sparkles, TrendingUp, Trophy, Users, Zap } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FeatureCard, ServiceCard, TestimonialCard } from "../components/HomePage/Cards";
import { useRevealAnimation } from "../components/hooks/useRevealAnimation";
import LiveUpdatesBot from "../components/LiveUpdatesBot";
import {
    features as homePageFeatures,
    galleryImages as homePageGallery,
    services as homePageServices,
    testimonials as homePageTestimonials,
    statistics
} from "../data/homePageData";

// Custom Hook for Parallax Scroll Effect
const useParallax = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollY;
};

// Custom Hook for Mouse Position
const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return mousePosition;
};

// Animated Counter Component
const AnimatedCounter = ({ target, suffix = "", duration = 2000 }: { target: number; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const increment = target / (duration / 16);
          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, hasAnimated]);

  return <div ref={ref}>{count}{suffix}</div>;
};

// Floating Element with Mouse Follow
const FloatingElement = ({ children, className, intensity = 20 }: { children: React.ReactNode; className?: string; intensity?: number }) => {
  const mousePosition = useMousePosition();
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    setOffset({
      x: (mousePosition.x - centerX) / intensity,
      y: (mousePosition.y - centerY) / intensity
    });
  }, [mousePosition, intensity]);

  return (
    <div
      className={className}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: 'transform 0.3s ease-out'
      }}
    >
      {children}
    </div>
  );
};

// Statistics Card Component
const StatCard = memo(({ stat, index }: { stat: typeof statistics[0]; index: number }) => {
  const { ref, isVisible } = useRevealAnimation(index * 100);

  return (
    <div
      ref={ref}
      className={`group relative bg-gradient-to-br ${stat.color} rounded-3xl p-8 text-white shadow-xl transform transition-all duration-700 hover:scale-105 hover:shadow-2xl ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl" />
      <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
        <stat.icon className="w-16 h-16" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <stat.icon className="w-6 h-6" />
          </div>
          <TrendingUp className="w-5 h-5 text-white/80" />
        </div>

        <div className="space-y-2">
          <div className="text-4xl font-black mb-1 group-hover:scale-110 transition-transform duration-300 origin-left">
            {stat.number}
          </div>
          <div className="text-lg font-bold text-white/90">{stat.label}</div>
          <div className="text-sm text-white/70">{stat.sublabel}</div>
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-white/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
});

StatCard.displayName = 'StatCard';

// Hero Section Component
const HeroSection = memo(() => {
  const { ref, isVisible } = useRevealAnimation();
  const scrollY = useParallax();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Enhanced Animated Background with Morphing Shapes */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-cyan-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
        <div className="absolute inset-0">
          {/* Morphing Blob Shapes */}
          <div
            className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-blue-400/30 to-cyan-400/20 dark:from-blue-500/20 dark:to-cyan-500/10 animate-blob animate-morph"
            style={{ transform: `translateY(${scrollY * 0.1}px)` }}
          />
          <div
            className="absolute bottom-32 right-16 w-96 h-96 bg-gradient-to-br from-cyan-400/25 to-blue-400/15 dark:from-cyan-500/15 dark:to-blue-500/10 animate-blob animate-morph"
            style={{ animationDelay: '2s', transform: `translateY(${scrollY * -0.15}px)` }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/15 dark:from-purple-500/15 dark:to-pink-500/10 animate-blob animate-morph"
            style={{ animationDelay: '4s', transform: `translate(-50%, -50%) translateY(${scrollY * 0.08}px)` }}
          />
          {/* Animated Gradient Ring */}
          <div className="absolute top-1/4 right-1/3 w-40 h-40 border-4 border-[#00ADB5]/20 dark:border-[#00ADB5]/30 rounded-full animate-spin-slow" />
          <div className="absolute bottom-1/4 left-1/4 w-32 h-32 border-2 border-cyan-400/30 dark:border-cyan-400/20 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }} />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div
            ref={ref}
            className={`space-y-8 transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/50 dark:border-gray-700 shadow-lg animate-magnetic spotlight">
              <Sparkles className="w-4 h-4 text-[#00ADB5] animate-pulse" />
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">🚀 Connect. Learn. Showcase. Succeed.</span>
            </div>

            {/* Main Heading with Neon Effect */}
            <div className="space-y-5">
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-tight">
                <span className="animate-fade-in inline-block">Learn by Doing</span>
                <br />
                <span className="bg-gradient-to-r from-[#00ADB5] via-cyan-500 to-blue-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] animate-fade-in-delay-1 inline-block">
                  Grow by Contributing
                </span>
              </h1>

              <p className="text-base lg:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl font-medium animate-fade-in-delay-1">
                SkillUpX is a smart platform designed for students who want to <span className="text-[#00ADB5] font-bold">learn, grow, and showcase</span> their abilities. Contribute to <span className="text-[#00ADB5] font-bold">real open-source projects</span>, collaborate with peers, and build a meaningful portfolio that impresses employers.
              </p>

              {/* Feature Highlights with Stagger Animation */}
              <div className="space-y-3 pt-2">
                {[
                  { text: "Collaborate", desc: "on projects & form teams", delay: "0.2s" },
                  { text: "Battle", desc: "in CodeArena & practice coding", delay: "0.4s" },
                  { text: "Gain", desc: "real-world experience instantly", delay: "0.6s" }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 group hover:translate-x-2 transition-all duration-300 opacity-0 animate-slide-left"
                    style={{ animationDelay: item.delay, animationFillMode: 'forwards' }}
                  >
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#00ADB5] to-cyan-500 group-hover:scale-150 transition-transform"></div>
                    <span><span className="font-bold text-[#00ADB5]">{item.text}</span> {item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons with Spotlight Effect */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 animate-fade-in-delay-3">
              <Link to="/signup" className="group relative px-6 py-3 bg-gradient-to-r from-[#00ADB5] to-cyan-600 text-white rounded-xl font-bold text-sm lg:text-base shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 inline-flex items-center justify-center overflow-hidden spotlight">
                <span className="relative z-10 flex items-center gap-2">
                  Start Your Journey
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>

              <button className="group flex items-center gap-2 px-6 py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-[#00ADB5]/20 hover:border-[#00ADB5] rounded-xl font-semibold text-sm lg:text-base text-gray-900 dark:text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ripple-effect">
                <div className="w-9 h-9 rounded-full bg-[#00ADB5]/10 flex items-center justify-center group-hover:bg-[#00ADB5] group-hover:scale-110 transition-all duration-300">
                  <Play className="w-3 h-3 text-[#00ADB5] group-hover:text-white ml-0.5 transition-colors" />
                </div>
                Watch Demo
              </button>
            </div>

            {/* Success Stats with Counter Animation */}
            <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700 animate-fade-in-delay-4">
              <div className="text-center hover:scale-110 transition-transform duration-300 group">
                <div className="text-2xl font-black bg-gradient-to-r from-[#00ADB5] to-cyan-600 bg-clip-text text-transparent">
                  <AnimatedCounter target={3000} suffix="+" />
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">DSA Problems</div>
              </div>
              <div className="w-px h-10 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
              <div className="text-center hover:scale-110 transition-transform duration-300 group">
                <div className="text-2xl font-black bg-gradient-to-r from-[#00ADB5] to-cyan-600 bg-clip-text text-transparent">
                  <AnimatedCounter target={500} suffix="+" />
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Live Projects</div>
              </div>
              <div className="w-px h-10 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
              <div className="text-center hover:scale-110 transition-transform duration-300 group">
                <div className="text-2xl font-black bg-gradient-to-r from-[#00ADB5] to-cyan-600 bg-clip-text text-transparent">
                  <AnimatedCounter target={12} suffix="K+" />
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Active Developers</div>
              </div>
            </div>
          </div>

          {/* Right Visual with Animated Tech Elements */}
          <div
            className={`relative -mt-8 transition-all duration-1000 delay-300 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            {/* Decorative Animated Frame with Glow */}
            <div className="absolute -inset-4 bg-gradient-to-br from-[#00ADB5]/20 via-purple-500/10 to-cyan-500/20 rounded-3xl blur-2xl animate-pulse-slow" />
            <div className="absolute -inset-2 bg-gradient-to-r from-[#00ADB5]/30 via-transparent to-purple-500/30 rounded-3xl blur-xl animate-magnetic" />

            <FloatingElement intensity={40}>
              <div className="relative group" style={{ perspective: '1000px' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#00ADB5]/40 to-cyan-600/30 rounded-3xl blur-3xl animate-magnetic" />

                {/* Animated Border Glow */}
                <div className="absolute -inset-[2px] bg-gradient-to-r from-[#00ADB5] via-purple-500 to-[#00ADB5] rounded-3xl opacity-75 blur-sm animate-gradient" style={{ backgroundSize: '200% 200%' }} />

                {/* Main Animated Container with 3D effect */}
                <div className="relative w-full h-[420px] rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700/40 backdrop-blur-sm bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 group-hover:scale-[1.02] transition-transform duration-700">

                  {/* Animated Grid Background */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `linear-gradient(rgba(0, 173, 181, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 173, 181, 0.4) 1px, transparent 1px)`,
                      backgroundSize: '30px 30px'
                    }} />
                  </div>

                  {/* Scanning Line Effect */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-[#00ADB5] to-transparent animate-scan-line" />
                  </div>

                  {/* Floating Particles */}
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-[#00ADB5] rounded-full animate-float-particle"
                        style={{
                          left: `${10 + (i * 8)}%`,
                          top: `${20 + (i % 4) * 20}%`,
                          animationDelay: `${i * 0.3}s`,
                          opacity: 0.6 + (i % 3) * 0.2
                        }}
                      />
                    ))}
                  </div>

                  {/* Floating Orbs - Enhanced */}
                  <div className="absolute top-6 left-6 w-24 h-24 bg-gradient-to-br from-[#00ADB5] to-cyan-400 rounded-full blur-2xl opacity-70 animate-blob" />
                  <div className="absolute bottom-10 right-10 w-36 h-36 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-2xl opacity-50 animate-blob" style={{ animationDelay: '2s' }} />
                  <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full blur-2xl opacity-60 animate-blob" style={{ animationDelay: '4s' }} />
                  <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-xl opacity-50 animate-blob" style={{ animationDelay: '3s' }} />

                  {/* Code Terminal Animation - Enhanced */}
                  <div className="absolute top-5 left-5 right-5 bg-gray-800/95 rounded-xl p-4 border border-[#00ADB5]/30 shadow-2xl shadow-[#00ADB5]/10 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700/50">
                      <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50" />
                      <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
                      <span className="ml-2 text-xs text-gray-400 font-mono flex items-center gap-1">
                        <Code className="w-3 h-3" /> nextstep.tsx
                      </span>
                      <div className="ml-auto flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#00ADB5] animate-pulse" />
                        <span className="text-[10px] text-[#00ADB5]">LIVE</span>
                      </div>
                    </div>
                    <div className="space-y-2 font-mono text-sm">
                      <div className="flex items-center gap-2 opacity-0 animate-fade-in-line" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                        <span className="text-gray-500 text-xs w-4">1</span>
                        <span className="text-purple-400">const</span>
                        <span className="text-cyan-300">developer</span>
                        <span className="text-white">=</span>
                        <span className="text-yellow-300">"you"</span>
                        <span className="text-gray-500">;</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 animate-fade-in-line" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
                        <span className="text-gray-500 text-xs w-4">2</span>
                        <span className="text-purple-400">const</span>
                        <span className="text-cyan-300">skills</span>
                        <span className="text-white">=</span>
                        <span className="text-green-400">[</span>
                        <span className="text-yellow-300">"code"</span>
                        <span className="text-gray-500">,</span>
                        <span className="text-yellow-300">"create"</span>
                        <span className="text-gray-500">,</span>
                        <span className="text-yellow-300">"grow"</span>
                        <span className="text-green-400">]</span>
                        <span className="text-gray-500">;</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 animate-fade-in-line" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
                        <span className="text-gray-500 text-xs w-4">3</span>
                        <span className="text-blue-400">await</span>
                        <span className="text-cyan-300">NextStep</span>
                        <span className="text-white">.</span>
                        <span className="text-yellow-400">transform</span>
                        <span className="text-white">(</span>
                        <span className="text-cyan-300">developer</span>
                        <span className="text-white">)</span>
                        <span className="text-gray-500">;</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 animate-fade-in-line" style={{ animationDelay: '1.4s', animationFillMode: 'forwards' }}>
                        <span className="text-gray-500 text-xs w-4">4</span>
                        <span className="text-green-400">// </span>
                        <span className="text-green-400/70">Output: 🚀 Ready to build amazing things!</span>
                        <span className="inline-block w-2 h-4 bg-[#00ADB5] animate-pulse ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* Floating Tech Icons - More Icons with Glow */}
                  <div className="absolute bottom-24 left-8 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 animate-float border border-blue-400/30">
                    <Code className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute bottom-10 left-28 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-xl shadow-green-500/30 animate-float-delayed border border-green-400/30">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute bottom-20 right-6 w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/30 animate-float-slow border border-purple-400/30">
                    <Rocket className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute bottom-6 right-24 w-11 h-11 bg-gradient-to-br from-[#00ADB5] to-cyan-400 rounded-xl flex items-center justify-center shadow-xl shadow-[#00ADB5]/30 animate-float border border-[#00ADB5]/30">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-xl shadow-yellow-500/30 animate-float-delayed border border-yellow-400/30">
                    <Award className="w-5 h-5 text-white" />
                  </div>

                  {/* Multiple Orbiting Rings */}
                  <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-44 h-44">
                    <div className="absolute inset-0 border-2 border-dashed border-[#00ADB5]/40 rounded-full animate-spin-slow" />
                    <div className="absolute inset-4 border border-purple-500/30 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '25s' }} />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#00ADB5] rounded-full shadow-lg shadow-[#00ADB5]/50" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50" />
                  </div>

                  {/* Glowing Corner Accents */}
                  <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#00ADB5]/30 to-transparent rounded-br-full" />
                  <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-purple-500/30 to-transparent rounded-tl-full" />

                  {/* Glowing Lines - Enhanced */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00ADB5] to-transparent opacity-80" />
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00ADB5]/50 to-transparent" />
                </div>

                {/* Floating Success Card with Animation */}
                <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-xl border border-white/80 dark:border-gray-700 backdrop-blur-sm hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-500 group animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg group-hover:animate-bounce">
                      <span className="text-lg">🎉</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">Success!</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">200+ projects completed</div>
                    </div>
                  </div>
                </div>

                {/* Floating Stats Card */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-br from-white to-cyan-50/50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 shadow-xl border border-white/80 dark:border-gray-700 backdrop-blur-sm hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-500 animate-float-delayed">
                  <div className="text-center">
                    <div className="text-3xl font-black bg-gradient-to-r from-[#00ADB5] to-cyan-600 bg-clip-text text-transparent mb-1">500+</div>
                    <div className="text-xs font-bold text-gray-800 dark:text-white">Live Projects</div>
                    <div className="text-xs text-[#00ADB5] font-semibold">Real experience</div>
                  </div>
                </div>

                {/* Animated Trophy Card */}
                <div className="absolute top-1/2 -right-8 transform -translate-y-1/2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-3 shadow-xl animate-float-slow">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </div>
            </FloatingElement>
          </div>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden">
      {/* Hero Section */}
      <HeroSection />

      {/* Services Section */}
      <section className="py-20 px-6 lg:px-8 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ADB5]/10 border border-[#00ADB5]/20 mb-4 animate-magnetic">
              <Sparkles className="w-4 h-4 text-[#00ADB5] animate-pulse" />
              <span className="text-xs font-semibold text-[#00ADB5]">How NextStep Works</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4">
              Your Path to Success
            </h2>
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Everything you need to transform from student to professional developer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {homePageServices.map((service, index) => (
              <ServiceCard key={index} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== UNIQUE SPLIT-SCREEN PARALLAX SECTION ===== */}
      <section className="relative min-h-[200vh] bg-gradient-to-br from-gray-100 via-gray-50 to-white dark:from-slate-900 dark:via-gray-900 dark:to-slate-800">
        <div className="flex flex-col lg:flex-row">
          {/* LEFT SIDE - STICKY/FIXED */}
          <div className="lg:w-1/2 lg:sticky lg:top-0 lg:h-screen flex items-center justify-center p-8 lg:p-16">
            <div className="relative max-w-lg w-full">
              {/* Animated Background Shapes */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#00ADB5]/20 rounded-full blur-3xl animate-blob" />
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
              <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }} />

              {/* Main Content */}
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ADB5]/20 border border-[#00ADB5]/30 mb-6">
                  <Rocket className="w-4 h-4 text-[#00ADB5]" />
                  <span className="text-sm font-bold text-[#00ADB5]">YOUR JOURNEY</span>
                </div>

                <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                  Transform Your
                  <br />
                  <span className="bg-gradient-to-r from-[#00ADB5] via-cyan-400 to-blue-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                    Career Path
                  </span>
                </h2>

                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  Scroll down to discover how NextStep takes you from beginner to industry-ready developer through our unique approach.
                </p>

                {/* Animated Image Container */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                  <img
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80"
                    alt="Developer working"
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Floating Badge */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div className="text-white">
                      <div className="text-2xl font-black">100%</div>
                      <div className="text-sm text-white/80">Practical Learning</div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#00ADB5] flex items-center justify-center animate-bounce">
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - SCROLLING CONTENT */}
          <div className="lg:w-1/2 py-20 lg:py-40 px-8 lg:px-16">
            <div className="space-y-32">
              {/* Journey Step 1 */}
              <div className="group opacity-0 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                <div className="relative p-8 bg-white dark:bg-white/10 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-white/10 hover:border-[#00ADB5]/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#00ADB5]/10 shadow-lg">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-br from-[#00ADB5] to-cyan-600 flex items-center justify-center font-black text-xl text-white shadow-lg">
                    01
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-10 h-10 text-[#00ADB5]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-[#00ADB5] transition-colors">
                        Learn Fundamentals
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                        Start with structured courses covering DSA, web development, and core programming concepts. Learn at your own pace with interactive tutorials.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['JavaScript', 'React', 'Node.js', 'DSA'].map((tag) => (
                          <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-white/10 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Image */}
                  <div className="mt-6 rounded-xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80"
                      alt="Learning"
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>

              {/* Journey Step 2 */}
              <div className="group opacity-0 animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                <div className="relative p-8 bg-white dark:bg-white/10 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 shadow-lg">
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center font-black text-xl text-white shadow-lg">
                    02
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                      <Code className="w-10 h-10 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-purple-400 transition-colors">
                        Practice & Battle
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                        Sharpen your skills in CodeArena! Compete in real-time coding battles, solve 3000+ DSA problems, and climb the global leaderboard.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['1v1 Battles', 'Tournaments', 'DSA', 'Algorithms'].map((tag) => (
                          <span key={tag} className="px-3 py-1 bg-purple-100 dark:bg-purple-500/20 rounded-full text-xs font-medium text-purple-600 dark:text-purple-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80"
                      alt="Coding"
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>

              {/* Journey Step 3 */}
              <div className="group opacity-0 animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
                <div className="relative p-8 bg-white dark:bg-white/10 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-white/10 hover:border-orange-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/10 shadow-lg">
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-black text-xl text-white shadow-lg">
                    03
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center flex-shrink-0">
                      <Users className="w-10 h-10 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-orange-400 transition-colors">
                        Collaborate & Build
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                        Join teams, contribute to 500+ real open-source projects, and build applications that go live. Get hands-on experience that matters.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['Teamwork', 'Open Source', 'Git', 'Deployment'].map((tag) => (
                          <span key={tag} className="px-3 py-1 bg-orange-100 dark:bg-orange-500/20 rounded-full text-xs font-medium text-orange-600 dark:text-orange-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&q=80"
                      alt="Team collaboration"
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>

              {/* Journey Step 4 */}
              <div className="group opacity-0 animate-fade-in" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
                <div className="relative p-8 bg-white dark:bg-white/10 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-white/10 hover:border-green-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/10 shadow-lg">
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center font-black text-xl text-white shadow-lg">
                    04
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Award className="w-10 h-10 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-green-400 transition-colors">
                        Get Certified & Hired
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                        Earn industry-recognized certificates, build an impressive portfolio, and land your dream tech job with real project experience.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['Certificates', 'Portfolio', 'Jobs', 'Career'].map((tag) => (
                          <span key={tag} className="px-3 py-1 bg-green-100 dark:bg-green-500/20 rounded-full text-xs font-medium text-green-600 dark:text-green-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80"
                      alt="Success"
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collaboration & Teams Section */}
      <section className="py-20 px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-cyan-50/30 to-transparent dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700">
                <span className="text-sm font-bold text-blue-700 dark:text-blue-400">👥 COLLABORATE</span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white">
                Form Teams & <span className="text-[#00ADB5]">Collaborate on Projects</span>
              </h2>

              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                NextStep enables students to form teams, work together on real-world projects, and build meaningful experience. Connect with like-minded developers, share ideas, and deliver projects that showcase your teamwork abilities to employers.
              </p>

              <ul className="space-y-3">
                {[
                  "Find talented teammates with different skill sets",
                  "Collaborate on real open-source projects",
                  "Build projects from idea to deployment",
                  "Learn version control and team workflows",
                  "Impress employers with team-based accomplishments"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 group hover:translate-x-1 transition-transform">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00ADB5] mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>

              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00ADB5] hover:bg-cyan-600 text-white rounded-lg font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                Explore Collaboration →
              </button>
            </div>

            {/* Right Visual */}
            <div className="relative h-[300px] rounded-2xl overflow-hidden shadow-xl border border-white/40">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00ADB5]/20 to-cyan-600/10" />
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&q=80"
                alt="Team collaboration"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Code Arena Section - Enhanced with Unique Animations */}
      <section className="py-20 px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white overflow-hidden relative">
        {/* Animated Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00ADB5]/20 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '3s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl animate-blob" style={{ animationDelay: '5s' }} />

          {/* Animated Code Rain Effect */}
          <div className="absolute inset-0 opacity-5">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute text-[#00ADB5] font-mono text-xs animate-slide-down"
                style={{
                  left: `${i * 5}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${8 + i * 0.5}s`
                }}
              >
                {'<code/>'}
              </div>
            ))}
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Visual with 3D Effect */}
            <div className="relative perspective-1000 group">
              <div className="relative h-[350px] rounded-2xl overflow-hidden shadow-2xl border border-cyan-500/30 transform transition-all duration-700 group-hover:rotate-y-3 preserve-3d">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00ADB5]/30 to-cyan-600/20" />
                <img
                  src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80"
                  alt="Code competition"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Floating Code Elements */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-[#00ADB5]/80 rounded-lg text-xs font-mono animate-float">
                  function battle() {'{}'}
                </div>
                <div className="absolute bottom-4 right-4 px-3 py-1 bg-purple-500/80 rounded-lg text-xs font-mono animate-float-delayed">
                  {'<CodeArena />'}
                </div>

                {/* Live Battle Indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-red-500/90 rounded-full animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full" />
                  <span className="text-xs font-bold">LIVE</span>
                </div>
              </div>

              {/* Floating Stats */}
              <div className="absolute -bottom-6 -left-6 bg-gradient-to-br from-[#00ADB5] to-cyan-600 rounded-xl p-4 shadow-xl animate-float">
                <div className="text-3xl font-black">⚔️</div>
                <div className="text-sm font-bold mt-1">1v1 Battles</div>
              </div>

              <div className="absolute -top-6 -right-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 shadow-xl animate-float-delayed">
                <div className="text-3xl font-black">🏆</div>
                <div className="text-sm font-bold mt-1">Leaderboard</div>
              </div>
            </div>

            {/* Right Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00ADB5]/20 border border-[#00ADB5]/50 animate-magnetic">
                <span className="text-sm font-bold text-[#00ADB5]">⚔️ CODE ARENA</span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-black">
                Battle in <span className="bg-gradient-to-r from-[#00ADB5] via-cyan-400 to-blue-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">CodeArena</span> & Master Coding
              </h2>

              <p className="text-sm lg:text-base text-gray-300 leading-relaxed">
                Challenge yourself and compete against other developers in real-time coding battles. Practice with thousands of DSA questions, compete in tournaments, earn coins, and climb the global leaderboard while building your coding skills.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "⚡", label: "1v1 Battles", desc: "Real-time coding duels", color: "from-yellow-400 to-orange-500" },
                  { icon: "🏆", label: "Tournaments", desc: "Compete globally", color: "from-purple-400 to-pink-500" },
                  { icon: "🎯", label: "3000+ Problems", desc: "DSA to interview prep", color: "from-blue-400 to-cyan-500" },
                  { icon: "💰", label: "Win Coins", desc: "Rewards & recognition", color: "from-green-400 to-emerald-500" }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#00ADB5]/50 hover:bg-white/10 transition-all duration-500 group cursor-pointer hover:-translate-y-2 hover:shadow-xl spotlight"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                      {item.icon}
                    </div>
                    <div className="text-sm font-bold text-white group-hover:text-[#00ADB5] transition-colors">{item.label}</div>
                    <div className="text-xs text-gray-400">{item.desc}</div>
                  </div>
                ))}
              </div>

              <Link to="/codearena" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00ADB5] to-cyan-600 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl font-bold text-sm transition-all duration-300 hover:shadow-xl hover:shadow-[#00ADB5]/30 hover:-translate-y-1 spotlight group">
                Join CodeArena
                <Zap className="w-4 h-4 group-hover:animate-pulse" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6">
              Why Choose
              <span className="bg-gradient-to-r from-[#00ADB5] to-cyan-600 bg-clip-text text-transparent"> NextStep?</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Unlock your potential with our comprehensive platform designed for career success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {homePageFeatures.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section with Unique Animations */}
      <section className="py-16 px-6 lg:px-8 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4">
              Our Community in Action
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              See how our students are building their future, one project at a time
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {homePageGallery.map((image, index) => (
              <div
                key={index}
                className="group relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 hover:scale-105 spotlight"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-125 group-hover:rotate-3 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-2 left-2 right-2 text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  <p className="text-xs font-semibold line-clamp-1">{image.caption}</p>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#00ADB5] rounded-xl transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== INFINITE SCROLLING TECH STACK ===== */}
      <section className="py-16 bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 overflow-hidden">
        <div className="text-center mb-10">
          <h3 className="text-xl font-bold text-white mb-2">Technologies You'll Master</h3>
          <p className="text-gray-400 text-sm">Learn the most in-demand tech skills</p>
        </div>

        <div className="relative">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-900 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-900 to-transparent z-10" />

          {/* Scrolling Container */}
          <div className="flex animate-scroll-x">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex gap-8 mr-8">
                {[
                  { name: "React", icon: "⚛️", color: "from-cyan-400 to-blue-500" },
                  { name: "Node.js", icon: "🟢", color: "from-green-400 to-emerald-500" },
                  { name: "TypeScript", icon: "📘", color: "from-blue-400 to-blue-600" },
                  { name: "Python", icon: "🐍", color: "from-yellow-400 to-green-500" },
                  { name: "MongoDB", icon: "🍃", color: "from-green-500 to-green-700" },
                  { name: "Firebase", icon: "🔥", color: "from-yellow-400 to-orange-500" },
                  { name: "AWS", icon: "☁️", color: "from-orange-400 to-yellow-500" },
                  { name: "Docker", icon: "🐳", color: "from-blue-400 to-cyan-500" },
                  { name: "Git", icon: "📦", color: "from-orange-500 to-red-500" },
                  { name: "GraphQL", icon: "◈", color: "from-pink-400 to-purple-500" },
                  { name: "Next.js", icon: "▲", color: "from-gray-400 to-gray-600" },
                  { name: "TailwindCSS", icon: "🎨", color: "from-cyan-400 to-teal-500" }
                ].map((tech, idx) => (
                  <div
                    key={`${setIndex}-${idx}`}
                    className={`flex-shrink-0 px-6 py-4 rounded-xl bg-gradient-to-r ${tech.color} flex items-center gap-3 hover:scale-110 transition-transform duration-300 cursor-pointer shadow-lg`}
                  >
                    <span className="text-2xl">{tech.icon}</span>
                    <span className="text-white font-bold whitespace-nowrap">{tech.name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section with Hover Lift */}
      <section className="py-24 px-6 lg:px-8 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6">
              Why NextStep is
              <span className="bg-gradient-to-r from-[#00ADB5] via-cyan-500 to-blue-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]"> Your Best Choice</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Everything you need to become a professional developer, all in one platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🎯",
                title: "Learn Real Skills",
                description: "Master DSA, coding concepts, and industry-standard technologies through hands-on practice",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: "👥",
                title: "Collaborate & Grow",
                description: "Team up with other developers on real projects and learn from experienced mentors",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: "📈",
                title: "Build Your Portfolio",
                description: "Showcase 500+ real projects on your profile to impress employers and land better jobs",
                gradient: "from-orange-500 to-red-500"
              },
              {
                icon: "⚔️",
                title: "Compete & Win",
                description: "Battle other developers in CodeArena, climb leaderboards, and earn recognition",
                gradient: "from-yellow-500 to-orange-500"
              },
              {
                icon: "🏆",
                title: "Get Verified Certs",
                description: "Earn industry-recognized certificates backed by real project completion",
                gradient: "from-green-500 to-emerald-500"
              },
              {
                icon: "💰",
                title: "100% Free Start",
                description: "Access all learning resources for free - premium features available at low cost",
                gradient: "from-[#00ADB5] to-cyan-600"
              }
            ].map((benefit, idx) => (
              <div
                key={idx}
                className="group relative p-8 rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-100 dark:border-gray-700 hover:border-transparent shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden spotlight"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* Gradient Border on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />
                <div className="absolute inset-[2px] bg-white dark:bg-gray-800 rounded-2xl z-0 group-hover:bg-gradient-to-br group-hover:from-white dark:group-hover:from-gray-800 group-hover:to-gray-50 dark:group-hover:to-gray-900" />

                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-[#00ADB5] transition-colors">{benefit.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-[#00ADB5]/5 via-cyan-50/30 to-blue-50/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 border border-white/50 dark:border-gray-700 backdrop-blur-sm mb-6">
              <span className="text-2xl">🌟</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Success Stories</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6">
              From Students to
              <span className="bg-gradient-to-r from-[#00ADB5] to-cyan-600 bg-clip-text text-transparent"> Successful Developers</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Hear from developers who landed their dream jobs after completing NextStep
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {homePageTestimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Achievement Milestones Section - Interactive Cards */}
      <section className="py-24 px-6 lg:px-8 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30 mb-6 animate-magnetic">
              <span className="text-2xl">🏅</span>
              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">GAMIFIED LEARNING</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6">
              Unlock Your Achievements
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Track your progress and celebrate milestones as you grow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "📚", milestone: "Complete 1 Course", reward: "+100 XP", color: "from-blue-400 to-blue-600", shadow: "shadow-blue-500/30" },
              { icon: "💻", milestone: "Finish 5 Projects", reward: "Gold Badge", color: "from-yellow-400 to-yellow-600", shadow: "shadow-yellow-500/30" },
              { icon: "⚔️", milestone: "Win 10 CodeArena Battles", reward: "+500 Coins", color: "from-purple-400 to-purple-600", shadow: "shadow-purple-500/30" },
              { icon: "👥", milestone: "Join 3 Teams", reward: "Collaborator Badge", color: "from-pink-400 to-pink-600", shadow: "shadow-pink-500/30" },
              { icon: "🏆", milestone: "Get 3 Certificates", reward: "Elite Status", color: "from-green-400 to-green-600", shadow: "shadow-green-500/30" },
              { icon: "⭐", milestone: "Reach 4.8+ Rating", reward: "Star Developer", color: "from-orange-400 to-orange-600", shadow: "shadow-orange-500/30" },
              { icon: "🎯", milestone: "Solve 100+ DSA Problems", reward: "Coding Master", color: "from-cyan-400 to-cyan-600", shadow: "shadow-cyan-500/30" },
              { icon: "🚀", milestone: "Deploy 1 Live Project", reward: "Full Stack Badge", color: "from-indigo-400 to-indigo-600", shadow: "shadow-indigo-500/30" }
            ].map((achievement, idx) => (
              <div
                key={idx}
                className={`group relative rounded-2xl p-6 bg-gradient-to-br ${achievement.color} text-white shadow-xl ${achievement.shadow} hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-105 overflow-hidden spotlight`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-20 h-20 bg-white rounded-full blur-2xl animate-float" />
                  <div className="absolute bottom-0 right-0 w-16 h-16 bg-white rounded-full blur-2xl animate-float-delayed" />
                </div>

                <div className="relative z-10">
                  <div className="text-5xl mb-3 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">{achievement.icon}</div>
                  <h3 className="font-black text-sm mb-2">{achievement.milestone}</h3>
                  <div className="inline-block px-3 py-1 bg-white/30 backdrop-blur-sm rounded-full text-xs font-bold group-hover:bg-white/50 transition-colors">
                    {achievement.reward}
                  </div>
                </div>

                {/* Shine Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Everything you need to know about NextStep
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Is NextStep really free?",
                a: "Yes! All courses and learning resources are completely free. You only pay optional fees for certificate verification (₹299-₹499) after completing projects."
              },
              {
                q: "What skills can I learn on NextStep?",
                a: "You can learn Web Development (JavaScript, React, Node.js), Data Structures & Algorithms (DSA), AI/Machine Learning, Full Stack Development (MERN), and more."
              },
              {
                q: "How do real projects work?",
                a: "Browse 500+ open projects posted by developers, apply to join teams, collaborate with other students, and build actual applications that go live."
              },
              {
                q: "Do I get certificates?",
                a: "Yes! Complete projects and earn verified certificates. These certificates are endorsed by project creators and recognized by employers."
              },
              {
                q: "Can I compete with other developers?",
                a: "Absolutely! CodeArena allows you to battle other developers in real-time coding competitions. Climb the leaderboard and earn coins."
              },
              {
                q: "How long does it take to get a job?",
                a: "It varies based on your dedication. With consistent learning and project completion (3-6 months), you'll have a strong portfolio to land tech jobs."
              }
            ].map((faq, idx) => (
              <details key={idx} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100 dark:border-gray-700 hover:border-[#00ADB5]/50">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-black text-gray-900 dark:text-white group-open:text-[#00ADB5]">
                  <span className="text-sm md:text-base">{faq.q}</span>
                  <span className="text-2xl group-open:rotate-180 transition-transform">+</span>
                </summary>
                <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-700 pt-6">
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section - Immersive Design */}
      <section className="py-24 px-6 lg:px-8 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            {/* Animated Dark background with multiple layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900" />

            {/* Animated Orbs */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-72 h-72 bg-[#00ADB5]/30 rounded-full blur-3xl animate-blob" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
              <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
            </div>

            {/* Background Image with Parallax */}
            <div className="absolute inset-0 opacity-20">
              <img
                src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80"
                alt="Dark tech background"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'linear-gradient(#00ADB5 1px, transparent 1px), linear-gradient(90deg, #00ADB5 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }} />

            {/* Content */}
            <div className="relative px-8 md:px-16 py-16 md:py-24 text-center z-10">
              <div className="space-y-8">
                {/* Animated Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ADB5]/20 border border-[#00ADB5]/30 animate-magnetic">
                  <Rocket className="w-4 h-4 text-[#00ADB5] animate-bounce" />
                  <span className="text-sm font-bold text-[#00ADB5]">START TODAY</span>
                </div>

                <div>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                    Ready to Transform Your
                    <br />
                    <span className="bg-gradient-to-r from-[#00ADB5] via-cyan-400 to-blue-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                      Career?
                    </span>
                  </h2>
                  <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                    Join thousands of successful developers who started their journey with NextStep.
                    Your future in tech starts today.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Link to="/signup" className="group relative px-10 py-5 bg-gradient-to-r from-[#00ADB5] to-cyan-600 rounded-2xl font-bold text-xl text-white shadow-2xl hover:shadow-[#00ADB5]/50 transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 inline-flex items-center overflow-hidden">
                    <span className="relative z-10 flex items-center gap-3">
                      Start Your Journey Now
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </Link>

                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">Join 12,000+ students</div>
                    <div className="flex items-center justify-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className="text-yellow-400 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>★</span>
                      ))}
                      <span className="text-sm text-gray-300 ml-2">4.9/5 rating</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-gray-700">
                  {[
                    { value: "Free", label: "Forever plan available", icon: "💎" },
                    { value: "24/7", label: "Community support", icon: "🌍" },
                    { value: "∞", label: "Lifetime access", icon: "🔓" }
                  ].map((stat, idx) => (
                    <div key={idx} className="text-center group hover:scale-110 transition-transform duration-300">
                      <div className="text-2xl mb-2 group-hover:animate-bounce">{stat.icon}</div>
                      <div className="text-3xl font-black text-[#00ADB5] mb-2">{stat.value}</div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Tech Updates Bot */}
      <LiveUpdatesBot />
    </div>
  );
}
