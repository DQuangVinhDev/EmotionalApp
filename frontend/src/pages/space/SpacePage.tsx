import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { DateTime } from 'luxon';
import { ChevronLeft, Send, Clock, CheckCircle2, XCircle, User, Moon, ShieldAlert, Zap, Coffee, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/useAuthStore';
import confetti from 'canvas-confetti';

// Types
interface ISpaceRequest {
    _id: string;
    requesterId: { _id: string; name: string; avatarUrl?: string };
    receiverId: { _id: string; name: string; avatarUrl?: string };
    startTime: string;
    endTime: string;
    reason: string;
    status: 'pending' | 'accepted' | 'rejected' | 'canceled';
    rejectionReason?: string;
    createdAt: string;
}

export default function SpacePage() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [requests, setRequests] = useState<ISpaceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    // Create state
    const [startTime, setStartTime] = useState(DateTime.now().toFormat("yyyy-MM-dd'T'HH:mm"));
    const [duration, setDuration] = useState(60); // minutes
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await client.get('/space-requests');
            setRequests(res.data);
        } catch (err) {
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!reason) return toast.error('Vui lòng nhập lý do');
        setSubmitting(true);
        try {
            const start = DateTime.fromISO(startTime);
            const end = start.plus({ minutes: duration });

            await client.post('/space-requests', {
                startTime: start.toJSDate(),
                endTime: end.toJSDate(),
                reason
            });

            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#f43f5e', '#fb7185', '#ffffff']
            });

            toast.success('Gửi yêu cầu thành công 🕊️');
            setShowCreate(false);
            setReason('');
            fetchRequests();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRespond = async (id: string, status: 'accepted' | 'rejected', rejectionReason?: string) => {
        try {
            await client.patch(`/space-requests/${id}/respond`, { status, rejectionReason });
            toast.success(status === 'accepted' ? 'Đã đồng ý ✅' : 'Đã từ chối ❌');
            if (status === 'accepted') {
                confetti({
                    particleCount: 100,
                    spread: 60,
                    origin: { y: 0.7 },
                    colors: ['#10b981', '#34d399', '#ffffff']
                });
            }
            fetchRequests();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleCancel = async (id: string) => {
        try {
            await client.patch(`/space-requests/${id}/cancel`);
            toast.success('Đã hủy yêu cầu');
            fetchRequests();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    return (
        <div className="bg-slate-950 min-h-screen pb-32">
            {/* Header */}
            <div className="p-6 flex items-center gap-4 sticky top-0 bg-slate-950/80 backdrop-blur-xl z-50 border-b border-white/5">
                <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-white/5 text-white"><ChevronLeft size={24} /></button>
                <div className="flex-1">
                    <h1 className="text-xl font-black text-white leading-none">Alone Ticket</h1>
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1">Khoảng lặng cho chính mình</p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className={`p-3 rounded-2xl transition-all ${showCreate ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-white/5 text-white hover:bg-white/10 border border-white/5'}`}
                >
                    <Moon size={20} />
                </button>
            </div>

            <div className="p-6 space-y-10">
                <AnimatePresence mode="wait">
                    {showCreate ? (
                        <motion.div
                            key="create"
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.2 } }}
                            className="bg-white/5 rounded-[2.5rem] p-8 border border-white/10 space-y-8 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                                <Moon size={120} className="text-white" />
                            </div>

                            <SectionTitle title="Thiết lập thời gian" icon={<Clock size={16} />} />

                            <div className="space-y-6">
                                <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Thời gian bắt đầu</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full bg-transparent border-none text-xl font-black text-white focus:outline-none"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black text-slate-200 uppercase tracking-widest flex items-center gap-2">
                                            <Zap size={14} className="text-amber-500" /> Thời lượng:
                                        </label>
                                        <span className="text-2xl font-black text-rose-500 italic">
                                            {duration >= 1440 ? `${Math.floor(duration / 1440)}d ` : ''}
                                            {Math.floor((duration % 1440) / 60)}h {duration % 60}p
                                        </span>
                                    </div>
                                    <input
                                        type="range" min="15" max="2880" step="15"
                                        value={duration}
                                        onChange={(e) => setDuration(parseInt(e.target.value))}
                                        className="range range-sm range-error"
                                    />
                                    <div className="flex justify-between text-[9px] font-black text-slate-700 uppercase tracking-tighter">
                                        <span>15 phút</span><span>24 giờ</span><span>48 giờ</span>
                                    </div>
                                </div>
                            </div>

                            <SectionTitle title="Lý do & Tiết lộ" icon={<Coffee size={16} />} />
                            <div className="space-y-4">
                                <textarea
                                    placeholder="Chia sẻ lý do bạn cần một mình... (đối phương sẽ dễ thông cảm hơn)"
                                    className="textarea w-full h-32 bg-white/5 border-none ring-1 ring-white/10 rounded-3xl p-5 font-medium text-base text-white placeholder:text-slate-600 focus:ring-2 focus:ring-rose-500/50"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-5 bg-rose-500/5 rounded-3xl border border-rose-500/20 flex gap-4 items-start"
                                >
                                    <div className="p-2 bg-rose-500 rounded-lg text-white">
                                        <Heart size={16} fill="currentColor" />
                                    </div>
                                    <p className="text-[11px] text-rose-200 leading-relaxed">
                                        <span className="font-black text-rose-500 block mb-1 uppercase tracking-tight">Lời hứa tin cậy 🤝</span>
                                        Mình cam kết sẽ chủ động liên lạc lại với bạn ngay sau khi thời gian này kết thúc. Đừng lo lắng nhé!
                                    </p>
                                </motion.div>
                            </div>

                            <button
                                onClick={handleCreate}
                                disabled={submitting}
                                className="w-full h-16 bg-rose-500 hover:brightness-110 text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(244,63,94,0.3)] transition-all active:scale-95 disabled:opacity-50"
                            >
                                {submitting ? <span className="loading loading-spinner"></span> : <><Send size={20} /> Gửi Alone Ticket</>}
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            <SectionTitle title="Nhật ký yêu cầu" icon={<Zap size={16} />} />

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="loading loading-spinner loading-lg text-rose-500"></div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Đang tải vũ trụ...</p>
                                </div>
                            ) : requests.length === 0 ? (
                                <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 space-y-4">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-700">
                                        <Moon size={32} />
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium italic">Chưa có "khoảng lặng" nào được ghi lại</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {requests.map((req) => (
                                        <RequestCard
                                            key={req._id}
                                            req={req}
                                            currentUserId={user?.id || ''}
                                            onRespond={handleRespond}
                                            onCancel={handleCancel}
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function RequestCard({ req, currentUserId, onRespond, onCancel }: {
    req: ISpaceRequest,
    currentUserId: string,
    onRespond: (id: string, status: 'accepted' | 'rejected', reason?: string) => void,
    onCancel: (id: string) => void
}) {
    const isRequester = req.requesterId._id === currentUserId;
    const start = DateTime.fromISO(req.startTime);
    const end = DateTime.fromISO(req.endTime);
    const now = DateTime.now();

    const getStatusInfo = () => {
        switch (req.status) {
            case 'pending': return { color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Chờ phản hồi', icon: <Clock size={12} /> };
            case 'accepted': return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Đã chấp nhận', icon: <CheckCircle2 size={12} /> };
            case 'rejected': return { color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'Từ chối', icon: <XCircle size={12} /> };
            case 'canceled': return { color: 'text-slate-500', bg: 'bg-slate-500/10', label: 'Đã hủy', icon: <XCircle size={12} /> };
        }
    };

    const statusInfo = getStatusInfo();
    const isActive = req.status === 'accepted' && now >= start && now <= end;

    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-[2.5rem] border transition-all ${isActive ? 'bg-rose-500/10 border-rose-500 shadow-lg shadow-rose-500/10' : 'bg-white/5 border-white/10'}`}
        >
            <div className="flex items-start gap-4 mb-5">
                <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
                        {req.requesterId.avatarUrl ? (
                            <img src={req.requesterId.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <User size={24} className="text-slate-500" />
                        )}
                    </div>
                    {isActive && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-slate-950 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-black text-white truncate">{isRequester ? 'Bạn' : req.requesterId.name}</p>
                        <div className={`px-2 py-0.5 rounded-lg ${statusInfo.bg} ${statusInfo.color} flex items-center gap-1`}>
                            {statusInfo.icon}
                            <span className="text-[8px] font-black uppercase tracking-tight">{statusInfo.label}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-black text-white/90">{start.toFormat('HH:mm')}</span>
                            <span className="text-[8px] font-bold text-slate-500 uppercase">{start.toFormat('dd/LL')}</span>
                        </div>
                        <div className="text-slate-700 font-black">&rarr;</div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                            <div className="w-1 h-1 rounded-full bg-rose-500" />
                            <span className="text-[10px] font-black text-white/90">{end.toFormat('HH:mm')}</span>
                            <span className="text-[8px] font-bold text-slate-500 uppercase">{end.toFormat('dd/LL')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 relative">
                    <div className="absolute -top-3 left-4 px-2 bg-slate-900 border border-white/5 rounded-lg">
                        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Lý do</span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed italic">"{req.reason}"</p>
                </div>

                {req.status === 'rejected' && req.rejectionReason && (
                    <div className="p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10">
                        <div className="flex items-center gap-2 mb-1 text-rose-500">
                            <ShieldAlert size={12} />
                            <span className="text-[9px] font-black uppercase tracking-tight">Phản hồi của đối phương:</span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">"{req.rejectionReason}"</p>
                    </div>
                )}

                {/* Actions */}
                <AnimatePresence mode="wait">
                    {!isRequester && req.status === 'pending' && (
                        isRejecting ? (
                            <motion.div
                                key="reject-form"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="space-y-3 pt-2"
                            >
                                <textarea
                                    autoFocus
                                    placeholder="Tại sao bạn muốn từ chối? (Hãy giải thích nhẹ nhàng...)"
                                    className="textarea w-full h-24 bg-white/5 border-none ring-1 ring-white/10 rounded-2xl p-4 font-medium text-xs text-white placeholder:text-slate-600 focus:ring-2 focus:ring-rose-500/50"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsRejecting(false)}
                                        className="flex-1 h-10 rounded-xl bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={() => onRespond(req._id, 'rejected', rejectionReason)}
                                        className="flex-1 h-10 rounded-xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-rose-500/20 transition-all"
                                    >
                                        Xác nhận từ chối
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="pending-actions"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex gap-3 pt-2"
                            >
                                <button
                                    onClick={() => setIsRejecting(true)}
                                    className="flex-1 h-12 rounded-2xl bg-white/5 border border-white/10 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                                >
                                    Từ chối
                                </button>
                                <button
                                    onClick={() => onRespond(req._id, 'accepted')}
                                    className="flex-1 h-12 rounded-2xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-rose-500/20 transition-all"
                                >
                                    Chấp nhận
                                </button>
                            </motion.div>
                        )
                    )}

                    {isRequester && req.status === 'pending' && (
                        <motion.button
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            onClick={() => onCancel(req._id)}
                            className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                        >
                            Hủy yêu cầu
                        </motion.button>
                    )}
                </AnimatePresence>

                {isActive && (
                    <div className="pt-2">
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: (end.diff(start).as('seconds')), ease: "linear" }}
                                className="h-full bg-emerald-500"
                            />
                        </div>
                        <p className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] text-center mt-2">
                            Bạn đang trong thời gian riêng tư 🌙
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function SectionTitle({ title, icon }: { title: string, icon?: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
            <h2 className="text-[11px] font-black text-slate-200 uppercase tracking-[0.2em] flex items-center gap-2">
                {icon}
                {title}
            </h2>
        </div>
    );
}
