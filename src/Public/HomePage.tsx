import { useEffect, useRef, useState } from "react";
import { ArrowRight, Code, Brain, Zap, Mic, Users, Target, Award, BookOpen } from "lucide-react";

export function HomePage() {
  const services = [
    {
      icon: Code,
      title: "Real Experience, Real Resume",
      description:
        "No more adding 'self-learning' on your resume. Showcase real projects and skills employers care about",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80"
    },
    {
      icon: Brain,
      title: "Mentorship You Can Trust",
      description:
        "Get feedback and guidance from industry experts who care about helping you succeed.",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
    },
    {
      icon: Zap,
      title: "A Community That Grows With You",
      description:
        "Learn together, share ideas, and build friendships that last beyond the classroom.",
      image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80"
    },
    {
      icon: Mic,
      title: "Opportunities That Match Your Goals",
      description:
        "Internships, collaborations, and challenges designed to help you grow professionally.",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80"
    },
  ];

  const features = [
    {
      icon: Users,
      title: "Collaborative Learning",
      description: "Work on team projects with peers from around the world",
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80"
    },
    {
      icon: Target,
      title: "Goal-Oriented Paths",
      description: "Personalized learning journeys tailored to your career goals",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80"
    },
    {
      icon: Award,
      title: "Verified Achievements",
      description: "Earn certificates and badges that employers recognize",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80"
    },
    {
      icon: BookOpen,
      title: "Real-World Projects",
      description: "Build your portfolio with industry-relevant experiences",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80"
    }
  ];

  const testimonials = [
    {
      name: "Diwakar Kumar",
      quote: "The platform has been a game-changer for connecting with like-minded people and exploring new opportunities!",
      image: "https://res.cloudinary.com/doytvgisa/image/upload/v1758559963/Diwaker_olmh3o.jpg",
    },
    {
      name: "Geet Srivastava",
      quote: "A great initiative with a supportive community. It's amazing to see how much this team cares about making an impact.",
      image: "https://res.cloudinary.com/doytvgisa/image/upload/v1758643144/Geet_y3etiz.jpg",
    },
  ];

  const galleryImages = [
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80",
    "https://images.unsplash.com/photo-1531537571171-a707bf2683da?w=600&q=80",
    "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80",
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80"
  ];

  const useReveal = () => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-white">

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="px-4 py-2 text-sm font-medium rounded-full bg-gray-100 text-gray-800 inline-block shadow-sm">
                Connect. Learn. Showcase. Succeed.
              </span>
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Learn by Doing
                <span style={{ color: "#00ADB5" }}> Grow by Contributing</span>
              </h1>
              <p className="text-xl text-gray-700 max-w-xl leading-relaxed">
                NextStep is a smart platform designed for students who want to
                learn, grow, and showcase their abilities. It's more than just a
                resume builder – it's a complete ecosystem where students can
                contribute to real open-source projects, gain practical
                experience, and update their resumes with meaningful
                accomplishments.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <a
                href="/commingsoon"
                className="px-8 py-4 text-white bg-black rounded-lg flex items-center hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Get Started <ArrowRight className="w-5 h-5 ml-2" />
              </a>
              <a 
                href="/contact" 
                className="px-8 py-4 border-2 border-gray-800 rounded-lg hover:bg-gray-50 transition-all shadow-md hover:shadow-lg"
              >
                Contact Us
              </a>
            </div>
          </div>

          {/* Hero Side Image */}
          <div className="hidden lg:block relative">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
                alt="Team collaboration"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#00ADB5] flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">500+</div>
                    <div className="text-sm text-gray-600">Active Members</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section with Images */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to build a successful career
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              const { ref, isVisible } = useReveal();

              return (
                <div
                  key={index}
                  ref={ref}
                  className={`group bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-700 transform hover:scale-105 hover:shadow-2xl
                    ${isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                    }
                  `}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div
                      className="absolute bottom-4 left-4 w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "#00ADB5" }}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2 text-gray-900">{service.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Vision Section with Futuristic Image */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Imagine Your Future,
                <span className="text-[#00ADB5]"> Build It Today</span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Your potential is limitless. With NextStep, transform your vision into reality through 
                real-world experience, innovative projects, and a community that believes in your success.
              </p>
              <div className="flex gap-4 pt-4">
                <a
                  href="/commingsoon"
                  className="px-8 py-4 text-white bg-[#00ADB5] rounded-lg flex items-center hover:bg-[#00ADB5]/90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Start Building <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </div>
            </div>
            <div className="relative">
              <img
                src="/futuristic-vision.jpg"
                alt="Vision of the Future"
                className="w-full rounded-2xl shadow-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">Why Choose NextStep?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Unlock your potential with our comprehensive platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const { ref, isVisible } = useReveal();

              return (
                <div
                  key={index}
                  ref={ref}
                  className={`relative overflow-hidden rounded-2xl transition-all duration-700 transform
                    ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
                  `}
                >
                  <div className="relative h-64">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="w-10 h-10 rounded-lg bg-[#00ADB5] flex items-center justify-center mb-3">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-200">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">Our Community in Action</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of students building their future
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((image, index) => {
              const { ref, isVisible } = useReveal();
              return (
                <div
                  key={index}
                  ref={ref}
                  className={`relative overflow-hidden rounded-xl aspect-square transition-all duration-700 transform hover:scale-105
                    ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
                  `}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <img
                    src={image}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#00ADB5]/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section with Animated Cards */}
      <section className="py-20 px-6 lg:px-16 relative overflow-hidden" style={{ backgroundColor: "#b5fcff" }}>
        {/* Floating decoration elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
        
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
          Success Stories
        </h2>
        
        <div className="grid sm:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testi, idx) => {
            const { ref, isVisible } = useReveal();
            return (
              <div
                key={idx}
                ref={ref}
                className={`bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform relative group overflow-hidden
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              >
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#00ADB5]/10 to-transparent rounded-bl-full"></div>
                
                {/* Quote icon */}
                <div className="text-6xl text-[#00ADB5]/20 font-serif mb-4">"</div>
                
                <p className="text-gray-700 text-lg mb-6 relative z-10 leading-relaxed">
                  {testi.quote}
                </p>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="relative">
                    <img
                      src={testi.image}
                      alt={testi.name}
                      className="w-16 h-16 rounded-full object-cover border-4 border-[#00ADB5]/30 shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">{testi.name}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-500">★★★★★</span>
                    </div>
                  </div>
                </div>
                
                {/* Hover effect gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#00ADB5]/0 to-[#00ADB5]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <img
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80"
                alt="Background"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join our community today and transform your learning experience
              </p>
              <a
                href="/commingsoon"
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-gray-900 bg-[#00ADB5] rounded-lg hover:bg-[#00ADB5]/90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Get Started Now <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}