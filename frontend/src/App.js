import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:3001'); // Backend URL

function App() {
    const [projects, setProjects] = useState([]);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [changedProjects, setChangedProjects] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');

    const fetchProjects = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/projects?page=${page}`);
            setProjects(response.data.projects);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [page]);

    useEffect(() => {
        socket.on('projectUpdate', (updatedProject) => {
            setChangedProjects((prev) => {
                const updated = prev.filter((p) => p.proid !== updatedProject.proid);
                return [...updated, updatedProject];
            });

            setProjects((prev) =>
                prev.map((p) => (p.proid === updatedProject.proid ? updatedProject : p))
            );
        });

        return () => {
            socket.off('projectUpdate');
        };
    }, []);

    const startEditing = (project) => {
        setEditingId(project.proid);
        setEditTitle(project.project_title);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditTitle('');
    };

    const saveEdit = async (id) => {
        try {
            const response = await axios.patch(`http://localhost:3001/api/projects/${id}`, {
                project_title: editTitle,
            });

            setProjects((prev) =>
                prev.map((p) => (p.proid === id ? { ...p, project_title: editTitle } : p))
            );
            setEditingId(null);
            setEditTitle('');
        } catch (error) {
            console.error('Error updating project:', error);
        }
    };

    return (
        <div className="container">
            <header>
                <h1>Project Tracker</h1>
                <h2>Updated Projects:</h2>
            </header>

            <section className="updates">
                {changedProjects.length === 0 ? (
                    <p>No recent changes.</p>
                ) : (
                    <ul>
                        {changedProjects.map((project) => (
                            <li key={project.proid}>
                                <strong>{project.project_title}</strong> — Status: {project.status}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="projects">
                <h2>📋 All Projects – Page {page}</h2>
                <ul>
                    {projects.map((project) => (
                        <li key={project.proid}>
                            {editingId === project.proid ? (
                                <>
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                    />
                                    <button onClick={() => saveEdit(project.proid)}>💾 Save</button>
                                    <button onClick={cancelEdit}>❌ Cancel</button>
                                </>
                            ) : (
                                <>
                                    <strong>{project.project_title}</strong> — Status: {project.status}
                                    <button className="edit-btn" onClick={() => startEditing(project)}>✏️ Edit</button>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </section>

            <div className="pagination">
                <button onClick={() => setPage(page - 1)} disabled={page === 1}>
                    ← Previous
                </button>
                <button onClick={() => setPage(page + 1)} disabled={page === pagination.totalPages}>
                    Next →
                </button>
            </div>
        </div>
    );
}

export default App;
