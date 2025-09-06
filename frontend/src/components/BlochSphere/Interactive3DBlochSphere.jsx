import React, { useState, useEffect } from 'react';

const Interactive3DBlochSphere = ({ quantumUpdates, isLive, title = "Interactive 3D Bloch Sphere" }) => {
    const [quantumState, setQuantumState] = useState({
        theta: Math.PI / 4,
        phi: Math.PI / 3,
        bitIndex: 0
    });

    useEffect(() => {
        if (quantumUpdates && quantumUpdates.length > 0) {
            const latest = quantumUpdates[quantumUpdates.length - 1];
            setQuantumState({
                theta: latest.quantum_state?.theta || latest.state?.theta || latest.theta || Math.PI / 4,
                phi: latest.quantum_state?.phi || latest.state?.phi || latest.phi || Math.PI / 3,
                bitIndex: latest.bit_index || latest.bitIndex || latest.index || 0
            });
        }
    }, [quantumUpdates]);

    // Convert spherical to cartesian coordinates for positioning
    const radius = 120;
    const centerX = 160;
    const centerY = 160;

    const x = centerX + radius * Math.sin(quantumState.theta) * Math.cos(quantumState.phi);
    const y = centerY - radius * Math.cos(quantumState.theta);
    const z = radius * Math.sin(quantumState.theta) * Math.sin(quantumState.phi);

    return (
        <div style={{
            width: '100%',
            height: '400px',
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: '12px',
            position: 'relative',
            border: '1px solid rgba(0, 212, 255, 0.2)',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                position: 'absolute',
                top: '10px',
                left: '20px',
                right: '20px',
                zIndex: 10,
                color: '#00d4ff',
                fontSize: '18px',
                fontWeight: 'bold',
                textAlign: 'center',
                textShadow: '0 0 10px rgba(0, 212, 255, 0.5)'
            }}>
                🌐 {title} {isLive && <span style={{ color: '#ff1493' }}>● LIVE</span>}
            </div>

            {/* 3D-Looking CSS Sphere */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '240px',
                height: '240px',
                background: `
          radial-gradient(circle at 30% 30%, rgba(0, 212, 255, 0.3), rgba(0, 212, 255, 0.1) 40%, transparent 70%),
          radial-gradient(circle at center, rgba(0, 100, 150, 0.2), rgba(0, 100, 150, 0.1) 60%, transparent)
        `,
                borderRadius: '50%',
                border: '2px solid rgba(0, 212, 255, 0.4)',
                position: 'relative',
                animation: isLive ? 'spin 10s linear infinite' : 'none'
            }}>

                {/* Wireframe lines for 3D effect */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '100%',
                    height: '2px',
                    backgroundColor: 'rgba(0, 212, 255, 0.3)',
                    transform: 'translate(-50%, -50%)'
                }} />

                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '2px',
                    height: '100%',
                    backgroundColor: 'rgba(0, 212, 255, 0.3)',
                    transform: 'translate(-50%, -50%)'
                }} />

                {/* Equatorial circle */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '80%',
                    height: '16px',
                    border: '1px solid rgba(0, 212, 255, 0.2)',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)'
                }} />

                {/* Quantum state vector */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '2px',
                    height: `${radius}px`,
                    backgroundColor: isLive ? '#ff1493' : '#00ff88',
                    transformOrigin: 'bottom center',
                    transform: `
            translate(-50%, -100%) 
            rotateY(${quantumState.phi * 180 / Math.PI}deg) 
            rotateX(${quantumState.theta * 180 / Math.PI}deg)
          `,
                    boxShadow: `0 0 10px ${isLive ? '#ff1493' : '#00ff88'}`,
                    animation: isLive ? 'pulse 2s ease-in-out infinite' : 'none'
                }}>

                    {/* Vector endpoint */}
                    <div style={{
                        position: 'absolute',
                        top: '0',
                        left: '50%',
                        width: isLive ? '12px' : '8px',
                        height: isLive ? '12px' : '8px',
                        backgroundColor: isLive ? '#ff1493' : '#00ff88',
                        borderRadius: '50%',
                        transform: 'translate(-50%, -50%)',
                        boxShadow: `0 0 15px ${isLive ? '#ff1493' : '#00ff88'}`,
                        animation: isLive ? 'glow 1s ease-in-out infinite alternate' : 'none'
                    }} />
                </div>

                {/* State labels */}
                <div style={{
                    position: 'absolute',
                    top: '-20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: '#00ff88',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    textShadow: '0 0 8px rgba(0, 255, 136, 0.8)'
                }}>
                    |0⟩
                </div>

                <div style={{
                    position: 'absolute',
                    bottom: '-20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: '#ff6b6b',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    textShadow: '0 0 8px rgba(255, 107, 107, 0.8)'
                }}>
                    |1⟩
                </div>

                {/* Axis labels */}
                <div style={{
                    position: 'absolute',
                    right: '-25px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#ff6b6b',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }}>
                    X
                </div>

                <div style={{
                    position: 'absolute',
                    top: '-25px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: '#4dabf7',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }}>
                    Z
                </div>

                {/* Bit label */}
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    color: '#00ff88',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid rgba(0, 255, 136, 0.3)'
                }}>
                    #{quantumState.bitIndex}
                </div>

                {/* Floating particles effect */}
                {isLive && [1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{
                        position: 'absolute',
                        width: '3px',
                        height: '3px',
                        backgroundColor: '#00d4ff',
                        borderRadius: '50%',
                        top: `${20 + Math.random() * 60}%`,
                        left: `${20 + Math.random() * 60}%`,
                        animation: `float${i} ${3 + Math.random() * 2}s ease-in-out infinite`,
                        boxShadow: '0 0 6px #00d4ff'
                    }} />
                ))}
            </div>

            {/* Control Instructions */}
            <div style={{
                position: 'absolute',
                top: '50px',
                right: '15px',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: '#8892b0',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div>🌐 3D CSS Visualization</div>
                <div>⚡ Real-time updates</div>
                <div>🔄 Auto-rotation enabled</div>
            </div>

            {/* State Information Panel */}
            <div style={{
                position: 'absolute',
                bottom: '15px',
                left: '15px',
                right: '15px',
                backgroundColor: 'rgba(0,0,0,0.8)',
                color: '#ffffff',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <strong style={{ color: '#00ff88' }}>Quantum Bit #{quantumState.bitIndex}</strong>
                    </div>
                    <div>
                        {isLive && (
                            <span style={{
                                color: '#ff1493',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}>
                                <div style={{
                                    width: '6px',
                                    height: '6px',
                                    backgroundColor: '#ff1493',
                                    borderRadius: '50%',
                                    animation: 'pulse 1s infinite'
                                }} />
                                LIVE UPDATE
                            </span>
                        )}
                    </div>
                </div>
                <div style={{
                    marginTop: '8px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '15px',
                    fontSize: '12px'
                }}>
                    <span>
                        <strong>θ (Polar):</strong> {(quantumState.theta * 180 / Math.PI).toFixed(1)}°
                    </span>
                    <span>
                        <strong>φ (Azimuthal):</strong> {(quantumState.phi * 180 / Math.PI).toFixed(1)}°
                    </span>
                </div>
                <div style={{
                    marginTop: '6px',
                    fontSize: '10px',
                    color: '#8892b0',
                    textAlign: 'center'
                }}>
                    |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩
                </div>
            </div>

            {/* CSS Animations */}
            <style jsx>{`
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotateY(0deg); }
          to { transform: translate(-50%, -50%) rotateY(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }
        
        @keyframes glow {
          from { box-shadow: 0 0 15px currentColor; }
          to { box-shadow: 0 0 25px currentColor, 0 0 35px currentColor; }
        }
        
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(10px, -10px) rotate(90deg); }
          50% { transform: translate(-5px, -20px) rotate(180deg); }
          75% { transform: translate(-15px, -5px) rotate(270deg); }
        }
        
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-12px, 8px) rotate(120deg); }
          66% { transform: translate(8px, -15px) rotate(240deg); }
        }
        
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          20% { transform: translate(15px, 5px) rotate(72deg); }
          40% { transform: translate(-8px, 18px) rotate(144deg); }
          60% { transform: translate(-18px, -8px) rotate(216deg); }
          80% { transform: translate(5px, -15px) rotate(288deg); }
        }
        
        @keyframes float4 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-10px, -12px) rotate(180deg); }
        }
        
        @keyframes float5 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(8px, 12px) rotate(90deg); }
          50% { transform: translate(-12px, 8px) rotate(180deg); }
          75% { transform: translate(-8px, -12px) rotate(270deg); }
        }
      `}</style>
        </div>
    );
};

export default Interactive3DBlochSphere;
