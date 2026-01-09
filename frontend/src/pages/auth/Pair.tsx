import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Users, Copy, Check, ArrowRight, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Pair() {
    const [code, setCode] = useState('');
    const [pairCode, setPairCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const { user, setUser } = useAuthStore();
    const navigate = useNavigate();

    // Auto-redirect if already paired
    useEffect(() => {
        if (user?.coupleId) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleCreate = async () => {
        try {
            const response = await client.post('/couple/create');
            setPairCode(response.data.pairCode);

            if (response.data.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);
                if (user) {
                    setUser({ ...user, coupleId: response.data.coupleId });
                }
            }
            toast.success('Mã kết nối đã được tạo! 🎟️');
        } catch (err: any) {
            const data = err.response?.data;
            if (data?.message === 'Bạn đã ở trong một couple hoàn chỉnh') {
                if (data.accessToken) {
                    localStorage.setItem('accessToken', data.accessToken);
                    if (user) setUser({ ...user, coupleId: data.coupleId });
                }
                toast.info('Bạn đã có couple rồi! Đang chuyển hướng...');
                setTimeout(() => navigate('/'), 1000);
                return;
            }
            toast.error(data?.message || 'Lỗi khi tạo mã. Vui lòng thử lại.');
        }
    };

    const handleJoin = async () => {
        setLoading(true);
        try {
            const response = await client.post('/couple/join', { pairCode: code });

            if (response.data.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);
            }

            if (user) {
                setUser({ ...user, coupleId: response.data.coupleId });
            }
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#f43f5e', '#6366f1', '#ffffff']
            });
            toast.success('Kết nối thành công! Chào mừng hai bạn! ❤️');
            setTimeout(() => navigate('/'), 1500);
        } catch (err: any) {
            const data = err.response?.data;
            if (data?.message === 'Bạn đã ở trong một couple') {
                if (data.accessToken) {
                    localStorage.setItem('accessToken', data.accessToken);
                    if (user) setUser({ ...user, coupleId: data.coupleId });
                }
                toast.info('Bạn đã có couple rồi! Đang chuyển hướng...');
                setTimeout(() => navigate('/'), 1000);
                return;
            }
            toast.error(data?.message || 'Lỗi khi tham gia. Kiểm tra lại mã nhé.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(pairCode);
        setCopied(true);
        toast.info('Đã sao chép mã! Gửi ngay cho đối tác nhé.');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col min-h-screen p-8 bg-white justify-center overflow-hidden relative">
            <div className="absolute top-10 left-10 text-rose-100 rotate-12"><Heart size={120} fill="currentColor" /></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 space-y-12 shrink-0"
            >
                <div className="text-center space-y-3">
                    <div className="inline-flex p-5 bg-indigo-50 rounded-[2rem] text-indigo-500 mb-2 shadow-inner">
                        <Users size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">Kết nối đôi lứa</h2>
                    <p className="text-gray-400 font-medium italic">Gắn kết tình cảm chỉ với một bước chân</p>
                </div>

                <div className="space-y-6">
                    <AnimatePresence mode="wait">
                        {!pairCode ? (
                            <motion.div
                                key="create"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="card-premium p-8 rounded-[3rem] space-y-6 text-center"
                            >
                                <div className="space-y-4">
                                    <h3 className="font-black text-gray-800">Bạn là người đầu tiên?</h3>
                                    <p className="text-sm text-gray-400 font-medium">Tạo mã riêng tư và gửi cho đối tác của bạn ngay.</p>
                                </div>
                                <button
                                    onClick={handleCreate}
                                    className="w-full btn btn-primary rounded-[1.5rem] font-black normal-case border-none shadow-lg shadow-rose-200"
                                >
                                    Tạo Couple Code
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="display"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="card-premium p-8 rounded-[3rem] space-y-6 text-center border-rose-100 bg-rose-50/30"
                            >
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em]">Mã của bạn</span>
                                    <div className="text-5xl font-black text-rose-600 tracking-[0.2em] leading-tight py-2 font-mono italic">
                                        {pairCode}
                                    </div>
                                </div>
                                <button
                                    onClick={copyToClipboard}
                                    className="btn btn-outline btn-primary rounded-2xl w-full border-none bg-white shadow-sm normal-case font-black gap-2"
                                >
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                    {copied ? 'Đã sao chép' : 'Sao chép mã'}
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="btn btn-primary rounded-2xl w-full border-none shadow-lg shadow-rose-200 normal-case font-black"
                                >
                                    Đã gửi mã, vào Trang chủ <ArrowRight size={18} />
                                </button>
                                <p className="text-[9px] text-gray-400 font-bold uppercase italic">Gửi mã này cho đối tác của bạn ngay!</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center shadow-sm"><span className="w-full border-t border-gray-100"></span></div>
                        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.5em]"><span className="bg-white px-6 text-gray-300 italic">Hoặc</span></div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card-premium p-8 rounded-[3rem] space-y-6 bg-indigo-50/20 border-indigo-50"
                    >
                        <div className="space-y-4 text-center">
                            <h3 className="font-black text-gray-800">Nhập mã từ đối tác</h3>
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Mã 6 ký tự"
                                    className="w-full p-5 bg-white border border-gray-100 rounded-3xl text-center text-3xl font-black tracking-[0.3em] font-mono text-indigo-600 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all uppercase placeholder:tracking-normal placeholder:text-gray-200 placeholder:text-sm"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    maxLength={6}
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleJoin}
                            disabled={loading || code.length < 6}
                            className="w-full btn bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] font-black border-none normal-case shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 group disabled:bg-gray-200"
                        >
                            {loading ? <span className="loading loading-spinner"></span> : (
                                <>Kết nối <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
