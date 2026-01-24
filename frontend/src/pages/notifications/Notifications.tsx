import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, CheckCheck, Clock, Heart, ShieldAlert, Zap, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '../../store/useNotificationStore';
import type { INotification } from '../../types/notification';
import { DateTime } from 'luxon';

export default function Notifications() {
    const navigate = useNavigate();
    const { notifications, loading, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'space_request': return <Clock size={18} className="text-amber-500" />;
            case 'kudos': return <Zap size={18} className="text-amber-500" />;
            case 'repair': return <ShieldAlert size={18} className="text-indigo-500" />;
            case 'checkin': return <Heart size={18} className="text-emerald-500" />;
            case 'prompt': return <Coffee size={18} className="text-rose-500" />;
            default: return <Bell size={18} className="text-slate-400" />;
        }
    };

    return (
        <div className="bg-slate-950 min-h-screen pb-32">
            {/* Header */}
            <div className="p-6 flex items-center gap-4 sticky top-0 bg-slate-950/80 backdrop-blur-xl z-50 border-b border-white/5">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/5 text-white">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-black text-white leading-none">Thông báo</h1>
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1">Sự kiện gần đây</p>
                </div>
                <button
                    onClick={() => markAllAsRead()}
                    className="p-3 rounded-2xl bg-white/5 text-white hover:bg-white/10 border border-white/5 transition-all active:scale-90"
                    title="Đánh dấu tất cả là đã đọc"
                >
                    <CheckCheck size={20} />
                </button>
            </div>

            <div className="p-6 space-y-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="loading loading-spinner loading-lg text-rose-500"></div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Đang tải vũ trụ...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-24 bg-white/5 rounded-[3rem] border border-dashed border-white/10 space-y-6">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-700">
                            <Bell size={40} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-white font-black text-lg">Yên tĩnh tuyệt đối</p>
                            <p className="text-slate-500 text-xs font-medium italic">Bạn chưa có thông báo nào mới</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence initial={false}>
                            {notifications.map((notif: INotification) => (
                                <motion.div
                                    key={notif._id}
                                    layout
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    onClick={() => {
                                        markAsRead(notif._id);
                                        if (notif.link) navigate(notif.link);
                                    }}
                                    className={`p-5 rounded-[2.5rem] border transition-all cursor-pointer group relative overflow-hidden active:scale-[0.98] ${notif.isRead
                                        ? 'bg-white/5 border-white/5 opacity-60'
                                        : 'bg-gradient-to-br from-white/10 to-white/5 border-white/20 shadow-xl shadow-rose-500/5'
                                        }`}
                                >
                                    {!notif.isRead && (
                                        <div className="absolute top-0 right-0 p-5">
                                            <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
                                        </div>
                                    )}

                                    <div className="flex gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${notif.isRead ? 'bg-white/5 border-white/5' : 'bg-white/10 border-white/10 group-hover:border-rose-500/50'
                                            }`}>
                                            {getIcon(notif.type)}
                                        </div>

                                        <div className="flex-1 min-w-0 py-1">
                                            <h3 className={`text-sm font-black truncate mb-1 ${notif.isRead ? 'text-slate-400' : 'text-white'}`}>
                                                {notif.title}
                                            </h3>
                                            <p className={`text-xs font-medium line-clamp-2 leading-relaxed ${notif.isRead ? 'text-slate-500' : 'text-slate-300'}`}>
                                                {notif.content}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Glass reflection effect for unread items */}
                                    {!notif.isRead && (
                                        <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/0 via-rose-500/0 to-rose-500/5 pointer-events-none" />
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
