import { useState } from 'react';
import { ValidationRules, validateForm, sanitizeInput } from '../utils/validation';

export default function CommentForm() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
  const [formData, setFormData] = useState({
    name: '',
    text: '',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
    // Clear messages on input change
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setSuccessMessage('');
    setErrorMessage('');

    // Validate form
    const { isValid, errors } = validateForm(formData, {
      name: 'name',
      text: 'message',
    });

    if (!isValid) {
      setValidationErrors(errors);
      setErrorMessage('Please fix the errors below before submitting.');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = `${API_URL}/comments`;
      console.log('📤 Sending comment to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: sanitizeInput(formData.name),
          text: sanitizeInput(formData.text),
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
        {/* Success Message */}
        {successMessage && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-green-700 text-sm">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
            {errorMessage}
          </div>
        )}

        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your name"
            required
            aria-invalid={!!validationErrors.name}
            aria-describedby={validationErrors.name ? 'name-error' : undefined}
            className={`w-full rounded-lg border px-4 py-2 text-gray-900 focus:outline-none focus:ring-1 ${
              validationErrors.name
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-[#6b3fa0] focus:ring-[#6b3fa0]'
            }`}
          />
          {validationErrors.name && (
            <p id="name-error" className="mt-1 text-sm text-red-600">
              {validationErrors.name}
            </p>
          )}
        </div>

        {/* Comment Input */}
        <div>
          <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
            Your Comment *
          </label>
          <textarea
            id="text"
            name="text"
            value={formData.text}
            onChange={handleInputChange}
            placeholder="Share your feedback or suggestions..."
            required
            rows="4"
            aria-invalid={!!validationErrors.text}
            aria-describedby={validationErrors.text ? 'text-error' : undefined}
            className={`w-full rounded-lg border px-4 py-2 text-gray-900 focus:outline-none focus:ring-1 ${
              validationErrors.text
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-[#6b3fa0] focus:ring-[#6b3fa0]'
            }`}
          />
          {validationErrors.text && (
            <p id="text-error" className="mt-1 text-sm text-red-600">
              {validationErrors.text}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.text.length}/5000 characters
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-medium transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Submitting...' : 'Submit Comment'}
        </button>
      </form>
    </div>
  );
}
