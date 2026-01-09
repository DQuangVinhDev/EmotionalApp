import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User';
import Couple from '../models/Couple';

const router = Router();

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string()
});

router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = registerSchema.parse(req.body);
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email đã tồn tại' });

        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({ email, passwordHash, name });
        await user.save();

        res.status(201).json({ message: 'Đăng ký thành công' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Thông tin đăng nhập không chính xác' });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: 'Thông tin đăng nhập không chính xác' });

        const couple = await Couple.findOne({ memberIds: user._id });

        const accessToken = jwt.sign(
            { userId: user._id, coupleId: couple?._id },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );
        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.REFRESH_SECRET || 'refresh_secret',
            { expiresIn: '7d' }
        );

        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                coupleId: couple?._id
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
