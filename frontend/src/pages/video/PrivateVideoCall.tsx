import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Video, VideoOff, Mic, MicOff, PhoneOff, User, ShieldCheck, X } from 'lucide-react';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';
const Peer = (SimplePeer as any).default || SimplePeer;
import { useAuthStore } from '../../store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import client from '../../api/client';
import { toast } from 'sonner';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
    transports: ['websocket'],
    autoConnect: false,
});

export default function PrivateVideoCall({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { user } = useAuthStore();
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState("");
    const [callerName, setCallerName] = useState("");
    const [callerAvatar, setCallerAvatar] = useState("");
    const [callerSignal, setCallerSignal] = useState<any>();
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    const [isBlurry, setIsBlurry] = useState(false);
    const [isCalling, setIsCalling] = useState(false);

    const myVideo = useRef<HTMLVideoElement>(null);
    const userVideo = useRef<HTMLVideoElement>(null);
    const connectionRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const { data: profile } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => (await client.get('/users/profile')).data
    });

    // --- SOCKET CONNECTION LIFECYCLE ---
    useEffect(() => {
        if (!user?.id) return;

        if (!socket.connected) {
            socket.connect();
        }

        socket.emit('join', user.id);

        socket.on('connect', () => {
            socket.emit('join', user.id);
        });

        socket.on('incoming-call', ({ from, offer, fromName, fromAvatar }: any) => {
            setReceivingCall(true);
            setCaller(from);
            setCallerName(fromName);
            setCallerAvatar(fromAvatar);
            setCallerSignal(offer);
        });

        socket.on('call-ended', () => {
            toast.info("Cuộc gọi đã kết thúc");
            cleanupCall();
            onClose();
        });

        socket.on('security-notification', ({ type, fromName }: any) => {
            if (type === 'SCREENSHOT') {
                toast.error(`${fromName} vừa chụp màn hình cuộc gọi! ⚠️`, { duration: 5000 });
            } else if (type === 'FOCUS_LOST') {
                toast.info(`${fromName} vừa thu nhỏ màn hình hoặc chuyển tab.`);
            }
        });

        socket.on('connect_error', (err: any) => {
            console.error('[DEBUG] Socket connection error:', err.message);
        });

        socket.on('call-error', ({ message }: any) => {
            toast.error(message);
            setIsCalling(false);
            cleanupCall();
        });

        return () => {
            socket.off('incoming-call');
            socket.off('call-ended');
            socket.off('security-notification');
            socket.off('connect');
            socket.off('connect_error');
            socket.off('call-error');
        };
    }, [user?.id]);

    // --- CAMERA & MEDIA (ONLY WHEN ACTIVE) ---
    useEffect(() => {
        if (!isOpen && !receivingCall) {
            cleanupCall();
            return;
        }

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                if (myVideo.current) myVideo.current.srcObject = currentStream;
            })
            .catch((err: any) => {
                console.error("Camera Access Error:", err);
                toast.error("Không thể truy cập Camera/Micro. Vui lòng cấp quyền.");
            });

        // Security listeners
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && (callAccepted)) {
                setIsBlurry(true);
                socket.emit('security-alert', { to: profile?.partnerId, type: 'FOCUS_LOST', fromName: user?.name });
            } else {
                setIsBlurry(false);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (callAccepted && (e.key === 'PrintScreen' || (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4')))) {
                socket.emit('security-alert', { to: profile?.partnerId, type: 'SCREENSHOT', fromName: user?.name });
                toast.warning("Việc chụp màn hình đã được thông báo cho đối phương 🛡️");
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, receivingCall, profile?.partnerId]);

    const cleanupCall = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setReceivingCall(false);
        setCallAccepted(false);
        setCallEnded(false);
        setIsCalling(false);
        connectionRef.current?.destroy();
        connectionRef.current = null;
    };

    const callPartner = () => {
        if (!stream || !profile?.partnerId) {
            let reason = "";
            if (!stream) reason += " (Thiếu Camera)";
            if (!profile?.partnerId) reason += " (Chưa kết đôi/Thiếu ID đối phương)";

            toast.error(`Không thể gọi: ${reason} `);
            return;
        }

        setIsCalling(true);
        const peer = new Peer({ initiator: true, trickle: false, stream: stream });

        peer.on('signal', (data: any) => {
            socket.emit('call-user', {
                to: profile?.partnerId,
                offer: data,
                fromName: user?.name,
                fromAvatar: profile?.avatarUrl
            });
        });

        peer.on('stream', (remoteStream: MediaStream) => {
            if (userVideo.current) userVideo.current.srcObject = remoteStream;
        });

        socket.on('call-accepted', ({ answer }: any) => {
            setCallAccepted(true);
            peer.signal(answer);
        });

        connectionRef.current = peer;
    };

    const answerCall = () => {
        if (!stream) {
            toast.error("Đang khởi động Camera...");
            return;
        }
        setCallAccepted(true);
        const peer = new Peer({ initiator: false, trickle: false, stream: stream });

        peer.on('signal', (data: any) => {
            socket.emit('answer-call', { to: caller, answer: data });
        });

        peer.on('stream', (remoteStream: MediaStream) => {
            if (userVideo.current) userVideo.current.srcObject = remoteStream;
        });

        peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    const endCall = () => {
        cleanupCall();
        socket.emit('end-call', { to: profile?.partnerId });
        onClose();
    };

    if (!isOpen && !receivingCall) return null;

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-slate-950 flex flex-col items-center justify-center overflow-hidden"
        >
            {/* Security Banner */}
            <div className="absolute top-0 w-full p-4 bg-rose-500/10 backdrop-blur-md border-b border-rose-500/20 flex items-center justify-center gap-2 z-50">
                <ShieldCheck size={16} className="text-rose-400" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-rose-400">Cuộc gọi được mã hóa đầu cuối & Bảo mật tuyệt đối</span>
            </div>

            {/* Remote Video (Main) */}
            <div className={`relative w - full h - full transition - all duration - 700 ${isBlurry ? 'blur-3xl grayscale' : ''} `}>
                {callAccepted && !callEnded ? (
                    <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center space-y-8">
                        {receivingCall && !callAccepted ? (
                            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center space-y-6">
                                <div className="w-32 h-32 mx-auto rounded-[3rem] overflow-hidden border-4 border-rose-500 shadow-2xl shadow-rose-500/20">
                                    <img src={callerAvatar || '/default-avatar.png'} alt="caller" className="w-full h-full object-cover" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-white">{callerName} đang gọi...</h2>
                                    <p className="text-rose-400 font-bold animate-pulse uppercase tracking-widest text-xs">Cuộc gọi video riêng tư</p>
                                </div>
                                <div className="flex gap-4 justify-center mt-10">
                                    <button onClick={answerCall} className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 hover:scale-110 active:scale-95 transition-all">
                                        <Video size={28} />
                                    </button>
                                    <button onClick={endCall} className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-rose-500/20 hover:scale-110 active:scale-95 transition-all">
                                        <PhoneOff size={28} />
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="text-center space-y-6">
                                <div className="w-24 h-24 mx-auto bg-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-500 border border-white/5">
                                    <User size={40} />
                                </div>
                                <button
                                    onClick={callPartner}
                                    disabled={isCalling}
                                    className={`px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl transition-all active:scale-95 ${isCalling ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-rose-500 text-white shadow-rose-500/20 hover:bg-rose-600'}`}
                                >
                                    {isCalling ? 'Đang kết nối...' : `Bắt đầu gọi cho ${profile?.partnerName || 'đối phương'}`}
                                </button>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-center gap-2"
                                >
                                    <div className={`w-2 h-2 rounded-full ${stream && profile?.partnerId ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]' : 'bg-slate-700'}`} />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        {!profile?.partnerId ? 'Chưa kết đôi đối phương' : !stream ? 'Đang chuẩn bị camera...' : 'Sẵn sàng kết nối'}
                                    </span>
                                </motion.div>
                            </div>
                        )}
                    </div>
                )}

                {/* Local Video (Floating) */}
                {/* Local Video (Floating & Draggable) */}
                <motion.div
                    drag
                    dragConstraints={containerRef}
                    whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
                    whileTap={{ cursor: 'grabbing' }}
                    dragElastic={0.1}
                    className="absolute top-24 right-6 w-32 h-44 bg-slate-800 rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl z-40 group cursor-grab touch-none"
                    style={{ x: 0, y: 0 }} // Prevent transform accumulation issues on re-render
                >
                    <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover pointer-events-none" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                        {isMuted ? <MicOff size={16} className="text-rose-400" /> : <Mic size={16} className="text-white" />}
                        {isVideoOff ? <VideoOff size={16} className="text-rose-400" /> : <Video size={16} className="text-white" />}
                    </div>
                </motion.div>

                {/* Watermark */}
                <div className="absolute bottom-32 left-8 pointer-events-none opacity-20 select-none">
                    <p className="text-white font-black text-4xl leading-none uppercase tracking-tighter italic">PRIVATE CALL</p>
                    <p className="text-white font-bold text-xs mt-1 uppercase tracking-widest">{user?.name} x {profile?.partnerName}</p>
                </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-10 flex items-center gap-6 p-6 bg-white/5 backdrop-blur-2xl rounded-[3.5rem] border border-white/10 shadow-2xl z-50">
                <button
                    onClick={() => {
                        const audioTrack = stream?.getAudioTracks()[0];
                        if (audioTrack) audioTrack.enabled = !audioTrack.enabled;
                        setIsMuted(!isMuted);
                    }}
                    className={`p - 5 rounded - full transition - all ${isMuted ? 'bg-rose-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'} `}
                >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>

                <button
                    onClick={endCall}
                    className="p-6 bg-rose-500 text-white rounded-[2.5rem] shadow-xl shadow-rose-500/30 hover:bg-rose-600 hover:scale-110 active:scale-95 transition-all"
                >
                    <PhoneOff size={32} />
                </button>

                <button
                    onClick={() => {
                        const videoTrack = stream?.getVideoTracks()[0];
                        if (videoTrack) videoTrack.enabled = !videoTrack.enabled;
                        setIsVideoOff(!isVideoOff);
                    }}
                    className={`p - 5 rounded - full transition - all ${isVideoOff ? 'bg-rose-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'} `}
                >
                    {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                </button>
            </div>

            {/* Security Notice */}
            <button onClick={onClose} className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-full backdrop-blur-md hover:bg-white/20 transition-all">
                <X size={20} />
            </button>
        </motion.div>
    );
}
