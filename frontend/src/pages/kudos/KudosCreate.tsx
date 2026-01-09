import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { motion } from 'framer-motion';
import { ChevronLeft, Sparkles, Heart, Star, Send } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function KudosCreate() {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!text) return;
        setLoading(true);
        try {
            await client.post('/kudos', {
                text,
                visibility: 'SHARED_NOW'
            });

            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#fbbf24', '#f43f5e', '#ffffff']
            });

            toast.success('Kudos đã được gửi vào Jar of Wins! 🏺');
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            toast.error('Có lỗi xảy ra. Hãy thử lại sau ít phút.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white min-h-screen p-8 flex flex-col relative overflow-hidden">
            {/* Decorative stars */}
            <div className="absolute top-20 right-10 text-amber-100 rotate-12 -z-0"><Star size={80} fill="currentColor" /></div>
            <div className="absolute bottom-40 left-10 text-rose-50 -rotate-12 -z-0"><Heart size={100} fill="currentColor" /></div>

            <div className="flex items-center gap-4 -ml-2 mb-10 relative z-10 shrink-0">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-50 transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-black text-gray-900 leading-none">Gửi Kudos</h1>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">Ghi nhận sự quan tâm</p>
                </div>
            </div>

            <div className="flex-1 space-y-8 relative z-10">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="card-premium p-10 rounded-[3.5rem] bg-gradient-to-br from-amber-50 to-white border-amber-100 flex flex-col items-center text-center space-y-6 shadow-2xl shadow-amber-100/50"
                >
                    <div className="p-5 bg-white rounded-[2rem] text-amber-500 shadow-xl shadow-amber-200/50 animate-bounce">
                        <Star size={32} fill="currentColor" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-amber-600 tracking-tight">Jar of Wins 🏺</h2>
                        <p className="text-amber-700/60 text-sm font-bold italic leading-relaxed px-4">
                            "Biết ơn là khởi đầu cho một tình yêu bền bỉ và hạnh phúc hơn mỗi ngày."
                        </p>
                    </div>
                </motion.div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2 ml-4">
                        <Sparkles size={16} className="text-amber-400" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tin nhắn trân trọng</span>
                    </div>
                    <textarea
                        placeholder="Hôm nay mình thực sự trân trọng khi bạn..."
                        className="textarea w-full h-56 p-8 bg-gray-50 border-none ring-1 ring-gray-100 rounded-[3rem] focus:ring-4 focus:ring-amber-500/10 focus:bg-white outline-none transition-all text-lg font-bold italic text-gray-900 resize-none shadow-inner"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                </div>
            </div>

            <div className="pt-8 pb-4 relative z-10 shrink-0">
                <button
                    onClick={handleSubmit}
                    disabled={!text || loading}
                    className="w-full btn btn-lg bg-amber-400 hover:bg-amber-500 text-white rounded-[2.25rem] font-black border-none gap-3 shadow-2xl shadow-amber-200 active:scale-95 transition-all normal-case disabled:bg-gray-100"
                >
                    {loading ? <span className="loading loading-spinner"></span> : (
                        <><Send size={20} /> Trao gửi yêu thương</>
                    )}
                </button>
            </div>
        </div>
    );
}
