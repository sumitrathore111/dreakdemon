import { Lightbulb, Users, Zap, BookOpen, Shield, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function AboutPage() {
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
    <div className="min-h-screen bg-white text-gray-900">
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
          <p className="text-gray-700 mb-4">
            It all started when we noticed a common struggle among students —
            they were eager to learn but unsure where to begin. Many had great
            ideas and ambition but lacked real-world experience, guidance, and a
            way to showcase their skills.
          </p>
          <p className="text-gray-700 mb-4">We’ve been there too.</p>
          <p className="text-gray-700">
            As students ourselves, we wanted to learn, build projects, and grow
            — but we didn’t always have the right support or structure. That’s
            why we created Skillindia — a place where learning isn’t just about
            theory, but about action, collaboration, and growth.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl shadow-lg">
          <img
            src="https://i.pinimg.com/736x/e8/7e/c4/e87ec4c9d80e8e3da206a9c67e368226.jpg"
            alt="Students working"
            className="w-full h-96 object-cover transform transition-transform duration-1000 hover:scale-105"
          />
        </div>
      </div>

      {/* Mission Section */}
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
          <p className="text-gray-700 mb-4">
            Empower students to learn, contribute, and showcase their talents —
            so they can build the careers they dream of.
          </p>
          <p className="text-gray-700 mb-4">
            With expert mentorship, hands-on projects, and a community that
            lifts each other up, we’re helping students turn ambition into
            achievement.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Live coding sessions & workshops</li>
            <li>Open Projects with mentor guidance</li>
            <li>Weekly quizzes and feedback</li>
            <li>Community discussions and support</li>
          </ul>
        </div>
        <div className="overflow-hidden rounded-2xl shadow">
          <img
            src="https://cdn.pixabay.com/photo/2024/04/18/10/09/ai-generated-8703972_1280.jpg"
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
          <p className="text-gray-700 mb-4">
            Beyond learning, our students work on real industry projects to
            apply their skills and build professional portfolios.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Internship with live projects</li>
            <li>Building full-stack applications</li>
            <li>Working on AI/ML use cases</li>
            <li>Industry mentorship and feedback</li>
          </ul>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gray-50 py-16 px-8 lg:px-16">
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
                className={`p-8 bg-white rounded-2xl text-center shadow-md hover:shadow-xl transition-all duration-700 transform ${
                  visibleSections.includes(`value-${value.id}`)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                }`}
              >
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-[#00ADB5]">
                  <Icon className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[#00ADB5]">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
