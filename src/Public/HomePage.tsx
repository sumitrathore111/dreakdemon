import { ArrowRight, Play, Sparkles, TrendingUp } from "lucide-react";
import { memo } from "react";
import { Link } from "react-router-dom";
import { FeatureCard, ServiceCard, TestimonialCard } from "../components/HomePage/Cards";
import { useRevealAnimation } from "../components/hooks/useRevealAnimation";
import {
  features as homePageFeatures,
  galleryImages as homePageGallery,
  services as homePageServices,
  testimonials as homePageTestimonials,
  statistics
} from "../data/homePageData";

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
  
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Enhanced Animated Background with gradients */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-cyan-50/30" />
        <div className="absolute inset-0">
          {/* Animated orbs with enhanced motion */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-cyan-400/10 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-32 right-16 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-400/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-purple-400/15 to-pink-400/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
          {/* Additional accent orbs */}
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-[#00ADB5]/15 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
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
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg">
              <Sparkles className="w-4 h-4 text-[#00ADB5]" />
              <span className="text-sm font-semibold text-gray-800">🚀 Connect. Learn. Showcase. Succeed.</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-5">
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight animate-fade-in">
                Learn by Doing
                <br />
                <span className="bg-gradient-to-r from-[#00ADB5] to-cyan-600 bg-clip-text text-transparent">
                  Grow by Contributing
                </span>
              </h1>
              
              <p className="text-base lg:text-lg text-gray-600 leading-relaxed max-w-xl font-medium animate-fade-in-delay-1">
                NextStep is a smart platform designed for students who want to <span className="text-[#00ADB5] font-bold">learn, grow, and showcase</span> their abilities. Contribute to <span className="text-[#00ADB5] font-bold">real open-source projects</span>, collaborate with peers, and build a meaningful portfolio that impresses employers.
              </p>

              {/* Feature Highlights */}
              <div className="space-y-3 pt-2 animate-fade-in-delay-2">
                <div className="flex items-center gap-3 text-sm text-gray-700 group hover:translate-x-1 transition-transform">
                  <div className="w-2 h-2 rounded-full bg-[#00ADB5]"></div>
                  <span><span className="font-bold text-[#00ADB5]">Collaborate</span> on projects & form teams</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 group hover:translate-x-1 transition-transform">
                  <div className="w-2 h-2 rounded-full bg-[#00ADB5]"></div>
                  <span><span className="font-bold text-[#00ADB5]">Battle</span> in CodeArena & practice coding</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 group hover:translate-x-1 transition-transform">
                  <div className="w-2 h-2 rounded-full bg-[#00ADB5]"></div>
                  <span><span className="font-bold text-[#00ADB5]">Gain</span> real-world experience instantly</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 animate-fade-in-delay-3">
              <Link to="/signup" className="group relative px-6 py-3 bg-gradient-to-r from-[#00ADB5] to-cyan-600 text-white rounded-xl font-bold text-sm lg:text-base shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 inline-flex items-center justify-center overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Start Your Journey
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              
              <button className="group flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-sm border-2 border-[#00ADB5]/20 hover:border-[#00ADB5]/50 rounded-xl font-semibold text-sm lg:text-base text-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-9 h-9 rounded-full bg-[#00ADB5]/10 flex items-center justify-center group-hover:bg-[#00ADB5]/20 transition-colors">
                  <Play className="w-3 h-3 text-[#00ADB5] ml-0.5" />
                </div>
                Watch Demo
              </button>
            </div>

            {/* Success Stats */}
            <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-gray-200 animate-fade-in-delay-4">
              <div className="text-center hover:scale-110 transition-transform duration-300">
                <div className="text-2xl font-black bg-gradient-to-r from-[#00ADB5] to-cyan-600 bg-clip-text text-transparent">3000+</div>
                <div className="text-xs text-gray-600 font-medium">DSA Problems</div>
              </div>
              <div className="w-px h-10 bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
              <div className="text-center hover:scale-110 transition-transform duration-300">
                <div className="text-2xl font-black bg-gradient-to-r from-[#00ADB5] to-cyan-600 bg-clip-text text-transparent">500+</div>
                <div className="text-xs text-gray-600 font-medium">Live Projects</div>
              </div>
              <div className="w-px h-10 bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
              <div className="text-center hover:scale-110 transition-transform duration-300">
                <div className="text-2xl font-black bg-gradient-to-r from-[#00ADB5] to-cyan-600 bg-clip-text text-transparent">12K+</div>
                <div className="text-xs text-gray-600 font-medium">Active Developers</div>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div
            className={`relative transition-all duration-1000 delay-300 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            {/* Decorative Frame */}
            <div className="absolute -inset-4 bg-gradient-to-br from-[#00ADB5]/10 via-transparent to-purple-600/10 rounded-3xl blur-2xl" />
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00ADB5]/30 to-cyan-600/20 rounded-3xl blur-3xl" />
              
              <div className="relative w-full h-[400px] rounded-3xl shadow-2xl overflow-hidden border-2 border-white/40 backdrop-blur-sm group">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80"
                  alt="Developers collaborating on a project"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              
              {/* Floating Success Card */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-xl border border-white/80 backdrop-blur-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                    <span className="text-lg">🎉</span>
                  </div>
                  <div>
                     <div className="text-sm font-bold text-gray-900">Success!</div>
                    <div className="text-xs text-gray-600 font-medium">200+ projects completed</div>
                  </div>
                </div>
              </div>
              
              {/* Floating Stats Card */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-br from-white to-cyan-50/50 rounded-xl p-4 shadow-xl border border-white/80 backdrop-blur-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="text-center">
                  <div className="text-3xl font-black bg-gradient-to-r from-[#00ADB5] to-cyan-600 bg-clip-text text-transparent mb-1">500+</div>
                  <div className="text-xs font-bold text-gray-800">Live Projects</div>
                  <div className="text-xs text-[#00ADB5] font-semibold">Real experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Services Section */}
      <section className="py-20 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ADB5]/10 border border-[#00ADB5]/20 mb-4">
              <Sparkles className="w-4 h-4 text-[#00ADB5]" />
              <span className="text-xs font-semibold text-[#00ADB5]">How NextStep Works</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
              Your Path to Success
            </h2>
            <p className="text-sm lg:text-base text-gray-600 max-w-3xl mx-auto">
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

      {/* Collaboration & Teams Section */}
      <section className="py-20 px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-cyan-50/30 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 border border-blue-300">
                <span className="text-sm font-bold text-blue-700">👥 COLLABORATE</span>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900">
                Form Teams & <span className="text-[#00ADB5]">Collaborate on Projects</span>
              </h2>
              
              <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
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
                    <span className="text-sm text-gray-700">{item}</span>
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

      {/* Code Arena Section */}
      <section className="py-20 px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white overflow-hidden relative">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00ADB5] rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Visual */}
            <div className="relative h-[300px] rounded-2xl overflow-hidden shadow-2xl border border-cyan-500/30">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00ADB5]/30 to-cyan-600/20" />
              <img
                src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80"
                alt="Code competition"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* Right Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00ADB5]/20 border border-[#00ADB5]/50">
                <span className="text-sm font-bold text-[#00ADB5]">⚔️ CODE ARENA</span>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-black">
                Battle in <span className="text-[#00ADB5]">CodeArena</span> & Master Coding
              </h2>
              
              <p className="text-sm lg:text-base text-gray-300 leading-relaxed">
                Challenge yourself and compete against other developers in real-time coding battles. Practice with thousands of DSA questions, compete in tournaments, earn coins, and climb the global leaderboard while building your coding skills.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "⚡", label: "1v1 Battles", desc: "Real-time coding duels" },
                  { icon: "🏆", label: "Tournaments", desc: "Compete globally" },
                  { icon: "🎯", label: "3000+ Problems", desc: "DSA to interview prep" },
                  { icon: "💰", label: "Win Coins", desc: "Rewards & recognition" }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-[#00ADB5]/50 hover:bg-white/10 transition-all duration-300 group cursor-pointer">
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-xs font-bold text-white group-hover:text-[#00ADB5] transition-colors">{item.label}</div>
                    <div className="text-xs text-gray-400">{item.desc}</div>
                  </div>
                ))}
              </div>

              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#00ADB5] to-cyan-600 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                Join CodeArena →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
              Why Choose
              <span className="bg-gradient-to-r from-[#00ADB5] to-cyan-600 bg-clip-text text-transparent"> NextStep?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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

      {/* Gallery Section */}
      <section className="py-16 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
              Our Community in Action
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              See how our students are building their future, one project at a time
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {homePageGallery.map((image, index) => (
              <div
                key={index}
                className="group relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-500 hover:-translate-y-0.5"
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-2 left-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-xs font-semibold line-clamp-1">{image.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
              Why NextStep is
              <span className="bg-gradient-to-r from-[#00ADB5] to-cyan-600 bg-clip-text text-transparent"> Your Best Choice</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to become a professional developer, all in one platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🎯",
                title: "Learn Real Skills",
                description: "Master DSA, coding concepts, and industry-standard technologies through hands-on practice"
              },
              {
                icon: "👥",
                title: "Collaborate & Grow",
                description: "Team up with other developers on real projects and learn from experienced mentors"
              },
              {
                icon: "📈",
                title: "Build Your Portfolio",
                description: "Showcase 500+ real projects on your profile to impress employers and land better jobs"
              },
              {
                icon: "⚔️",
                title: "Compete & Win",
                description: "Battle other developers in CodeArena, climb leaderboards, and earn recognition"
              },
              {
                icon: "🏆",
                title: "Get Verified Certs",
                description: "Earn industry-recognized certificates backed by real project completion"
              },
              {
                icon: "💰",
                title: "100% Free Start",
                description: "Access all learning resources for free - premium features available at low cost"
              }
            ].map((benefit, idx) => (
              <div key={idx} className="group p-8 rounded-2xl bg-gradient-to-br from-white to-cyan-50 border-2 border-gray-100 hover:border-[#00ADB5]/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-[#00ADB5] transition-colors">{benefit.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ADB5]/10 border border-[#00ADB5]/30 mb-6">
              <span className="text-sm font-semibold text-[#00ADB5]">🚀 QUICK START</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
              Get Started in
              <span className="bg-gradient-to-r from-[#00ADB5] to-cyan-600 bg-clip-text text-transparent"> 5 Minutes</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-5 gap-6 mb-12">
            {[
              { num: "1", icon: "📝", title: "Sign Up", desc: "Create your free account" },
              { num: "2", icon: "📚", title: "Choose Course", desc: "Pick a learning path" },
              { num: "3", icon: "🎬", title: "Watch Videos", desc: "Learn from experts" },
              { num: "4", icon: "💻", title: "Build Projects", desc: "Apply your skills" },
              { num: "5", icon: "🏅", title: "Get Certified", desc: "Earn credentials" }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:border-[#00ADB5]/50 transition-all text-center group hover:shadow-2xl hover:-translate-y-1">
                  <div className="text-4xl mb-3">{step.icon}</div>
                  <div className="text-2xl font-black text-[#00ADB5] mb-2">{step.num}</div>
                  <h3 className="font-black text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-xs text-gray-600">{step.desc}</p>
                </div>
                {idx < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-[#00ADB5]" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/signup" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#00ADB5] to-cyan-600 text-white rounded-2xl font-black shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 hover:scale-105">
              Start Learning Free Today
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-[#00ADB5]/5 via-cyan-50/30 to-blue-50/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-white/50 backdrop-blur-sm mb-6">
              <span className="text-2xl">🌟</span>
              <span className="text-sm font-semibold text-gray-800">Success Stories</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
              From Students to
              <span className="bg-gradient-to-r from-[#00ADB5] to-cyan-600 bg-clip-text text-transparent"> Industry Leaders</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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

      {/* Achievement Milestones Section */}
      <section className="py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
              Unlock Your Achievements
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Track your progress and celebrate milestones as you grow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "📚", milestone: "Complete 1 Course", reward: "+100 XP", color: "from-blue-400 to-blue-600" },
              { icon: "💻", milestone: "Finish 5 Projects", reward: "Gold Badge", color: "from-yellow-400 to-yellow-600" },
              { icon: "⚔️", milestone: "Win 10 CodeArena Battles", reward: "+500 Coins", color: "from-purple-400 to-purple-600" },
              { icon: "👥", milestone: "Join 3 Teams", reward: "Collaborator Badge", color: "from-pink-400 to-pink-600" },
              { icon: "🏆", milestone: "Get 3 Certificates", reward: "Elite Status", color: "from-green-400 to-green-600" },
              { icon: "⭐", milestone: "Reach 4.8+ Rating", reward: "Star Developer", color: "from-orange-400 to-orange-600" },
              { icon: "🎯", milestone: "Solve 100+ DSA Problems", reward: "Coding Master", color: "from-cyan-400 to-cyan-600" },
              { icon: "🚀", milestone: "Deploy 1 Live Project", reward: "Full Stack Badge", color: "from-indigo-400 to-indigo-600" }
            ].map((achievement, idx) => (
              <div key={idx} className={`group rounded-2xl p-6 bg-gradient-to-br ${achievement.color} text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105`}>
                <div className="text-4xl mb-3">{achievement.icon}</div>
                <h3 className="font-black text-sm mb-2">{achievement.milestone}</h3>
                <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold">{achievement.reward}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-cyan-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
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
              <details key={idx} className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-[#00ADB5]/50">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-black text-gray-900 group-open:text-[#00ADB5]">
                  <span className="text-sm md:text-base">{faq.q}</span>
                  <span className="text-2xl group-open:rotate-180 transition-transform">+</span>
                </summary>
                <div className="px-6 pb-6 border-t border-gray-100 pt-6">
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            {/* Dark background with image overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900" />
            <div className="absolute inset-0 opacity-20">
              <img 
                src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80" 
                alt="Dark tech background"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="relative px-8 md:px-16 py-16 md:py-24 text-center z-10">
              <div className="space-y-8">
                <div>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                    Ready to Transform Your
                    <br />
                    <span className="bg-gradient-to-r from-[#00ADB5] to-cyan-400 bg-clip-text text-transparent">
                      Career?
                    </span>
                  </h2>
                  <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                    Join thousands of successful developers who started their journey with NextStep. 
                    Your future in tech starts today.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Link to="/signup" className="group relative px-10 py-5 bg-gradient-to-r from-[#00ADB5] to-cyan-600 rounded-2xl font-bold text-xl text-white shadow-2xl hover:shadow-[#00ADB5]/25 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 inline-flex items-center">
                    <span className="relative z-10 flex items-center gap-3">
                      Start Your Journey Now
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">Join 12,000+ students</div>
                    <div className="flex items-center justify-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                      <span className="text-sm text-gray-300 ml-2">4.9/5 rating</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-gray-700">
                  <div className="text-center">
                    <div className="text-3xl font-black text-[#00ADB5] mb-2">Free</div>
                    <div className="text-sm text-gray-400">Forever plan available</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-[#00ADB5] mb-2">24/7</div>
                    <div className="text-sm text-gray-400">Community support</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-[#00ADB5] mb-2">∞</div>
                    <div className="text-sm text-gray-400">Lifetime access</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}