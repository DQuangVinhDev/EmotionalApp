import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Heart, ChevronLeft, Sparkles, Send, Quote } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function LoveMap() {
    const [answer, setAnswer] = useState('');
    const [visibility, setVisibility] = useState<'PRIVATE' | 'SHARED_NOW'>('SHARED_NOW');
    const navigate = useNavigate();

    // Fetch Daily Prompt
    const { data: prompt, isLoading } = useQuery({
        queryKey: ['daily-prompt'],
        queryFn: async () => {
            const res = await client.get('/prompts/today');
            return res.data;
        }
    });

    // Submit Answer
    const submitAnswer = useMutation({
        mutationFn: async () => {
            const today = new Date().toISOString().split('T')[0];
            return client.post('/prompts/answer', {
                promptId: prompt._id,
                answerText: answer,
                dateKey: today,
                visibility
            });
        },
        onSuccess: () => {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#f43f5e', '#ffffff']
            });
            toast.success('Câu trả lời đã được lưu vào hành trình! ❤️');
            setTimeout(() => navigate('/'), 1500);
        }
    });

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <span className="loading loading-spinner loading-lg text-rose-500"></span>
        </div>
    );

    return (
        <div className="bg-white min-h-screen flex flex-col relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-rose-50 rounded-full blur-3xl opacity-60" />
            <div className="absolute bottom-[-5%] left-[-5%] w-80 h-80 bg-rose-100/30 rounded-full blur-3xl opacity-60" />

            {/* Header */}
            <div className="p-6 flex items-center gap-4 sticky top-0 bg-white/80 backdrop-blur-xl z-50 border-b border-gray-50 flex-shrink-0">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-black text-gray-900 leading-none tracking-tight">Love Map</h1>
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1 italic">Kết nối tâm hồn mỗi ngày</p>
                </div>
            </div>

            <div className="p-8 space-y-12 relative z-10 flex-1 overflow-y-auto pb-48">
                {/* Question Section */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="card-premium p-10 rounded-[3.5rem] bg-gradient-to-br from-rose-50 to-white border-rose-100 relative shadow-2xl shadow-rose-100/50"
                >
                    <div className="p-4 bg-white rounded-2xl text-rose-500 shadow-lg absolute -top-6 left-1/2 -translate-x-1/2 border border-rose-50">
                        <Quote size={24} fill="currentColor" className="opacity-20" />
                    </div>
                    <div className="text-center space-y-4 pt-4">
                        <span className="badge badge-primary font-black text-[9px] tracking-widest uppercase py-3 px-4">Daily Topic</span>
                        <h2 className="text-2xl font-black text-gray-800 leading-tight italic">"{prompt?.text}"</h2>
                    </div>
                </motion.div>

                {/* Input Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2 ml-4">
                        <Sparkles size={16} className="text-rose-400" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Suy nghĩ của bạn</span>
                    </div>
                    <div className="relative">
                        <textarea
                            placeholder="Hãy chia sẻ thật tâm nhất..."
                            className="textarea w-full h-56 p-8 bg-gray-50 border-none ring-1 ring-gray-100 rounded-[3rem] focus:ring-4 focus:ring-rose-500/10 focus:bg-white outline-none transition-all text-lg font-bold text-gray-900 resize-none shadow-inner"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                        />
                        <div className="absolute top-6 right-8 text-rose-200"><Heart size={20} fill="currentColor" /></div>
                    </div>
                </section>
            </div>

            {/* Fixed Footer for Actions */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-8 bg-white/80 backdrop-blur-xl z-40 space-y-6">
                <div className="bg-gray-100/50 p-2 rounded-[2rem] flex border border-gray-100 shadow-inner">
                    <button
                        onClick={() => setVisibility('PRIVATE')}
                        className={`flex-1 py-3 rounded-[1.75rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${visibility === 'PRIVATE' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 opacity-60'}`}
                    >
                        Bí mật
                    </button>
                    <button
                        onClick={() => setVisibility('SHARED_NOW')}
                        className={`flex-1 py-3 rounded-[1.75rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${visibility === 'SHARED_NOW' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 opacity-60'}`}
                    >
                        Chia sẻ
                    </button>
                </div>

                <button
                    onClick={() => submitAnswer.mutate()}
                    disabled={!answer || submitAnswer.isPending}
                    className="w-full btn btn-primary btn-lg rounded-[2.25rem] bg-rose-500 hover:bg-rose-600 text-white border-none font-black shadow-2xl shadow-rose-200 normal-case flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                    {submitAnswer.isPending ? <span className="loading loading-spinner text-white"></span> : (
                        <><Send size={20} /> Gửi câu trả lời</>
                    )}
                </button>
            </div>
        </div>
    );
}
