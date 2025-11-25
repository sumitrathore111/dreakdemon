import { useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useDataContext } from '../../Context/UserDataContext';
import { Lightbulb, Send, FileText, Clock, Tag } from 'lucide-react';

export default function IdeaSubmission() {
  const { user } = useAuth();
  const { submitIdea } = useDataContext();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    expectedTimeline: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    'Web Development',
    'Mobile App',
    'AI/ML',
    'Data Science',
    'Game Development',
    'IoT',
    'Blockchain',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to submit an idea');
      return;
    }

    setSubmitting(true);
    try {
      // Submit to Firebase
      await submitIdea(formData);
      
      setSubmitted(true);
      setFormData({ title: '', description: '', category: '', expectedTimeline: '' });
    } catch (error) {
      console.error('Error submitting idea:', error);
      alert('Failed to submit idea. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00ADB5] to-cyan-600 flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Submit Your Idea</h1>
              <p className="text-gray-600">Share your project idea and get it approved</p>
            </div>
          </div>
        </div>

        {submitted && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-green-900">Idea Submitted Successfully!</h3>
                <p className="text-sm text-green-700">Your idea is pending admin review. You'll receive an email notification once it's reviewed.</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <FileText className="w-4 h-4" />
                Project Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="E.g., E-Learning Platform for Students"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00ADB5] focus:outline-none transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <FileText className="w-4 h-4" />
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your project idea, its goals, target audience, and key features..."
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00ADB5] focus:outline-none transition-colors resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 100 characters</p>
            </div>

            {/* Category */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Tag className="w-4 h-4" />
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00ADB5] focus:outline-none transition-colors"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Timeline */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Clock className="w-4 h-4" />
                Expected Timeline *
              </label>
              <input
                type="text"
                required
                value={formData.expectedTimeline}
                onChange={(e) => setFormData({ ...formData, expectedTimeline: e.target.value })}
                placeholder="E.g., 3 months, 6 weeks, etc."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00ADB5] focus:outline-none transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-[#00ADB5] to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {submitting ? 'Submitting...' : 'Submit Idea for Review'}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="font-bold text-blue-900 mb-2">What happens next?</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">1.</span>
              <span>Your idea will be reviewed by our admin team within 2-3 business days</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">2.</span>
              <span>You'll receive an email notification about the approval status</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">3.</span>
              <span>If approved, you'll become a Creator and can start your project!</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">4.</span>
              <span>You can manage tasks, team members, and track progress</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
