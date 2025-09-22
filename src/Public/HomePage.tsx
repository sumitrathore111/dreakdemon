import { useEffect, useRef, useState } from "react";
import { ArrowRight, Code, Brain, Zap, Mic } from "lucide-react";
import { Link } from "react-router-dom";
import ContributorSection from "../Component/Global/ContributorSection";

export function HomePage() {
  const services = [
    {
      icon: Code,
      title: "Real Experience, Real Resume",
      description:
        "No more adding “self-learning” on your resume. Showcase real projects and skills employers care about",
    },
    {
      icon: Brain,
      title: "Mentorship You Can Trust",
      description:
        "Get feedback and guidance from industry experts who care about helping you succeed.",
    },
    {
      icon: Zap,
      title: "A Community That Grows With You",
      description:
        "Learn together, share ideas, and build friendships that last beyond the classroom.",
    },
    {
      icon: Mic,
      title: "Opportunities That Match Your Goals",
      description:
        "Internships, collaborations, and challenges designed to help you grow professionally.",
    },
  ];

  // For parallax effect
  useEffect(() => {
    const handleScroll = () => {
      document.documentElement.style.setProperty(
        "--scrollY",
        window.scrollY.toString()
      );
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Reveal animation observer
  const useReveal = () => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => setIsVisible(entry.isIntersecting));
        },
        { threshold: 0.2 }
      );

      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    }, []);

    return { ref, isVisible };
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Parallax */}
      <section className="relative h-[100vh] flex items-center">
        {/* Parallax Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://cdn.pixabay.com/photo/2023/08/13/22/00/computer-8188538_1280.jpg')",
            transform: "translateY(calc(var(--scrollY, 0) * -0.3px))",
          }}
        ></div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-gray-100/90"></div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="px-3 py-1 text-sm rounded bg-gray-200 w-fit inline-block">
                Connect. Learn. Showcase. Succeed.
              </span>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900">
                Learn by Doing
                <span style={{ color: "#00ADB5" }}>
                  {" "}
                  Grow by Contributing
                </span>
              </h1>
              <p className="text-lg text-gray-600 max-w-xl">
                Skillora is a smart platform designed for students who want to
                learn, grow, and showcase their abilities. It’s more than just a
                resume builder – it’s a complete ecosystem where students can
                contribute to real open-source projects, gain practical
                experience, and update their resumes with meaningful
                accomplishments.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                to={"/about"}
                className="px-6 py-3 text-white bg-black rounded-lg flex items-center"
              >
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link to={"/team"} className="px-6 py-3 border rounded-lg">
                Meet Our Team
              </Link>
            </div>

            <div className="flex items-center space-x-8 pt-4">
              <div>
                <div className="text-2xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-600">Students Trained</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">50+</div>
                <div className="text-sm text-gray-600">Projects Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">95%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">How It Works</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              const { ref, isVisible } = useReveal();

              return (
                <div
                  key={index}
                  ref={ref}
                  className={`p-6 rounded-lg shadow transition-all duration-1000 transform
                  ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
                  `}
                >
                  <div className="space-y-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "#00ADB5" }}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{service.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <ContributorSection />
    </div>
  );
}
