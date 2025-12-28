import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";

export function ContactUs() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">We're Here to Help</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Let's Start a
                <span style={{ color: "#00ADB5" }}> Conversation</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Have questions about NextStep? Want to learn more about how we can help you grow? 
                We'd love to hear from you. Reach out and let's make something amazing together.
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-6 pt-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                  <div className="text-3xl font-bold" style={{ color: "#00ADB5" }}>24/7</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Available Support</div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                  <div className="text-3xl font-bold" style={{ color: "#00ADB5" }}>&lt;1hr</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Response Time</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=800&q=80"
                  alt="Contact Us"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-6 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#00ADB5" }}>
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">Always Connected</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">We're just a message away</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">Get In Touch</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose the way that works best for you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Phone */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 group">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: "#00ADB5" }}>
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Call Us</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Speak directly with our team
              </p>
              <a 
                href="tel:8756824350" 
                className="font-semibold hover:opacity-80 transition-colors text-lg"
                style={{ color: "#00ADB5" }}
              >
                +91 8756824350
              </a>
            </div>

            {/* Email */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 group">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: "#00ADB5" }}>
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Email Us</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Send us a detailed message
              </p>
              <a 
                href="mailto:contact@nextstep.com" 
                className="font-semibold hover:opacity-80 transition-colors break-all"
                style={{ color: "#00ADB5" }}
              >
                contact@nextstep.com
              </a>
            </div>

            {/* Location */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 group">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: "#00ADB5" }}>
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Visit Us</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Come say hello at our office
              </p>
              <p className="font-semibold" style={{ color: "#00ADB5" }}>
                India
              </p>
            </div>
          </div>

          {/* WhatsApp CTA */}
          <div className="rounded-2xl p-12 text-center shadow-2xl" style={{ background: "linear-gradient(to right, #00ADB5, #00969e)" }}>
            <div className="max-w-3xl mx-auto">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12" fill="#00ADB5" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Prefer WhatsApp?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Chat with us instantly on WhatsApp for quick responses
              </p>
              <a
                href="https://wa.me/918756824350"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-10 py-5 bg-white rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                style={{ color: "#00ADB5" }}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Start WhatsApp Chat
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Office Hours Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-12 border border-gray-100 dark:border-gray-700">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-8 h-8" style={{ color: "#00ADB5" }} />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Office Hours</h2>
                <div className="space-y-3 text-lg text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="font-semibold">Monday - Friday</span>
                    <span>9:00 AM - 6:00 PM IST</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="font-semibold">Saturday</span>
                    <span>10:00 AM - 4:00 PM IST</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-semibold">Sunday</span>
                    <span style={{ color: "#00ADB5" }}>Closed</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong style={{ color: "#00ADB5" }}>Note:</strong> WhatsApp support is available 24/7 
                    for urgent queries. We'll respond as quickly as possible!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Don't wait! Join NextStep today and start building your future
          </p>
          <a
            href="/commingsoon"
            className="inline-flex items-center px-10 py-5 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            style={{ backgroundColor: "#00ADB5" }}
          >
            <Send className="w-5 h-5 mr-2" />
            Join NextStep Now
          </a>
        </div>
      </section>
    </div>
  );
}
