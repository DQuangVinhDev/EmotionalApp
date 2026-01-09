import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
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
    const { data: prompt, isLoading, refetch } = useQuery({
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
        }
    });

    if (isLoading && !currentPrompt) return (
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

            <div className="p-8 space-y-12 relative z-10 flex-1 overflow-y-auto pb-48 font-sans">
                {/* Tip Section */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-indigo-50/50 p-6 rounded-[2.5rem] border border-indigo-100/50 flex gap-4 items-center"
                >
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100">
                        <Lightbulb size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Love Map Tip</p>
                        <p className="text-xs font-bold text-gray-600 leading-relaxed italic">
                            "{LOVE_TIPS[tipIndex]}"
                        </p>
                    </div>
                </motion.div>

                {/* Question Section */}
                <motion.div
                    key={currentPrompt?._id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="card-premium p-10 rounded-[3.5rem] bg-gradient-to-br from-rose-50 to-white border-rose-100 relative shadow-2xl shadow-rose-100/50"
                >
                    <div className="p-4 bg-white rounded-2xl text-rose-500 shadow-lg absolute -top-6 left-1/2 -translate-x-1/2 border border-rose-50">
                        <Quote size={24} fill="currentColor" className="opacity-20" />
                    </div>

                    <button
                        onClick={() => shufflePrompt.mutate()}
                        className="absolute top-6 right-8 p-3 rounded-2xl bg-white/50 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                        title="Đổi câu hỏi khác"
                    >
                        <RefreshCw size={18} className={shufflePrompt.isPending ? 'animate-spin' : ''} />
                    </button>

                    <div className="text-center space-y-6 pt-4">
                        <div className="flex flex-wrap justify-center gap-2">
                            <span className="badge badge-primary font-black text-[9px] tracking-widest uppercase py-3 px-4">Daily Topic</span>
                            {currentPrompt?.tags?.map((tag: string) => (
                                <span key={tag} className="badge bg-white text-rose-400 border-rose-100 font-bold text-[8px] uppercase tracking-tighter py-3 px-3">#{tag}</span>
                            ))}
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 leading-tight italic">"{currentPrompt?.text}"</h2>
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
