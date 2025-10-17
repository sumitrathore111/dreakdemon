import {
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Building2,
  Briefcase,
  MapPin,
  GraduationCap,
  Calendar,
  IndianRupee,
  Filter,
  X,
  ExternalLink,
  Target,
} from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { companies } from "../../data";
import { useDataContext } from "../../Context/UserDataContext";
import { useAuth } from "../../Context/AuthContext";

const industryColors: Record<string, string> = {
  Technology: "from-blue-500 to-cyan-500",
  "E-commerce & Cloud": "from-orange-500 to-pink-500",
  "IT Services": "from-purple-500 to-indigo-500",
  "E-commerce": "from-red-500 to-orange-500",
  "Software & Design": "from-pink-500 to-rose-500",
  "Cloud & CRM": "from-teal-500 to-green-500",
};

export default function JobExplorer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [jobTypeFilter, setJobTypeFilter] = useState<string | null>(null);

  const industries = [...new Set(companies.map((j) => j.industry))];
  const locations = [...new Set(companies.map((j) => j.location))];
  const jobTypes = [...new Set(companies.map((j) => j.job_type))];

  // ✅ Optimized filtering with useMemo
  const filteredJobs = useMemo(() => {
    return companies.filter((job) => {
      const matchesSearch =
        job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.job_role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.required_skills.some((s) =>
          s.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesIndustry = !activeFilter || job.industry === activeFilter;
      const matchesLocation = !locationFilter || job.location === locationFilter;
      const matchesType = !jobTypeFilter || job.job_type === jobTypeFilter;

      return matchesSearch && matchesIndustry && matchesLocation && matchesType;
    });
  }, [searchTerm, activeFilter, locationFilter, jobTypeFilter]);
  const { user } = useAuth()
  const { addObjectToUserArray } = useDataContext()

  const addcompnaytotarget = (compnay_id: string) => {
    if (user) {

      addObjectToUserArray(user.uid, 'Target', compnay_id)
    }

  }
  const handleApply = (link: string) => window.open(link, "_blank");

  return (
    <div className="min-h-screen ">
      <header className="text-white relative overflow-hidden" style={{ backgroundColor: '#00ADB5' }}>
        <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-6 h-6 text-yellow-300" />
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm border border-white/30 backdrop-blur-sm">
              2025 Campus Hiring
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-semibold mb-3">
            Discover Your Dream Job
          </h1>
          <p className="text-lg text-white/90 mb-8 max-w-2xl">
            Explore exciting opportunities from India's top companies. Your future starts here.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-md">
            {[
              {
                icon: Building2,
                label: "Companies",
                value: new Set(companies.map((j) => j.company_name)).size,
              },
              { icon: TrendingUp, label: "Open Roles", value: companies.length },
              { icon: Users, label: "Industries", value: industries.length },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-md"
              >
                <div className="flex items-center gap-2 text-sm text-white/80 mb-1">
                  <stat.icon className="w-5 h-5" /> {stat.label}
                </div>
                <p className="text-2xl font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </header>


      <section className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by company, role, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl  text-white hover:shadow-md transition-all"
            style={{ backgroundColor: '#00ADB5' }}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>
      </section>

      {/* ================= FILTER DRAWER ================= */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="fixed top-0 right-0 w-80 h-full bg-white shadow-2xl z-50 p-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-700">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Industry Filter */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Industry</h3>
              <div className="flex flex-wrap gap-2">
                {industries.map((ind) => (
                  <button
                    key={ind}
                    onClick={() =>
                      setActiveFilter(activeFilter === ind ? null : ind)
                    }
                    className={`px-3 py-1.5 rounded-full text-sm  ${activeFilter === ind
                      ? ""
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                      } ${activeFilter !== ind
                        ? "border  "
                        : "text-white"

                      }`}
                    style={{ backgroundColor: activeFilter === ind ? "#00ADB5" : '', }}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Location</h3>
              <div className="flex flex-wrap gap-2">
                {locations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() =>
                      setLocationFilter(locationFilter === loc ? null : loc)
                    }
                    className={`px-3 py-1.5 rounded-full text-sm  ${locationFilter === loc
                      ? ""
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                      } ${locationFilter !== loc
                        ? "border  "
                        : "text-white"

                      }`}
                    style={{ backgroundColor: locationFilter === loc ? "#00ADB5" : '', }}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Job Type Filter */}
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Job Type</h3>
              <div className="flex flex-wrap gap-2">
                {jobTypes.map((jt) => (
                  <button
                    key={jt}
                    onClick={() =>
                      setJobTypeFilter(jobTypeFilter === jt ? null : jt)
                    }
                    className={`px-3 py-1.5 rounded-full text-sm  ${jobTypeFilter === jt
                      ? ""
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                      } ${jobTypeFilter !== jt
                        ? "border  "
                        : "text-white"

                      }`}
                    style={{ backgroundColor: jobTypeFilter === jt ? "#00ADB5" : '', }}
                  >
                    {jt}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= JOB CARDS ================= */}
      <main className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredJobs.length ? (
            filteredJobs.map((job) => {
              const gradient = industryColors[job.industry] || "from-gray-400 to-gray-500";
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl overflow-hidden border hover:shadow-xl transition-all hover:scale-[1.02]"
                >
                  <div className={`h-2 `} style={{ backgroundColor: '#00ADB5' }} />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          style={{ backgroundColor: '#00ADB5' }}
                          className={`w-12 h-12 rounded-xl  flex items-center justify-center text-white font-semibold`}
                        >
                          {job.company_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-medium">{job.company_name}</h3>
                          <p className="text-xs text-gray-500">{job.industry}</p>
                        </div>
                      </div>
                      <span className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-md border border-green-200">
                        {job.job_type}
                      </span>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-4">{job.job_role}</h4>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <IndianRupee className="text-blue-600 w-4 h-4" /> {job.package_lpa} LPA
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="text-purple-600 w-4 h-4" /> {job.experience_required}
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <MapPin className="text-orange-600 w-4 h-4" /> {job.location}
                      </div>
                    </div>

                    <div className="h-px bg-gray-200 my-4" />

                    <div className="text-sm space-y-2 mb-4">
                      <p className="flex items-center gap-2 text-gray-600">
                        <GraduationCap className="w-4 h-4 text-gray-400" /> {job.education}
                      </p>
                      <p className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" /> Hiring for {job.hiring_for}
                      </p>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Required Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {job.required_skills.map((s: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs bg-gray-100 border border-gray-200 rounded-lg"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      // onClick={() => handleApply(job.apply_link)}
                      className={`w-full py-3 text-white rounded-xl flex justify-center items-center gap-2 hover:opacity-90 transition-all`}
                      style={{ backgroundColor: '#00ADB5' }}
                    >
                      Add In Target <Target className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-20">
              <Search className="w-10 h-10 text-gray-400 mx-auto mb-4" />
              <h3 className="text-gray-700 mb-2">No opportunities found</h3>
              <p className="text-gray-500">Try adjusting your search or filters.</p>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
