import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { DateTime } from 'luxon';
import { ChevronLeft, Save, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

import MoodEmoji from '../../components/MoodEmoji';

const MOODS = [
    { val: 1, label: 'Tệ' },
    { val: 2, label: 'Kém' },
    { val: 3, label: 'Ổn' },
    { val: 4, label: 'Tốt' },
    { val: 5, label: 'Tuyệt' },
];

export default function CheckInForm() {
    const [mood, setMood] = useState(3);
    const [energy, setEnergy] = useState(3);
    const [stress, setStress] = useState(3);
    const [gratitude, setGratitude] = useState('');
    const [need, setNeed] = useState('LISTEN');
    const [customNeed, setCustomNeed] = useState('');
    const [isCustomNeed, setIsCustomNeed] = useState(false);
    const [visibility, setVisibility] = useState<'PRIVATE' | 'SHARED_NOW'>('PRIVATE');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const dateKey = DateTime.now().toFormat('yyyy-MM-dd');
            await client.post('/checkins', {
                dateKey, mood, energy, stress,
                need: isCustomNeed ? customNeed : need,
                gratitudeText: gratitude,
                visibility
            });

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#f43f5e', '#fb7185', '#ffffff']
            });

            toast.success('Check-in thành công! Ghi nhận vào Journal.');
            setTimeout(() => navigate('/'), 1500);
        } catch (err: any) {
            const message = err.response?.data?.message || 'Có lỗi khi lưu thông tin. Vui lòng thử lại.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-950 min-h-screen pb-40">
            {/* Premium Header */}
            <div className="p-6 flex items-center gap-4 sticky top-0 bg-slate-950/80 backdrop-blur-xl z-50 border-b border-white/5 flex-shrink-0">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/5 text-white transition-colors"><ChevronLeft size={24} /></button>
                <div className="flex-1">
                    <h1 className="text-xl font-black text-white leading-none">Daily Check-in</h1>
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1">Ghi lại cảm xúc hôm nay</p>
                </div>
            </div>

            <div className="p-8 space-y-12">
                {/* Mood Section */}
                <section>
                    <SectionTitle title="Tâm trạng hiện tại" />
                    <div className="grid grid-cols-5 gap-2">
                        {MOODS.map((m) => (
                            <motion.button
                                key={m.val}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setMood(m.val)}
                                className={`flex flex-col items-center gap-2 py-5 px-1 rounded-[2rem] transition-all border ${mood === m.val ? 'bg-rose-500/10 border-rose-500 shadow-lg shadow-rose-500/20' : 'bg-white/5 border-white/5 text-slate-500'}`}
                            >
                                <div className={`transition-transform duration-300 ${mood === m.val ? 'scale-125' : ''}`}>
                                    <MoodEmoji mood={m.val} size="md" />
                                </div>
                                <span className={`text-[8px] font-black uppercase tracking-wider ${mood === m.val ? 'text-rose-500' : 'text-slate-600'}`}>{m.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </section>

                {/* Energy & Stress Sliders */}
                <div className="space-y-10">
                    <CustomRange label="Mức năng lượng" value={energy} onChange={setEnergy} color="accent" icon="⚡" />
                    <CustomRange label="Mức độ Stress" value={stress} onChange={setStress} color="error" icon="🌪️" />
                </div>

                {/* Need Selection */}
                <section>
                    <SectionTitle title="Bạn đang cần gì nhất?" />
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { id: 'LISTEN', label: 'Lắng nghe', emoji: '👂' },
                            { id: 'HUG', label: 'Cái ôm', emoji: '🫂' },
                            { id: 'SPACE', label: 'Khoảng lặng', emoji: '☁️' },
                            { id: 'HELP', label: 'Giúp đỡ', emoji: '🤝' },
                            { id: 'PLAY', label: 'Giải trí', emoji: '🎮' },
                            { id: 'CLARITY', label: 'Làm rõ', emoji: '💡' },
                        ].map((n) => (
                            <button
                                key={n.id}
                                onClick={() => {
                                    setNeed(n.id);
                                    setIsCustomNeed(false);
                                }}
                                className={`flex items-center gap-3 p-4 rounded-3xl border transition-all ${(!isCustomNeed && need === n.id) ? 'bg-rose-500/10 border-rose-500 shadow-lg shadow-rose-500/10 text-rose-500' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                            >
                                <span className="text-xl">{n.emoji}</span>
                                <span className="text-[10px] font-black uppercase tracking-tight">{n.label}</span>
                            </button>
                        ))}
                        <button
                            onClick={() => setIsCustomNeed(true)}
                            className={`flex items-center gap-3 p-4 rounded-3xl border transition-all ${isCustomNeed ? 'bg-rose-500/10 border-rose-500 shadow-lg shadow-rose-500/10 text-rose-500' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                        >
                            <span className="text-xl">✨</span>
                            <span className="text-[10px] font-black uppercase tracking-tight">Khác</span>
                        </button>
                    </div>

                    {isCustomNeed && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4"
                        >
                            <input
                                type="text"
                                placeholder="Bạn đang cần gì... (ví dụ: Một nụ hôn)"
                                className="input w-full rounded-2xl bg-white/5 border-none ring-1 ring-white/10 focus:ring-2 focus:ring-rose-500/50 font-bold text-white placeholder:text-slate-600"
                                value={customNeed}
                                onChange={(e) => setCustomNeed(e.target.value)}
                                autoFocus
                            />
                        </motion.div>
                    )}
                </section>

                {/* Gratitude Section */}
                <section>
                    <SectionTitle title="Điều bạn biết ơn hôm nay" />
                    <div className="relative">
                        <textarea
                            placeholder="Hôm nay mình trân trọng vì..."
                            className="textarea w-full h-40 p-6 rounded-[2.5rem] bg-white/5 border-none ring-1 ring-white/10 focus:ring-2 focus:ring-rose-500/50 transition-all font-medium resize-none text-base text-white placeholder:text-slate-600"
                            value={gratitude}
                            onChange={(e) => setGratitude(e.target.value)}
                        />
                        <div className="absolute top-4 right-6 text-rose-500/20"><Heart size={20} fill="currentColor" /></div>
                    </div>
                </section>

                {/* Visibility & Submit Container */}
                <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-8 bg-slate-950/80 backdrop-blur-xl z-40 space-y-6">
                    <div className="bg-white/5 p-1.5 rounded-[2rem] flex border border-white/5">
                        <VisibilityBtn active={visibility === 'PRIVATE'} onClick={() => setVisibility('PRIVATE')} label="Bí mật" />
                        <VisibilityBtn active={visibility === 'SHARED_NOW'} onClick={() => setVisibility('SHARED_NOW')} label="Chia sẻ" />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full h-16 bg-rose-500 hover:brightness-110 text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(244,63,94,0.3)] transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <span className="loading loading-spinner"></span> : (
                            <><Save size={20} /> Lưu Check-in</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function SectionTitle({ title }: { title: string }) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-rose-500 rounded-full" />
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{title}</h2>
        </div>
    );
}

function CustomRange({ label, value, onChange, color, icon }: any) {
    return (
        <section>
            <div className="flex justify-between items-center mb-4 px-2">
                <label className="text-[10px] font-black text-slate-200 uppercase tracking-widest flex items-center gap-2">
                    <span>{icon}</span> {label}
                </label>
                <span className="text-2xl font-black text-rose-500 italic">{value}</span>
            </div>
            <input
                type="range" min="1" max="5" value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className={`range range-sm range-${color} transition-all duration-300`}
                step="1"
            />
            <div className="w-full flex justify-between text-[10px] px-2 mt-2 font-black text-slate-700">
                <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
            </div>
        </section>
    );
}

function VisibilityBtn({ active, onClick, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 py-3 rounded-[1.75rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all duration-500 ${active ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-slate-600'}`}
        >
            {label}
        </button>
    );
}
