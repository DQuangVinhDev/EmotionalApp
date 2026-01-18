import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, ShieldAlert, MessageCircle, RefreshCcw, Quote, Sparkles, Send, Filter, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import MoodEmoji from '../../components/MoodEmoji';

export default function Feed() {
    const [filterType, setFilterType] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const {
        data: feedData,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch
    } = useInfiniteQuery({
        queryKey: ['feed', filterType, startDate, endDate],
        queryFn: async ({ pageParam = 1 }) => {
            const params = new URLSearchParams();
            params.append('page', pageParam.toString());
            params.append('limit', '10');
            if (filterType) params.append('type', filterType);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const res = await client.get(`/feed?${params.toString()}`);
            return res.data;
        },
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.hasMore ? allPages.length + 1 : undefined;
        },
        initialPageParam: 1,
    });

    const feed = feedData?.pages.flatMap(page => page.data) || [];

    const resetFilters = () => {
        setFilterType('');
        setStartDate('');
        setEndDate('');
    };

    const hasActiveFilters = filterType || startDate || endDate;

    return (
        <div className="p-8 space-y-10 pb-32">
            {/* Dynamic Header */}
            <div className="pt-10 space-y-4 mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-1 bg-rose-500 rounded-full" />
                    <span className="text-[10px] font-black text-rose-500/60 uppercase tracking-[0.4em]">Memory Lane</span>
                </div>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight leading-none">Journal chung</h1>
                        <p className="text-sm font-bold text-slate-400 mt-3 italic">Khoảnh khắc gắn kết của hai bạn</p>
                    </div>
                    <div className="flex gap-2">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowFilters(!showFilters)}
                            className={`btn btn-circle btn-ghost ${showFilters ? 'bg-rose-500 text-white' : 'bg-slate-800 text-rose-500'} border-none shadow-md`}
                        >
                            <Filter size={20} />
                        </motion.button>
                        <motion.button
                            whileTap={{ rotate: 180 }}
                            onClick={() => refetch()}
                            className="btn btn-circle btn-ghost text-rose-500 bg-slate-800 border-none shadow-md"
                        >
                            <RefreshCcw size={20} />
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-slate-900/50 p-6 rounded-[2rem] space-y-6 border border-white/5 shadow-inner">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Loại bài viết</label>
                                    <select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="select select-bordered w-full rounded-2xl bg-slate-800 border-none shadow-sm text-sm font-bold text-slate-200"
                                    >
                                        <option value="">Tất cả</option>
                                        <option value="CHECKIN">Mood Check-in</option>
                                        <option value="KUDOS">Kudos</option>
                                        <option value="REPAIR">Repair</option>
                                        <option value="PROMPT_ANSWER">Love Map</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Từ ngày</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="input input-bordered w-full rounded-2xl bg-slate-800 border-none shadow-sm text-sm font-bold text-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Đến ngày</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="input input-bordered w-full rounded-2xl bg-slate-800 border-none shadow-sm text-sm font-bold text-slate-200"
                                    />
                                </div>
                                <div className="flex items-end">
                                    {hasActiveFilters && (
                                        <button
                                            onClick={resetFilters}
                                            className="btn btn-ghost w-full rounded-2xl text-rose-500 font-bold hover:bg-rose-50 gap-2 normal-case"
                                        >
                                            <X size={16} /> Xóa bộ lọc
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 space-y-4">
                        <span className="loading loading-spinner loading-lg text-rose-500"></span>
                        <p className="text-gray-300 font-bold uppercase text-[10px] tracking-widest animate-pulse">Đang đồng bộ dữ liệu...</p>
                    </div>
                ) : (
                    <>
                        <AnimatePresence mode="popLayout">
                            {feed.length > 0 ? feed.map((item: any, idx: number) => (
                                <FeedItem key={item._id} item={item} idx={idx} />
                            )) : (
                                <div className="text-center py-20 bg-slate-900/30 rounded-[3rem] border border-dashed border-white/10">
                                    <p className="text-slate-500 font-medium italic text-sm">
                                        {hasActiveFilters ? 'Không thấy bài viết nào phù hợp 🔍' : 'Chưa có gì được chia sẻ hôm nay ✨'}
                                    </p>
                                    {hasActiveFilters && (
                                        <button onClick={resetFilters} className="btn btn-link text-rose-500 normal-case no-underline font-black mt-2">
                                            Xem lại tất cả
                                        </button>
                                    )}
                                </div>
                            )}
                        </AnimatePresence>

                        {hasNextPage && (
                            <div className="flex justify-center pt-4">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                    className="px-8 py-4 bg-slate-900/50 hover:bg-slate-800 text-rose-500 rounded-full font-black text-xs uppercase tracking-widest border border-white/5 transition-all flex items-center gap-3"
                                >
                                    {isFetchingNextPage ? (
                                        <>
                                            <span className="loading loading-spinner loading-xs"></span>
                                            Đang tải...
                                        </>
                                    ) : (
                                        'Xem thêm bài viết'
                                    )}
                                </motion.button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function FeedItem({ item, idx }: { item: any; idx: number }) {
    const isKudos = item.itemType === 'KUDOS';
    const isCheckin = item.itemType === 'CHECKIN';
    const isRepair = item.itemType === 'REPAIR';
    const isPrompt = item.itemType === 'PROMPT_ANSWER';
    const [showAllComments, setShowAllComments] = useState(false);
    const visibleComments = showAllComments ? item.comments : item.comments?.slice(-3);
    const hasMoreComments = item.comments?.length > 3;

    const [comment, setComment] = useState('');
    const queryClient = useQueryClient();

    const addComment = useMutation({
        mutationFn: async () => {
            return client.post('/comments', {
                itemType: item.itemType,
                itemId: item._id,
                content: comment
            });
        },
        onSuccess: () => {
            setComment('');
            queryClient.invalidateQueries({ queryKey: ['feed'] });
            toast.success('Đã gửi phản hồi! 💌');
        }
    });

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
                            {(item.userId?.avatarUrl || item.fromUserId?.avatarUrl || item.initiatorUserId?.avatarUrl) ? (
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
                        <h3 className="font-black text-white text-sm">{item.userId?.name || item.fromUserId?.name || item.initiatorUserId?.name || 'Partner'}</h3>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5 inline-flex items-center gap-2">
                            <span className="w-1 h-1 bg-slate-700 rounded-full" /> {item.itemType} {new Date(item.sharedAt || item.createdAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })}
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
                                    Xem thêm {item.comments.length - 3} bình luận...
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

                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Viết phản hồi của bạn..."
                            className="input w-full bg-slate-800/50 rounded-full text-sm font-bold focus:bg-slate-800 transition-colors border-none ring-1 ring-white/5 focus:ring-2 focus:ring-rose-500/20 text-white"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && comment && addComment.mutate()}
                        />
                        <button
                            onClick={() => addComment.mutate()}
                            disabled={!comment || addComment.isPending}
                            className="btn btn-circle btn-primary bg-rose-500 border-none text-white shadow-lg shadow-rose-500/20"
                        >
                            {addComment.isPending ? <span className="loading loading-spinner loading-xs"></span> : <Send size={16} />}
                        </button>
                    </div>
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
