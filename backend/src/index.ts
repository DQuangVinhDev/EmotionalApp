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

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

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

// Vercel serverless function entry
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            startCronJobs();
        });
    });
} else {
    // In production (Vercel), we connect on the first request if not connected
    app.use(async (req: any, res: any, next: any) => {
        await connectDB();
        next();
    });
}

export default app;
