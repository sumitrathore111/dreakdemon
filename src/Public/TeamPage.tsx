import { Target, Users, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import ContributorSection from "../Component/Global/ContributorSection";
import { Link } from "react-router-dom";

export function TeamPage() {
  

  const highlights = [
    {
      icon: Target,
      title: "Driven by Purpose",
      desc: "We set out to build a platform that solves real problems and makes a positive impact on people’s lives.",
    },
    {
      icon: Users,
      title: "Built Together",
      desc: "Our journey started as a small team with a shared vision—and it continues to grow with contributions from passionate individuals.",
    },
    {
      icon: Lightbulb,
      title: "Innovative Solutions",
      desc: "We embrace creativity and technology to explore new ways of solving challenges and delivering value.",
    },
  ];

  const testimonials = [
    {
      name: "Diwakar Kumar",
      quote: "The platform has been a game-changer for connecting with like-minded people and exploring new opportunities!",
      image: "https://res.cloudinary.com/doytvgisa/image/upload/v1758559963/Diwaker_olmh3o.jpg",
    },
    {
      name: "Geet Srivastava",
      quote: "A great initiative with a supportive community. It’s amazing to see how much this team cares about making an impact.",
      image: "https://res.cloudinary.com/doytvgisa/image/upload/v1758623925/Screenshot_2025-09-23_160822_wamrtb.png",
    },
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        transition={{ duration: 0.8 }}
        className="relative py-20 px-6 lg:px-16 text-white text-center overflow-hidden"
        style={{ backgroundColor: "#00ADB5" }}
      >
        <h1 className="text-5xl font-extrabold relative z-10">Meet Our Team</h1>
        <p className="max-w-2xl mx-auto mt-4 relative z-10 text-lg text-purple-100">
          We are three passionate individuals who started this project to bring ideas to life and build a community around innovation and purpose.
        </p>
      </motion.section>

      {/* Team Members */}
      <ContributorSection />

      {/* Highlights */}
      <motion.section
        className="py-16 px-6 lg:px-16"
        style={{ backgroundColor: "#f0feff" }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.h2
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-center mb-12"
        >
          Why We Do This
        </motion.h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                className="bg-white p-6 rounded-xl shadow hover:shadow-md transition text-center"
                variants={fadeUp}
                transition={{ delay: idx * 0.2 }}
              >
                <div
                  className="w-14 h-14 mx-auto flex items-center justify-center rounded-full mb-4"
                  style={{ backgroundColor: "#8efaff" }}
                >
                  <Icon className="w-6 h-6" style={{ color: "#000" }} />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section
        className="py-16 px-6 lg:px-16"
        style={{ backgroundColor: "#b5fcff" }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.h2
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-center mb-12"
        >
          What Our Users Say
        </motion.h2>
        <div className="grid sm:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testi, idx) => (
            <motion.div
              key={idx}
              className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition relative group"
              variants={fadeUp}
              transition={{ delay: idx * 0.2 }}
            >
              <p className="text-gray-700 mb-4 italic">"{testi.quote}"</p>
              <div className="flex items-center gap-4">
                <img
                  src={testi.image}
                  alt={testi.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-200"
                />
                <div>
                  <h4 className="font-semibold">{testi.name}</h4>
                  <p className="text-sm text-gray-500">Community Member</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        className="py-16 px-6 lg:px-16 text-white text-center"
        style={{ backgroundColor: "#01787cff" }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-4xl font-bold mb-4">Let’s Build Together</h2>
        <p className="max-w-2xl mx-auto mb-8 text-purple-100">
          Join us on this exciting journey of creativity, collaboration, and innovation.
        </p>
        <Link 
        to={'https://forms.gle/RKYHdpAxvZxyMb5o8'}
        className="px-8 py-3 bg-white text-black rounded-lg font-semibold hover:bg-purple-100 transition">
          Connect Now
        </Link>
      </motion.section>
    </div>
  );
}
