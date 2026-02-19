
import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stats, Stars, Float, PerspectiveCamera, Torus, Environment } from '@react-three/drei'
import * as THREE from 'three'

// --- Floating Particles ---
const Particles = ({ count = 300 }) => {
    const mesh = useRef()
    const { viewport, mouse } = useThree()

    // Create random positions
    const particles = useMemo(() => {
        const temp = []
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100
            const factor = 20 + Math.random() * 100
            const speed = 0.01 + Math.random() / 200
            const xFactor = -50 + Math.random() * 100
            const yFactor = -50 + Math.random() * 100
            const zFactor = -50 + Math.random() * 100
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 })
        }
        return temp
    }, [count])

    // Update positions each frame
    const dummy = useMemo(() => new THREE.Object3D(), [])

    useFrame((state) => {
        particles.forEach((particle, i) => {
            let { t, factor, speed, xFactor, yFactor, zFactor } = particle

            // Basic circular motion + mouse interaction
            t = particle.t += speed / 2
            const a = Math.cos(t) + Math.sin(t * 1) / 10
            const b = Math.sin(t) + Math.cos(t * 2) / 10
            const s = Math.cos(t)

            // Applying position based on time and factors
            dummy.position.set(
                (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
                (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
                (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
            )

            // Scale pulsing
            dummy.scale.set(s, s, s)
            dummy.rotation.set(s * 5, s * 5, s * 5)
            dummy.updateMatrix()

            // Set instance matrix
            mesh.current.setMatrixAt(i, dummy.matrix)
        })
        mesh.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={mesh} args={[null, null, count]}>
            <dodecahedronGeometry args={[0.2, 0]} />
            <meshStandardMaterial color="#00FFFF" roughness={0.5} metalness={0.5} wireframe={true} />
        </instancedMesh>
    )
}

// --- Main Hero Object (Cyber Core) ---
const CyberCore = () => {
    const meshRef = useRef()

    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        meshRef.current.rotation.x = time * 0.2
        meshRef.current.rotation.y = time * 0.3
    })

    return (
        <group ref={meshRef}>
            {/* Outer Ring */}
            <Torus args={[3, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
                <meshBasicMaterial color="#00FFFF" transparent opacity={0.3} wireframe />
            </Torus>
            <Torus args={[3.2, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
                <meshBasicMaterial color="#FF7BAC" transparent opacity={0.2} wireframe />
            </Torus>

            {/* Inner Icosahedron */}
            <Float speed={2} rotationIntensity={2} floatIntensity={1}>
                <mesh>
                    <icosahedronGeometry args={[1.5, 0]} />
                    <meshStandardMaterial
                        color="#050505"
                        emissive="#00FFFF"
                        emissiveIntensity={0.5}
                        wireframe
                        roughness={0}
                        metalness={1}
                    />
                </mesh>
            </Float>

            {/* Core Light */}
            <pointLight position={[0, 0, 0]} intensity={1.5} color="#00FFFF" distance={10} />
        </group>
    )
}

const Hero3D = () => {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
            <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 10], fov: 45 }}>
                <fog attach="fog" args={['#050505', 5, 20]} />
                <ambientLight intensity={0.5} />
                <PerspectiveCamera makeDefault position={[0, 0, 10]} />

                {/* Lights */}
                <pointLight position={[10, 10, 10]} intensity={1} color="#FF7BAC" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#00FFFF" />

                {/* Scene Objects */}
                <group position={[0, 0, -2]}>
                    <CyberCore />
                    <Particles count={200} />
                </group>

                {/* Environment & Extras */}
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                {/* Helper Controls (disabled Zoom/Pan for background effect) */}
                {/* <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} /> */}
            </Canvas>
        </div>
    )
}

export default Hero3D
