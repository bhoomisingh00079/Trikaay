import { useState } from 'react';

export default function CommentForm() {
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";
  const [formData, setFormData] = useState({
    name: '',
    text: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear messages on input change
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const apiUrl = `${API_URL}/comments`;
      console.log('📤 Sending comment to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          text: formData.text.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ API Error:', response.status, data.error);
        throw new Error(data.error || 'Failed to submit comment');
      }

      console.log('✅ Comment submitted successfully');
      setSuccessMessage('Thank you! Your comment has been submitted successfully.');
      
      // Clear form
      setFormData({
        name: '',
        text: '',
      });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error) {
      console.error('❌ Error submitting comment:', error.message);
      
      if (error instanceof TypeError) {
        // Network error
        setErrorMessage('Network error: Could not reach the server. Is the backend running on port 5001?');
      } else {
        setErrorMessage(error.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-2xl font-bold text-gray-900">Share Your Feedback</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your name"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-[#6b3fa0] focus:outline-none focus:ring-1 focus:ring-[#6b3fa0]"
          />
        </div>

        {/* Comment Input */}
        <div>
          <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
            Your Comment
          </label>
          <textarea
            id="text"
            name="text"
            value={formData.text}
            onChange={handleInputChange}
            placeholder="Share your feedback or suggestions..."
            required
            rows="4"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-[#6b3fa0] focus:outline-none focus:ring-1 focus:ring-[#6b3fa0]"
          />
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-green-700">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-gradient-to-r from-[#6b3fa0] to-[#9b59b6] px-6 py-2 text-sm font-medium text-white transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Submitting...' : 'Submit Comment'}
        </button>
      </form>
    </div>
  );
}
