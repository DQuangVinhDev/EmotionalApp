import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Heart, Zap, InfoIcon, ShieldAlert, SendHorizonal, BrainCircuit } from 'lucide-react';
import { toast } from 'sonner';

const FEELINGS = ['Buồn', 'Tổn thương', 'Lo lắng', 'Tức giận', 'Cô đơn', 'Mệt mỏi', 'Thất vọng'];
const NEEDS = ['Thấu hiểu', 'Tôn trọng', 'Sự hỗ trợ', 'Kết nối', 'Không gian riêng', 'An toàn'];

export default function RepairDraft() {
    const [step, setStep] = useState(1);
    const [stress, setStress] = useState(3);
    const [observation, setObservation] = useState('');
    const [feeling, setFeeling] = useState('');
    const [need, setNeed] = useState('');
    const [request, setRequest] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const generateMessage = () => {
        return `Khi [${observation || '...'}], mình cảm thấy [${feeling || '...'}]. Mình cần [${need || '...'}]. Bạn có thể [${request || '...'}] không?`;
    };

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => step > 1 ? setStep(s => s - 1) : navigate(-1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await client.post('/repairs', {
                stressLevel: stress,
                observation, feeling, need, request,
                generatedMessage: generateMessage(),
                visibility: 'SHARED_NOW'
            });
            toast.success('Lời nhắn NVC đã được gửi! ❤️');
            navigate('/');
        } catch (err: any) {
            const message = err.response?.data?.message || 'Gặp lỗi khi gửi yêu cầu. Thử lại nhé.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-950 min-h-screen pb-32 overflow-x-hidden">
            {/* Dynamic Header */}
            <div className="p-6 flex items-center gap-4 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 flex-shrink-0 sticky top-0 z-50">
                <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-white/5 text-white"><ChevronLeft size={24} /></button>
                <div className="flex-1">
                    <h1 className="text-xl font-black text-white leading-none tracking-tight">Conflict Wizard</h1>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">NVC Framework (Bước {step}/3)</p>
                </div>
                <div className="flex gap-1">
                    {[1, 2, 3].map(i => <div key={i} className={`w-8 h-1 rounded-full ${i <= step ? 'bg-indigo-500' : 'bg-white/5'}`} />)}
                </div>
            </div>

            <div className="p-8">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                            <div className="space-y-4">
                                <div className="p-4 bg-indigo-500/10 rounded-3xl text-indigo-500 inline-block border border-indigo-500/20"><BrainCircuit size={32} /></div>
                                <h2 className="text-3xl font-black text-white tracking-tight leading-snug">Kiểm tra cảm xúc cá nhân</h2>
                                <p className="text-slate-500 font-medium">Trước khi trò chuyện, hãy xem mức độ căng thẳng của bạn đang ở đâu.</p>
                            </div>

                            <div className="p-10 bg-white/5 border border-white/5 space-y-8 rounded-[3rem]">
                                <div className="flex justify-between items-center bg-black/20 p-4 rounded-3xl shadow-sm border border-white/5">
                                    <span className="font-black text-slate-600 italic uppercase text-[10px] tracking-widest">Mức Stress hiện tại</span>
                                    <span className="text-3xl font-black text-indigo-500 italic px-4">{stress}/5</span>
                                </div>
                                <input type="range" min="1" max="5" value={stress} onChange={e => setStress(parseInt(e.target.value))} className="range range-indigo range-lg" step="1" />
                                <div className="flex justify-between px-2 text-[10px] font-black text-slate-700">
                                    <span>BÌNH TĨNH</span>
                                    <span>CĂNG THẲNG</span>
                                </div>
                            </div>

                            {stress >= 4 && (
                                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-amber-500/10 p-6 rounded-[2.25rem] border border-amber-500/20 flex gap-4">
                                    <div className="text-amber-500 shrink-0"><InfoIcon size={24} /></div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-amber-500 font-black uppercase tracking-tight">Khuyên dùng: "Time-out"</p>
                                        <p className="text-sm text-slate-400 font-medium leading-relaxed opacity-90">Bộ não đang ở trạng thái 'chiến đấu'. Bạn nên dành 20 phút hít thở sâu trước khi bắt đầu.</p>
                                    </div>
                                </motion.div>
                            )}

                            <button onClick={handleNext} className="w-full h-16 bg-indigo-600 hover:brightness-110 text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(79,70,229,0.3)] transition-all active:scale-95">
                                Bắt đầu Step 2 <SendHorizonal size={20} />
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 mb-2 ml-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" /><h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quan sát sự việc</h2></div>
                                <textarea
                                    placeholder="Ví dụ: Khi mình thấy bạn chưa cất đồ sau khi đi làm về..."
                                    className="textarea w-full h-40 p-6 bg-white/5 border border-white/10 rounded-[2.5rem] focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-bold text-white italic placeholder:text-slate-700"
                                    value={observation}
                                    onChange={e => setObservation(e.target.value)}
                                />
                            </section>

                            <section className="space-y-6">
                                <div className="flex items-center gap-2 mb-2 ml-2"><h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono italic flex items-center gap-2"><Heart size={14} className="text-rose-500" /> Cảm xúc đi kèm</h2></div>
                                <div className="flex flex-wrap gap-3">
                                    {FEELINGS.map(f => (
                                        <button
                                            key={f} onClick={() => setFeeling(f)}
                                            className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${feeling === f ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 scale-105' : 'bg-white/5 text-slate-500 border border-white/5 hover:bg-white/10'}`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <button onClick={handleNext} disabled={!observation || !feeling} className="w-full h-16 bg-indigo-600 hover:brightness-110 text-white rounded-[2rem] font-black shadow-[0_20px_50px_rgba(79,70,229,0.3)] transition-all active:scale-95 disabled:opacity-50">Tiếp tục bước cuối</button>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10 pb-40">
                            <section className="space-y-6">
                                <div className="flex items-center gap-2 mb-2 ml-2"><h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Zap size={14} className="text-amber-500" /> Nhu cầu sâu thẳm</h2></div>
                                <div className="flex flex-wrap gap-3">
                                    {NEEDS.map(n => (
                                        <button
                                            key={n} onClick={() => setNeed(n)}
                                            className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${need === n ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 scale-105' : 'bg-white/5 text-slate-500 border border-white/5 hover:bg-white/10'}`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Lời đề nghị cụ thể</h2>
                                <textarea
                                    placeholder="Bạn có thể giúp mình... không?"
                                    className="textarea w-full h-40 p-6 bg-white/5 border border-white/10 rounded-[2.5rem] focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-bold text-white placeholder:text-slate-700"
                                    value={request}
                                    onChange={e => setRequest(e.target.value)}
                                />
                            </section>

                            {/* Real-time Message Preview */}
                            <div className="p-8 rounded-[3rem] bg-slate-900 border border-white/5 overflow-hidden relative shadow-2xl">
                                <div className="absolute top-4 right-6 text-slate-700 font-black text-[9px] tracking-[0.4em] uppercase">Preview</div>
                                <div className="space-y-4">
                                    <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500 inline-block border border-indigo-500/20"><SendHorizonal size={24} /></div>
                                    <p className="text-white text-base font-bold italic leading-relaxed pr-2">"{generateMessage()}"</p>
                                </div>
                            </div>

                            {/* Fixed Footer for Step 3 */}
                            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-8 bg-slate-950/80 backdrop-blur-xl z-40">
                                <button
                                    onClick={handleSubmit}
                                    disabled={!need || !request || loading}
                                    className="w-full h-16 bg-indigo-600 hover:brightness-110 text-white rounded-[2rem] font-black shadow-[0_20px_50px_rgba(79,70,229,0.3)] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {loading ? <span className="loading loading-spinner"></span> : (
                                        <><ShieldAlert size={20} /> Gửi lời nhắn Repair</>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
