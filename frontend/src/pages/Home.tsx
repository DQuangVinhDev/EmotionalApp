import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Star, Heart, ShieldAlert, Calendar, Flame, ArrowRight, History, Moon, Bell } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useQuery } from '@tanstack/react-query';
import client from '../api/client';
import { useState, useEffect } from 'react';

const LOVE_TIPS = [
    "Một cái ôm lâu hơn 20 giây giúp giải phóng Oxytocin, hormone hạnh phúc và sự gắn kết.",
    "Bắt đầu ngày mới bằng việc hỏi: 'Mình có thể làm gì để ngày hôm nay của bạn nhẹ nhàng hơn?'",
    "Kỹ thuật 5-1: Cần ít nhất 5 tương tác tích cực để bù đắp cho 1 tương tác tiêu cực.",
    "Nắm tay nhau 10 phút giúp điều hòa nhịp tim và giảm bớt căng thẳng (Cortisol).",
    "Thực hành lắng nghe tích cực: Hãy lặp lại ý của đối phương để họ thấy mình thực sự được thấu hiểu.",
    "Quy tắc 2-2-2: 2 tuần đi hẹn hò, 2 tháng đi chơi xa, 2 năm đi du lịch dài ngày cùng nhau.",
    "Lời xin lỗi chân thành không kèm theo từ 'nhưng' là chìa khóa để chữa lành mâu thuẫn.",
    "Ghi nhận những nỗ lực nhỏ hàng ngày của đối phương giúp xây dựng lòng tự trọng trong mối quan hệ.",
    "Dành 15 phút mỗi ngày để nói chuyện 'không thiết bị số' sẽ tăng 40% sự gắn kết.",
    "Khen ngợi đối phương trước mặt người khác giúp củng cố niềm tin và sự tự hào.",
    "Sự tò mò là thức ăn của tình yêu. Đừng bao giờ ngừng đặt câu hỏi về thế giới nội tâm của nhau.",
    "Hành động 'tương tác hướng về' (bids for connection) quyết định 90% sự bền vững của đôi lứa.",
    "Viết một lời nhắn ngọt ngào bất ngờ có thể thay đổi tâm trạng của đối phương cả một ngày.",
    "Học ngôn ngữ tình yêu của nhau: Có người cần lời nói, có người cần hành động hoặc quà tặng.",
    "Chia sẻ về ước mơ và hoài bão giúp hai bạn cùng nhìn về một hướng trong tương lai.",
    "Một nụ hôn 6 giây trước khi đi làm giúp duy trì sự kết nối hóa học giữa hai bộ não.",
    "Đôi khi im lặng và chỉ hiện diện cạnh nhau cũng là một hình thức an ủi mạnh mẽ.",
    "Dành thời gian cho bản thân giúp bạn mang lại năng lượng tích cực hơn khi ở bên đối phương.",
    "Khi tranh luận, hãy tập trung vào cảm xúc của chính mình thay vì chỉ trích hành động của người kia.",
    "Tạo ra những truyền thống riêng (Rituals) chỉ của hai bạn để nuôi dưỡng bản sắc văn hóa đôi lứa.",
    "Chúc ngủ ngon bằng một nụ hôn nhẹ giúp làm dịu hệ thần kinh trước khi nghỉ ngơi.",
    "Hỏi về 'Thắng lợi nhỏ nhất' trong ngày của đối phương để cùng nhau ăn mừng.",
    "Chấp nhận những thói quen nhỏ của nhau là một hình thức cao thượng của tình yêu.",
    "Giao tiếp về tài chính một cách minh bạch và nhẹ nhàng giúp giảm 50% áp lực gia đình.",
    "Một chuyến đi bộ ngắn cùng nhau vào buổi tối giúp kích thích sự sáng tạo và trò chuyện sâu.",
    "Thực hành 'Soft Startup': Bắt đầu cuộc thảo luận khó khăn bằng sự dịu dàng thay vì sự gay gắt.",
    "Học cách 'Pause' (tạm dừng) khi cảm thấy cảm xúc quá tải để tránh nói lời tổn thương.",
    "Kỷ niệm không chỉ là ngày lễ lớn, hãy kỷ niệm cả những cột mốc nhỏ chỉ hai người biết.",
    "Đồng điệu trong hơi thở: Thỉnh thoảng hãy thử hít thở cùng nhịp với nhau để cảm nhận sự kết nối.",
    "Sự tin tưởng được xây dựng từ những khoảnh khắc nhỏ nhất, không phải từ những lời hứa lớn lao.",
    "Gửi một tấm ảnh cũ của cả hai để nhắc nhớ về những ngày đầu mới yêu đầy cảm xúc.",
    "Tôn trọng không gian riêng của đối phương là cách bạn tôn trọng chính mối quan hệ này.",
    "Hãy là 'fan hâm mộ' lớn nhất của đối phương trong mọi dự định và đam mê của họ.",
    "Giao tiếp bằng mắt khi nói chuyện giúp Hormone Oxytocin tăng mạnh, tạo sự thấu cảm sâu.",
    "Sự yếu lòng (Vulnerability) không phải yếu đuối, đó là dũng khí để yêu nhau chân thành hơn.",
    "Học cách bao dung cho những lỗi lầm cũ để cùng nhau viết tiếp chương mới tươi sáng.",
    "Một bữa tối tự nấu cùng nhau có thể mang lại nhiều niềm vui hơn là đi ăn nhà hàng sang trọng.",
    "Hãy luôn dành cho nhau những lời khen về sự trưởng thành và nỗ lực hoàn thiện bản thân.",
    "Thực hành 'Phản hồi mang tính xây dựng': Luôn đi kèm một giải pháp thay vì chỉ đưa ra lời phê bình.",
    "Sự thân mật về trí tuệ (Intellectual Intimacy) là khi hai bạn có thể thảo luận mọi chủ đề một cách cởi mở.",
    "Đừng quên nói 'Mình yêu bạn' vào những lúc đối phương không ngờ tới nhất.",
    "Chia sẻ gánh nặng việc nhà là cách thiết thực nhất để nói 'Mình quan tâm đến bạn'.",
    "Luôn giữ bí mật cho nhau, đó là nền tảng của sự an toàn tuyệt đối trong tình yêu.",
    "Hãy luôn đặt điện thoại xuống khi đối phương có điều quan trọng muốn chia sẻ.",
    "Sự hài hước là liều thuốc giải độc tốt nhất cho những căng thẳng trong cuộc sống thường nhật.",
    "Dành 20 phút mỗi tuần để thảo luận về hướng đi chung của gia đình/mối quan hệ.",
    "Tình yêu không phải là tìm được người hoàn hảo, mà là học cách nhìn thấy sự hoàn hảo trong một người không hoàn hảo."
];

export default function Home() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { unreadCount, fetchNotifications } = useNotificationStore();
    const [tip, setTip] = useState(LOVE_TIPS[0]);

    useEffect(() => {
        setTip(LOVE_TIPS[Math.floor(Math.random() * LOVE_TIPS.length)]);
        fetchNotifications();
    }, []);

    const { data: stats } = useQuery({
        queryKey: ['couple-stats'],
        queryFn: async () => {
            const res = await client.get('/couple/stats');
            return res.data;
        }
    });

    return (
        <div className="p-8 space-y-10 pb-32">
            {/* Header Section */}
            <div className="pt-10 space-y-2">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-1 bg-rose-500 rounded-full" />
                        <span className="text-[10px] font-black text-rose-500/60 uppercase tracking-[0.4em]">Dashboard</span>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate('/notifications')}
                        className="relative p-2 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                        <Bell size={24} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-slate-50">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </motion.button>
                </div>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black text-slate-950 tracking-tight leading-tight">
                            Chào <span className="text-rose-500">{user?.name.split(' ')[0]}</span>! ✨
                        </h1>
                        <p className="text-slate-500 font-bold text-sm mt-2">
                            {stats?.daysTogether ? `Ngày thứ ${stats.daysTogether} bên nhau` : 'Hành trình mới bắt đầu'}
                        </p>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 bg-white p-3 rounded-2xl shadow-sm border border-gray-100"
                    >
                        <Flame size={20} className="text-orange-500 fill-orange-500" />
                        <span className="font-black text-orange-600 text-sm italic">{stats?.streak || 0} Days</span>
                    </motion.div>
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
                <p className="text-slate-700 font-bold text-lg leading-snug relative z-10">
                    "{tip}"
                </p>
            </motion.div>

            {/* Feature Grid */}
            <div className="space-y-4">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2">Hành động mỗi ngày</h2>

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
                        title="Alone Ticket"
                        desc="Yêu cầu khoảng lặng cho bản thân"
                        icon={<Moon size={24} />}
                        color="bg-slate-700"
                        onClick={() => navigate('/space')}
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
                <h3 className="font-black text-slate-800 tracking-tight group-hover:text-rose-500 transition-colors">{title}</h3>
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mt-1">{desc}</p>
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
            <h3 className="font-black text-gray-800 text-xs tracking-tight uppercase group-hover:text-rose-600 transition-colors">{title}</h3>
        </motion.button>
    );
}
