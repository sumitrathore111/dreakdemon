import { Bold, Clock, FileText, Italic, Lightbulb, Link2, List, ListOrdered, Send, Tag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function IdeaSubmission() {
  // Simulated auth and data context
  const user = { name: 'Demo User' }; // Replace with useAuth()
  const submitIdea = async (data: any) => { console.log('Submitting:', data); }; // Replace with useDataContext()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    expectedTimeline: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    // Initialize editor content
    if (editorRef.current && formData.description) {
      editorRef.current.innerHTML = formData.description;
    }
  }, []);

  const handleEditorInput = () => {
    if (editorRef.current) {
      setFormData({ ...formData, description: editorRef.current.innerHTML });
    }
  };

  const execCommand = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value || undefined);
    editorRef.current?.focus();
    handleEditorInput();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

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
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
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
          <div className="space-y-6">
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Description with Rich Text Editor */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <FileText className="w-4 h-4" />
                Description *
              </label>
              
              {/* Rich Text Toolbar */}
              <div className="flex items-center gap-1 p-2 bg-gray-50 border-2 border-gray-200 rounded-t-xl border-b-0">
                <button
                  type="button"
                  onClick={() => execCommand('bold')}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand('italic')}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand('underline')}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="Underline"
                >
                  <span className="text-sm font-bold underline">U</span>
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button
                  type="button"
                  onClick={() => execCommand('insertUnorderedList')}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand('insertOrderedList')}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="Numbered List"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button
                  type="button"
                  onClick={insertLink}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="Insert Link"
                >
                  <Link2 className="w-4 h-4" />
                </button>
                <select
                  onChange={(e) => execCommand('formatBlock', e.target.value)}
                  className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm"
                  defaultValue="p"
                >
                  <option value="p">Paragraph</option>
                  <option value="h1">Heading 1</option>
                  <option value="h2">Heading 2</option>
                  <option value="h3">Heading 3</option>
                </select>
              </div>

              {/* Rich Text Editor Area */}
              <div
                ref={editorRef}
                contentEditable
                onInput={handleEditorInput}
                className="w-full min-h-[200px] px-4 py-3 border-2 border-gray-200 rounded-b-xl focus:border-cyan-500 focus:outline-none transition-colors overflow-auto"
                data-placeholder="Describe your project idea, its goals, target audience, and key features..."
              />
              <style>{`
                [contenteditable]:empty:before {
                  content: attr(data-placeholder);
                  color: #9ca3af;
                  pointer-events: none;
                }
                [contenteditable] h1 {
                  font-size: 2em;
                  font-weight: bold;
                  margin: 0.67em 0;
                }
                [contenteditable] h2 {
                  font-size: 1.5em;
                  font-weight: bold;
                  margin: 0.75em 0;
                }
                [contenteditable] h3 {
                  font-size: 1.17em;
                  font-weight: bold;
                  margin: 0.83em 0;
                }
                [contenteditable] ul, [contenteditable] ol {
                  margin: 1em 0;
                  padding-left: 2em;
                }
                [contenteditable] a {
                  color: #06b6d4;
                  text-decoration: underline;
                }
              `}</style>
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-colors"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {submitting ? 'Submitting...' : 'Submit Idea for Review'}
            </button>
          </div>
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