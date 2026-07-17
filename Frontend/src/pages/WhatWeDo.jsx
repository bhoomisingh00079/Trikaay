import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "../components/Navbar";
import SiteFooter from "../components/SiteFooter";
import ApprovedComments from "../components/ApprovedComments";
import { apiUrl, normalizeAssetUrl } from "../utils/api";
import { useSyncListener, SYNC_EVENTS } from "../utils/sync";

export default function WhatWeDo() {
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [expandedIds, setExpandedIds] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [comments, setComments] = useState({});
  const fetchingProjects = useRef(false);
  const fetchingComments = useRef(false);

  const fetchProjects = useCallback(async () => {
    if (fetchingProjects.current) return;
    fetchingProjects.current = true;
    try {
      const response = await fetch(apiUrl('/api/projects'));
      const data = await response.json();
      if (response.ok) {
        setProjects(Array.isArray(data) ? data : []);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setIsLoadingProjects(false);
      fetchingProjects.current = false;
    }
  }, []);

  const fetchComments = useCallback(async () => {
    if (fetchingComments.current) return;
    fetchingComments.current = true;
    try {
      const response = await fetch(apiUrl('/api/comments/approved'));
      const data = await response.json();
      if (response.ok) {
        const commentsByProject = {};
        (data.data || []).forEach(comment => {
          if (!commentsByProject[comment.projectId]) {
            commentsByProject[comment.projectId] = [];
          }
          commentsByProject[comment.projectId].push(comment);
        });
        setComments(commentsByProject);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      fetchingComments.current = false;
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchComments();
  }, [fetchProjects, fetchComments]);

  useSyncListener(
    [SYNC_EVENTS.PROJECT_CREATED, SYNC_EVENTS.PROJECT_UPDATED, SYNC_EVENTS.PROJECT_DELETED, SYNC_EVENTS.COMMENTS_UPDATED],
    (event) => {
      if (event.type.startsWith('project-')) {
        fetchProjects();
      } else if (event.type === 'comments-updated') {
        fetchComments();
      }
    }
  );

  const toggleProject = (projectId) => {
    setExpandedIds(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleCommentSubmit = async (e, projectId) => {
    e.preventDefault();
    const name = "Anonymous";
    const commentText = commentInputs[projectId]?.trim();
    if (!commentText) return;

    try {
      console.log("📤 Sending comment to backend...");
      console.log("Request payload:", { name, text: commentText });
      
      const response = await fetch(apiUrl('/api/comments'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          text: commentText,
          projectId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ API Error:', response.status, data.error);
        throw new Error(data.error || 'Failed to submit comment');
      }

      console.log('✅ Comment submitted successfully:', data);
      alert('Comment submitted for approval');

      // Clear input field
      setCommentInputs(prev => ({
        ...prev,
        [projectId]: '',
      }));
    } catch (error) {
      console.error('❌ Error submitting comment:', error);
      alert('Failed to submit comment: ' + error.message);
    }
  };

  const handleCommentChange = (projectId, value) => {
    setCommentInputs(prev => ({
      ...prev,
      [projectId]: value,
    }));
  };

  const handleCommentDelete = (projectId, commentId) => {
    // Comments are managed by backend - cannot delete from frontend
    console.log('Info: Comments are managed by backend and cannot be deleted from frontend');
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen support-bg">
        {/* Projects Section */}
        <section className="px-4 py-12">
          <div className="mx-auto max-w-6xl">
            <h2 className="heading-section mb-8 text-center">
              Our Projects
            </h2>

            {isLoadingProjects ? (
              <p className="text-center text-brand-secondary">Loading projects...</p>
            ) : null}

            <div className="grid gap-6 md:grid-cols-2">
              {projects.map((project) => {
                const projectId = project._id || project.id;
                const isExpanded = expandedIds.includes(projectId);
                const title = project.title || "Project";
                const subtitle = project.marathiTitle || "";
                const shortDescription = project.shortDescriptionEn || project.description || "";
                const fullDescription = project.fullDescriptionEn || project.description || "";
                const shortDescriptionMr = project.shortDescriptionMr || "";
                const fullDescriptionMr = project.fullDescriptionMr || "";
                const image = normalizeAssetUrl(project.images?.[0] || project.image || "");

                return (
                  <article
                    key={projectId}
                    className="group overflow-hidden rounded-2xl bg-white shadow-[0_4px_15px_rgba(107,63,160,0.08)] transition-all duration-300 hover:shadow-[0_12px_30px_rgba(107,63,160,0.18)] hover:-translate-y-1"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={image}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    <div className="p-6">
                      <h3 className="mb-1 text-xl font-bold text-brand-heading">
                        {title}
                      </h3>
                      {subtitle ? (
                        <h4 className="mb-4 text-lg font-medium text-brand-purple">{subtitle}</h4>
                      ) : null}

                      <div className="mb-4 space-y-2">
                        <p className="text-sm leading-[1.5] text-brand-secondary">
                          {isExpanded ? fullDescription : shortDescription}
                        </p>
                        {shortDescriptionMr || fullDescriptionMr ? (
                          <p className="text-sm leading-[1.5] text-brand-muted">
                            {isExpanded ? fullDescriptionMr : shortDescriptionMr}
                          </p>
                        ) : null}
                      </div>

                      <button
                        onClick={() => toggleProject(projectId)}
                        className="rounded-lg bg-gradient-to-r from-[#6b3fa0] to-[#9b59b6] px-4 py-2 text-sm font-medium text-brand-inverse transition-all duration-200 hover:shadow-lg hover:scale-105"
                      >
                        {isExpanded ? "Show Less" : "Read More"}
                      </button>

                      {/* Comments Section */}
                      <div className="mt-6 border-t border-gray-200 pt-4">
                        <h5 className="mb-3 text-sm font-semibold text-brand-primary">Comments</h5>

                        {/* Comment Form */}
                        <form onSubmit={(e) => handleCommentSubmit(e, projectId)} className="mb-4">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={commentInputs[projectId] || ''}
                              onChange={(e) => handleCommentChange(projectId, e.target.value)}
                              placeholder="Share your feedback or suggestions..."
                              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-brand-primary focus:border-[#6b3fa0] focus:outline-none focus:ring-1 focus:ring-[#6b3fa0]"
                            />
                            <button
                              type="submit"
                              className="rounded-lg bg-[#6b3fa0] px-4 py-2 text-sm font-medium text-brand-inverse transition-all duration-200 hover:shadow-md"
                            >
                              Submit
                            </button>
                          </div>
                        </form>

                        {/* Approved comments rendered by shared component */}
                        <ApprovedComments projectId={projectId} comments={comments} />
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
