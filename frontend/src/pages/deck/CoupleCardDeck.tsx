import React, { useState, useEffect, useRef, Suspense, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Environment, useCursor, useTexture, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useAuthStore } from '../../store/useAuthStore';
import client from '../../api/client';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ChevronLeft, RefreshCcw, Hand, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChibiCharacter from './ChibiCharacter';

// --- Types ---
interface CardData {
    _id: string;
    level: number;
    category: string;
    prompt: string;
    followups: string[];
}

interface SessionData {
    _id: string;
    coupleId: string;
    remainingCardIds: string[];
    currentCardId: CardData | null;
}

// --- Shared Materials (Performance Optimization - No Shaders = No Flicker) ---
const cardBackMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#e11d48'),
    roughness: 0.25,
    metalness: 0.15,
    side: THREE.DoubleSide
});

const cardFrontMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#ffffff'),
    roughness: 0.1,
    metalness: 0.1,
    side: THREE.DoubleSide
});

// --- 3D Components ---

function Card({
    data,
    isDrawn,
    onDraw,
    hoverScale = 1.05
}: {
    data: CardData | null,
    isDrawn: boolean,
    onDraw: () => void,
    hoverScale?: number
}) {
    const meshRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);

    useCursor(hovered);

    // Simple floating animation only - no material updates
    useFrame((state) => {
        if (meshRef.current && !isDrawn) {
            const time = state.clock.elapsedTime;
            // Very gentle floating - always keep some distance from the pile
            meshRef.current.position.y = 0.08 + Math.sin(time * 0.5) * 0.02;
            meshRef.current.rotation.y = Math.sin(time * 0.3) * 0.05;
        }
    });

    useEffect(() => {
        if (isDrawn && meshRef.current) {
            gsap.to(meshRef.current.position, {
                x: 0, y: 1.5, z: 2.5,
                duration: 0.8,
                ease: "back.out(1.2)"
            });
            gsap.to(meshRef.current.rotation, {
                x: 0, y: 0, z: 0,
                duration: 0.8,
                ease: "power3.out"
            });
            gsap.to(meshRef.current.scale, {
                x: 1.1, y: 1.1, z: 1.1,
                duration: 0.8,
                ease: "elastic.out(1, 0.5)"
            });
        } else if (!isDrawn && meshRef.current) {
            gsap.to(meshRef.current.position, {
                x: 0, y: 0, z: 0,
                duration: 0.6,
                ease: "power2.inOut"
            });
            gsap.to(meshRef.current.rotation, {
                x: -Math.PI / 2, y: 0, z: 0,
                duration: 0.6,
                ease: "power2.inOut"
            });
            gsap.to(meshRef.current.scale, {
                x: 1, y: 1, z: 1,
                duration: 0.4
            });
        }
    }, [isDrawn]);

    const handlePointerOver = useCallback(() => !isDrawn && setHovered(true), [isDrawn]);
    const handlePointerOut = useCallback(() => setHovered(false), []);
    const handleClick = useCallback(() => !isDrawn && onDraw(), [isDrawn, onDraw]);

    return (
        <group
            ref={meshRef}
            rotation={[-Math.PI / 2, 0, 0]}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            onClick={handleClick}
        >
            {/* Card Body with Rounded Corners - Simple solid color */}
            <RoundedBox args={[2.5, 3.5, 0.08]} radius={0.12} smoothness={4} castShadow receiveShadow>
                <meshStandardMaterial
                    color={isDrawn ? "#ffffff" : "#e11d48"}
                    roughness={isDrawn ? 0.1 : 0.25}
                    metalness={isDrawn ? 0.05 : 0.15}
                />
            </RoundedBox>

            {/* Front Design - When Drawn - Premium Design */}
            {isDrawn && data && (
                <group position={[0, 0, 0.055]}>
                    {/* Card background gradient layer - L0 */}
                    <mesh position={[0, 0, 0]}>
                        <planeGeometry args={[2.2, 3.2]} />
                        <meshBasicMaterial color="#fef7f8" />
                    </mesh>

                    {/* Top gradient accent - L1 */}
                    <mesh position={[0, 1.35, 0.04]}>
                        <planeGeometry args={[2.2, 0.5]} />
                        <meshBasicMaterial color="#fff1f2" polygonOffset polygonOffsetFactor={-1} />
                    </mesh>

                    {/* Decorative Top Border with gradient - L1 */}
                    <mesh position={[0, 1.5, 0.04]}>
                        <planeGeometry args={[2.2, 0.06]} />
                        <meshBasicMaterial color="#f43f5e" polygonOffset polygonOffsetFactor={-1} />
                    </mesh>

                    {/* Side accent lines - L1 */}
                    <mesh position={[-1.1, 0, 0.04]}>
                        <planeGeometry args={[0.02, 3]} />
                        <meshBasicMaterial color="#fda4af" transparent opacity={0.5} polygonOffset polygonOffsetFactor={-1} />
                    </mesh>
                    <mesh position={[1.1, 0, 0.04]}>
                        <planeGeometry args={[0.02, 3]} />
                        <meshBasicMaterial color="#fda4af" transparent opacity={0.5} polygonOffset polygonOffsetFactor={-1} />
                    </mesh>

                    {/* Category Badge - Premium Style - L2 */}
                    <group position={[0, 1.2, 0.08]}>
                        {/* Badge shadow */}
                        <mesh position={[0, -0.02, -0.015]}>
                            <planeGeometry args={[1.4, 0.35]} />
                            <meshBasicMaterial color="#1e1e2e" transparent opacity={0.1} polygonOffset polygonOffsetFactor={-2} />
                        </mesh>
                        {/* Badge background */}
                        <mesh>
                            <planeGeometry args={[1.35, 0.32]} />
                            <meshBasicMaterial color="#f43f5e" />
                        </mesh>
                        {/* Badge text */}
                        <Text
                            position={[0, 0, 0.01]}
                            fontSize={0.1}
                            color="#ffffff"
                            anchorX="center"
                            anchorY="middle"
                        >
                            {data.category.toUpperCase()}
                        </Text>
                    </group>

                    {/* Decorative flourish under category */}
                    <Text position={[0, 0.9, 0.08]} fontSize={0.08} color="#fda4af">
                        ━━━ ♥ ━━━
                    </Text>

                    {/* Main Prompt - Larger, more prominent */}
                    <Text
                        position={[0, 0.1, 0.08]}
                        fontSize={0.14}
                        color="#1e293b"
                        maxWidth={2}
                        textAlign="center"
                        anchorX="center"
                        anchorY="middle"
                        lineHeight={1.6}
                    >
                        {data.prompt}
                    </Text>

                    {/* Bottom decorative section - L1 */}
                    <mesh position={[0, -1.1, 0.04]}>
                        <planeGeometry args={[2.2, 0.02]} />
                        <meshBasicMaterial color="#fda4af" transparent opacity={0.5} polygonOffset polygonOffsetFactor={-1} />
                    </mesh>

                    {/* Decorative Hearts with glow */}
                    <group position={[-0.85, -1.4, 0.04]}>
                        <mesh position={[0, 0, -0.01]}>
                            <circleGeometry args={[0.12, 16]} />
                            <meshBasicMaterial color="#fff1f2" polygonOffset polygonOffsetFactor={-1} />
                        </mesh>
                        <Text fontSize={0.12} color="#f43f5e">♥</Text>
                    </group>
                    <group position={[0.85, -1.4, 0.04]}>
                        <mesh position={[0, 0, -0.01]}>
                            <circleGeometry args={[0.12, 16]} />
                            <meshBasicMaterial color="#fff1f2" polygonOffset polygonOffsetFactor={-1} />
                        </mesh>
                        <Text fontSize={0.12} color="#f43f5e">♥</Text>
                    </group>


                    {/* Bottom Note - Refined */}
                    <Text
                        position={[0, -1.4, 0.08]}
                        fontSize={0.07}
                        color="#94a3b8"
                        anchorX="center"
                        anchorY="middle"
                    >
                        Nhấn nút để tiếp tục
                    </Text>

                    {/* Corner decorations */}
                    <Text position={[-1.0, 1.45, 0.08]} fontSize={0.1} color="#fda4af">✦</Text>
                    <Text position={[1.0, 1.45, 0.08]} fontSize={0.1} color="#fda4af">✦</Text>

                    {/* Border decoration - L0 (on top by default due to draw order) */}
                    <mesh position={[0, 0, 0]}>
                        <planeGeometry args={[2.4, 3.4]} />
                        <meshBasicMaterial color="#f43f5e" transparent opacity={0.4} polygonOffset polygonOffsetFactor={-1} />
                    </mesh>
                </group>
            )
            }

            {/* Back Design - Deck View - Premium Design */}
            {
                !isDrawn && (
                    // Push group out to 0.06 to be safely above RoundedBox surface (0.04)
                    <group position={[0, 0, 0.06]}>
                        {/* Outer decorative border - at Z=0 relative to group (Total 0.06) */}
                        <mesh position={[0, 0, 0]}>
                            <planeGeometry args={[2.2, 3.2]} />
                            <meshBasicMaterial color="#1e1e2e" />
                        </mesh>

                        {/* Gradient inner area - at Z=0.01 relative to group (Total 0.07) */}
                        <mesh position={[0, 0, 0.01]}>
                            <planeGeometry args={[2.1, 3.1]} />
                            <meshBasicMaterial color="#2a1a3a" />
                        </mesh>

                        {/* Decorative corner flourishes */}
                        <Text position={[-0.85, 1.35, 0]} fontSize={0.18} color="#ffc0cb">✦</Text>
                        <Text position={[0.85, 1.35, 0]} fontSize={0.18} color="#ffc0cb">✦</Text>
                        <Text position={[-0.85, -1.35, 0]} fontSize={0.18} color="#ffc0cb">✦</Text>
                        <Text position={[0.85, -1.35, 0]} fontSize={0.18} color="#ffc0cb">✦</Text>

                        {/* Top decorative line - L2 */}
                        <mesh position={[0, 1.1, 0.015]}>
                            <planeGeometry args={[1.6, 0.02]} />
                            <meshBasicMaterial color="#ff6b8a" transparent opacity={0.6} />
                        </mesh>

                        {/* Bottom decorative line - L2 */}
                        <mesh position={[0, -1.1, 0.015]}>
                            <planeGeometry args={[1.6, 0.02]} />
                            <meshBasicMaterial color="#ff6b8a" transparent opacity={0.6} />
                        </mesh>

                        {/* Center Heart with Glow Effect */}
                        <Text fontSize={0.7} color="#ff6b8a" position={[0, 0.15, 0.02]}>
                            💕
                        </Text>

                        {/* Heart glow backing - L2 */}
                        <mesh position={[0, 0.15, 0.015]}>
                            <circleGeometry args={[0.5, 32]} />
                            <meshBasicMaterial color="#ff6b8a" transparent opacity={0.15} />
                        </mesh>

                        {/* Title Text */}
                        <Text
                            position={[0, -0.55, 0.02]}
                            fontSize={0.11}
                            color="#ffffff"
                            anchorX="center"
                            anchorY="middle"
                        >
                            COUPLE DECK
                        </Text>

                        {/* Subtitle */}
                        <Text
                            position={[0, -0.78, 0.02]}
                            fontSize={0.06}
                            color="#ffc0cb"
                            anchorX="center"
                            anchorY="middle"
                        >
                            ✧ Kết nối trái tim ✧
                        </Text>

                        {/* Decorative ring */}
                        <mesh position={[0, 0.1, 0]}>
                            <ringGeometry args={[0.75, 0.8, 32]} />
                            <meshBasicMaterial color="#ff6b8a" transparent opacity={0.2} />
                        </mesh>

                        {/* Outer ring - L2 */}
                        <mesh position={[0, 0, 0.015]}>
                            <ringGeometry args={[1.4, 1.5, 64]} />
                            <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
                        </mesh>
                    </group>
                )
            }
        </group >
    );
}

// Optimized Avatar with cached texture loading
function AvatarBubble({ url, position, label, jump }: { url: string; position: [number, number, number]; label: string; jump?: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    const animRef = useRef({ baseY: position[1], phase: Math.random() * Math.PI * 2 });

    // Use useTexture for proper caching and loading
    const texture = useTexture(url || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdBWB76EZKUgHdARYa-XNyIzoiJiUiyKiFrg&s');

    // Optimized animation - reduced frequency
    useFrame((state) => {
        if (groupRef.current) {
            const time = state.clock.elapsedTime;
            groupRef.current.position.y = animRef.current.baseY + Math.sin(time * 0.6 + animRef.current.phase) * 0.08;
            groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.08;
        }
    });

    useEffect(() => {
        if (jump && groupRef.current) {
            gsap.to(groupRef.current.position, {
                y: animRef.current.baseY + 0.8,
                duration: 0.25,
                yoyo: true,
                repeat: 1,
                ease: "power2.out"
            });
            gsap.to(groupRef.current.scale, {
                x: 1.2, y: 1.2, z: 1.2,
                duration: 0.15,
                yoyo: true,
                repeat: 1
            });
        }
    }, [jump]);

    return (
        <group ref={groupRef} position={position}>
            {/* Glow Ring */}
            <mesh position={[0, 0, -0.02]}>
                <ringGeometry args={[0.55, 0.72, 32]} />
                <meshBasicMaterial color="#ff6b8a" transparent opacity={0.4} />
            </mesh>

            {/* Avatar Circle */}
            <mesh>
                <circleGeometry args={[0.55, 48]} />
                <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
            </mesh>

            {/* Border Ring */}
            <mesh position={[0, 0, -0.01]}>
                <ringGeometry args={[0.55, 0.62, 48]} />
                <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={0.3} />
            </mesh>

            {/* Label Background */}
            <mesh position={[0, -0.85, 0]}>
                <planeGeometry args={[0.8, 0.22]} />
                <meshBasicMaterial color="#1e1e2e" transparent opacity={0.8} />
            </mesh>

            {/* Label */}
            <Text
                position={[0, -0.85, 0.01]}
                fontSize={0.1}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                {label}
            </Text>
        </group>
    );
}

// Deck pile cards - optimized with instancing concept
const DeckPile = React.memo(function DeckPile() {
    const deckColors = useMemo(() => ['#fb7185', '#f472b6', '#e879f9', '#c084fc'], []);

    return (
        <>
            {deckColors.map((color, i) => (
                <mesh
                    key={i}
                    // Increase vertical spacing to avoid Z-fighting and shadow artifacts between pile cards
                    position={[0, -i * 0.08 - 0.15, 0]}
                    rotation={[-Math.PI / 2, 0, i * 0.03]}
                    receiveShadow
                >
                    <RoundedBox args={[2.5, 3.5, 0.05]} radius={0.1} smoothness={2}>
                        <meshStandardMaterial color={color} roughness={0.25} metalness={0.15} />
                    </RoundedBox>
                </mesh>
            ))}
        </>
    );
});

// Floating Hearts/Particles for ambient effect
const FloatingParticles = React.memo(function FloatingParticles({ count = 20 }: { count?: number }) {
    const particles = useMemo(() => {
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            position: [
                (Math.random() - 0.5) * 8,
                Math.random() * 6 - 1,
                (Math.random() - 0.5) * 6 - 2
            ] as [number, number, number],
            scale: Math.random() * 0.3 + 0.1,
            speed: Math.random() * 0.5 + 0.3,
            phase: Math.random() * Math.PI * 2
        }));
    }, [count]);

    return (
        <group>
            {particles.map((p) => (
                <FloatingHeart key={p.id} {...p} />
            ))}
        </group>
    );
});

function FloatingHeart({ position, scale, speed, phase }: {
    position: [number, number, number];
    scale: number;
    speed: number;
    phase: number;
}) {
    const meshRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (meshRef.current) {
            const time = state.clock.elapsedTime;
            // Slower, gentler movement
            const slowSpeed = speed * 0.3;
            meshRef.current.position.y = position[1] + Math.sin(time * slowSpeed + phase) * 0.4;
            meshRef.current.position.x = position[0] + Math.sin(time * slowSpeed * 0.5 + phase) * 0.2;
            meshRef.current.rotation.z = Math.sin(time * slowSpeed + phase) * 0.2;
        }
    });

    return (
        <group ref={meshRef} position={position} scale={scale}>
            <Text fontSize={0.5} color="#ff6b8a" anchorX="center" anchorY="middle">
                ♥
            </Text>
        </group>
    );
}

// Magic sparkle effect around the deck
const MagicSparkles = React.memo(function MagicSparkles({ active }: { active: boolean }) {
    const sparklesRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (sparklesRef.current && active) {
            // Slower rotation for gentler effect
            sparklesRef.current.rotation.y = state.clock.elapsedTime * 0.08;
        }
    });

    if (!active) return null;

    return (
        <group ref={sparklesRef} position={[0, 0.5, 0]}>
            {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const radius = 2;
                return (
                    <mesh
                        key={i}
                        position={[Math.cos(angle) * radius, Math.sin(angle * 2) * 0.5, Math.sin(angle) * radius]}
                    >
                        <sphereGeometry args={[0.05, 8, 8]} />
                        <meshBasicMaterial color="#ffd700" transparent opacity={0.8} />
                    </mesh>
                );
            })}
        </group>
    );
});

// Glowing ring around the deck
function GlowRing({ isDrawn }: { isDrawn: boolean }) {
    const ringRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (ringRef.current && !isDrawn) {
            const scale = 1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.03;
            ringRef.current.scale.set(scale, scale, 1);

            const material = ringRef.current.material as THREE.MeshBasicMaterial;
            material.opacity = 0.25 + Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
        }
    });

    if (isDrawn) return null;

    return (
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
            <ringGeometry args={[1.8, 2.2, 64]} />
            <meshBasicMaterial color="#ff6b8a" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
    );
}

function Scene({
    currentCard,
    isDrawn,
    onDraw,
    members,
    currentUser
}: {
    currentCard: CardData | null,
    isDrawn: boolean,
    onDraw: () => void,
    members: any[],
    currentUser: any
}) {
    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 4, 9]} fov={50} />
            <OrbitControls
                enablePan={false}
                minDistance={6}
                maxDistance={12}
                maxPolarAngle={Math.PI / 2.2}
                enableZoom={!isDrawn}
                enableDamping
                dampingFactor={0.05}
            />

            {/* Enhanced Lighting for Premium Feel */}
            <ambientLight intensity={0.4} />
            <directionalLight
                position={[5, 10, 5]}
                intensity={0.9}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-bias={-0.0005}
                shadow-normalBias={0.04}
            />
            <pointLight position={[-5, 5, -5]} intensity={0.4} color="#ff6b8a" />
            <pointLight position={[5, 3, 3]} intensity={0.3} color="#8b5cf6" />
            <spotLight
                position={[0, 8, 0]}
                angle={0.4}
                penumbra={0.5}
                intensity={0.6}
                color="#ffd700"
                castShadow={false}
            />

            {/* Floating Particles Background */}
            <FloatingParticles count={15} />

            {/* Magic Sparkles around deck */}
            <MagicSparkles active={!isDrawn} />

            {/* Glowing Ring */}
            <GlowRing isDrawn={isDrawn} />

            {/* 3D Chibi Avatars - Interactive & Animated */}
            {members.map((m, i) => (
                <ChibiCharacter
                    key={m._id}
                    url={m.avatarUrl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdBWB76EZKUgHdARYa-XNyIzoiJiUiyKiFrg&s'}
                    label={m._id === currentUser?.id ? "Bạn" : m.name}
                    position={[i === 0 ? -3.0 : 3.0, 0.1, -1.5]} // Standing on ground level
                    isLeft={i === 0}
                    isExcited={isDrawn}
                />
            ))}

            {/* Main Card */}
            <Card data={currentCard} isDrawn={isDrawn} onDraw={onDraw} />

            {/* Deck Pile - only show when card not drawn */}
            {!isDrawn && <DeckPile />}

            {/* Ground with gradient effect */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
                <circleGeometry args={[20, 64]} />
                <meshStandardMaterial
                    color="#0a0a1a"
                    roughness={0.95}
                    metalness={0.05}
                />
            </mesh>

            {/* Ambient Environment */}
            <Environment preset="night" />

            {/* Fog for depth */}
            <fog attach="fog" args={['#0a0a1a', 10, 25]} />
        </>
    );
}

// --- Main Component ---

export default function CoupleCardDeck() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [session, setSession] = useState<SessionData | null>(null);
    const [currentCard, setCurrentCard] = useState<CardData | null>(null);
    const [isDrawn, setIsDrawn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState<any[]>([]);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        fetchSession();
        fetchCouple();

        // Socket setup
        const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        socketRef.current = io(socketUrl);
        // ... keep existing socket logic

        if (user?.coupleId) {
            socketRef.current.emit('join_couple', user.coupleId);
        }

        socketRef.current.on('reveal_card', (data) => {
            setCurrentCard(data.card);
            setSession(data.session);
            setIsDrawn(true);
            toast.info('Đối phương vừa rút một thẻ bài! ✨');
        });

        socketRef.current.on('clear_card', () => {
            setIsDrawn(false);
            setCurrentCard(null);
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, []);

    const fetchCouple = async () => {
        try {
            const res = await client.get('/couple/me');
            if (res.data && res.data.memberIds) {
                setMembers(res.data.memberIds);
            }
        } catch (err) {
            console.error('Error fetching couple:', err);
        }
    };

    const fetchSession = async () => {
        try {
            const res = await client.get('/cards/session');
            setSession(res.data);
            if (res.data.currentCardId) {
                setCurrentCard(res.data.currentCardId);
                // Don't auto reveal - let user click to reveal
                // setIsDrawn(true); 
            }
        } catch (err) {
            toast.error('Không thể tải bộ bài');
        } finally {
            setLoading(false);
        }
    };

    const handleDraw = async () => {
        if (isDrawn || !session) return;

        // If we already have a card loaded, just reveal it
        if (currentCard) {
            setIsDrawn(true);
            return;
        }

        setLoading(true);
        try {
            const res = await client.post('/cards/draw');
            setCurrentCard(res.data.card);
            setSession(res.data.session);
            setIsDrawn(true);

            // Sync with partner
            socketRef.current?.emit('card_drawn', {
                coupleId: user?.coupleId,
                card: res.data.card,
                session: res.data.session
            });
        } catch (err: any) {
            if (err.response?.status === 400 && err.response?.data?.message === 'Hết thẻ bài rồi!') {
                toast.info('Đã hết thẻ bài! Hãy nhấn nút "Reset" ở trên để chơi lại từ đầu 🔄');
            } else {
                toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDiscard = () => {
        setIsDrawn(false);
        setCurrentCard(null);
        socketRef.current?.emit('card_discarded', { coupleId: user?.coupleId });
    };

    const handleReset = async () => {
        if (!window.confirm('Bạn muốn bắt đầu lại bộ bài mới?')) return;
        try {
            const res = await client.post('/cards/reset');
            setSession(res.data);
            setIsDrawn(false);
            setCurrentCard(null);
            socketRef.current?.emit('card_discarded', { coupleId: user?.coupleId });
            toast.success('Đã làm mới bộ bài! 🃏');
        } catch (err) {
            toast.error('Không thể làm mới bộ bài');
        }
    };

    if (loading && !session) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950">
                <span className="loading loading-spinner text-rose-500 loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
            {/* UI Overlay */}
            <div className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between items-center pointer-events-none">
                <motion.button
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    onClick={() => navigate('/')}
                    className="p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white pointer-events-auto active:scale-95 transition-all"
                >
                    <ChevronLeft size={24} />
                </motion.button>

                <div className="flex gap-3">
                    <motion.button
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        onClick={handleReset}
                        className="p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white pointer-events-auto active:scale-95 transition-all"
                    >
                        <RefreshCcw size={24} />
                    </motion.button>
                </div>
            </div>

            {/* Hint */}
            <AnimatePresence>
                {!isDrawn && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-10 pointer-events-none"
                    >
                        <div className="px-6 py-3 bg-rose-500/20 backdrop-blur-md border border-rose-500/30 rounded-full text-rose-400 font-bold flex items-center gap-2">
                            <Hand size={18} />
                            Nhấn vào bộ bài để rút thẻ
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Followups for drawn card */}
            <AnimatePresence>
                {isDrawn && currentCard && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="absolute bottom-12 left-0 w-full px-8 z-20"
                    >
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-rose-400 font-black text-[10px] uppercase tracking-[0.2em]">
                                        <Info size={14} />
                                        Câu hỏi gợi mở
                                    </div>
                                    <div className="space-y-3">
                                        {currentCard.followups.map((f, i) => (
                                            <motion.p
                                                key={i}
                                                initial={{ x: -10, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.5 + i * 0.1 }}
                                                className="text-slate-300 font-medium italic text-sm leading-relaxed"
                                            >
                                                • {f}
                                            </motion.p>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={handleDiscard}
                                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                                >
                                    Xong mục này
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats */}
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Còn lại {session?.remainingCardIds.length} thẻ bài
            </div>

            {/* Three.js Canvas */}
            <Canvas shadows dpr={[1, 2]}>
                <Suspense fallback={null}>
                    <Scene
                        currentCard={currentCard}
                        isDrawn={isDrawn}
                        onDraw={handleDraw}
                        members={members}
                        currentUser={user}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}
