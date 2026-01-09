import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../../api/client';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { UserPlus, Mail, Lock, User as UserIcon } from 'lucide-react';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await client.post('/auth/register', { email, password, name });
            toast.success('Đăng ký thành công! Hãy đăng nhập để bắt đầu ❤️');
            navigate('/login');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi đăng ký');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen px-8 justify-center bg-white relative overflow-hidden">
            {/* Decorative background blobs */}
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl opacity-60" />
            <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-rose-100/50 rounded-full blur-3xl opacity-60" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 space-y-10"
            >
                <div className="text-center space-y-2">
                    <div className="inline-flex p-4 bg-emerald-50 rounded-3xl text-emerald-500 mb-4 shadow-inner">
                        <UserPlus size={32} />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Đăng ký</h1>
                    <p className="text-gray-400 font-medium italic">Bắt đầu xây dựng tổ ấm hạnh phúc</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                            <UserIcon size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Tên của bạn"
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-gray-900"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                            <Mail size={20} />
                        </div>
                        <input
                            type="email"
                            placeholder="Email của bạn"
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-gray-900"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                            <Lock size={20} />
                        </div>
                        <input
                            type="password"
                            placeholder="Mật khẩu"
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-gray-900"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn btn-lg rounded-2xl normal-case font-black text-lg shadow-xl shadow-emerald-200 mt-4 border-none bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                        {loading ? <span className="loading loading-spinner"></span> : 'Tạo tài khoản'}
                    </button>
                </form>

                <div className="text-center space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Đã là thành viên?</span>
                        <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    <p className="text-gray-500 font-medium">
                        <Link to="/login" className="text-rose-500 font-black hover:underline underline-offset-4 decoration-2">
                            Đăng nhập ngay
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
