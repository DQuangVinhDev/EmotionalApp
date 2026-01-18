import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import client from '../../api/client';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { LogIn, Mail, Lock } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await client.post('/auth/login', { email, password });
            const { accessToken, refreshToken, user } = response.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            setUser(user);
            toast.success(`Chào mừng ${user.name} trở lại! ❤️`);
            navigate('/');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Thông tin đăng nhập không chính xác');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen px-8 justify-center bg-white relative overflow-hidden">
            {/* Decorative background blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-rose-100/50 rounded-full blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-blue-100/50 rounded-full blur-3xl" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 space-y-10"
            >
                <div className="text-center space-y-4">
                    <motion.div
                        animate={{
                            y: [0, -10, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="inline-flex p-1 bg-rose-50 rounded-[2rem] mb-2 shadow-xl shadow-rose-100"
                    >
                        <motion.span
                            animate={{
                                scale: [1, 1.25, 1],
                                filter: ["drop-shadow(0 0 0px rgba(244,63,94,0))", "drop-shadow(0 0 20px rgba(244,63,94,0.5))", "drop-shadow(0 0 0px rgba(244,63,94,0))"]
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="text-7xl p-6"
                        >
                            ❤️
                        </motion.span>
                    </motion.div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Chào bạn yêu!</h1>
                    <p className="text-gray-400 font-medium italic">Tiếp tục hành trình yêu thương của chúng mình</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors">
                            <Mail size={20} />
                        </div>
                        <input
                            type="email"
                            placeholder="Email của bạn"
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all font-medium text-gray-900"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors">
                            <Lock size={20} />
                        </div>
                        <input
                            type="password"
                            placeholder="Mật khẩu"
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all font-medium text-gray-900"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn btn-primary btn-lg rounded-2xl normal-case font-black text-lg shadow-xl shadow-rose-200 mt-4 border-none"
                    >
                        {loading ? <span className="loading loading-spinner"></span> : 'Bắt đầu ngay'}
                    </button>
                </form>

                <div className="text-center space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Hoặc</span>
                        <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    <p className="text-gray-500 font-medium">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="text-rose-500 font-black hover:underline underline-offset-4 decoration-2">
                            Đăng ký
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
