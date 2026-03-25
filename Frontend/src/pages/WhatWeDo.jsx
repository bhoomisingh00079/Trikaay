import { useState } from "react";
import Navbar from "../components/Navbar";
import SiteFooter from "../components/SiteFooter";
import projects from "../data/projects";

export default function WhatWeDo() {
  const [expandedIds, setExpandedIds] = useState([]);
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  const toggleProject = (projectId) => {
    setExpandedIds(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleCommentSubmit = (e, projectId) => {
    e.preventDefault();
    const commentText = commentInputs[projectId]?.trim();
    if (!commentText) return;

    const newComment = {
      id: Date.now(),
      text: commentText,
      timestamp: new Date().toLocaleString(),
    };

    setComments(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), newComment],
    }));

    setCommentInputs(prev => ({
      ...prev,
      [projectId]: '',
    }));
  };

  const handleCommentChange = (projectId, value) => {
    setCommentInputs(prev => ({
      ...prev,
      [projectId]: value,
    }));
  };

  const handleCommentDelete = (projectId, commentId) => {
    setComments(prev => ({
      ...prev,
      [projectId]: prev[projectId].filter(comment => comment.id !== commentId),
    }));
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f3f3f3]">
        {/* Projects Section */}
        <section className="px-4 py-12">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
              Our Projects
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              {projects.map((project) => {
                const isExpanded = expandedIds.includes(project.id);

                return (
                  <article
                    key={project.id}
                    className="group overflow-hidden rounded-2xl bg-white shadow-[0_4px_15px_rgba(107,63,160,0.08)] transition-all duration-300 hover:shadow-[0_12px_30px_rgba(107,63,160,0.18)] hover:-translate-y-1"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    <div className="p-6">
                      <h3 className="mb-1 text-xl font-bold text-gray-900">
                        {project.title}
                      </h3>
                      <h4 className="mb-4 text-lg font-medium text-[#6b3fa0]">
                        {project.marathiTitle}
                      </h4>

                      <div className="mb-4 space-y-2">
                        <p className="text-sm leading-[1.5] text-gray-700">
                          {isExpanded ? project.fullDescriptionEn : project.shortDescriptionEn}
                        </p>
                        <p className="text-sm leading-[1.5] text-gray-600">
                          {isExpanded ? project.fullDescriptionMr : project.shortDescriptionMr}
                        </p>
                      </div>

                      <button
                        onClick={() => toggleProject(project.id)}
                        className="rounded-lg bg-gradient-to-r from-[#6b3fa0] to-[#9b59b6] px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:shadow-lg hover:scale-105"
                      >
                        {isExpanded ? "Show Less" : "Read More"}
                      </button>

                      {/* Comments Section */}
                      <div className="mt-6 border-t border-gray-200 pt-4">
                        <h5 className="mb-3 text-sm font-semibold text-gray-800">Comments</h5>

                        {/* Comment Form */}
                        <form onSubmit={(e) => handleCommentSubmit(e, project.id)} className="mb-4">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={commentInputs[project.id] || ''}
                              onChange={(e) => handleCommentChange(project.id, e.target.value)}
                              placeholder="Share your feedback or suggestions..."
                              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#6b3fa0] focus:outline-none focus:ring-1 focus:ring-[#6b3fa0]"
                            />
                            <button
                              type="submit"
                              className="rounded-lg bg-[#6b3fa0] px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-[#5a2d8a] hover:shadow-md"
                            >
                              Submit
                            </button>
                          </div>
                        </form>

                        {/* Comments List */}
                        {comments[project.id] && comments[project.id].length > 0 && (
                          <div className="space-y-3">
                            {comments[project.id].map((comment) => (
                              <div
                                key={comment.id}
                                className="relative rounded-lg bg-gray-50 p-3 text-sm"
                              >
                                <button
                                  onClick={() => handleCommentDelete(project.id, comment.id)}
                                  className="absolute right-2 top-2 text-red-500 hover:text-red-700 transition-colors duration-200"
                                  title="Delete comment"
                                >
                                  <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                                <p className="pr-8 text-gray-800">{comment.text}</p>
                                <p className="mt-1 pr-8 text-xs text-gray-500">{comment.timestamp}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
