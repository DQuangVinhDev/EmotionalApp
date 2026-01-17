import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, List, ShieldCheck, Heart, ArrowRight, Sparkles, CheckCircle2, Check, History } from 'lucide-react';
import { toast } from 'sonner';
import client from '../../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import confetti from 'canvas-confetti';

export default function Ritual() {
    const [activeTab, setActiveTab] = useState<'WEEKLY' | 'BACKLOG' | 'HISTORY'>('WEEKLY');
    const [weeklyAnswers, setWeeklyAnswers] = useState<Record<string, string>>({
        'q1': '', 'q2': '', 'q3': ''
    });
    const [newBacklogTitle, setNewBacklogTitle] = useState('');
    const [showAddBacklog, setShowAddBacklog] = useState(false);
    const queryClient = useQueryClient();

    // Current week key
    const weekKey = DateTime.now().toFormat("yyyy-'W'WW");

    // Fetch current weekly session
    const { data: weeklySession, isLoading: loadingWeekly } = useQuery({
        queryKey: ['weekly', weekKey],
        queryFn: async () => {
            const res = await client.get('/weekly/current', { params: { weekKey } });
            return res.data;
        }
    });

    // Populate form when session data is loaded
    useEffect(() => {
        if (weeklySession?.answersByUser) {
            // Lấy câu trả lời của user đầu tiên tìm thấy (thường là current user)
            const allUsersAnswers = Object.values(weeklySession.answersByUser);
            if (allUsersAnswers.length > 0) {
                const answers = allUsersAnswers[0] as any;
                setWeeklyAnswers({
                    'q1': answers.q1 || '',
                    'q2': answers.q2 || '',
                    'q3': answers.q3 || ''
                });
            }
        }
    }, [weeklySession]);

    // Fetch Backlog
    const { data: backlogItems, isLoading: loadingBacklog } = useQuery({
        queryKey: ['backlog'],
        queryFn: async () => {
            const res = await client.get('/backlog/open');
            return res.data;
        }
    });

    // Fetch Weekly History
    const { data: weeklyHistory, isLoading: loadingHistory } = useQuery({
        queryKey: ['weekly-history'],
        queryFn: async () => {
            const res = await client.get('/weekly/history');
            return res.data;
        }
    });

    // Save Weekly Session
    const saveWeekly = useMutation({
        mutationFn: async () => {
            return client.post('/weekly/submit', {
                weekKey,
                answers: weeklyAnswers
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['weekly', weekKey] });
            queryClient.invalidateQueries({ queryKey: ['weekly-history'] });
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
                <TabButton
                    active={activeTab === 'HISTORY'}
                    onClick={() => setActiveTab('HISTORY')}
                    label="Lịch sử"
                    icon={<History size={18} />}
                />
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'WEEKLY' && (
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
                                <div className="flex items-center gap-3">
                                    <div className="badge badge-outline border-white/40 text-white font-black text-[9px] py-3 tracking-[0.2em]">SESSIONS OF THE WEEK</div>
                                    {weeklySession && (
                                        <div className="badge bg-white/20 border-none text-white font-black text-[9px] py-3 tracking-[0.1em] gap-1">
                                            <Check size={12} /> ĐÃ LƯU
                                        </div>
                                    )}
                                </div>
                                <h2 className="text-3xl font-black italic tracking-tight leading-tight">State of Us 🍷</h2>
                                <p className="text-rose-100 text-sm font-medium leading-relaxed max-w-[80%] italic">Dành 15-30 phút cuối tuần để thấu hiểu và cùng nhau tạo ra kỷ niệm đẹp.</p>
                            </div>
                        </div>

                        {/* Ritual Questions */}
                        {loadingWeekly ? (
                            <div className="p-10 text-center">
                                <span className="loading loading-spinner text-rose-500"></span>
                                <p className="text-sm text-gray-400 mt-3 font-medium">Đang tải dữ liệu...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-4">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Câu hỏi thảo luận</h3>
                                    {weeklySession && (
                                        <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                                            <CheckCircle2 size={12} /> Tuần {weekKey.split('W')[1]}
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <QuestionBox num="1" q="Tuần này điều gì làm bạn thấy tự hào nhất về cả hai?" color="border-emerald-100 text-emerald-600 bg-emerald-50" value={weeklyAnswers['q1']} onChange={(v) => setWeeklyAnswers({ ...weeklyAnswers, 'q1': v })} />
                                    <QuestionBox num="2" q="Có điều gì chúng ta cần cải thiện để tuần tới vui hơn không?" color="border-amber-100 text-amber-600 bg-amber-50" value={weeklyAnswers['q2']} onChange={(v) => setWeeklyAnswers({ ...weeklyAnswers, 'q2': v })} />
                                    <QuestionBox num="3" q="Bạn muốn mình làm điều gì đặc biệt cho bạn vào tuần sau?" color="border-rose-100 text-rose-500 bg-rose-50" value={weeklyAnswers['q3']} onChange={(v) => setWeeklyAnswers({ ...weeklyAnswers, 'q3': v })} />
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => saveWeekly.mutate()}
                            disabled={saveWeekly.isPending || loadingWeekly}
                            className={`w-full btn btn-lg rounded-[2.25rem] border-none shadow-2xl font-black gap-3 normal-case text-lg group ${weeklySession ? 'btn-success shadow-emerald-200' : 'btn-primary shadow-rose-200'}`}
                        >
                            {saveWeekly.isPending ? <span className="loading loading-spinner"></span> : weeklySession ? (
                                <><CheckCircle2 size={20} /> Cập nhật phiên họp <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                            ) : (
                                <><Sparkles size={20} /> Lưu phiên họp <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </motion.div>
                )}

                {activeTab === 'BACKLOG' && (
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

                {activeTab === 'HISTORY' && (
                    <motion.div
                        key="history"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-10"
                    >
                        <div className="px-4">
                            <h2 className="text-xl font-black text-gray-800 tracking-tight">Lịch sử phiên họp</h2>
                            <p className="text-sm text-gray-400 mt-1 font-medium">Xem lại các phiên họp đã lưu trước đây</p>
                        </div>

                        <div className="space-y-4">
                            {loadingHistory ? (
                                <div className="p-10 text-center">
                                    <span className="loading loading-spinner text-rose-500"></span>
                                    <p className="text-sm text-gray-400 mt-3 font-medium">Đang tải lịch sử...</p>
                                </div>
                            ) : weeklyHistory?.length > 0 ? (
                                weeklyHistory.map((session: any) => (
                                    <HistoryItem key={session._id} session={session} />
                                ))
                            ) : (
                                <div className="p-12 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200 text-center">
                                    <History size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-400 font-bold italic text-sm">Chưa có phiên họp nào được lưu.</p>
                                    <p className="text-gray-300 text-xs mt-2">Hãy bắt đầu với tab "Nghi thức"!</p>
                                </div>
                            )}
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

function HistoryItem({ session }: { session: any }) {
    const [expanded, setExpanded] = useState(false);
    const weekNumber = session.weekKey?.split('W')[1] || '??';
    const year = session.weekKey?.split('-W')[0] || '????';

    // answersByUser là object { "userId": { q1, q2, q3 } }
    const userAnswersList = session.answersByUser ? Object.values(session.answersByUser) : [];

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden"
        >
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full p-6 flex items-center gap-4 text-left hover:bg-gray-50/50 transition-colors"
            >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 flex flex-col items-center justify-center text-white shadow-lg shadow-rose-200/50">
                    <span className="text-[10px] font-bold opacity-80 uppercase">Tuần</span>
                    <span className="text-lg font-black leading-none">{weekNumber}</span>
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="font-black text-gray-800 text-sm italic">State of Us 🍷</span>
                        <span className="badge bg-emerald-100 text-emerald-600 border-none text-[9px] font-bold gap-1">
                            <CheckCircle2 size={10} /> ĐÃ LƯU
                        </span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium">
                        {DateTime.fromISO(session.createdAt).toFormat("dd' Thg 'MM, yyyy")} • Năm {year}
                    </span>
                </div>
                <div className={`p-2 rounded-full bg-gray-50 text-gray-400 transition-transform ${expanded ? 'rotate-90 text-rose-500 bg-rose-50' : ''}`}>
                    <ArrowRight size={18} />
                </div>
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-gray-50/30"
                    >
                        <div className="px-6 pb-6 pt-2 space-y-6 border-t border-gray-100">
                            {userAnswersList.length > 0 ? (
                                userAnswersList.map((answers: any, idx) => (
                                    <div key={idx} className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-px flex-1 bg-gray-200" />
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-white px-2 py-1 rounded-full border border-gray-100 shadow-sm">
                                                {idx === 0 ? 'Câu trả lời 1' : `Câu trả lời ${idx + 1}`}
                                            </span>
                                            <div className="h-px flex-1 bg-gray-200" />
                                        </div>

                                        <div className="grid gap-4">
                                            {answers.q1 && (
                                                <div className="space-y-1">
                                                    <div className="text-[10px] font-black text-emerald-700 uppercase pl-1">✨ Điểm tự hào nhất:</div>
                                                    <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-[1.5rem] shadow-sm italic text-slate-900 text-sm font-semibold leading-relaxed">
                                                        "{answers.q1}"
                                                    </div>
                                                </div>
                                            )}

                                            {answers.q2 && (
                                                <div className="space-y-1">
                                                    <div className="text-[10px] font-black text-amber-700 uppercase pl-1">💡 Cần cải thiện:</div>
                                                    <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-[1.5rem] shadow-sm italic text-slate-900 text-sm font-semibold leading-relaxed">
                                                        "{answers.q2}"
                                                    </div>
                                                </div>
                                            )}

                                            {answers.q3 && (
                                                <div className="space-y-1">
                                                    <div className="text-[10px] font-black text-rose-700 uppercase pl-1">💖 Mong muốn đặc biệt:</div>
                                                    <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-[1.5rem] shadow-sm italic text-slate-900 text-sm font-semibold leading-relaxed">
                                                        "{answers.q3}"
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-400 italic text-sm">
                                    Không có dữ liệu câu trả lời chi tiết.
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
