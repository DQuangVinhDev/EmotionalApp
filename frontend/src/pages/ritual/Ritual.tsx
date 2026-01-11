import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, List, ShieldCheck, Heart, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import client from '../../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import confetti from 'canvas-confetti';

export default function Ritual() {
    const [activeTab, setActiveTab] = useState<'WEEKLY' | 'BACKLOG'>('WEEKLY');
    const [weeklyAnswers, setWeeklyAnswers] = useState<Record<string, string>>({
        '1': '', '2': '', '3': ''
    });
    const [newBacklogTitle, setNewBacklogTitle] = useState('');
    const [showAddBacklog, setShowAddBacklog] = useState(false);
    const queryClient = useQueryClient();

    // Fetch Backlog
    const { data: backlogItems, isLoading: loadingBacklog } = useQuery({
        queryKey: ['backlog'],
        queryFn: async () => {
            const res = await client.get('/backlog/open');
            return res.data;
        }
    });

    // Save Weekly Session
    const saveWeekly = useMutation({
        mutationFn: async () => {
            const weekKey = DateTime.now().toFormat('yyyy-\'W\'WW');
            return client.post('/weekly/submit', {
                weekKey,
                answers: weeklyAnswers
            });
        },
        onSuccess: () => {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
            toast.success('Phiên họp tuần này đã được lưu! 🍷');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
            toast.error(message);
        }
    });

    // Add Backlog Item
    const addBacklog = useMutation({
        mutationFn: async (title: string) => {
            return client.post('/backlog', { title, status: 'OPEN' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['backlog'] });
            setNewBacklogTitle('');
            setShowAddBacklog(false);
            toast.success('Đã thêm vào danh sách chờ! 📝');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
            toast.error(message);
        }
    });

    // Mark Backlog Done
    const markBacklogDone = useMutation({
        mutationFn: async (id: string) => {
            return client.post(`/backlog/${id}/done`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['backlog'] });
            toast.info('Vấn đề đã được giải quyết! ✅');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
            toast.error(message);
        }
    });

    return (
        <div className="p-8 space-y-10 pb-32">
            {/* Header */}
            <div className="pt-10 space-y-4 mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-1 bg-rose-500 rounded-full" />
                    <span className="text-[10px] font-black text-rose-500/60 uppercase tracking-[0.4em]">Rituals</span>
                </div>
                <div>
                    <h1 className="text-4xl font-black text-slate-950 tracking-tight leading-none">Nghi thức & Gắn kết</h1>
                    <p className="text-sm font-bold text-slate-500 mt-3 italic">Dành thời gian chất lượng cho nhau</p>
                </div>
            </div>

            {/* Premium Tab Switcher */}
            <div className="bg-gray-100/50 p-2 rounded-[2.5rem] flex border border-gray-100 shadow-inner">
                <TabButton
                    active={activeTab === 'WEEKLY'}
                    onClick={() => setActiveTab('WEEKLY')}
                    label="Nghi thức"
                    icon={<ShieldCheck size={18} />}
                />
                <TabButton
                    active={activeTab === 'BACKLOG'}
                    onClick={() => setActiveTab('BACKLOG')}
                    label="Danh sách"
                    icon={<List size={18} />}
                />
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'WEEKLY' ? (
                    <motion.div
                        key="weekly"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-10"
                    >
                        {/* Session Promo Card */}
                        <div className="card-premium p-8 rounded-[3.5rem] bg-gradient-to-br from-rose-500 to-rose-600 text-white relative overflow-hidden shadow-2xl shadow-rose-200">
                            <div className="absolute -bottom-10 -right-10 opacity-20 rotate-12"><Heart size={160} fill="white" /></div>
                            <div className="relative z-10 space-y-4">
                                <div className="badge badge-outline border-white/40 text-white font-black text-[9px] py-3 tracking-[0.2em]">SESSIONS OF THE WEEK</div>
                                <h2 className="text-3xl font-black italic tracking-tight leading-tight">State of Us 🍷</h2>
                                <p className="text-rose-100 text-sm font-medium leading-relaxed max-w-[80%] italic">Dành 15-30 phút cuối tuần để thấu hiểu và cùng nhau tạo ra kỷ niệm đẹp.</p>
                            </div>
                        </div>

                        {/* Ritual Questions */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">Câu hỏi thảo luận</h3>
                            <div className="space-y-4">
                                <QuestionBox num="1" q="Tuần này điều gì làm bạn thấy tự hào nhất về cả hai?" color="border-emerald-100 text-emerald-600 bg-emerald-50" value={weeklyAnswers['1']} onChange={(v) => setWeeklyAnswers({ ...weeklyAnswers, '1': v })} />
                                <QuestionBox num="2" q="Có điều gì chúng ta cần cải thiện để tuần tới vui hơn không?" color="border-amber-100 text-amber-600 bg-amber-50" value={weeklyAnswers['2']} onChange={(v) => setWeeklyAnswers({ ...weeklyAnswers, '2': v })} />
                                <QuestionBox num="3" q="Bạn muốn mình làm điều gì đặc biệt cho bạn vào tuần sau?" color="border-rose-100 text-rose-500 bg-rose-50" value={weeklyAnswers['3']} onChange={(v) => setWeeklyAnswers({ ...weeklyAnswers, '3': v })} />
                            </div>
                        </div>

                        <button
                            onClick={() => saveWeekly.mutate()}
                            disabled={saveWeekly.isPending}
                            className="w-full btn btn-primary btn-lg rounded-[2.25rem] border-none shadow-2xl shadow-rose-200 font-black gap-3 normal-case text-lg group"
                        >
                            {saveWeekly.isPending ? <span className="loading loading-spinner"></span> : (
                                <><Sparkles size={20} /> Lưu phiên họp <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="backlog"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-10"
                    >
                        <div className="flex justify-between items-center px-4">
                            <h2 className="text-xl font-black text-gray-800 tracking-tight">Vấn đề chờ trao đổi</h2>
                            <button
                                onClick={() => setShowAddBacklog(!showAddBacklog)}
                                className={`btn btn-circle border-none shadow-xl transition-all ${showAddBacklog ? 'bg-rose-500 hover:bg-rose-600 rotate-45' : 'bg-gray-900 hover:bg-black'} text-white`}
                            >
                                <Plus size={24} />
                            </button>
                        </div>

                        <AnimatePresence>
                            {showAddBacklog && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="card-premium p-6 rounded-[2rem] space-y-4 bg-indigo-50/30 border-indigo-100">
                                        <input
                                            type="text"
                                            placeholder="Ghi nhanh vấn đề..."
                                            className="input w-full bg-white rounded-2xl border-none ring-1 ring-indigo-100 focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900"
                                            value={newBacklogTitle}
                                            onChange={(e) => setNewBacklogTitle(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && newBacklogTitle && addBacklog.mutate(newBacklogTitle)}
                                        />
                                        <button
                                            disabled={!newBacklogTitle || addBacklog.isPending}
                                            onClick={() => addBacklog.mutate(newBacklogTitle)}
                                            className="btn btn-indigo w-full bg-indigo-600 hover:bg-indigo-700 text-white border-none rounded-2xl font-black normal-case"
                                        >
                                            Thêm vào danh sách
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-4">
                            {loadingBacklog ? (
                                <div className="p-10 text-center"><span className="loading loading-spinner text-rose-500"></span></div>
                            ) : backlogItems?.length > 0 ? (
                                backlogItems.map((item: any) => (
                                    <BacklogItem
                                        key={item._id}
                                        title={item.title}
                                        status={item.status}
                                        time={DateTime.fromISO(item.createdAt).toRelative()}
                                        onDone={() => markBacklogDone.mutate(item._id)}
                                    />
                                ))
                            ) : (
                                <div className="p-12 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200 text-center">
                                    <p className="text-gray-400 font-bold italic text-sm">Danh sách đang trống. Tuyệt vời! ✨</p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200 text-center">
                            <p className="text-gray-400 text-xs font-bold italic">Sử dụng Backlog trong buổi State of Us để cùng giải quyết các vấn đề tồn đọng.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function TabButton({ active, onClick, label, icon }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all duration-500 ${active ? 'bg-white text-rose-500 shadow-xl shadow-rose-100/50' : 'text-gray-400 font-bold opacity-60'}`}
        >
            {icon} {label}
        </button>
    );
}

function QuestionBox({ num, q, color, value, onChange }: { num: string; q: string; color: string; value: string; onChange: (v: string) => void }) {
    return (
        <motion.div
            whileFocus={{ scale: 1.02 }}
            className={`card-premium p-8 rounded-[2.5rem] space-y-4 bg-white border ${color.split(' ')[0]} transition-all shadow-sm`}
        >
            <div className="flex items-start gap-4">
                <span className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-2xl font-black text-sm italic ${color.split(' ')[2]} ${color.split(' ')[1]}`}>
                    {num}
                </span>
                <h3 className="font-bold text-gray-800 text-sm leading-tight pr-2 pt-1">{q}</h3>
            </div>
            <textarea
                placeholder="Cùng nhau suy nghĩ và viết tại đây..."
                className="textarea w-full p-6 bg-gray-50/50 focus:bg-white rounded-[1.75rem] text-sm font-bold border-none outline-none focus:ring-4 focus:ring-rose-500/5 resize-none h-32 italic text-gray-900"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </motion.div>
    );
}

function BacklogItem({ title, status, time, onDone }: { title: string; status: string; time: string | null; onDone: () => void }) {
    const isDone = status === 'DONE';
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-6 rounded-[2rem] flex items-center gap-5 border transition-all duration-300 ${isDone ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100 shadow-sm hover:border-rose-200 shadow-rose-200/10'}`}
        >
            <button
                onClick={onDone}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${isDone ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-50 text-gray-300 hover:bg-emerald-50 hover:text-emerald-500'}`}
            >
                <CheckCircle2 size={24} />
            </button>
            <div className="flex-1">
                <span className={`block font-bold text-sm tracking-tight ${isDone ? 'line-through text-gray-400 font-medium' : 'text-gray-700'}`}>{title}</span>
                <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest">{time || 'vừa xong'}</span>
            </div>
            {status === 'URGENT' && <span className="badge badge-error text-[8px] font-black text-white p-2">URGENT</span>}
        </motion.div>
    );
}
