
import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { FloatingShape, WireframeGrid } from './ThreeElements'
import * as THREE from 'three'

const SceneContent = ({ scrollProgress }) => {
    const group = useRef()

    useFrame((state, delta) => {
        if (group.current) {
            // Smoothly interpolate current rotation to target based on scroll
            const targetRotation = scrollProgress * Math.PI * 2;
            group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotation, 0.1);

            // Move camera z-position slightly
            const targetZ = 10 - scrollProgress * 5;
            state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.1);
        }
    })

    return (
        <group ref={group}>
            {/* HERO SECTION - Cyber Core equivalent */}
            <FloatingShape type="icosahedron" position={[0, 1, 0]} color="#00FFFF" speed={2} scale={1.5} />
            <FloatingShape type="torus" position={[0, 1, 0]} color="#FF7BAC" speed={1.5} scale={1} />

            {/* FEATURES SECTION - Floating Elements */}
            <group position={[0, -10, 0]}>
                <FloatingShape type="box" position={[-4, 2, 2]} color="#B6A1C4" speed={1} />
                <FloatingShape type="sphere" position={[4, -2, -2]} color="#00FFFF" speed={1.2} />
                <FloatingShape type="torus" position={[-3, -5, 1]} color="#FF7BAC" speed={0.8} />
            </group>

            {/* WORKFLOW/FOOTER SECTION */}
            <group position={[0, -20, 0]}>
                <WireframeGrid />
                <FloatingShape type="icosahedron" position={[0, 5, 0]} color="#FF7BAC" scale={2} />
            </group>

            {/* Background Ambience */}
            <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        </group>
    )
}

const Scene3D = () => {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = window.scrollY / totalHeight;
            setScrollProgress(progress);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            zIndex: -1, pointerEvents: 'none', background: '#050505'
        }}>
            <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                <fog attach="fog" args={['#050505', 5, 30]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} color="#FF7BAC" intensity={1} />
                <pointLight position={[-10, -10, -10]} color="#00FFFF" intensity={1} />

                <SceneContent scrollProgress={scrollProgress} />
            </Canvas>
        </div>
    )
}

export default Scene3D
