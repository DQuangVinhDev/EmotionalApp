import { useQuery } from '@tanstack/react-query';
import client from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, ShieldAlert, MessageCircle, RefreshCcw, Quote, Sparkles, Lock, Globe } from 'lucide-react';

export default function MemoryLane() {
    const { data: feed, isLoading, refetch } = useQuery({
        queryKey: ['memory-lane'],
        queryFn: async () => {
            const res = await client.get('/memory');
            return res.data;
        },
        refetchInterval: 10000,
    });

    return (
        <div className="p-8 space-y-10 pb-32">
            {/* Dynamic Header */}
            <div className="pt-6 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Memory Lane</h1>
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mt-3">Hành trình & Kỷ niệm của riêng bạn</p>
                </div>
                <motion.button
                    whileTap={{ rotate: 180 }}
                    onClick={() => refetch()}
                    className="btn btn-circle btn-ghost text-rose-500 bg-rose-50 border-none shadow-sm shadow-rose-100"
                >
                    <RefreshCcw size={20} />
                </motion.button>
            </div>

            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 space-y-4">
                        <span className="loading loading-spinner loading-lg text-rose-500"></span>
                        <p className="text-gray-300 font-bold uppercase text-[10px] tracking-widest animate-pulse">Đang hồi tưởng...</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {feed?.length > 0 ? feed.map((item: any, idx: number) => (
                            <MemoryItem key={item._id} item={item} idx={idx} />
                        )) : (
                            <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                                <p className="text-gray-400 font-medium italic text-sm">Chưa có ký ức nào được lưu lại ✨</p>
                            </div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}

function MemoryItem({ item, idx }: { item: any; idx: number }) {
    const isKudos = item.itemType === 'KUDOS';
    const isCheckin = item.itemType === 'CHECKIN';
    const isRepair = item.itemType === 'REPAIR';
    const isPrompt = item.itemType === 'PROMPT_ANSWER';
    const isPrivate = item.visibility === 'PRIVATE';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className={`relative p-8 rounded-[2.5rem] border border-gray-50 shadow-xl shadow-black/5 overflow-hidden group transition-all duration-300 ${isKudos ? 'bg-amber-50/50' : isPrompt ? 'bg-rose-50/50' : 'bg-white'}`}
        >
            {/* Decorative background element */}
            <div className={`absolute -top-4 -right-4 transition-transform group-hover:scale-125 duration-700 opacity-5 ${isKudos ? 'text-amber-500' : isCheckin ? 'text-emerald-500' : isPrompt ? 'text-rose-500' : 'text-rose-500'}`}>
                <FeedIcon type={item.itemType} size={120} />
            </div>

            <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <div className="avatar placeholder">
                        <div className={`w-12 rounded-2xl ${isKudos ? 'bg-amber-400' : isCheckin ? 'bg-emerald-400' : isPrompt ? 'bg-rose-400' : 'bg-rose-400'} text-white font-black shadow-lg`}>
                            <span>{item.userId?.name?.[0] || item.fromUserId?.name?.[0] || 'U'}</span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-black text-gray-800 text-sm">{item.userId?.name || item.fromUserId?.name || 'Me'}</h3>
                            {isPrivate ? (
                                <span className="p-1 bg-gray-100 rounded-md text-gray-400"><Lock size={12} /></span>
                            ) : (
                                <span className="p-1 bg-rose-50 rounded-md text-rose-400"><Globe size={12} /></span>
                            )}
                        </div>
                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-0.5 inline-flex items-center gap-2">
                            <span className="w-1 h-1 bg-gray-300 rounded-full" /> {item.itemType} • {new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric' })}
                        </p>
                    </div>
                </div>

                <div className="text-gray-700 leading-relaxed relative">
                    {isKudos && (
                        <div className="space-y-4">
                            <div className="text-amber-600"><Quote size={32} fill="currentColor" className="opacity-10" /></div>
                            <p className="text-xl font-black text-gray-800 italic pr-8 -mt-4 leading-snug">"{item.text}"</p>
                            <div className="flex items-center gap-2 text-amber-500 font-black text-[10px] tracking-widest uppercase">
                                <Star size={14} fill="currentColor" /> Jar of Wins
                            </div>
                        </div>
                    )}

                    {isCheckin && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between bg-emerald-50/50 p-4 rounded-3xl border border-emerald-100/50">
                                <div className="flex items-center gap-4">
                                    <span className="text-4xl">{['😢', '😕', '😐', '🙂', '😊'][item.mood - 1]}</span>
                                    <div>
                                        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Tâm trạng</h4>
                                        <p className="text-sm font-bold text-gray-700">{['Tệ', 'Kém', 'Ổn', 'Tốt', 'Tuyệt'][item.mood - 1]}</p>
                                    </div>
                                </div>
                                <div className="w-px h-8 bg-emerald-100" />
                                <div className="text-center px-4">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">E/S</p>
                                    <p className="text-sm font-black text-gray-700">{item.energy}/{item.stress}</p>
                                </div>
                            </div>
                            {item.gratitudeText && (
                                <div className="relative pl-6">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-200 rounded-full" />
                                    <p className="text-sm font-bold text-gray-500 italic leading-relaxed pr-4">"{item.gratitudeText}"</p>
                                </div>
                            )}
                        </div>
                    )}

                    {isRepair && (
                        <div className="space-y-4">
                            <p className="bg-indigo-50 p-6 rounded-[2rem] text-indigo-700 italic border border-indigo-100 font-bold leading-snug shadow-inner">
                                "{item.generatedMessage}"
                            </p>
                            <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] tracking-widest uppercase ml-4">
                                <ShieldAlert size={14} /> NVC Framework
                            </div>
                        </div>
                    )}

                    {isPrompt && (
                        <div className="space-y-4">
                            <div className="p-6 bg-white rounded-[2rem] border border-rose-100 shadow-sm relative">
                                <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest mb-2 italic">Chủ đề: {item.promptId?.text}</p>
                                <p className="text-gray-800 font-bold italic leading-relaxed">"{item.text}"</p>
                            </div>
                            <div className="flex items-center gap-2 text-rose-400 font-black text-[10px] tracking-widest uppercase ml-4">
                                <Heart size={14} fill="currentColor" /> Love Map Answer
                            </div>
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
