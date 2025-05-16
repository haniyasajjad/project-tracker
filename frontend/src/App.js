import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './App.css'; // Make sure this is being imported

const socket = io('http://localhost:3001'); // Backend URL

function App() {
    const [projects, setProjects] = useState([]);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [changedProjects, setChangedProjects] = useState([]);

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

    return (
        <div className="container">
            <header>
                <h1>📊 Project Tracker</h1>
                <h2>🟢 Real-Time Updates</h2>
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
                            <strong>{project.project_title}</strong> — Status: {project.status}
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
