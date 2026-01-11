import { BookOpen, Globe, Lightbulb, Shield, Users, Zap } from "lucide-react";
import { useState } from "react";

export function AboutPage() {
    // Timeline milestones
    const milestones = [
      {
        year: "2022",
        title: "Idea Born",
        desc: "SkillUpX was conceptualized by a group of passionate students.",
        icon: Lightbulb,
      },
      {
        year: "2023",
        title: "First Project Launched",
        desc: "Our first batch of students completed real-world projects.",
        icon: BookOpen,
      },
      {
        year: "2024",
        title: "Community Growth",
        desc: "We grew to 10,000+ active learners and mentors.",
        icon: Users,
      },
      {
        year: "2025",
        title: "Global Recognition",
        desc: "SkillUpX received awards for innovation in education.",
        icon: Shield,
      },
      {
        year: "2026 Launch",
        title: "Platform Launch",
        desc: "SkillUpX officially launched for students worldwide.",
        icon: Zap,
      },
    ];
  const [visibleSections, setVisibleSections] = useState<string[]>([]);

  const observe = (id: string, el: HTMLDivElement | null) => {
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !visibleSections.includes(id)) {
            setVisibleSections((prev) => [...prev, id]);
            observer.unobserve(entry.target); // animate only once
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
  };

  const values = [
    {
      id: 1,
      title: "Empowerment",
      description:
        "We believe every student has the potential to succeed. Our platform gives you the tools, resources, and opportunities to build skills, gain experience, and confidently pursue your career goals.",
      icon: Zap,
    },
    {
      id: 2,
      title: "Collaboration",
      description:
        "Learning is stronger when we grow together. We foster a supportive community where students, mentors, and professionals share knowledge, solve problems, and celebrate each other’s achievements.",
      icon: Users,
    },
    {
      id: 3,
      title: "Lifelong Learning",
      description:
        "Education doesn’t end with a classroom. We encourage curiosity and continuous learning, helping students stay updated with new technologies and gain practical experience through real-world projects.",
      icon: BookOpen,
    },
    {
      id: 4,
      title: "Integrity & Trust",
      description:
        "Transparency and authenticity guide everything we do. We ensure every contribution is verified and every achievement is celebrated. Our goal is to build trust between students, mentors, and recruiters.",
      icon: Shield,
    },
    {
      id: 5,
      title: "Innovation",
      description:
        "Creativity and problem-solving open new doors. We encourage students to experiment, think outside the box, and bring fresh ideas to projects, shaping the future one contribution at a time.",
      icon: Lightbulb,
    },
    {
      id: 6,
      title: "Accessibility & Inclusivity",
      description:
        "Opportunities should be open to everyone. We strive to make learning affordable, approachable, and welcoming for students from all backgrounds — because talent knows no boundaries.",
      icon: Globe,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Story Section */}
      <div
        ref={(el) => observe("story", el)}
        className={`grid lg:grid-cols-2 gap-12 px-8 lg:px-16 py-20 items-center transform transition-all duration-1000 ${
          visibleSections.includes("story")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-12"
        }`}
      >
        <div>
          <h2 className="text-3xl font-semibold mb-6 text-[#00ADB5]">
            Our Story
          </h2>
<p className="text-gray-700 dark:text-gray-300 mb-4">
            It all started when we noticed a common struggle among students —
            they were eager to learn but unsure where to begin. Many had great
            ideas and ambition but lacked real-world experience, guidance, and a
            way to showcase their skills.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">We've been there too.</p>
          <p className="text-gray-700 dark:text-gray-300">
            As students ourselves, we wanted to learn, build projects, and grow
            — but we didn’t always have the right support or structure. That’s
            why we created SkillUpX — a place where learning isn’t just about
            theory, but about action, collaboration, and growth.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl shadow-lg relative">
          <img
            src="https://i.pinimg.com/736x/e8/7e/c4/e87ec4c9d80e8e3da206a9c67e368226.jpg"
            alt="Students working"
            className="w-full h-96 object-cover transform transition-transform duration-1000 hover:scale-105"
            style={{ transform: "translateZ(0)", willChange: "transform" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
      </div>

      {/* Mission Section */}
            {/* Timeline Section */}
            <div className="bg-white dark:bg-gray-900 py-16 px-4 lg:px-24">
              <h2 className="text-3xl font-semibold text-center mb-10 text-[#00ADB5]">SkillUpX Journey</h2>
              <div className="relative flex flex-col items-center">
                <div className="absolute left-1/2 transform -translate-x-1/2 w-2 h-full bg-gradient-to-b from-[#00ADB5] to-gray-200 dark:to-gray-700 rounded-full"></div>
                {milestones.map((m, idx) => {
                  const Icon = m.icon;
                  return (
                    <div
                      key={idx}
                      className={`relative z-10 mb-12 flex items-center w-full ${idx % 2 === 0 ? "justify-start" : "justify-end"}`}
                      style={{ animation: `fadeIn 0.8s ease ${idx * 0.15}s both` }}
                    >
                      {/* Dot */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 w-7 h-7 bg-white dark:bg-gray-800 rounded-full shadow-lg border-4 border-[#00ADB5] dark:border-gray-700 flex items-center justify-center" style={{ top: '50%' }}>
                        <Icon className="w-5 h-5 text-[#00ADB5]" />
                      </div>
                      <div
                        className={`w-full max-w-md ${idx % 2 === 0 ? "ml-0 mr-auto" : "mr-0 ml-auto"} rounded-2xl shadow-xl p-6 border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 hover:scale-105 transition-transform duration-300`}
                        style={{ boxShadow: "0 8px 32px 0 rgba(0,0,0,0.08)" }}
                      >
                        <div className="flex items-center mb-2">
                          <span className="font-bold text-[#00ADB5] text-lg mr-3">{m.year}</span>
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 border-2 border-[#00ADB5] dark:border-gray-700 shadow">
                            <Icon className="w-6 h-6 text-[#00ADB5]" />
                          </div>
                        </div>
                        <div className="font-bold text-xl mb-1 text-[#00ADB5]">{m.title}</div>
                        <div className="text-gray-700 dark:text-gray-300 text-base">{m.desc}</div>
                      </div>
                    </div>
                  );
                })}
                {/* Fade-in animation keyframes */}
                <style>{`
                  @keyframes fadeIn {
                    0% { opacity: 0; transform: translateY(40px); }
                    100% { opacity: 1; transform: translateY(0); }
                  }
                `}</style>
              </div>
            </div>
      <div
        ref={(el) => observe("mission", el)}
        className={`grid lg:grid-cols-2 gap-12 px-8 lg:px-16 py-20 items-center transform transition-all duration-1000 ${
          visibleSections.includes("mission")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-12"
        }`}
      >
        <div>
          <h2 className="text-3xl font-bold mb-6 text-[#00ADB5]">
            Our Mission is Simple:
          </h2>
<p className="text-gray-700 dark:text-gray-300 mb-4">
            Empower students to learn, contribute, and showcase their talents —
            so they can build the careers they dream of.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            With expert mentorship, hands-on projects, and a community that
            lifts each other up, we're helping students turn ambition into
            achievement.
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
            <li>Live coding sessions & workshops</li>
            <li>Open Projects with mentor guidance</li>
            <li>Weekly quizzes and feedback</li>
            <li>Community discussions and support</li>
          </ul>
        </div>
        <div className="overflow-hidden rounded-2xl shadow">
          <img
            src="https://res.cloudinary.com/doytvgisa/image/upload/v1758624468/Gemini_Generated_Image_c414u6c414u6c414_elixe0.png"
            alt="Mission"
            className="w-full h-96 object-cover transform transition-transform duration-1000 hover:scale-105"
          />
        </div>
      </div>

      {/* Student Working Section */}
      <div
        ref={(el) => observe("working", el)}
        className={`grid lg:grid-cols-2 gap-12 px-8 lg:px-16 py-20 items-center transform transition-all duration-1000 ${
          visibleSections.includes("working")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-12"
        }`}
      >
        <div className="order-2 lg:order-1 overflow-hidden rounded-2xl shadow">
          <img
            src="https://i.pinimg.com/1200x/81/29/92/812992f44a2cd6e6787b8b61209abf48.jpg"
            alt="Students working"
            className="w-full h-96 object-cover transform transition-transform duration-1000 hover:scale-105"
          />
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="text-3xl font-bold mb-6 text-[#00ADB5]">
            Student Working
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Beyond learning, our students work on real industry projects to
            apply their skills and build professional portfolios.
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
            <li>Internship with live projects</li>
            <li>Building full-stack applications</li>
            <li>Working on AI/ML use cases</li>
            <li>Industry mentorship and feedback</li>
          </ul>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gray-50 dark:bg-gray-800 py-16 px-8 lg:px-16">
        <h2 className="text-3xl font-semibold text-center mb-10 text-[#00ADB5]">
          Our Core Values
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <div
                key={value.id}
                ref={(el) => observe(`value-${value.id}`, el)}
                className={`p-8 bg-white dark:bg-gray-900 rounded-2xl text-center shadow-md hover:shadow-xl transition-all duration-700 transform hover:scale-105 hover:rotate-1`}
              >
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-[#00ADB5]">
                  <Icon className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[#00ADB5]">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>
      {/* Impact & Achievements Section */}
      <div className="bg-white dark:bg-gray-900 py-20 px-8 lg:px-24 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 mt-16">
        <h2 className="text-4xl font-extrabold text-center mb-14 text-[#00ADB5]">Impact & Achievements</h2>
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10">
          <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#00ADB5] mb-4 shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl font-bold text-[#00ADB5] mb-1">10,000+ Learners</div>
            <p className="text-gray-700 dark:text-gray-300 text-base">Active students and mentors building real-world skills.</p>
          </div>
          <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#00ADB5] mb-4 shadow-Our Storylg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-base">Industry projects completed by SkillUpX students.</p>
          </div>
          <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#00ADB5] mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl font-bold text-[#00ADB5] mb-1">50+ Awards</div>
            <p className="text-gray-700 dark:text-gray-300 text-base">Recognized for innovation and impact in education.</p>
          </div>
          <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#00ADB5] mb-4 shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl font-bold text-[#00ADB5] mb-1">100% Satisfaction</div>
            <p className="text-gray-700 dark:text-gray-300 text-base">Learners rate SkillUpX highly for mentorship and growth.</p>
          </div>
        </div>
      </div>
      {/* Meet the Team Section */}
      <div className="bg-gray-50 dark:bg-gray-800 py-20 px-8 lg:px-24 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 mt-16">
        <h2 className="text-4xl font-extrabold text-center mb-10 text-[#00ADB5]">Meet the Team</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 shadow-xl text-center border-2 border-[#00ADB5]/20 hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 hover:scale-105">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Aman Sharma" className="w-20 h-20 mx-auto rounded-full mb-4 border-4 border-[#00ADB5]" />
            <h3 className="text-xl font-bold mb-2 text-[#00ADB5]">Aman Sharma</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">Founder & CEO</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Visionary leader passionate about empowering students and driving innovation in education.</p>
          </div>
          <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 shadow-xl text-center border-2 border-[#00ADB5]/20 hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 hover:scale-105">
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Priya Verma" className="w-20 h-20 mx-auto rounded-full mb-4 border-4 border-[#00ADB5]" />
            <h3 className="text-xl font-bold mb-2 text-[#00ADB5]">Priya Verma</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">Head of Community</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Building a vibrant, inclusive community and supporting every learner’s journey.</p>
          </div>
          <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 shadow-xl text-center border-2 border-[#00ADB5]/20 hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 hover:scale-105">
            <img src="https://randomuser.me/api/portraits/men/65.jpg" alt="Rahul Singh" className="w-20 h-20 mx-auto rounded-full mb-4 border-4 border-[#00ADB5]" />
            <h3 className="text-xl font-bold mb-2 text-[#00ADB5]">Rahul Singh</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">Lead Developer</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Tech enthusiast focused on building robust, scalable solutions for SkillUpX.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
