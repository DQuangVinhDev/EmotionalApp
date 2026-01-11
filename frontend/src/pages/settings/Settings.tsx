import { LogOut, User, Bell, ChevronRight, ShieldCheck, Heart, Crown, X, Save, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import client from '../../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';

export default function Settings() {
    const { logout } = useAuthStore();
    const queryClient = useQueryClient();
    const [editingType, setEditingType] = useState<'PROFILE' | 'NOTIFICATIONS' | 'PRIVACY' | null>(null);

    // Fetch Profile
    const { data: profile } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const res = await client.get('/users/profile');
            return res.data;
        }
    });

    // Update Profile
    const updateProfile = useMutation({
        mutationFn: async (data: any) => {
            return client.patch('/users/profile', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            setEditingType(null);
            toast.success('Cập nhật thành công! ✨');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
            toast.error(message);
        }
    });

    const handleLogout = () => {
        toast.info('Hẹn gặp lại bạn nhé! ❤️');
        setTimeout(() => logout(), 1000);
    };

    return (
        <div className="p-8 space-y-10 pb-32">
            {/* Profile Header Card */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="card-premium p-8 rounded-[3.5rem] flex flex-col items-center bg-gradient-to-br from-rose-50 to-white relative overflow-hidden"
            >
                <div className="absolute -top-10 -right-10 text-rose-100/50 -rotate-12"><Crown size={120} /></div>

                <div className="relative mb-6">
                    <div className="w-24 h-24 bg-rose-500 rounded-[2.5rem] flex items-center justify-center text-4xl text-white font-black shadow-2xl shadow-rose-200 rotate-3 overflow-hidden">
                        {profile?.avatarUrl ? (
                            <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                            profile?.name?.[0].toUpperCase() || '?'
                        )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg border border-rose-50 text-rose-500">
                        <Heart size={16} fill="currentColor" />
                    </div>
                </div>

                <div className="text-center space-y-1">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none">{profile?.name}</h1>
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">{profile?.email}</p>
                </div>

                <div className="mt-8 flex gap-3">
                    <div className="badge badge-outline border-rose-200 text-rose-500 font-bold px-4 py-3 bg-white">Couple Member</div>
                    {profile?.coupleId && <div className="badge badge-primary font-bold px-4 py-3">Paired</div>}
                </div>
            </motion.div>

            {/* Settings Menu */}
            <div className="space-y-6">
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-4">Cài đặt ứng dụng</h2>

                <div className="card-premium rounded-[3rem] overflow-hidden p-2">
                    <SettingItem icon={<User size={18} />} title="Hồ sơ cá nhân" color="bg-blue-500" onClick={() => setEditingType('PROFILE')} />
                    <SettingItem icon={<Bell size={18} />} title="Thông báo" color="bg-orange-400" onClick={() => setEditingType('NOTIFICATIONS')} />
                    <SettingItem icon={<ShieldCheck size={18} />} title="Quyền riêng tư" color="bg-emerald-500" onClick={() => setEditingType('PRIVACY')} />
                </div>
            </div>

            <AnimatePresence>
                {editingType && (
                    <SettingsModal
                        type={editingType}
                        profile={profile}
                        onClose={() => setEditingType(null)}
                        onUpdate={(data: any) => updateProfile.mutate(data)}
                        isPending={updateProfile.isPending}
                    />
                )}
            </AnimatePresence>

            {/* Danger Zone */}
            <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleLogout}
                className="w-full btn btn-lg bg-rose-50 border-none hover:bg-rose-100 text-rose-500 rounded-[2.5rem] font-bold normal-case flex items-center justify-center gap-4 transition-all"
            >
                <div className="p-2 bg-white rounded-xl shadow-sm text-rose-400">
                    <LogOut size={20} />
                </div>
                Đăng xuất tài khoản
            </motion.button>

            <div className="text-center space-y-2">
                <p className="text-[9px] text-gray-200 font-medium">Made by Vinh ❤️ for Our Relationship</p>
            </div>
        </div>
    );
}

function SettingItem({ icon, title, color, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-5 p-5 rounded-[2.5rem] hover:bg-gray-50/50 transition-all group group-active:scale-95 duration-200"
        >
            <div className={`p-3 rounded-2xl text-white ${color} shadow-lg shadow-current/10 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <span className="flex-1 text-left font-black text-gray-700 text-sm tracking-tight">{title}</span>
            <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-rose-50 group-hover:text-rose-400 transition-all text-gray-300">
                <ChevronRight size={16} strokeWidth={3} />
            </div>
        </button>
    );
}

function SettingsModal({ type, profile, onClose, onUpdate, isPending }: any) {
    const [formData, setFormData] = useState({
        name: profile?.name || '',
        email: profile?.email || '',
        avatarUrl: profile?.avatarUrl || '',
        timezone: profile?.timezone || 'Asia/Ho_Chi_Minh',
        emailNotifications: profile?.settings?.emailNotifications !== false
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                email: profile.email || '',
                avatarUrl: profile.avatarUrl || '',
                timezone: profile.timezone || 'Asia/Ho_Chi_Minh',
                emailNotifications: profile.settings?.emailNotifications !== false
            });
        }
    }, [profile]);

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const subscribeToPush = async () => {
        try {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                throw new Error('Trình duyệt của bạn không hỗ trợ thông báo đẩy trực tiếp. Hãy thử dùng Chrome hoặc Safari.');
            }

            const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
            if (!publicVapidKey || publicVapidKey.length < 50) {
                console.error('VITE_VAPID_PUBLIC_KEY is invalid or missing');
                throw new Error('Lỗi cấu hình hệ thống: Mã định danh thông báo không hợp lệ.');
            }

            let registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
            }

            // Wait for service worker to be ready
            await navigator.serviceWorker.ready;

            // Try to unsubscribe first to avoid key mismatch errors (AbortError)
            try {
                const existingSub = await registration.pushManager.getSubscription();
                if (existingSub) {
                    await existingSub.unsubscribe();
                }
            } catch (e) {
                console.warn('Unsubscribe failed, continuing...', e);
            }

            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                throw new Error('Bạn cần cấp quyền "Cho phép thông báo" trong phần cài đặt trình duyệt.');
            }

            const applicationServerKey = urlBase64ToUint8Array(publicVapidKey.trim());

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey
            });

            await client.post('/users/push-subscribe', { subscription });
            toast.success('Đã kích hoạt thông báo thành công! 🔔');
        } catch (error: any) {
            console.error('Push Error Details:', error);
            if (error.name === 'NotAllowedError') {
                toast.error('Bạn đã chặn quyền thông báo. Hãy bật lại trong cài đặt trình duyệt.');
            } else if (error.name === 'AbortError' || error.message.includes('Registration failed')) {
                toast.error('Lỗi dịch vụ thông báo (Push Service Error). Hãy chắc chắn bạn không dùng VPN/Ẩn danh và hãy F5 lại trang.');
            } else {
                toast.error(error.message || 'Không thể bật thông báo');
            }
        }
    };

    const handleSave = () => {
        let payload: any = {};
        if (type === 'PROFILE') {
            // Only send changed fields and handle them as optional
            if (formData.name !== profile?.name) payload.name = formData.name;
            if (formData.email !== profile?.email) payload.email = formData.email;
            if (formData.avatarUrl !== profile?.avatarUrl) payload.avatarUrl = formData.avatarUrl;
        } else if (type === 'NOTIFICATIONS') {
            payload = {
                settings: {
                    emailNotifications: formData.emailNotifications
                }
            };
        }

        if (Object.keys(payload).length === 0 && type === 'PROFILE') {
            onClose();
            return;
        }

        onUpdate(payload);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-white w-full max-w-[430px] rounded-[3.5rem] p-8 space-y-8"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">
                        {type === 'PROFILE' ? 'Hồ sơ cá nhân' : type === 'NOTIFICATIONS' ? 'Cài đặt thông báo' : 'Quyền riêng tư'}
                    </h3>
                    <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400"><X size={20} /></button>
                </div>

                <div className="space-y-6">
                    {type === 'PROFILE' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Họ và tên</label>
                                <input
                                    type="text"
                                    className="input w-full bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl font-bold text-gray-900"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                                <input
                                    type="email"
                                    className="input w-full bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl font-bold text-gray-900"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ảnh đại diện</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gray-50 ring-1 ring-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                                        {formData.avatarUrl ? (
                                            <img src={formData.avatarUrl} alt="preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon size={24} className="text-gray-200" />
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const widget = window.cloudinary.createUploadWidget(
                                                {
                                                    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
                                                    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
                                                    sources: ['local', 'camera'],
                                                    multiple: false,
                                                    cropping: true,
                                                    croppingAspectRatio: 1,
                                                    showSkipCropButton: false,
                                                    language: 'vi',
                                                    styles: {
                                                        palette: {
                                                            window: '#FFFFFF',
                                                            sourceBg: '#F4F4F5',
                                                            windowBorder: '#E4E4E7',
                                                            tabIcon: '#F43F5E',
                                                            inactiveTabIcon: '#94A3B8',
                                                            menuIcons: '#F43F5E',
                                                            link: '#F43F5E',
                                                            action: '#F43F5E',
                                                            inProgress: '#F43F5E',
                                                            complete: '#10B981',
                                                            error: '#EF4444',
                                                            textDark: '#000000',
                                                            textLight: '#FFFFFF'
                                                        },
                                                        frame: {
                                                            width: '100%',
                                                            max_width: '430px',
                                                            height: '100%',
                                                            margin: '0',
                                                            position: 'fixed'
                                                        }
                                                    }
                                                },
                                                (error: any, result: any) => {
                                                    if (!error && result && result.event === 'success') {
                                                        setFormData({ ...formData, avatarUrl: result.info.secure_url });
                                                        toast.success('Ảnh đại diện đã sẵn sàng! ✨');
                                                    }
                                                }
                                            );
                                            widget.open();
                                        }}
                                        className="flex-1 bg-rose-50 text-rose-500 hover:bg-rose-100 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-rose-100"
                                    >
                                        {formData.avatarUrl ? 'Thay đổi ảnh' : 'Chọn ảnh đại diện'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {type === 'NOTIFICATIONS' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-6 bg-orange-50/50 rounded-3xl border border-orange-100/50 transition-all">
                                <div className="space-y-1">
                                    <p className="font-black text-slate-800 text-sm">Thông báo qua Email</p>
                                    <p className="text-[10px] text-slate-400 font-bold leading-tight">Nhận email khi đối phương tương tác</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="toggle toggle-warning toggle-lg"
                                    checked={formData.emailNotifications}
                                    onChange={e => setFormData({ ...formData, emailNotifications: e.target.checked })}
                                />
                            </div>

                            <div className="flex flex-col p-6 bg-rose-50/50 rounded-3xl border border-rose-100/50 space-y-4">
                                <div className="space-y-1">
                                    <p className="font-black text-slate-800 text-sm">Thông báo trên điện thoại</p>
                                    <p className="text-[10px] text-slate-400 font-bold leading-tight uppercase tracking-wider">Web Push Notifications</p>
                                </div>
                                <button
                                    onClick={subscribeToPush}
                                    className="w-full py-4 bg-white text-rose-500 rounded-2xl font-black text-xs uppercase tracking-widest border border-rose-100 shadow-sm hover:shadow-md transition-all active:scale-95"
                                >
                                    Bật thông báo trên máy này
                                </button>
                                <p className="text-[9px] text-slate-400 italic">Lưu ý: Bạn cần đồng ý khi trình duyệt hỏi quyền "Cho phép thông báo".</p>
                            </div>
                        </div>
                    )}

                    {type === 'PRIVACY' && (
                        <div className="p-6 bg-rose-50 rounded-3xl space-y-2">
                            <p className="font-bold text-rose-600 text-sm">Mã hóa đầu cuối 🔒</p>
                            <p className="text-xs text-rose-500/80 leading-relaxed font-medium">Tất cả dữ liệu tin nhắn và check-in của bạn đều được bảo mật tuyệt đối giữa hai người.</p>
                        </div>
                    )}
                </div>

                {
                    type !== 'PRIVACY' && (
                        <button
                            onClick={handleSave}
                            disabled={isPending}
                            className="w-full btn btn-primary btn-lg rounded-[2rem] border-none font-black shadow-xl shadow-rose-200 gap-2"
                        >
                            {isPending ? <span className="loading loading-spinner"></span> : <><Save size={20} /> Lưu thay đổi</>}
                        </button>
                    )
                }
            </motion.div >
        </motion.div >
    );
}
