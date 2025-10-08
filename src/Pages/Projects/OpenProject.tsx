import  { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../service/Firebase";

export type Project = {

  name: string;
  techStack: string;
  idea: string;
  shortDescription: string;
  createdAt: string;
};



const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function ProjectList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([

  ]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    techStack: "",
    idea: "",
    shortDescription: "",
  });
  const [error, setError] = useState("");

  const addProject = () => {
    setError("");
    if (!form.name.trim() || !form.techStack.trim() || !form.idea.trim()) {
      setError("Please fill in all required fields: Name, Tech Stack, and Idea.");
      return;
    }

    const newProject: Project = {

      name: form.name.trim(),
      techStack: form.techStack.trim(),
      idea: form.idea.trim(),
      shortDescription: form.shortDescription.trim(),
      createdAt: new Date().toISOString(),
    };

    setProjects((prev) => [newProject, ...prev]);
    setForm({ name: "", techStack: "", idea: "", shortDescription: "" });
    setShowForm(false);
  };
  useEffect(() => {
    const fetchProjects = async () => {
      const querySnapshot = await getDocs(collection(db, "Open_Projects"));
      setProjects(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchProjects();
  }, []);
  return (
    <div className="min-h-screen p-6  flex items-start justify-center">
      <div className="w-full max-w-6xl">
        <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Project </h1>
            <p className="text-sm text-gray-500 mt-1">Select a Project where you can Contribute </p>
          </div>

          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg shadow bg-cyan-500 text-white font-semibold text-sm hover:brightness-105 transition"
            aria-expanded={showForm}
          >
            {showForm ? "Close" : "I have a Idea "}
          </button>
        </header>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-white border border-gray-200 rounded-2xl p-6 shadow"
            >
              <form onSubmit={(e) => { e.preventDefault(); addProject(); }} className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Project Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-1 focus:ring-cyan-200 focus:border-cyan-400 p-2"
                    placeholder="e.g. AI Contract Review Tool"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tech Stack *</label>
                  <input
                    value={form.techStack}
                    onChange={(e) => setForm({ ...form, techStack: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-1 focus:ring-cyan-200 focus:border-cyan-400 p-2"
                    placeholder="e.g. React, Node.js, MongoDB"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Idea *</label>
                  <input
                    value={form.idea}
                    onChange={(e) => setForm({ ...form, idea: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-1 focus:ring-cyan-200 focus:border-cyan-400 p-2"
                    placeholder="Brief idea of the project"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Short Description</label>
                  <textarea
                    value={form.shortDescription}
                    onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-1 focus:ring-cyan-200 focus:border-cyan-400 p-2"
                    placeholder="A few lines about the project"
                    rows={3}
                  />
                </div>

                {error && <div className="text-sm text-red-600">{error}</div>}

                <div className="flex items-center gap-3">
                  <button type="submit" className="px-5 py-2 rounded-lg font-semibold bg-cyan-600 text-white shadow">Submit Project</button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700">Cancel</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <main>
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.length === 0 && (
              <div className="col-span-full text-center py-10 text-gray-500">No projects yet — Send Your first project!</div>
            )}

            {projects.map((p) => (
              <motion.div
                key={p.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                onClick={() => navigate(`/dashboard/openproject/${p.id}`)}
                className="bg-white rounded-2xl p-5 shadow border border-gray-100 cursor-pointer hover:shadow-md transition"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-1">{p.title}</h3>
                  <p className="text-gray-700 line-clamp-4">{p.shortDescription || p.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.techStack?.map((tech: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
