import { useState, useEffect } from 'react';

export default function ApprovedComments({ projectId, comments }) {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Comments are passed as prop, so no loading needed
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Community Feedback</h2>
        <div className="flex justify-center py-8">
          <div className="text-gray-500">Loading comments...</div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Community Feedback</h2>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
          {errorMessage}
        </div>
      </div>
    );
  }

  const displayedComments = comments[projectId] || [];

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Community Feedback</h2>

      {displayedComments.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          No comments yet. Be the first to share your feedback!
        </div>
      ) : (
        <div className="space-y-4">
          {displayedComments.map((comment, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{comment.name}</h3>
                  <p className="mt-2 text-gray-700 leading-relaxed">{comment.text}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-500">{comment.timestamp}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
