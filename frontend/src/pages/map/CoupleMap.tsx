import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../../api/client';
import { MapPin, Camera, X, Save, Navigation2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// Fix for default marker icon in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

declare global {
    interface Window {
        cloudinary: any;
    }
}

export default function CoupleMap() {
    const [isAdding, setIsAdding] = useState(false);
    const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
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
        if (!window.cloudinary) {
            toast.error('Cloudinary widget not loaded');
            return;
        }

        const widget = window.cloudinary.createUploadWidget(
            {
                cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
                uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
                sources: ['local', 'camera'],
                multiple: false,
                cropping: true,
                croppingAspectRatio: 1, // Force square for Locket style
                showSkipCropButton: false,
                croppingShowBackButton: true,
                clientAllowedFormats: ['png', 'jpg', 'jpeg', 'heic'],
                language: 'vi',
                text: {
                    vi: {
                        menu: {
                            files: "Ảnh của tôi",
                            camera: "Máy ảnh"
                        },
                        local: {
                            browse: "Chọn ảnh",
                            dd_title_single: "Kéo ảnh vào đây"
                        },
                        crop: {
                            title: "Cắt ảnh kỷ niệm",
                            btn_ok: "Xong",
                            btn_cancel: "Hủy"
                        }
                    }
                },
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
                        height: '100%',
                        margin: '0',
                        position: 'fixed'
                    },
                    fonts: {
                        default: null,
                        "'Inter', sans-serif": "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
                    }
                }
            },
            (error: any, result: any) => {
                if (!error && result && result.event === 'success') {
                    setImageUrl(result.info.secure_url);
                    toast.success('Ảnh đã sẵn sàng! 📸');
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
        <div className="h-screen w-full relative flex flex-col pt-6 px-6 overflow-hidden">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Bản đồ Kỷ niệm</h1>
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1">Dấu chân hạnh phúc của tụi mình</p>
                </div>
                <button
                    onClick={() => {
                        setIsAdding(!isAdding);
                        setSelectedCoords(null);
                    }}
                    className={`btn btn-circle ${isAdding ? 'btn-error' : 'btn-primary bg-rose-500 border-none'} shadow-lg scale-110`}
                >
                    {isAdding ? <X size={24} /> : <MapPin size={24} />}
                </button>
            </div>

            <div className="flex-1 rounded-[3.5rem] overflow-hidden border-4 border-white shadow-2xl relative">
                <MapContainer center={viewCoords} zoom={13} style={{ height: '100%', width: '100%', zIndex: 10 }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MapEvents />
                    {locations?.map((loc: any) => (
                        <Marker key={loc._id} position={[loc.lat, loc.lng]}>
                            <Popup className="premium-popup">
                                <div className="p-1 space-y-3 font-sans min-w-[180px]">
                                    {loc.imageUrl && (
                                        <div className="relative group">
                                            <img src={loc.imageUrl} alt={loc.title} className="w-full h-32 object-cover rounded-2xl shadow-md transition-transform group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
                                        </div>
                                    )}
                                    <div className="px-1">
                                        <h4 className="font-black text-gray-900 leading-tight">{loc.title}</h4>
                                        <p className="text-[11px] font-medium text-gray-500 mt-1 line-clamp-2 italic">{loc.description}</p>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 px-1">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-[8px] font-black text-rose-500">
                                                {loc.userId?.name?.[0]}
                                            </div>
                                            <span className="text-[9px] font-bold text-gray-400">{loc.userId?.name}</span>
                                        </div>
                                        <button
                                            onClick={() => deleteLocation.mutate(loc._id)}
                                            className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-400 hover:text-rose-600 transition-all"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                    {selectedCoords && (
                        <Marker position={selectedCoords}>
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
                            className="absolute bottom-6 left-6 right-6 z-[1000] bg-white/95 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl space-y-5 border border-rose-50 ring-1 ring-black/5"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-rose-100 rounded-xl text-rose-500">
                                        <Navigation2 size={16} className="animate-pulse" />
                                    </div>
                                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">
                                        {selectedCoords ? 'Vị trí đã chọn ✅' : 'Nhấn vào bản đồ để chọn'}
                                    </span>
                                </div>
                                <button onClick={() => setIsAdding(false)} className="p-2 text-gray-300 hover:text-gray-500"><X size={20} /></button>
                            </div>

                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Tên địa điểm kỷ niệm..."
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-900 outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-rose-500/20 transition-all shadow-inner"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />

                                <textarea
                                    placeholder="Cảm xúc của tụi mình tại đây..."
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 font-medium text-gray-700 outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-rose-500/20 transition-all h-24 resize-none shadow-inner"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />

                                <div className="flex gap-4">
                                    <button
                                        onClick={handleUpload}
                                        className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${imageUrl ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' : 'bg-rose-50 text-rose-500 hover:bg-rose-100 ring-1 ring-rose-100'}`}
                                    >
                                        <Camera size={20} />
                                        {imageUrl ? 'Đã có ảnh ✨' : 'Thêm ảnh'}
                                    </button>

                                    <button
                                        onClick={handleSave}
                                        disabled={createLocation.isPending || !selectedCoords || !title}
                                        className="btn btn-primary bg-rose-500 border-none rounded-2xl px-10 shadow-xl shadow-rose-200"
                                    >
                                        {createLocation.isPending ? <span className="loading loading-spinner"></span> : <Save size={20} />}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex items-center justify-center py-8">
                <div className="px-6 py-2 bg-gray-50 rounded-full">
                    <p className="text-[8px] text-gray-400 font-black uppercase tracking-[0.4em]">Footprints of Love • Since 2024</p>
                </div>
            </div>
        </div>
    );
}
