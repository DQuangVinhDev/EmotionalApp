import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../../api/client';
import { MapPin, Camera, X, Save, Navigation2, Trash2, Clock, Map as MapIcon } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Reliable Heart-style House Icon for Map Markers
const createMarkerIcon = (color: string) => L.divIcon({
    html: `
        <div style="background: rgba(2, 6, 23, 0.8); backdrop-filter: blur(8px); padding: 8px; border-radius: 16px; border: 2px solid ${color}; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <path d="M12 18s-2-1.5-2-3a2 2 0 1 1 4 0c0 1.5-2 3-2 3z"/>
            </svg>
            <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid ${color};"></div>
        </div>
    `,
    className: 'custom-div-icon',
    iconSize: [44, 44],
    iconAnchor: [22, 52],
    popupAnchor: [0, -50]
});

const homeIcon = createMarkerIcon('#f43f5e'); // Rose-500
const newPointIcon = createMarkerIcon('#10b981'); // Emerald-500

declare global {
    interface Window {
        cloudinary: any;
    }
}

function MapAutoCenter({ locations }: { locations: any[] }) {
    const map = useMap();
    const [hasCentered, setHasCentered] = useState(false);

    useEffect(() => {
        if (locations && locations.length > 0 && !hasCentered) {
            const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            setHasCentered(true);
        }
    }, [locations, map, hasCentered]);

    return null;
}

export default function CoupleMap() {
    const [isAdding, setIsAdding] = useState(false);
    const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [viewCoords, setViewCoords] = useState<[number, number]>([10.762622, 106.660172]); // Default HCMC
    const queryClient = useQueryClient();

    // Fetch locations
    const { data: locations } = useQuery({
        queryKey: ['locations'],
        queryFn: async () => {
            const res = await client.get('/locations');
            return res.data;
        }
    });

    const latestLocation = locations?.length > 0
        ? [...locations].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        : null;

    // Create location
    const createLocation = useMutation({
        mutationFn: async (data: any) => {
            return client.post('/locations', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locations'] });
            setIsAdding(false);
            setSelectedCoords(null);
            setTitle('');
            setDescription('');
            setImageUrl('');
            toast.success('Đã lưu địa điểm kỷ niệm! 📍');
        }
    });

    // Delete location
    const deleteLocation = useMutation({
        mutationFn: async (id: string) => {
            return client.delete(`/locations/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locations'] });
            toast.success('Đã xóa địa điểm');
        }
    });

    // Get current location
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
                    setViewCoords(coords);
                    if (isAdding && !selectedCoords) {
                        setSelectedCoords(coords);
                    }
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }
    }, [isAdding]);

    const handleUpload = () => {
        if (isUploading) return;
        if (!window.cloudinary) {
            toast.error('Cloudinary widget not loaded');
            return;
        }

        setIsUploading(true);
        toast.info('Đang mở thư viện ảnh, vui lòng đợi giây lát... ⏳', {
            id: 'map-upload-loading'
        });

        const widget = window.cloudinary.createUploadWidget(
            {
                cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
                uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
                sources: ['local', 'camera'],
                multiple: false,
                cropping: true,
                croppingAspectRatio: 1,
                showSkipCropButton: false,
                croppingShowBackButton: true,
                clientAllowedFormats: ['png', 'jpg', 'jpeg', 'heic'],
                language: 'vi',
                styles: {
                    palette: {
                        window: '#020617',
                        sourceBg: '#0F172A',
                        windowBorder: '#1E293B',
                        tabIcon: '#F43F5E',
                        inactiveTabIcon: '#475569',
                        menuIcons: '#F43F5E',
                        link: '#F43F5E',
                        action: '#F43F5E',
                        inProgress: '#F43F5E',
                        complete: '#10B981',
                        error: '#EF4444',
                        textDark: '#FFFFFF',
                        textLight: '#FFFFFF'
                    }
                }
            },
            (error: any, result: any) => {
                if (result.event === 'close') {
                    setIsUploading(false);
                    toast.dismiss('map-upload-loading');
                }
                if (!error && result && result.event === 'success') {
                    setImageUrl(result.info.secure_url);
                    toast.success('Ảnh đã sẵn sàng! 📸');
                    setIsUploading(false);
                    toast.dismiss('map-upload-loading');
                }
            }
        );
        widget.open();
    };

    const handleMapClick = (e: any) => {
        if (isAdding) {
            setSelectedCoords([e.latlng.lat, e.latlng.lng]);
        }
    };

    const handleSave = () => {
        if (!selectedCoords || !title) {
            toast.error('Vui lòng chọn vị trí và nhập tên địa điểm');
            return;
        }
        createLocation.mutate({
            lat: selectedCoords[0],
            lng: selectedCoords[1],
            title,
            description,
            imageUrl
        });
    };

    const MapEvents = () => {
        useMapEvents({
            click: handleMapClick,
        });
        return null;
    };

    return (
        <div className="h-screen w-full relative flex flex-col pt-6 px-6 overflow-hidden bg-slate-950">
            <div className="pt-10 space-y-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-1 bg-rose-500 rounded-full" />
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em]">Love Map</span>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Bản đồ Kỷ niệm</h1>
                        {latestLocation && (
                            <div className="flex items-center gap-2 mt-2">
                                <Clock size={12} className="text-rose-400" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Cập nhật: {format(new Date(latestLocation.createdAt), "HH:mm, dd/MM", { locale: vi })}
                                </p>
                            </div>
                        )}
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            setIsAdding(!isAdding);
                            setSelectedCoords(null);
                        }}
                        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all ${isAdding ? 'bg-slate-800 text-rose-500 ring-2 ring-rose-500/50' : 'bg-rose-500 text-white'}`}
                    >
                        {isAdding ? <X size={24} /> : <MapPin size={24} />}
                    </motion.button>
                </div>
            </div>

            <div className="flex-1 rounded-[3.5rem] overflow-hidden border-4 border-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] relative">
                <MapContainer center={viewCoords} zoom={13} style={{ height: '100%', width: '100%', zIndex: 10 }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MapEvents />
                    <MapAutoCenter locations={locations || []} />
                    {locations?.map((loc: any) => (
                        <Marker key={loc._id} position={[loc.lat, loc.lng]} icon={homeIcon}>
                            <Popup className="premium-popup">
                                <div className="p-1 space-y-3 font-sans min-w-[200px] bg-slate-900 text-white rounded-3xl overflow-hidden border border-white/10">
                                    {loc.imageUrl && (
                                        <div className="relative group overflow-hidden rounded-2xl">
                                            <img src={loc.imageUrl} alt={loc.title} className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                                        </div>
                                    )}
                                    <div className="px-2">
                                        <h4 className="font-black text-white text-sm leading-tight uppercase tracking-tight">{loc.title}</h4>
                                        <p className="text-[10px] font-medium text-slate-400 mt-1 line-clamp-2 italic">{loc.description}</p>
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <Clock size={10} className="text-rose-500" />
                                            <span className="text-[9px] font-black text-slate-500 uppercase">
                                                {format(new Date(loc.createdAt), "dd MMM yyyy", { locale: vi })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-white/5 px-2 pb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-rose-500/20">
                                                {loc.userId?.name?.[0]}
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-300">{loc.userId?.name}</span>
                                        </div>
                                        <button
                                            onClick={() => deleteLocation.mutate(loc._id)}
                                            className="p-2 hover:bg-rose-500/20 rounded-xl text-rose-500 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                    {selectedCoords && (
                        <Marker position={selectedCoords} icon={newPointIcon}>
                            <Popup>Điểm check-in mới ✨</Popup>
                        </Marker>
                    )}
                </MapContainer>

                {/* Overlays */}
                <AnimatePresence>
                    {isAdding && (
                        <motion.div
                            initial={{ y: 200, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 200, opacity: 0 }}
                            className="absolute bottom-6 left-6 right-6 z-[1000] bg-slate-900/90 backdrop-blur-2xl p-8 rounded-[3rem] shadow-2xl space-y-5 border border-white/10"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-500 border border-rose-500/20">
                                        <Navigation2 size={16} className="animate-bounce" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Vị trí check-in</span>
                                        <span className="text-[9px] font-bold text-rose-400/80 mt-1 uppercase tracking-tighter">
                                            {selectedCoords ? 'Đã xác định vị trí ✅' : 'Chạm vào bản đồ để chọn'}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => setIsAdding(false)} className="p-2 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={18} /></button>
                            </div>

                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Tên địa điểm kỷ niệm..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-rose-500/50 transition-all shadow-inner placeholder:text-slate-600"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />

                                <textarea
                                    placeholder="Cảm xúc của tụi mình tại đây..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-medium text-slate-300 outline-none focus:ring-2 focus:ring-rose-500/50 transition-all h-24 resize-none shadow-inner placeholder:text-slate-600"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />

                                <div className="flex gap-4">
                                    <button
                                        onClick={handleUpload}
                                        disabled={isUploading}
                                        className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${isUploading ? 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed' : imageUrl ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'}`}
                                    >
                                        {isUploading ? (
                                            <>
                                                <span className="loading loading-spinner loading-xs"></span>
                                                Đang chuẩn bị...
                                            </>
                                        ) : (
                                            <>
                                                <Camera size={18} />
                                                {imageUrl ? 'Ảnh đã xong ✨' : 'Thêm ảnh'}
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={handleSave}
                                        disabled={createLocation.isPending || !selectedCoords || !title}
                                        className="bg-rose-500 text-white rounded-2xl px-8 shadow-xl shadow-rose-500/20 font-black hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {createLocation.isPending ? <span className="loading loading-spinner"></span> : <Save size={20} />}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Floating Activity Info */}
                {!isAdding && locations?.length > 0 && (
                    <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="absolute top-6 left-6 z-[500] bg-slate-900/40 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/5 pointer-events-none"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-500 rounded-lg">
                                <MapIcon size={14} className="text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-white uppercase tracking-widest">{locations.length} Điểm đến</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">Hành trình hạnh phúc</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="flex items-center justify-center py-6">
                <div className="px-6 py-2 bg-white/5 rounded-full border border-white/5">
                    <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.4em]">Footprints of Love • Since 2024</p>
                </div>
            </div>
        </div >
    );
}
