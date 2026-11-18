import React, { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit3, Sparkles, LogOut, FileText, CheckCircle2 } from "lucide-react";
import "./App.css";

const API_BASE = "http://localhost:5000/api/v1";

export default function App() {
  // Authentication State
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  const [authForm, setAuthForm] = useState({ name: "", email: "rahul@example.com", password: "password123" });
  const [authError, setAuthError] = useState("");

  // Notes & UI State
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteForm, setNoteForm] = useState({
    title: "",
    content: "",
    category: "general",
    tags: ""
  });
  const [formError, setFormError] = useState("");

  // 1. Fetch Notes List
  const fetchNotes = async (page = 1, search = searchTerm, category = selectedCategory) => {
    if (!token) return;
    setLoading(true);
    try {
      let url = `${API_BASE}/notes?page=${page}&limit=9`;
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      if (category !== "all") {
        url += `&category=${encodeURIComponent(category)}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setNotes(data.notes || []);
        if (data.pagination) {
          setPagination({
            page: data.pagination.page,
            totalPages: data.pagination.totalPages
          });
        }
      } else {
        if (res.status === 401) handleLogout();
      }
    } catch (err) {
      console.error("Fetch notes error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotes(1, searchTerm, selectedCategory);
    }
  }, [token, selectedCategory]);

  // Debounced Search Handler
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (token) {
        fetchNotes(1, searchTerm, selectedCategory);
      }
    }, 350);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // 2. Auth: Login & Register
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    const endpoint = authMode === "login" ? `${API_BASE}/auth/login` : `${API_BASE}/auth/register`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
      } else {
        setAuthError(data.message || "Authentication failed");
      }
    } catch (err) {
      setAuthError("Server is unreachable. Please ensure backend is running on port 5000.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    setNotes([]);
  };

  // 3. Open Create / Edit Modal
  const openCreateModal = () => {
    setEditingNote(null);
    setNoteForm({ title: "", content: "", category: "general", tags: "" });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (note) => {
    setEditingNote(note);
    setNoteForm({
      title: note.title,
      content: note.content,
      category: note.category || "general",
      tags: Array.isArray(note.tags) ? note.tags.join(", ") : ""
    });
    setFormError("");
    setIsModalOpen(true);
  };

  // 4. Save Note (Create or Edit)
  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!noteForm.title.trim() || !noteForm.content.trim()) {
      setFormError("Title and content are required.");
      return;
    }

    try {
      const payload = {
        title: noteForm.title.trim(),
        content: noteForm.content.trim(),
        category: noteForm.category,
        tags: noteForm.tags
      };

      const url = editingNote ? `${API_BASE}/notes/${editingNote._id}` : `${API_BASE}/notes`;
      const method = editingNote ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setIsModalOpen(false);
        fetchNotes(pagination.page, searchTerm, selectedCategory);
      } else {
        setFormError(data.message || "Failed to save note");
      }
    } catch (err) {
      setFormError("Error saving note: " + err.message);
    }
  };

  // 5. Delete Note
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      const res = await fetch(`${API_BASE}/notes/${noteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setNotes(notes.filter((n) => n._id !== noteId));
      } else {
        alert(data.message || "Failed to delete note");
      }
    } catch (err) {
      alert("Error deleting note: " + err.message);
    }
  };

  // 6. Generate AI Summary (Assignment Requirement)
  const handleGenerateSummary = async (noteId) => {
    try {
      const res = await fetch(`${API_BASE}/notes/${noteId}/summary`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success && data.ai_summary) {
        setNotes(
          notes.map((n) => (n._id === noteId ? { ...n, ai_summary: data.ai_summary } : n))
        );
      }
    } catch (err) {
      console.error("AI summary error:", err);
    }
  };

  // ==========================================
  // RENDER: AUTHENTICATION SCREEN
  // ==========================================
  if (!token) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="brand-area" style={{ justifyContent: "center", marginBottom: 24 }}>
            <div className="brand-icon">
              <FileText size={22} />
            </div>
            <div>
              <h1 className="brand-title">AI Notes</h1>
              <p className="brand-subtitle">Smart note taking app</p>
            </div>
          </div>

          <div className="auth-tabs">
            <button
              className={`auth-tab-btn ${authMode === "login" ? "active" : ""}`}
              onClick={() => { setAuthMode("login"); setAuthError(""); }}
            >
              Login
            </button>
            <button
              className={`auth-tab-btn ${authMode === "register" ? "active" : ""}`}
              onClick={() => { setAuthMode("register"); setAuthError(""); }}
            >
              Register
            </button>
          </div>

          {authError && <div className="alert-box alert-error">{authError}</div>}

          <form className="auth-form" onSubmit={handleAuthSubmit}>
            {authMode === "register" && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Rahul Sharma"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="user@example.com"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: 8 }}>
              {authMode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: MAIN NOTES DASHBOARD
  // ==========================================
  const categories = ["all", "general", "work", "personal", "study", "ideas"];

  return (
    <div className="app-container">
      {/* 1. Top Header */}
      <header className="app-header">
        <div className="brand-area">
          <div className="brand-icon">
            <FileText size={22} />
          </div>
          <div>
            <h1 className="brand-title">AI Notes Manager</h1>
            <p className="brand-subtitle">Fast, intelligent note management</p>
          </div>
        </div>

        <div className="user-profile-bar">
          <span className="user-badge">👤 {user?.name || "User"}</span>
          <button className="btn-logout" onClick={handleLogout} title="Logout">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* 2. Search & Create Controls */}
      <div className="controls-bar">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search notes by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="btn-primary" onClick={openCreateModal}>
          <Plus size={18} /> Create Note
        </button>
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="category-filter-bar">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-pill ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* 4. Notes List Grid */}
      {loading ? (
        <div className="empty-state">
          <p className="empty-title">Loading notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">No notes found</p>
          <p className="empty-desc">
            {searchTerm ? "Try adjusting your search query." : "Click below to create your very first note!"}
          </p>
          <button className="btn-primary" onClick={openCreateModal}>
            <Plus size={18} /> Create Note
          </button>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <div key={note._id} className="note-card">
              <div>
                <div className="note-card-header">
                  <h3 className="note-title">{note.title}</h3>
                  <span className="badge-category">{note.category || "General"}</span>
                </div>

                <p className="note-content">{note.content}</p>

                {/* AI Summary Highlight */}
                {note.ai_summary ? (
                  <div className="ai-summary-box">
                    <span className="ai-summary-label">
                      <Sparkles size={13} /> AI Summary
                    </span>
                    <p className="ai-summary-text">{note.ai_summary}</p>
                  </div>
                ) : (
                  <button
                    className="btn-ai-summary"
                    onClick={() => handleGenerateSummary(note._id)}
                    title="Generate 2-sentence summary using AI"
                  >
                    <Sparkles size={13} /> Generate AI Summary
                  </button>
                )}

                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <div className="tags-list">
                    {note.tags.map((tag, idx) => (
                      <span key={idx} className="tag-pill">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer: Date & Actions */}
              <div className="note-card-footer">
                <span className="note-date">
                  {new Date(note.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
                <div className="card-actions">
                  <button
                    className="btn-icon"
                    onClick={() => openEditModal(note)}
                    title="Edit Note"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    className="btn-icon delete"
                    onClick={() => handleDeleteNote(note._id)}
                    title="Delete Note"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="pagination-bar">
          <button
            className="btn-secondary"
            disabled={pagination.page <= 1}
            onClick={() => fetchNotes(pagination.page - 1)}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            className="btn-secondary"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchNotes(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* 6. Create / Edit Note Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingNote ? "Edit Note" : "Create New Note"}</h2>
              <button
                style={{ background: "none", fontSize: 20, color: "#94a3b8" }}
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {formError && <div className="alert-box alert-error">{formError}</div>}

            <form onSubmit={handleSaveNote} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Note Title *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Q4 Sprint Planning"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Content *</label>
                <textarea
                  rows={5}
                  required
                  className="form-input"
                  placeholder="Write your note details here..."
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-input"
                    value={noteForm.category}
                    onChange={(e) => setNoteForm({ ...noteForm, category: e.target.value })}
                  >
                    <option value="general">General</option>
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="study">Study</option>
                    <option value="ideas">Ideas</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tags (comma separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="react, api, docker"
                    value={noteForm.tags}
                    onChange={(e) => setNoteForm({ ...noteForm, tags: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingNote ? "Update Note" : "Save Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

