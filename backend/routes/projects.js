const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// Fetch paginated projects
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const query = `
            SELECT * FROM projects
            ORDER BY date_created DESC
            LIMIT $1 OFFSET $2
        `;
        const countQuery = 'SELECT COUNT(*) FROM projects';

        const [projectsResult, countResult] = await Promise.all([
            pool.query(query, [limit, offset]),
            pool.query(countQuery),
        ]);

        const projects = projectsResult.rows;
        const totalProjects = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalProjects / limit);

        res.json({
            projects,
            pagination: {
                page,
                limit,
                totalProjects,
                totalPages,
            },
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;