import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import coupleRoutes from './routes/couple';
import checkinRoutes from './routes/checkin';
import kudosRoutes from './routes/kudos';
import promptRoutes from './routes/prompt';
import repairRoutes from './routes/repair';
import weeklyRoutes from './routes/weekly';
import backlogRoutes from './routes/backlog';
import feedRoutes from './routes/feed';
import userRoutes from './routes/user';
import { startCronJobs } from './services/cron';
import { seedPrompts } from './services/seed';

import memoryRoutes from './routes/memory';
import commentRoutes from './routes/comment';
import locationRoutes from './routes/location';

import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

app.use(cors());
app.use(express.json());

// --- SOCKET.IO LOGIC FOR VIDEO CALL & SECURITY ---
const users = new Map(); // userId -> socketId

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId) => {
        users.set(userId, socket.id);
    });

    // Signaling for WebRTC
    socket.on('call-user', ({ to, offer, fromName, fromAvatar }) => {
        const targetSocketId = users.get(to);
        if (targetSocketId) {
            io.to(targetSocketId).emit('incoming-call', { from: socket.id, offer, fromName, fromAvatar });
        }
    });

    socket.on('answer-call', ({ to, answer }) => {
        io.to(to).emit('call-accepted', { answer });
    });

    socket.on('ice-candidate', ({ to, candidate }) => {
        io.to(to).emit('ice-candidate', { candidate });
    });

    socket.on('end-call', ({ to }) => {
        const targetSocketId = users.get(to) || to;
        io.to(targetSocketId).emit('call-ended');
    });

    // Security Notifications
    socket.on('security-alert', ({ to, type, fromName }) => {
        const targetSocketId = users.get(to);
        if (targetSocketId) {
            io.to(targetSocketId).emit('security-notification', { type, fromName });
        }
    });

    socket.on('disconnect', () => {
        for (const [userId, socketId] of users.entries()) {
            if (socketId === socket.id) {
                users.delete(userId);
                break;
            }
        }
    });
});

// Routes
app.use('/auth', authRoutes);
app.use('/couple', coupleRoutes);
app.use('/checkins', checkinRoutes);
app.use('/kudos', kudosRoutes);
app.use('/prompts', promptRoutes);
app.use('/repairs', repairRoutes);
app.use('/weekly', weeklyRoutes);
app.use('/backlog', backlogRoutes);
app.use('/feed', feedRoutes);
app.use('/users', userRoutes);
app.use('/memory', memoryRoutes);
app.use('/comments', commentRoutes);
app.use('/locations', locationRoutes);

// Basic health check
app.get('/ping', (req: any, res: any) => res.send('pong'));

// Database connection
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/coupleapp');
        console.log('Connected to MongoDB');
        await seedPrompts();
    } catch (err: any) {
        console.error('MongoDB connection error:', err);
    }
};

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        startCronJobs();
    });
});

export default app;
