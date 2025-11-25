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
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { companies } from "../../data";
import { useDataContext } from "../../Context/UserDataContext";
import { useAuth } from "../../Context/AuthContext";

// const industryColors: Record<string, string> = {
//   Technology: "from-blue-500 to-cyan-500",
//   "E-commerce & Cloud": "from-orange-500 to-pink-500",
//   "IT Services": "from-purple-500 to-indigo-500",
//   "E-commerce": "from-red-500 to-orange-500",
//   "Software & Design": "from-pink-500 to-rose-500",
//   "Cloud & CRM": "from-teal-500 to-green-500",
// };

export default function JobExplorer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [jobTypeFilter, setJobTypeFilter] = useState<string | null>(null);
  const [companiesList, setCompaniesList] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const { user } = useAuth();
  const { fetchCompanies, addCompanyToTarget, pushDataToFirestore } = useDataContext();

  // Fetch companies from Firebase on mount
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const fetchedCompanies = await fetchCompanies();
        
        // If no companies in Firebase, push the static data
        if (fetchedCompanies.length === 0) {
          await pushDataToFirestore("Companies", companies);
          setCompaniesList(companies);
        } else {
          setCompaniesList(fetchedCompanies);
        }
      } catch (error) {
        console.error("Error loading companies:", error);
        // Fallback to static data
        setCompaniesList(companies);
      } finally {
        setLoadingCompanies(false);
      }
    };

    loadCompanies();
  }, []);

  const industries = [...new Set(companiesList.map((j) => j.industry))];
  const locations = [...new Set(companiesList.map((j) => j.location))];
  const jobTypes = [...new Set(companiesList.map((j) => j.job_type))];

  // ✅ Optimized filtering with useMemo
  const filteredJobs = useMemo(() => {
    return companiesList.filter((job) => {
      const matchesSearch =
        job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.job_role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.required_skills.some((s: string) =>
          s.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesIndustry = !activeFilter || job.industry === activeFilter;
      const matchesLocation = !locationFilter || job.location === locationFilter;
      const matchesType = !jobTypeFilter || job.job_type === jobTypeFilter;

      return matchesSearch && matchesIndustry && matchesLocation && matchesType;
    });
  }, [searchTerm, activeFilter, locationFilter, jobTypeFilter, companiesList]);
  
  const addcompanyToTarget = async (companyId: string) => {
    if (!user) {
      alert("⚠️ Please login to add companies to your targets!");
      return;
    }
    
    try {
      await addCompanyToTarget(companyId);
      alert("✅ Company added to your targets!");
    } catch (error) {
      console.error("Error adding company to targets:", error);
      alert("❌ Failed to add company. Please try again.");
    }
  };

  const handleVisit = (job: any) => {
    if (job.apply_link) {
      window.open(job.apply_link, "_blank");
    } else {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(job.company_name + " careers " + job.job_role)}`, "_blank");
    }
  };

  if (loadingCompanies) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading companies...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <header className="text-white relative overflow-hidden" style={{ backgroundColor: '#00ADB5' }}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white hover:shadow-md transition-all"
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
              // const gradient = industryColors[job.industry] || "from-gray-400 to-gray-500";
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.3 }}
                  className="group bg-white rounded-2xl overflow-hidden border hover:shadow-xl transition-all hover:scale-[1.02]"
                >
                  <div className="h-2" style={{ backgroundColor: '#00ADB5' }} />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold" style={{ backgroundColor: '#00ADB5' }}>
                          {job.company_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-medium">{job.company_name}</h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {job.industry}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-200 font-medium">
                        {job.job_type}
                      </span>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-4">{job.job_role}</h4>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
                        <IndianRupee className="text-blue-600 w-4 h-4" /> 
                        <span className="font-semibold text-blue-700">{job.package_lpa} LPA</span>
                      </div>
                      <div className="flex items-center gap-2 bg-purple-50 p-2 rounded-lg">
                        <Briefcase className="text-purple-600 w-4 h-4" /> 
                        <span className="font-medium text-purple-700">{job.experience_required}</span>
                      </div>
                      <div className="col-span-2 flex items-center gap-2 bg-orange-50 p-2 rounded-lg">
                        <MapPin className="text-orange-600 w-4 h-4" /> 
                        <span className="font-medium text-orange-700">{job.location}</span>
                      </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4" />

                    <div className="text-sm space-y-2.5 mb-4">
                      <p className="flex items-center gap-2 text-gray-600">
                        <GraduationCap className="w-4 h-4 text-cyan-500" /> 
                        <span className="font-medium">{job.education}</span>
                      </p>
                      <p className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-cyan-500" /> 
                        <span>Hiring for <span className="font-medium text-gray-900">{job.hiring_for}</span></span>
                      </p>
                    </div>

                    <div className="mb-5">
                      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Required Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {job.required_skills.slice(0, 4).map((s: string, i: number) => (
                          <span
                            key={i}
                            className="px-3 py-1 text-xs bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg font-medium text-gray-700 hover:border-cyan-300 transition-colors"
                          >
                            {s}
                          </span>
                        ))}
                        {job.required_skills.length > 4 && (
                          <span className="px-3 py-1 text-xs bg-cyan-50 border border-cyan-200 rounded-lg font-medium text-cyan-700">
                            +{job.required_skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVisit(job)}
                        className="flex-1 py-3 text-white rounded-xl flex justify-center items-center gap-2 hover:opacity-90 transition-all font-semibold"
                        style={{ backgroundColor: '#00ADB5' }}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Visit & Apply
                      </button>
                      <button
                        onClick={() => addcompanyToTarget(job.id)}
                        className="px-4 py-3 text-white rounded-xl hover:opacity-90 transition-all"
                        style={{ backgroundColor: '#00ADB5' }}
                        title="Add to your targets"
                      >
                        <Target className="w-5 h-5" />
                      </button>
                    </div>
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
