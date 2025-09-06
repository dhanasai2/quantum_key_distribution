import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function QuantumVector({ theta = Math.PI / 4, phi = Math.PI / 3, isActive = false }) {
    const groupRef = useRef();

    useFrame((_, delta) => {
        if (isActive && groupRef.current) {
            groupRef.current.rotation.y += delta * 0.5;
        }
    });

    // Calculate position on sphere
    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.sin(theta) * Math.sin(phi);
    const z = Math.cos(theta);

    return (
        <group ref={groupRef}>
            {/* Vector line - using simple mesh cylinder */}
            <mesh
                position={[x / 2, y / 2, z / 2]}
                rotation={[Math.atan2(y, Math.sqrt(x * x + z * z)), Math.atan2(x, z), 0]}
            >
                <cylinderGeometry args={[0.02, 0.02, Math.sqrt(x * x + y * y + z * z)]} />
                <meshBasicMaterial color={isActive ? "#ff1493" : "#00ff88"} />
            </mesh>

            {/* Point on sphere */}
            <mesh position={[x, y, z]}>
                <sphereGeometry args={[0.08, 12, 12]} />
                <meshBasicMaterial
                    color={isActive ? "#ff1493" : "#00ff88"}
                    emissive={isActive ? "#ff0044" : "#004400"}
                    emissiveIntensity={0.4}
                />
            </mesh>
        </group>
    );
}

const BlochSphereLive = ({ quantumUpdates, isLive, title = "Real-Time Bloch Sphere" }) => {
    const [quantumState, setQuantumState] = useState({
        theta: Math.PI / 4,
        phi: Math.PI / 3,
        bitIndex: 0
    });

    useEffect(() => {
        if (quantumUpdates && quantumUpdates.length > 0) {
            const latest = quantumUpdates[quantumUpdates.length - 1];
            setQuantumState({
                theta: latest.quantum_state?.theta || latest.theta || Math.PI / 4,
                phi: latest.quantum_state?.phi || latest.phi || Math.PI / 3,
                bitIndex: latest.bit_index || latest.bitIndex || 0
            });
        }
    }, [quantumUpdates]);

    return (
        <div style={{
            height: '400px',
            width: '100%',
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: '12px',
            position: 'relative'
        }}>
            <h3 style={{
                color: '#00d4ff',
                margin: '0 0 10px 0',
                padding: '10px',
                fontSize: '16px'
            }}>
                {title} {isLive && <span style={{ color: '#ff1493' }}>● LIVE</span>}
            </h3>

            <Canvas camera={{ position: [3, 3, 3], fov: 50 }} style={{ height: '320px' }}>
                <ambientLight intensity={0.6} />
                <pointLight position={[10, 10, 10]} intensity={0.8} />

                {/* Bloch sphere wireframe */}
                <mesh>
                    <sphereGeometry args={[1, 20, 20]} />
                    <meshBasicMaterial color="#004466" wireframe transparent opacity={0.4} />
                </mesh>

                {/* X axis */}
                <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.01, 0.01, 2.4]} />
                    <meshBasicMaterial color="#666666" />
                </mesh>

                {/* Y axis */}
                <mesh position={[0, 0, 0]}>
                    <cylinderGeometry args={[0.01, 0.01, 2.4]} />
                    <meshBasicMaterial color="#666666" />
                </mesh>

                {/* Z axis */}
                <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.01, 0.01, 2.4]} />
                    <meshBasicMaterial color="#666666" />
                </mesh>

                {/* Always show quantum vector - THIS IS THE KEY */}
                <QuantumVector
                    theta={quantumState.theta}
                    phi={quantumState.phi}
                    isActive={isLive}
                />

                <OrbitControls enablePan={false} enableZoom={true} maxDistance={8} minDistance={2} />
            </Canvas>

            {/* Status info */}
            <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                right: '10px',
                backgroundColor: 'rgba(0,0,0,0.8)',
                color: '#ffffff',
                padding: '8px',
                borderRadius: '6px',
                fontSize: '12px',
                textAlign: 'center'
            }}>
                <strong style={{ color: '#00ff88' }}>Bit #{quantumState.bitIndex}:</strong>
                <span style={{ marginLeft: '8px' }}>
                    θ = {(quantumState.theta * 180 / Math.PI).toFixed(1)}°
                </span>
                <span style={{ marginLeft: '8px' }}>
                    φ = {(quantumState.phi * 180 / Math.PI).toFixed(1)}°
                </span>
            </div>
        </div>
    );
};

export default BlochSphereLive;
