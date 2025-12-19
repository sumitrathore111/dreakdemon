import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { useDataContext } from '../../Context/UserDataContext';
import { createProject } from '../../service/marketplaceService';
import type { CreateProjectData, LicenseType, ProjectCategory } from '../../types/marketplace';
import { CATEGORY_LABELS, LICENSE_LABELS, TECH_STACK_OPTIONS } from '../../types/marketplace';

export default function CreateListing() {
  const { user } = useAuth();
  const { userprofile, avatrUrl } = useDataContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CreateProjectData>({
    title: '',
    description: '',
    category: 'web-app',
    techStack: [],
    price: 0,
    isFree: true,
    images: [],
    links: {
      github: '',
      liveDemo: '',
      documentation: '',
      video: '',
    },
    licenseType: 'personal',
    status: 'published',
  });

  const [techInput, setTechInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTech = (tech: string) => {
    if (tech && !formData.techStack.includes(tech)) {
      setFormData({
        ...formData,
        techStack: [...formData.techStack, tech],
      });
      setTechInput('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setFormData({
      ...formData,
      techStack: formData.techStack.filter((t) => t !== tech),
    });
  };

  const handleAddImage = () => {
    if (imageInput && !formData.images.includes(imageInput)) {
      setFormData({
        ...formData,
        images: [...formData.images, imageInput],
      });
      setImageInput('');
    }
  };

  const handleRemoveImage = (image: string) => {
    setFormData({
      ...formData,
      images: formData.images.filter((img) => img !== image),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !userprofile?.name) {
      toast.error('You must be logged in');
      return;
    }

    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.techStack.length === 0) {
      toast.error('Please add at least one technology');
      return;
    }

    setIsSubmitting(true);
    try {
      const projectId = await createProject(
        formData,
        user.uid,
        userprofile.name,
        avatrUrl || ''
      );
      toast.success('Project listed successfully!');
      navigate(`/dashboard/marketplace/project/${projectId}`);
    } catch (error: any) {
      console.error('Error creating project:', error);
      
      // Provide specific error messages
      if (error?.code === 'permission-denied') {
        toast.error('Permission denied! Please deploy Firestore rules first.\n\nGo to Firebase Console → Firestore → Rules → Publish');
      } else if (error?.message) {
        toast.error(`Failed to create listing: ${error.message}`);
      } else {
        toast.error('Failed to create listing. Check browser console for details.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/dashboard/marketplace')}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Marketplace
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-teal-600 bg-clip-text text-transparent mb-2">
            List Your Project
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Share your amazing project with the community
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white dark:focus:bg-gray-800 transition-all"
                placeholder="e.g., E-commerce Platform with React & Node.js"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white dark:focus:bg-gray-800 transition-all"
                placeholder="Describe your project, its features, and what makes it special..."
                required
              />
            </div>

            {/* Category & License */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ProjectCategory })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  License Type *
                </label>
                <select
                  value={formData.licenseType}
                  onChange={(e) => setFormData({ ...formData, licenseType: e.target.value as LicenseType })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  {Object.entries(LICENSE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Tech Stack *
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTech(techInput);
                    }
                  }}
                  list="tech-options"
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white dark:focus:bg-gray-800 transition-all"
                  placeholder="Type or select technology..."
                />
                <datalist id="tech-options">
                  {TECH_STACK_OPTIONS.map((tech) => (
                    <option key={tech} value={tech} />
                  ))}
                </datalist>
                <button
                  type="button"
                  onClick={() => handleAddTech(techInput)}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="hover:text-purple-900 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Pricing
              </label>
              <div className="flex items-center gap-4 mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.isFree}
                    onChange={() => setFormData({ ...formData, isFree: true, price: 0 })}
                    className="w-4 h-4 text-teal-500"
                  />
                  <span className="text-gray-900 dark:text-white">Free</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!formData.isFree}
                    onChange={() => setFormData({ ...formData, isFree: false })}
                    className="w-4 h-4 text-teal-500"
                  />
                  <span className="text-gray-900 dark:text-white">Paid</span>
                </label>
              </div>
              {!formData.isFree && (
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">$</span>
                  <input
                    type="number"
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white dark:focus:bg-gray-600 transition-all"
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Project Images (URLs)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="url"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddImage();
                    }
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white dark:focus:bg-gray-600 transition-all"
                  placeholder="https://example.com/image.jpg"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Add
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(image)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  GitHub Repository
                </label>
                <input
                  type="url"
                  value={formData.links.github}
                  onChange={(e) => setFormData({ ...formData, links: { ...formData.links, github: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Live Demo
                </label>
                <input
                  type="url"
                  value={formData.links.liveDemo}
                  onChange={(e) => setFormData({ ...formData, links: { ...formData.links, liveDemo: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="https://demo.example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Documentation
                </label>
                <input
                  type="url"
                  value={formData.links.documentation}
                  onChange={(e) => setFormData({ ...formData, links: { ...formData.links, documentation: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="https://docs.example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Video Demo (YouTube, etc.)
                </label>
                <input
                  type="url"
                  value={formData.links.video}
                  onChange={(e) => setFormData({ ...formData, links: { ...formData.links, video: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard/marketplace')}
                className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Publish Project</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}




