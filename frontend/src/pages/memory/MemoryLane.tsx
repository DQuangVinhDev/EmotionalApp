import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../../api/client';
import { ChevronLeft, Calendar, Search, MessageCircle, Star, ShieldAlert, Sparkles, Heart, Lock, Globe, Quote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MoodEmoji from '../../components/MoodEmoji';

export default function MemoryLane() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState<'ALL' | 'CHECKIN' | 'KUDOS' | 'PROMPT_ANSWER' | 'REPAIR'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const { data: memories, isLoading } = useQuery({
        queryKey: ['memories', filter],
        queryFn: async () => {
            const res = await client.get('/memory', {
                params: { type: filter === 'ALL' ? undefined : filter }
            });
            return res.data;
        }
    });

    const filteredMemories = memories?.filter((m: any) =>
        m.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.answerText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.generatedMessage?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.gratitudeText?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-[#020617] min-h-screen pb-32">
            <div className="p-6 pb-0 space-y-8">
                <div className="flex flex-col gap-6 pt-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-3 -ml-2 rounded-2xl bg-slate-800 text-slate-400 hover:bg-slate-700 transition-all shadow-sm border border-white/5">
                            <ChevronLeft size={24} />
                        </button>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-8 h-1 bg-rose-500 rounded-full" />
                                <span className="text-[10px] font-black text-rose-500/60 uppercase tracking-[0.4em]">Timeline</span>
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight">Hành trình Kỷ niệm</h1>
                        </div>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm lại kỷ niệm xưa..."
                            className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border-none rounded-2xl font-bold text-white ring-1 ring-white/5 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all shadow-inner placeholder:text-slate-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {(['ALL', 'CHECKIN', 'KUDOS', 'PROMPT_ANSWER', 'REPAIR'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all ${filter === t ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-800/50 text-slate-500 hover:bg-slate-800'}`}
                            >
                                {t === 'ALL' ? 'Tất cả' : t === 'PROMPT_ANSWER' ? 'Love Map' : t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <span className="loading loading-spinner loading-lg text-rose-500"></span>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Đang tìm lại ký ức...</p>
                    </div>
                ) : filteredMemories?.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/40 rounded-[3rem] border-2 border-dashed border-white/5">
                        <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/20">
                            <Calendar size={40} className="text-slate-700" />
                        </div>
                        <h3 className="text-lg font-black text-slate-200">Chưa có kỷ niệm nào</h3>
                        <p className="text-xs font-bold text-slate-500 mt-2 px-10">Hãy cùng nhau tạo thêm thật nhiều mảnh ghép tình yêu nhé! ❤️</p>
                    </div>
                ) : (
                    <div className="space-y-8 relative">
                        {/* Timeline Line */}
                        <div className="absolute left-10 top-0 bottom-0 w-px bg-gradient-to-b from-rose-500/20 via-slate-800 to-transparent" />

                        <AnimatePresence mode="popLayout">
                            {filteredMemories?.map((item: any, idx: number) => (
                                <MemoryItem key={item._id} item={item} idx={idx} />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div >
    );
}

function MemoryItem({ item, idx }: { item: any; idx: number }) {
    const isKudos = item.itemType === 'KUDOS';
    const isCheckin = item.itemType === 'CHECKIN';
    const isRepair = item.itemType === 'REPAIR';
    const isPrompt = item.itemType === 'PROMPT_ANSWER';
    const isPrivate = item.visibility === 'PRIVATE';

    const [showAllComments, setShowAllComments] = useState(false);
    const visibleComments = showAllComments ? item.comments : item.comments?.slice(-3);
    const hasMoreComments = item.comments?.length > 3;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className={`relative p-8 rounded-[2.5rem] border border-white/5 shadow-2xl shadow-black/20 overflow-hidden group transition-all duration-300 ${isKudos ? 'bg-amber-500/10' : isPrompt ? 'bg-rose-500/10' : 'bg-slate-900/40'}`}
        >
            {/* Decorative background element */}
            <div className={`absolute -top-4 -right-4 transition-transform group-hover:scale-125 duration-700 opacity-5 ${isKudos ? 'text-amber-500' : isCheckin ? 'text-emerald-500' : isPrompt ? 'text-rose-500' : 'text-rose-500'}`}>
                <FeedIcon type={item.itemType} size={120} />
            </div>

            <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <div className="avatar">
                        <div className={`w-12 h-12 rounded-2xl ${isKudos ? 'bg-amber-400' : isCheckin ? 'bg-emerald-400' : isPrompt ? 'bg-rose-400' : 'bg-rose-400'} text-white font-black shadow-lg overflow-hidden flex items-center justify-center`}>
                            {item.userId?.avatarUrl || item.fromUserId?.avatarUrl || item.initiatorUserId?.avatarUrl ? (
                                <img
                                    src={item.userId?.avatarUrl || item.fromUserId?.avatarUrl || item.initiatorUserId?.avatarUrl}
                                    alt="avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span>{(item.userId?.name || item.fromUserId?.name || item.initiatorUserId?.name)?.[0] || 'U'}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-black text-white text-sm">{item.userId?.name || item.fromUserId?.name || item.initiatorUserId?.name || 'Me'}</h3>
                            {isPrivate ? (
                                <span className="p-1 bg-slate-800 rounded-md text-slate-500" title="Chỉ mình tôi"><Lock size={12} /></span>
                            ) : (
                                <span className="p-1 bg-rose-500/10 rounded-md text-rose-500" title="Chia sẻ chung"><Globe size={12} /></span>
                            )}
                        </div>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5 inline-flex items-center gap-2">
                            <span className="w-1 h-1 bg-slate-700 rounded-full" /> {item.itemType} • {new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                <div className="text-gray-700 leading-relaxed relative">
                    {isKudos && (
                        <div className="space-y-4">
                            <div className="text-amber-500/20"><Quote size={32} fill="currentColor" /></div>
                            <p className="text-xl font-black text-amber-50 italic pr-8 -mt-4 leading-snug">"{item.text}"</p>
                            <div className="flex items-center gap-2 text-amber-500 font-black text-[10px] tracking-widest uppercase">
                                <Star size={14} fill="currentColor" /> Jar of Wins
                            </div>
                        </div>
                    )}

                    {isCheckin && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between bg-emerald-500/10 p-4 rounded-3xl border border-emerald-500/10">
                                <div className="flex items-center gap-4">
                                    <MoodEmoji mood={item.mood} size="lg" />
                                    <div>
                                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Tâm trạng</h4>
                                        <p className="text-sm font-bold text-emerald-50">{['Tệ', 'Kém', 'Ổn', 'Tốt', 'Tuyệt'][item.mood - 1]}</p>
                                    </div>
                                </div>
                                <div className="w-px h-8 bg-emerald-500/20" />
                                <div className="text-center px-4">
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">E/S</p>
                                    <p className="text-sm font-black text-emerald-50">{item.energy}/{item.stress}</p>
                                </div>
                            </div>
                            {item.gratitudeText && (
                                <div className="relative pl-6">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500/30 rounded-full" />
                                    <p className="text-sm font-bold text-slate-300 italic leading-relaxed pr-4">"{item.gratitudeText}"</p>
                                </div>
                            )}
                            {item.need && (
                                <div className="flex items-center gap-2 bg-indigo-500/10 p-3 rounded-2xl border border-indigo-500/10">
                                    <span className="text-lg">
                                        {item.need === 'LISTEN' && '👂'}
                                        {item.need === 'HUG' && '🫂'}
                                        {item.need === 'SPACE' && '☁️'}
                                        {item.need === 'HELP' && '🤝'}
                                        {item.need === 'PLAY' && '🎮'}
                                        {item.need === 'CLARITY' && '💡'}
                                    </span>
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                        Đang cần: {
                                            item.need === 'LISTEN' ? 'Lắng nghe' :
                                                item.need === 'HUG' ? 'Cái ôm' :
                                                    item.need === 'SPACE' ? 'Khoảng lặng' :
                                                        item.need === 'HELP' ? 'Giúp đỡ' :
                                                            item.need === 'PLAY' ? 'Giải trí' :
                                                                item.need === 'CLARITY' ? 'Làm rõ' : item.need
                                        }
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {isRepair && (
                        <div className="space-y-4">
                            <p className="bg-indigo-500/10 p-6 rounded-[2rem] text-indigo-200 italic border border-indigo-500/10 font-bold leading-snug shadow-inner">
                                "{item.generatedMessage}"
                            </p>
                            <div className="flex items-center gap-2 text-indigo-500/50 font-black text-[10px] tracking-widest uppercase ml-4">
                                <ShieldAlert size={14} /> NVC Framework
                            </div>
                        </div>
                    )}

                    {isPrompt && (
                        <div className="space-y-4">
                            <div className="p-6 bg-slate-900/60 rounded-[2rem] border border-rose-500/10 shadow-sm relative">
                                <p className="text-[10px] font-black text-rose-500/40 uppercase tracking-widest mb-2 italic">Chủ đề: {item.promptId?.text}</p>
                                <p className="text-slate-100 font-bold italic leading-relaxed">"{item.answerText}"</p>
                            </div>
                            <div className="flex items-center gap-2 text-rose-500/60 font-black text-[10px] tracking-widest uppercase ml-4">
                                <Heart size={14} fill="currentColor" /> Love Map Answer
                            </div>
                        </div>
                    )}
                </div>

                {/* Comment Section */}
                <div className="pt-6 border-t border-white/5 space-y-4">
                    {item.comments && item.comments.length > 0 && (
                        <div className="space-y-3">
                            {hasMoreComments && !showAllComments && (
                                <button
                                    onClick={() => setShowAllComments(true)}
                                    className="text-[10px] font-black text-rose-500/60 uppercase tracking-widest ml-11 hover:text-rose-500 transition-colors"
                                >
                                    Xem thêm {item.comments.length - 3} phản hồi...
                                </button>
                            )}

                            {visibleComments.map((c: any, i: number) => (
                                <div key={i} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-white/5">
                                        {c.userId?.avatarUrl ? (
                                            <img src={c.userId.avatarUrl} alt="c" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[10px] font-black text-slate-500 uppercase">{c.userId?.name?.[0] || 'U'}</span>
                                        )}
                                    </div>
                                    <div className="bg-slate-800/50 rounded-2xl rounded-tl-none p-3 px-4 text-sm font-medium text-slate-300">
                                        {c.content}
                                    </div>
                                </div>
                            ))}

                            {showAllComments && hasMoreComments && (
                                <button
                                    onClick={() => setShowAllComments(false)}
                                    className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-11 hover:text-gray-500 transition-colors"
                                >
                                    Thu gọn
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function FeedIcon({ type, size = 20 }: any) {
    if (type === 'CHECKIN') return <MessageCircle size={size} />;
    if (type === 'KUDOS') return <Star size={size} />;
    if (type === 'REPAIR') return <ShieldAlert size={size} />;
    if (type === 'PROMPT_ANSWER') return <Sparkles size={size} />;
    return <Heart size={size} />;
}
