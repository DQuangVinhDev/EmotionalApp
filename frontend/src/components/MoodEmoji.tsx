import { motion } from 'framer-motion';

const MOOD_ASSETS: Record<number, { url: string; color: string; anim: any }> = {
    1: { // Tệ - Sad (Loudly Crying)
        url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f62d/512.webp',
        color: 'rgba(59, 130, 246, 0.4)', // Blue
        anim: {
            animate: {
                y: [0, 4, 0],
                scale: [1, 0.95, 1.02, 1],
                filter: ['drop-shadow(0 0 0px #3b82f600)', 'drop-shadow(0 0 10px #3b82f644)', 'drop-shadow(0 0 0px #3b82f600)']
            },
            transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }
    },
    2: { // Kém - Worried
        url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f61f/512.webp',
        color: 'rgba(148, 163, 184, 0.4)', // Slate
        anim: {
            animate: {
                x: [-1, 1, -1],
                rotate: [-4, 4, -4],
                scale: [1, 0.98, 1]
            },
            transition: { duration: 2.5, repeat: Infinity, ease: "linear" }
        }
    },
    3: { // Ổn - Neutral
        url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f610/512.webp',
        color: 'rgba(209, 213, 219, 0.4)', // Gray
        anim: {
            animate: {
                y: [0, -2, 0],
                scale: [1, 1.03, 1]
            },
            transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }
    },
    4: { // Tốt - Happy
        url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f642/512.webp',
        color: 'rgba(16, 185, 129, 0.4)', // Emerald
        anim: {
            animate: {
                y: [0, -10, 0],
                scale: [1, 1.15, 0.9, 1.05, 1],
                filter: ['drop-shadow(0 0 0px #10b98100)', 'drop-shadow(0 0 15px #10b98144)', 'drop-shadow(0 0 0px #10b98100)']
            },
            transition: { duration: 2, repeat: Infinity, ease: "backOut" }
        }
    },
    5: { // Tuyệt - Awesome (Heart Hearts)
        url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f970/512.webp',
        color: 'rgba(244, 63, 94, 0.4)', // Rose
        anim: {
            animate: {
                y: [0, -15, 0],
                rotate: [-10, 10, -10],
                scale: [1, 1.25, 0.8, 1.15, 1],
                filter: ['drop-shadow(0 0 5px #f43f5e22)', 'drop-shadow(0 0 30px #f43f5e66)', 'drop-shadow(0 0 5px #f43f5e22)']
            },
            transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
        }
    }
};

interface MoodEmojiProps {
    mood: number;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function MoodEmoji({ mood, className = "", size = 'md' }: MoodEmojiProps) {
    const asset = MOOD_ASSETS[mood] || MOOD_ASSETS[3];

    const sizePixels = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-14 h-14',
        xl: 'w-24 h-24'
    };

    return (
        <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
            {/* Background Glow Pulse */}
            <motion.div
                className="absolute inset-0 rounded-full blur-2xl"
                animate={{
                    scale: [1, 1.8, 1],
                    opacity: [0.15, 0.4, 0.15]
                }}
                transition={{
                    duration: asset.anim.transition.duration * 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{ backgroundColor: asset.color }}
            />

            <motion.picture
                animate={asset.anim.animate}
                transition={asset.anim.transition}
                className={`${sizePixels[size]} relative z-10 flex items-center justify-center`}
            >
                <source srcSet={asset.url} type="image/webp" />
                <img
                    src={asset.url}
                    alt={`mood-${mood}`}
                    className="w-full h-full object-contain pointer-events-none select-none"
                    loading="lazy"
                />
            </motion.picture>
        </div>
    );
}
