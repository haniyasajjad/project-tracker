const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const pool = require('./db/db');
const projectRoutes = require('./routes/projects');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // Frontend URL
        methods: ['GET', 'POST'],
    },
});

app.use(cors());
app.use(express.json());
app.use('/api/projects', projectRoutes);

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Listen for PostgreSQL changes (using LISTEN/NOTIFY)
async function setupPostgresListener() {
    const client = await pool.connect();
    try {
        await client.query('LISTEN project_changes');
        client.on('notification', (msg) => {
            const payload = JSON.parse(msg.payload);
            io.emit('projectUpdate', payload); 
        });
    } catch (error) {
        console.error('Error setting up listener:', error);
    }
}

setupPostgresListener();

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});