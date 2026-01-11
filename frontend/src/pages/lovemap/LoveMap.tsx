import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Heart, ChevronLeft, Sparkles, Send, Quote, RefreshCw, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

const LOVE_TIPS = [
    "Một cái ôm lâu hơn 20 giây giúp giải phóng Oxytocin, hormone hạnh phúc và sự gắn kết.",
    "Kỹ thuật 5-1: Cần ít nhất 5 tương tác tích cực để bù đắp cho 1 tương tác tiêu cực trong mối quan hệ.",
    "Bắt đầu ngày mới bằng việc hỏi 'Mình có thể làm gì để ngày hôm nay của bạn nhẹ nhàng hơn?'",
    "Thực hành lắng nghe tích cực: Nhắc lại những gì đối phương vừa nói để đảm bảo bạn đã hiểu đúng cảm xúc của họ.",
    "Dành 15 phút mỗi tuần để thực hành 'State of the Union' - thảo luận về những điều tốt đẹp và những điều cần cải thiện.",
    "Ghi nhận những nỗ lực nhỏ: Một lời cảm ơn cho việc rửa bát có giá trị lớn hơn bạn tưởng.",
    "Duy trì sự tò mò: Con người luôn thay đổi. Hãy tiếp tục đặt câu hỏi như thể bạn mới đang hẹn hò.",
    "Quy tắc 2-2-2: 2 tuần đi hẹn hò 1 lần, 2 tháng đi chơi xa 1 lần, 2 năm đi du lịch dài ngày 1 lần.",
    "Chạm nhẹ vào vai hoặc nắm tay khi đang thảo luận căng thẳng giúp xoa dịu hệ thần kinh của cả hai.",
    "Chia sẻ 'Thắng lợi nhỏ' trong ngày giúp đối phương cảm thấy họ là một phần trong thành công của bạn.",
    "Ngôn ngữ cơ thể chiếm 90% giao tiếp. Đôi khi chỉ cần một ánh mắt trìu mến là đủ.",
    "Đừng đi ngủ khi đang giận dữ, nhưng cũng đừng cố giải quyết mâu thuẫn khi cả hai đang quá mệt mỏi.",
    "Khen ngợi đối phương trước mặt người khác giúp xây dựng sự tự tin và lòng tự hào về mối quan hệ.",
    "Hành động 'tương tác hướng về' (bids for connection) quyết định 90% sự bền vững của hôn nhân.",
    "Học cách xin lỗi chân thành: 'Mình xin lỗi vì đã làm bạn tổn thương' quan trọng hơn 'Mình xin lỗi nhưng...'",
    "Tìm kiếm một sở thích chung mới mỗi năm để tạo ra những 'bản đồ tình yêu' mới.",
    "Viết những mẩu giấy nhắn chúc một ngày tốt lành và giấu vào túi áo đối phương.",
    "Hỏi về những giấc mơ và hoài bão của đối phương, ngay cả khi chúng dường như không tưởng.",
    "Thực hành sự biết ơn: Mỗi tối hãy kể cho nhau nghe 1 điều bạn trân trọng ở đối phương hôm nay.",
    "Không gian riêng cũng quan trọng như thời gian chung. Hãy ủng hộ đối phương có thời gian cho bản thân."
];

export default function LoveMap() {
    const [answer, setAnswer] = useState('');
    const [visibility, setVisibility] = useState<'PRIVATE' | 'SHARED_NOW'>('SHARED_NOW');
    const [tipIndex, setTipIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        setTipIndex(Math.floor(Math.random() * LOVE_TIPS.length));
    }, []);

    const rotateTip = () => {
        setTipIndex((prev) => (prev + 1) % LOVE_TIPS.length);
    };

    // Fetch Daily Prompt or Random Prompt
    const { data: prompt, isLoading } = useQuery({
        queryKey: ['daily-prompt'],
        queryFn: async () => {
            const res = await client.get('/prompts/today');
            return res.data;
        }
    });

    // Mutation for Shuffle
    const shufflePrompt = useMutation({
        mutationFn: async () => {
            const res = await client.get('/prompts/random');
            return res.data;
        },
        onSuccess: (data) => {
            setCurrentPrompt(data);
            rotateTip();
        }
    });

    const [currentPrompt, setCurrentPrompt] = useState<any>(null);

    // Effect-like logic: if prompt is loaded and currentPrompt is null, set it
    if (prompt && !currentPrompt && !isLoading) {
        setCurrentPrompt(prompt);
    }

    // Submit Answer
    const submitAnswer = useMutation({
        mutationFn: async () => {
            const today = new Date().toISOString().split('T')[0];
            return client.post('/prompts/answer', {
                promptId: currentPrompt?._id,
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
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
            toast.error(message);
        }
    });

    if (isLoading && !currentPrompt) return (
        <div className="min-h-screen flex items-center justify-center">
            <span className="loading loading-spinner loading-lg text-rose-500"></span>
        </div>
    );

    return (
        <div className="bg-slate-950 min-h-screen flex flex-col relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-rose-500/10 rounded-full blur-[120px] opacity-40" />
            <div className="absolute bottom-[-5%] left-[-5%] w-80 h-80 bg-rose-600/10 rounded-full blur-[120px] opacity-40" />

            {/* Header */}
            <div className="p-6 flex items-center gap-4 sticky top-0 bg-slate-950/80 backdrop-blur-xl z-50 border-b border-white/5 flex-shrink-0">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/5 text-white transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-black text-white leading-none tracking-tight">Love Map</h1>
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1 italic">Kết nối tâm hồn mỗi ngày</p>
                </div>
            </div>

            <div className="p-8 space-y-12 relative z-10 flex-1 overflow-y-auto pb-48 font-sans">
                {/* Tip Section */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 flex gap-4 items-center"
                >
                    <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/20">
                        <Lightbulb size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Love Map Tip</p>
                        <p className="text-xs font-bold text-slate-400 leading-relaxed italic">
                            "{LOVE_TIPS[tipIndex]}"
                        </p>
                    </div>
                </motion.div>

                {/* Question Section */}
                <motion.div
                    key={currentPrompt?._id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-10 rounded-[3.5rem] bg-slate-900 border border-white/5 relative shadow-2xl"
                >
                    <div className="p-4 bg-slate-800 rounded-2xl text-rose-500 shadow-lg absolute -top-6 left-1/2 -translate-x-1/2 border border-white/5">
                        <Quote size={24} fill="currentColor" className="opacity-40" />
                    </div>

                    <button
                        onClick={() => shufflePrompt.mutate()}
                        className="absolute top-6 right-8 p-3 rounded-2xl bg-white/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                        title="Đổi câu hỏi khác"
                    >
                        <RefreshCw size={18} className={shufflePrompt.isPending ? 'animate-spin' : ''} />
                    </button>

                    <div className="text-center space-y-6 pt-4">
                        <div className="flex flex-wrap justify-center gap-2">
                            <span className="bg-rose-500 text-white font-black text-[9px] tracking-widest uppercase py-2 px-4 rounded-full">Daily Topic</span>
                            {currentPrompt?.tags?.map((tag: string) => (
                                <span key={tag} className="bg-white/5 text-rose-400 border border-white/5 font-bold text-[8px] uppercase tracking-tighter py-2 px-3 rounded-full">#{tag}</span>
                            ))}
                        </div>
                        <h2 className="text-2xl font-black text-white leading-tight italic">"{currentPrompt?.text}"</h2>
                    </div>
                </motion.div>

                {/* Input Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2 ml-4">
                        <Sparkles size={16} className="text-rose-500" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Suy nghĩ của bạn</span>
                    </div>
                    <div className="relative">
                        <textarea
                            placeholder="Hãy chia sẻ thật tâm nhất..."
                            className="textarea w-full h-56 p-8 bg-white/5 border border-white/10 rounded-[3rem] focus:ring-4 focus:ring-rose-500/10 outline-none transition-all text-lg font-bold text-white resize-none shadow-inner placeholder:text-slate-700"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                        />
                        <div className="absolute top-6 right-8 text-rose-500/20"><Heart size={20} fill="currentColor" /></div>
                    </div>
                </section>
            </div>

            {/* Fixed Footer for Actions */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-8 bg-slate-950/80 backdrop-blur-xl z-40 space-y-6">
                <div className="bg-white/5 p-1.5 rounded-[2rem] flex border border-white/5 shadow-inner">
                    <button
                        onClick={() => setVisibility('PRIVATE')}
                        className={`flex-1 py-3 rounded-[1.75rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${visibility === 'PRIVATE' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-600'}`}
                    >
                        Bí mật
                    </button>
                    <button
                        onClick={() => setVisibility('SHARED_NOW')}
                        className={`flex-1 py-3 rounded-[1.75rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${visibility === 'SHARED_NOW' ? 'bg-white text-white shadow-lg' : 'text-slate-600'}`}
                    >
                        Chia sẻ
                    </button>
                </div>

                <button
                    onClick={() => submitAnswer.mutate()}
                    disabled={!answer || submitAnswer.isPending}
                    className="w-full h-16 bg-rose-500 hover:brightness-110 text-white rounded-[2.25rem] font-black shadow-[0_20px_50px_rgba(244,63,94,0.3)] flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                >
                    {submitAnswer.isPending ? <span className="loading loading-spinner text-white"></span> : (
                        <><Send size={20} /> Gửi câu trả lời</>
                    )}
                </button>
            </div>
        </div>
    );
}
