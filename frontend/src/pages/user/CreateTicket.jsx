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
        <h1 className="text-2xl font-bold mb-6 text-center">Create New Ticket</h1>

        <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Your Branch:</strong> {user?.branch_name || 'Not assigned'}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Problem Type <span className="text-red-500">*</span>
            </label>
            <select
              name="problem_type"
              value={formData.problem_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Problem Type</option>
              <option value="it">IT Support</option>
              <option value="underwriting">Underwriting</option>
              <option value="mis">MIS</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of your issue"
              required
              minLength={5}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="6"
              placeholder="Detailed description of your issue..."
              required
              minLength={10}
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-gray-700 text-sm font-bold">
                Attach Images (Optional)
              </label>
              {selectedFiles.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedFiles([])}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove all
                </button>
              )}
            </div>
            {selectedFiles.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-16 h-16 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = selectedFiles.filter((_, i) => i !== index);
                        setSelectedFiles(updated);
                      }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <UploadField onUpload={setSelectedFiles} uploading={uploading} />
            <p className="text-xs text-gray-500 mt-2">
              Supported: JPG, PNG, GIF, WEBP (max 5 files, 5MB each). Images are auto-compressed. You can also add files later from the ticket page.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading || uploading ? 'Creating...' : 'Create Ticket'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/user/tickets')}
              className="w-full sm:w-auto bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
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
