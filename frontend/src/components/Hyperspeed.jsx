import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

const Road = ({ width = 10, length = 400, color = 0x555555, islandWidth = 2, lanes = 3 }) => {
    const mesh = useRef();
    const material = useRef();

    // Shader for the moving road
    const shaderArgs = useMemo(() => ({
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(color) },
            uRoadWidth: { value: width },
            uIslandWidth: { value: islandWidth },
            uLanes: { value: lanes },
            uBrokenLinesColor: { value: new THREE.Color(0xffffff) },
            uShoulderLinesColor: { value: new THREE.Color(0xffffff) }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                vec3 pos = position;
                // Simple curvature/distortion if needed, but we keep it flat for speed
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTime;
            uniform vec3 uColor;
            uniform float uRoadWidth;
            uniform float uIslandWidth;
            uniform float uLanes;
            uniform vec3 uBrokenLinesColor;
            
            varying vec2 vUv;

            void main() {
                vec2 uv = vUv;
                
                // Animate texture coordinate along Y to simulate movement
                float speed = 2.0; // speedUp
                float yOffset = uTime * speed;
                
                // Base Road Color
                vec3 color = uColor;
                
                // Calculate symmetric X (-0.5 to 0.5)
                float x = uv.x - 0.5;
                
                // --- Simple Logic to draw lines based on UV x position ---
                // This is a simplified procedural texture generation
                
                // Shoulder lines (edges)
                float edgeThickness = 0.02;
                if(abs(x) > 0.45 && abs(x) < 0.48) {
                    color = uBrokenLinesColor; 
                }
                
                // Center Island
                if(abs(x) < 0.05) {
                    color = color * 0.5; // Darker center
                }
                
                // Broken Lines for lanes (simplified)
                // We cycle through Y to make them 'broken'
                float brokenPattern = step(0.5, fract(uv.y * 20.0 + yOffset));
                
                // Right Lane marker
                if(abs(x - 0.25) < 0.01 && brokenPattern > 0.5) {
                    color = uBrokenLinesColor;
                }
                // Left Lane marker
                if(abs(x + 0.25) < 0.01 && brokenPattern > 0.5) {
                    color = uBrokenLinesColor;
                }

                gl_FragColor = vec4(color, 1.0);
                
                // Fade out into distance (fog-like)
                float dist = gl_FragCoord.z / gl_FragCoord.w;
                float fogFactor = smoothstep(50.0, 400.0, dist);
                // gl_FragColor = mix(gl_FragColor, vec4(0.0, 0.0, 0.0, 1.0), fogFactor);
            }
        `
    }), [color, width, islandWidth, lanes]);

    useFrame((state) => {
        if (material.current) {
            material.current.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    return (
        <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
            <planeGeometry args={[width, length, 20, 20]} />
            <shaderMaterial ref={material} args={[shaderArgs]} transparent />
        </mesh>
    );
};

const LightStreaks = ({ count = 50, colors = ['#ff0000', '#ffffff', '#0000ff'], length = 400, width = 10, speed = 1 }) => {
    const mesh = useRef();
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            temp.push({
                x: (Math.random() - 0.5) * width * 0.8, // Scatter across road width
                y: 0.5, // Height above road
                z: -Math.random() * length, // Initial Z
                speed: (Math.random() * 0.5 + 0.5) * 100 * speed * (Math.random() > 0.5 ? 1 : 1.5), // Speed
                color: colors[Math.floor(Math.random() * colors.length)],
                scale: Math.random() * 10 + 5
            });
        }
        return temp;
    }, [count, length, width, speed, colors]);

    useFrame((state, delta) => {
        if (!mesh.current) return;

        particles.forEach((p, i) => {
            // Update Z
            p.z += p.speed * delta;
            if (p.z > 50) p.z = -length; // Reset if passed camera

            dummy.position.set(p.x, p.y, p.z);
            dummy.scale.set(1, 1, p.scale); // Stretch along Z? We need a box
            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);

            // Note: Setting color for InstancedMesh requires more logic or custom shader usually,
            // but for simplicity we assume one color or use instanceColor if we upgraded three.js
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[null, null, count]}>
            <boxGeometry args={[0.2, 0.2, 5]} /> {/* Small streak */}
            <meshBasicMaterial color={new THREE.Color(1, 1, 1)} /> {/* White base, we rely on bloom */}
        </instancedMesh>
    );
};

// Simplified component that accepts the props but renders our custom implementation
const Hyperspeed = ({
    effectOptions = {
        colors: {
            roadColor: 0x080808,
            islandColor: 0x0a0a0a,
            background: 0x000000,
            shoulderLines: 0xFFFFFF,
            brokenLines: 0xFFFFFF,
            leftCars: [0xFF0000, 0xEB3838, 0xFF0000],
            rightCars: [0xD4D4D4, 0xFFFFFF, 0xF4F4F4],
            sticks: 0x00FFFF
        },
        distortion: 'turbulentDistortion',
        length: 400,
        roadWidth: 20,
        islandWidth: 2,
        lanesPerRoad: 3,
        fov: 90,
        fovSpeedUp: 150,
        speedUp: 2,
        carLightsFade: 0.4,
        totalSideLightSticks: 20,
        lightPairsPerRoadWay: 40
    }
}) => {
    const { colors, roadWidth, length, speedUp } = effectOptions;

    return (
        <div style={{ width: '100%', height: '100%', background: 'none' }}>
            <Canvas
                camera={{ position: [0, 5, 20], fov: 60 }}
                style={{ width: '100%', height: '100%' }}
                dpr={[1, 2]}
            >
                <color attach="background" args={[new THREE.Color(colors.background || 'black')]} />
                <fog attach="fog" args={['black', 30, length / 2]} />

                <ambientLight intensity={0.5} />

                {/* Road */}
                <Road
                    width={roadWidth}
                    length={length}
                    color={colors.roadColor}
                    islandWidth={effectOptions.islandWidth}
                    lanes={effectOptions.lanesPerRoad}
                />

                {/* Lights (Mocking Cars) */}
                <LightStreaks
                    count={50}
                    width={roadWidth}
                    length={length}
                    speed={speedUp}
                    colors={colors.leftCars || ['red']}
                />

                <LightStreaks
                    count={50}
                    width={roadWidth}
                    length={length}
                    speed={speedUp * 1.2}
                    colors={colors.rightCars || ['white']}
                />

                {/* Post Processing for Glow */}
                <EffectComposer>
                    <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
                </EffectComposer>

                {/* Camera Controller or subtle shake could belong here */}
            </Canvas>
        </div>
    );
};

export default Hyperspeed;
