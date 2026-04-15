import UserLayout from '../../layouts/UserLayout';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import UploadField from '../../components/UploadField';

const CreateTicket = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    problem_type: '',
    title: '',
    description: '',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await ticketService.create(formData);
      const ticketId = response.data.id;

      if (selectedFiles.length > 0) {
        setUploading(true);
        for (const file of selectedFiles) {
          const fd = new FormData();
          fd.append('file', file);
          await ticketService.upload(ticketId, fd);
        }
      }

      navigate(`/user/tickets/${ticketId}`);
    } catch (err) {
      console.error('Create ticket error:', err);
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.errors?.[0]?.message ||
                          'Failed to create ticket. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <UserLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Create New Ticket</h1>
            <p className="text-sm text-[var(--text-muted)]">Submit a support request</p>
          </div>
        </div>

        <div className="rounded-xl border p-6" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
          <div className="mb-5 p-4 rounded-xl" style={{ background: "linear-gradient(135deg, var(--primary-light), transparent)" }}>
            <p className="text-sm" style={{ color: "var(--primary)" }}>
              <span className="font-semibold">Your Branch:</span> {user?.branch_name || 'Not assigned'}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-900/30 dark:border-rose-800">
              <p className="text-sm text-rose-600 dark:text-rose-300">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </span>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                Problem Type <span className="text-rose-500">*</span>
              </label>
              <select
                name="problem_type"
                value={formData.problem_type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
                style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
                required
              >
                <option value="">Select Problem Type</option>
                <option value="it">IT Support</option>
                <option value="underwriting">Underwriting</option>
                <option value="mis">MIS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                Title <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
                  style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
                  placeholder="Brief description of your issue"
                  required
                  minLength={5}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
                style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all resize-none"
                style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
                rows="6"
                placeholder="Detailed description of your issue..."
                required
                minLength={10}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                  Attach Images (Optional)
                </label>
                {selectedFiles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedFiles([])}
                    className="text-xs font-medium text-rose-500 hover:underline"
                  >
                    Remove all
                  </button>
                )}
              </div>
              {selectedFiles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-xl border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = selectedFiles.filter((_, i) => i !== index);
                          setSelectedFiles(updated);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <UploadField onUpload={setSelectedFiles} uploading={uploading} />
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                Supported: JPG, PNG, GIF, WEBP (max 5 files, 5MB each). Images are auto-compressed. You can also add files later from the ticket page.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-active))" }}
              >
                {loading || uploading ? 'Creating...' : 'Create Ticket'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/user/tickets')}
                className="px-6 py-2.5 rounded-xl font-medium border transition-all hover:bg-[var(--bg-muted)]"
                style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </UserLayout>
  );
};

export default CreateTicket;
