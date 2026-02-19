
import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'

export const FloatingShape = ({ position, color, type = 'box', speed = 1, scale = 1 }) => {
    const mesh = useRef()
    const [hovered, setHover] = useState(false)

    useFrame((state, delta) => {
        if (mesh.current) {
            mesh.current.rotation.x += delta * 0.5 * speed
            mesh.current.rotation.y += delta * 0.2 * speed
        }
    })

    const Geometry = type === 'box' ? 'boxGeometry' : type === 'sphere' ? 'sphereGeometry' : 'icosahedronGeometry'
    const args = type === 'box' ? [1, 1, 1] : type === 'sphere' ? [0.7, 32, 32] : [1, 0]

    return (
        <Float speed={2 * speed} rotationIntensity={1} floatIntensity={1}>
            <mesh
                ref={mesh}
                position={position}
                scale={hovered ? scale * 1.2 : scale}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
            >
                {type === 'box' && <boxGeometry args={[1, 1, 1]} />}
                {type === 'sphere' && <sphereGeometry args={[0.7, 32, 32]} />}
                {type === 'icosahedron' && <icosahedronGeometry args={[1, 0]} />}
                {type === 'torus' && <torusGeometry args={[0.6, 0.2, 16, 32]} />}

                <meshStandardMaterial
                    color={hovered ? '#ffffff' : color}
                    wireframe
                    transparent
                    opacity={0.6}
                />
            </mesh>
        </Float>
    )
}

export const WireframeGrid = () => {
    return (
        <gridHelper args={[100, 100, '#00FFFF', '#222']} position={[0, -5, 0]} rotation={[0, 0, 0]} />
    )
}
