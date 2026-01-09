import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Star, Heart, ShieldAlert, Calendar, Flame, ArrowRight, History } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Home() {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    return (
        <div className="p-8 space-y-10 pb-32">
            {/* Header Section */}
            <div className="flex justify-between items-start pt-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
                        Chào <span className="text-rose-500">{user?.name.split(' ')[0]}</span>! ✨
                    </h1>
                    <p className="text-gray-400 font-bold text-sm mt-1">Hôm nay hai người thế nào?</p>
                </div>
                <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100 shadow-sm">
                    <Flame size={18} className="text-orange-500 fill-orange-500" />
                    <span className="font-black text-orange-600 text-sm italic">7 Days</span>
                </div>
            </div>

            {/* Daily Motivation/Tip Card */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="card-premium p-8 rounded-[3rem] space-y-4 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-500">
                    <Heart size={80} fill="#f43f5e" />
                </div>
                <span className="badge badge-primary font-black text-[10px] tracking-widest uppercase py-3">Love Map Tip</span>
                <p className="text-gray-700 font-bold text-lg leading-snug relative z-10">
                    "Một cái ôm lâu hơn 20 giây sẽ giúp giải phóng Oxytocin, hormone hạnh phúc."
                </p>
            </motion.div>

            {/* Feature Grid */}
            <div className="space-y-4">
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-2">Hành động mỗi ngày</h2>

                <div className="grid gap-4">
                    <MainFeature
                        title="Check-in nhanh"
                        desc="Tâm trạng & nhu cầu hiện tại"
                        icon={<CheckCircle size={24} />}
                        color="bg-emerald-500"
                        onClick={() => navigate('/checkin')}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <SubFeature
                            title="Kudos"
                            icon={<Star size={20} />}
                            color="bg-amber-400"
                            onClick={() => navigate('/kudos')}
                        />
                        <SubFeature
                            title="Love Map"
                            icon={<Heart size={20} />}
                            color="bg-rose-500"
                            onClick={() => navigate('/lovemap')}
                        />
                    </div>
                    <MainFeature
                        title="Repair Loop"
                        desc="Giải quyết mâu thuẫn văn minh"
                        icon={<ShieldAlert size={24} />}
                        color="bg-indigo-500"
                        onClick={() => navigate('/repair')}
                    />
                    <MainFeature
                        title="Nghi thức cuối tuần"
                        desc="State of Us & Backlog"
                        icon={<Calendar size={24} />}
                        color="bg-violet-500"
                        onClick={() => navigate('/ritual')}
                    />
                    <MainFeature
                        title="Memory Lane"
                        desc="Hành trình & Kỷ niệm"
                        icon={<History size={24} />}
                        color="bg-rose-400"
                        onClick={() => navigate('/memory-lane')}
                    />
                </div>
            </div>
        </div>
    );
}

function MainFeature({ title, desc, icon, color, onClick }: any) {
    return (
        <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            className="bg-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-sm border border-gray-100/50 hover:border-rose-100 transition-all text-left w-full group relative overflow-hidden"
        >
            <div className={`p-4 rounded-[1.5rem] text-white ${color} shadow-lg shadow-current/20 relative z-10`}>
                {icon}
            </div>
            <div className="flex-1 relative z-10">
                <h3 className="font-black text-gray-800 tracking-tight group-hover:text-rose-500 transition-colors">{title}</h3>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">{desc}</p>
            </div>
            <ArrowRight size={18} className="text-gray-200 group-hover:text-rose-400 group-hover:translate-x-1 transition-all mr-2" />
        </motion.button>
    );
}

function SubFeature({ title, icon, color, onClick }: any) {
    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="bg-white p-5 rounded-[2rem] flex flex-col items-center gap-3 shadow-sm border border-gray-100/50 hover:border-rose-100 transition-all text-center w-full group"
        >
            <div className={`p-4 rounded-2xl text-white ${color} shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <h3 className="font-black text-gray-800 text-xs tracking-tight uppercase group-hover:text-rose-500 transition-colors">{title}</h3>
        </motion.button>
    );
}
