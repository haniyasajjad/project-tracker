import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:3001'); // Backend URL

function App() {
    const [projects, setProjects] = useState([]);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [changedProjects, setChangedProjects] = useState([]);

    // Fetch paginated projects
    const fetchProjects = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/projects?page=${page}`);
            setProjects(response.data.projects);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchProjects();
    }, [page]);

    // Listen for real-time updates
    useEffect(() => {
        socket.on('projectUpdate', (updatedProject) => {
            setChangedProjects((prev) => {
                const updated = prev.filter((p) => p.proid !== updatedProject.proid);
                return [...updated, updatedProject];
            });

            // Optionally update the main project list
            setProjects((prev) =>
                prev.map((p) => (p.proid === updatedProject.proid ? updatedProject : p))
            );
        });

        return () => {
            socket.off('projectUpdate');
        };
    }, []);

    // Pagination controls
    const handleNext = () => {
        if (page < pagination.totalPages) {
            setPage(page + 1);
        }
    };

    const handlePrevious = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    return (
        <div>
            <h1>Project Tracker</h1>
            <h2>Changed Projects</h2>
            <ul>
                {changedProjects.map((project) => (
                    <li key={project.proid}>
                        {project.project_title} (Status: {project.status})
                    </li>
                ))}
            </ul>
            <h2>All Projects (Page {page})</h2>
            <ul>
                {projects.map((project) => (
                    <li key={project.proid}>
                        {project.project_title} (Status: {project.status})
                    </li>
                ))}
            </ul>
            <div>
                <button onClick={handlePrevious} disabled={page === 1}>
                    Previous
                </button>
                <button onClick={handleNext} disabled={page === pagination.totalPages}>
                    Next
                </button>
            </div>
        </div>
    );
}

export default App;