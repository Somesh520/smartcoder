import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';

function SpinningPolyhedron() {
    const meshRef = useRef();

    useFrame((state, delta) => {
        meshRef.current.rotation.x += delta * 0.5;
        meshRef.current.rotation.y += delta * 0.5;
    });

    return (
        <mesh ref={meshRef}>
            <icosahedronGeometry args={[2, 0]} />
            <meshStandardMaterial color="#22c55e" wireframe />
        </mesh>
    );
}

function FloatingParticles() {
    const groupRef = useRef();
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        groupRef.current.rotation.z = -t * 0.1;
        groupRef.current.rotation.y = Math.sin(t / 4) * 0.5;
    });

    return (
        <group ref={groupRef}>
            {Array.from({ length: 50 }).map((_, i) => (
                <mesh key={i} position={[
                    (Math.random() - 0.5) * 15,
                    (Math.random() - 0.5) * 15,
                    (Math.random() - 0.5) * 15
                ]}>
                    <sphereGeometry args={[0.05, 8, 8]} />
                    <meshBasicMaterial color="#4ade80" />
                </mesh>
            ))}
        </group>
    );
}

const ThreeLoadingScreen = ({ text = "INITIALIZING SYSTEM..." }) => {
    return (
        <div style={{ height: '100vh', width: '100vw', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', height: '60%', position: 'relative' }}>
                <Canvas camera={{ position: [0, 0, 6] }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <SpinningPolyhedron />
                    <FloatingParticles />
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
                </Canvas>
            </div>

            <div style={{ color: '#22c55e', fontFamily: 'monospace', fontSize: '24px', letterSpacing: '4px', fontWeight: 'bold', marginTop: '-50px', zIndex: 10 }}>
                {text}
            </div>

            <div style={{
                marginTop: '15px',
                width: '200px',
                height: '4px',
                background: '#111',
                borderRadius: '2px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: '100%',
                    height: '100%',
                    background: '#22c55e',
                    animation: 'loadProgress 2s infinite ease-in-out',
                    transformOrigin: 'left'
                }}></div>
            </div>
            <style>{`
                @keyframes loadProgress {
                    0% { transform: scaleX(0); }
                    50% { transform: scaleX(1); }
                    100% { transform: scaleX(0); transform-origin: right; }
                }
            `}</style>
        </div>
    );
};

export default ThreeLoadingScreen;
