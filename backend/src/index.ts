const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth').default || require('./routes/auth');
const coupleRoutes = require('./routes/couple').default || require('./routes/couple');
const checkinRoutes = require('./routes/checkin').default || require('./routes/checkin');
const kudosRoutes = require('./routes/kudos').default || require('./routes/kudos');
const promptRoutes = require('./routes/prompt').default || require('./routes/prompt');
const repairRoutes = require('./routes/repair').default || require('./routes/repair');
const weeklyRoutes = require('./routes/weekly').default || require('./routes/weekly');
const backlogRoutes = require('./routes/backlog').default || require('./routes/backlog');
const feedRoutes = require('./routes/feed').default || require('./routes/feed');
const userRoutes = require('./routes/user').default || require('./routes/user');
const { startCronJobs } = require('./services/cron');
const { seedPrompts } = require('./services/seed');

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
