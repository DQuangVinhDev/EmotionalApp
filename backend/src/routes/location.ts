import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Location from '../models/Location';

const router = Router();

// Get all locations for a couple
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const locations = await Location.find({ coupleId: req.user?.coupleId })
            .populate('userId', 'name avatarUrl')
            .sort({ createdAt: -1 });
        res.json(locations);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new location
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { lat, lng, title, description, imageUrl } = req.body;
        const location = new Location({
            coupleId: req.user?.coupleId,
            userId: req.user?.userId,
            lat,
            lng,
            title,
            description,
            imageUrl
        });
        await location.save();
        res.status(201).json(location);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// Update a location
router.patch('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, imageUrl } = req.body;
        const location = await Location.findOne({ _id: req.params.id, coupleId: req.user?.coupleId });

        if (!location) return res.status(404).json({ message: 'Location not found' });

        if (title) location.title = title;
        if (description !== undefined) location.description = description;
        if (imageUrl !== undefined) location.imageUrl = imageUrl;

        await location.save();
        res.json(location);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a location
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const location = await Location.findOneAndDelete({ _id: req.params.id, coupleId: req.user?.coupleId });
        if (!location) return res.status(404).json({ message: 'Location not found' });
        res.json({ message: 'Location deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
