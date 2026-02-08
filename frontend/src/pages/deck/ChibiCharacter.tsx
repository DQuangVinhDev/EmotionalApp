import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';

interface ChibiCharacterProps {
    url: string;
    label: string;
    position: [number, number, number];
    isLeft: boolean;
    isExcited: boolean;
}

export default function ChibiCharacter({ url, label, position, isLeft, isExcited }: ChibiCharacterProps) {
    const group = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Mesh>(null);
    const leftArmRef = useRef<THREE.Group>(null);
    const rightArmRef = useRef<THREE.Group>(null);
    const leftLegRef = useRef<THREE.Group>(null);
    const rightLegRef = useRef<THREE.Group>(null);

    // Load avatar texture
    const texture = useMemo(() => {
        const loader = new THREE.TextureLoader();
        return loader.load(url);
    }, [url]);

    // Random offset for animation phase to prevent sync
    const phaseOffset = useMemo(() => Math.random() * 100, []);

    // Color logic
    const bodyColor = isLeft ? "#60a5fa" : "#f472b6";
    const pantsColor = "#334155";

    useFrame((state) => {
        if (!group.current || !headRef.current || !bodyRef.current ||
            !leftArmRef.current || !rightArmRef.current ||
            !leftLegRef.current || !rightLegRef.current) return;

        const t = state.clock.elapsedTime + phaseOffset;
        // Animation Speed
        const speed = isExcited ? 8 : 2;
        const intensity = isExcited ? 1.5 : 0.5;

        // Bounce Body
        group.current.position.y = position[1] + Math.sin(t * speed) * 0.05 * intensity;

        // Head Bobble
        headRef.current.rotation.z = Math.sin(t * (speed * 0.5)) * 0.05 * intensity;
        headRef.current.rotation.y = Math.sin(t * (speed * 0.3)) * 0.1 + (isLeft ? 0.3 : -0.3);

        // Breathing (Scale Body)
        bodyRef.current.scale.x = 1 + Math.sin(t * speed) * 0.02 * intensity;

        // Arm Swing
        const armAngle = Math.sin(t * speed) * 0.6 * intensity;
        leftArmRef.current.rotation.x = armAngle;
        rightArmRef.current.rotation.x = -armAngle;

        // Excited Wave
        if (isExcited) {
            // Wave hands high
            leftArmRef.current.rotation.z = Math.PI - 0.5 + Math.sin(t * 15) * 0.3;
            rightArmRef.current.rotation.z = -Math.PI + 0.5 - Math.sin(t * 15) * 0.3;
        } else {
            // Idle arms
            leftArmRef.current.rotation.z = 0.2;
            rightArmRef.current.rotation.z = -0.2;
        }

        // Leg Walk
        leftLegRef.current.rotation.x = -armAngle * 0.8;
        rightLegRef.current.rotation.x = armAngle * 0.8;
    });

    return (
        <group ref={group} position={position}>
            {/* Label */}
            <group position={[0, 1.3, 0]}>
                <mesh position={[0, 0, -0.01]}>
                    <planeGeometry args={[1.2, 0.35]} />
                    <meshBasicMaterial color="black" transparent opacity={0.3} />
                </mesh>
                <Text
                    fontSize={0.2}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#000000"
                >
                    {label}
                </Text>
            </group>

            {/* HEAD */}
            <group ref={headRef} position={[0, 0.7, 0]}>
                <RoundedBox args={[0.55, 0.5, 0.5]} radius={0.15} smoothness={4}>
                    <meshStandardMaterial color="#fcd3ca" />
                </RoundedBox>
                {/* Face Texture */}
                <mesh position={[0, 0, 0.26]}>
                    <planeGeometry args={[0.4, 0.4]} />
                    <meshBasicMaterial map={texture} transparent />
                </mesh>
            </group>

            {/* BODY */}
            <mesh ref={bodyRef} position={[0, 0.15, 0]}>
                <RoundedBox args={[0.4, 0.5, 0.25]} radius={0.1} smoothness={4}>
                    <meshStandardMaterial color={bodyColor} />
                </RoundedBox>
            </mesh>

            {/* ARMS - Pivoted at top */}
            <group ref={leftArmRef} position={[-0.28, 0.35, 0]}>
                <mesh position={[0, -0.15, 0]}>
                    <RoundedBox args={[0.12, 0.35, 0.12]} radius={0.06} smoothness={4}>
                        <meshStandardMaterial color={bodyColor} />
                    </RoundedBox>
                </mesh>
            </group>

            <group ref={rightArmRef} position={[0.28, 0.35, 0]}>
                <mesh position={[0, -0.15, 0]}>
                    <RoundedBox args={[0.12, 0.35, 0.12]} radius={0.06} smoothness={4}>
                        <meshStandardMaterial color={bodyColor} />
                    </RoundedBox>
                </mesh>
            </group>

            {/* LEGS - Pivoted at top */}
            <group ref={leftLegRef} position={[-0.12, -0.1, 0]}>
                <mesh position={[0, -0.15, 0]}>
                    <RoundedBox args={[0.13, 0.35, 0.13]} radius={0.06} smoothness={4}>
                        <meshStandardMaterial color={pantsColor} />
                    </RoundedBox>
                </mesh>
            </group>

            <group ref={rightLegRef} position={[0.12, -0.1, 0]}>
                <mesh position={[0, -0.15, 0]}>
                    <RoundedBox args={[0.13, 0.35, 0.13]} radius={0.06} smoothness={4}>
                        <meshStandardMaterial color={pantsColor} />
                    </RoundedBox>
                </mesh>
            </group>

            {/* Shadow */}
            <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.4, 32]} />
                <meshBasicMaterial color="black" transparent opacity={0.2} />
            </mesh>
        </group>
    );
}
