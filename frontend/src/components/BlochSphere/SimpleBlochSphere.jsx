import React, { useState, useEffect } from 'react';

const SimpleBlochSphere = ({ quantumUpdates, isLive, title = "Real-Time Bloch Sphere" }) => {
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

    // Sphere parameters
    const radius = 120;
    const centerX = 160;
    const centerY = 160;

    // Convert spherical coordinates to 2D projection
    const x = centerX + radius * Math.sin(quantumState.theta) * Math.cos(quantumState.phi);
    const y = centerY - radius * Math.cos(quantumState.theta);

    // Equatorial circle points for better visualization
    const equatorPoints = [];
    for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * 2 * Math.PI;
        equatorPoints.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY
        });
    }

    return (
        <div style={{
            width: '100%',
            height: '400px',
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: '12px',
            padding: '20px',
            position: 'relative',
            border: '1px solid rgba(0, 212, 255, 0.2)'
        }}>
            <h3 style={{
                color: '#00d4ff',
                margin: '0 0 20px 0',
                fontSize: '18px',
                textAlign: 'center'
            }}>
                {title} {isLive && <span style={{ color: '#ff1493' }}>● LIVE</span>}
            </h3>

            {/* SVG Bloch Sphere Visualization */}
            <svg width="320" height="320" style={{ display: 'block', margin: '0 auto' }}>
                {/* Background gradient */}
                <defs>
                    <radialGradient id="sphereGradient" cx="50%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="rgba(0, 212, 255, 0.1)" />
                        <stop offset="100%" stopColor="rgba(0, 212, 255, 0.05)" />
                    </radialGradient>
                    <filter id="glow">
                        <feMorphology operator="dilate" radius="2" />
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Main sphere outline */}
                <circle
                    cx={centerX}
                    cy={centerY}
                    r={radius}
                    fill="url(#sphereGradient)"
                    stroke="#004466"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    opacity="0.6"
                />

                {/* Equatorial circle */}
                <circle
                    cx={centerX}
                    cy={centerY}
                    r={radius}
                    fill="none"
                    stroke="#003344"
                    strokeWidth="1"
                    opacity="0.4"
                />

                {/* Meridian circle */}
                <ellipse
                    cx={centerX}
                    cy={centerY}
                    rx="3"
                    ry={radius}
                    fill="none"
                    stroke="#003344"
                    strokeWidth="1"
                    opacity="0.4"
                />

                {/* Coordinate axes */}
                <line
                    x1={centerX - radius - 20}
                    y1={centerY}
                    x2={centerX + radius + 20}
                    y2={centerY}
                    stroke="#666"
                    strokeWidth="1"
                />
                <line
                    x1={centerX}
                    y1={centerY - radius - 20}
                    x2={centerX}
                    y2={centerY + radius + 20}
                    stroke="#666"
                    strokeWidth="1"
                />

                {/* Axis labels */}
                <text x={centerX + radius + 25} y={centerY + 5} fill="#ffffff" fontSize="12" fontWeight="bold">X</text>
                <text x={centerX - 8} y={centerY - radius - 25} fill="#ffffff" fontSize="12" fontWeight="bold">Z</text>
                <text x={centerX - 15} y={centerY - radius - 8} fill="#00ff88" fontSize="11">|0⟩</text>
                <text x={centerX - 15} y={centerY + radius + 18} fill="#ff6b6b" fontSize="11">|1⟩</text>

                {/* North and South pole markers */}
                <circle cx={centerX} cy={centerY - radius} r="3" fill="#00ff88" opacity="0.7" />
                <circle cx={centerX} cy={centerY + radius} r="3" fill="#ff6b6b" opacity="0.7" />

                {/* Quantum state vector line */}
                <line
                    x1={centerX}
                    y1={centerY}
                    x2={x}
                    y2={y}
                    stroke={isLive ? "#ff1493" : "#00ff88"}
                    strokeWidth="4"
                    filter="url(#glow)"
                />

                {/* State point on sphere surface */}
                <circle
                    cx={x}
                    cy={y}
                    r={isLive ? "8" : "6"}
                    fill={isLive ? "#ff1493" : "#00ff88"}
                    filter="url(#glow)"
                >
                    {isLive && (
                        <animate
                            attributeName="r"
                            values="6;12;6"
                            dur="1.5s"
                            repeatCount="indefinite"
                        />
                    )}
                </circle>

                {/* Bit index label */}
                <text
                    x={x + 15}
                    y={y - 8}
                    fill="#00ff88"
                    fontSize="12"
                    fontWeight="bold"
                >
                    Bit #{quantumState.bitIndex}
                </text>

                {/* Projection lines (optional visual aid) */}
                <line
                    x1={x}
                    y1={y}
                    x2={x}
                    y2={centerY}
                    stroke={isLive ? "#ff1493" : "#00ff88"}
                    strokeWidth="1"
                    strokeDasharray="2,2"
                    opacity="0.5"
                />
                <line
                    x1={x}
                    y1={centerY}
                    x2={centerX}
                    y2={centerY}
                    stroke={isLive ? "#ff1493" : "#00ff88"}
                    strokeWidth="1"
                    strokeDasharray="2,2"
                    opacity="0.5"
                />

                {/* Angle arcs for better understanding */}
                <path
                    d={`M ${centerX + 30} ${centerY} A 30 30 0 0 0 ${centerX + 30 * Math.cos(quantumState.phi)} ${centerY - 30 * Math.sin(quantumState.phi)}`}
                    fill="none"
                    stroke="#ffd700"
                    strokeWidth="2"
                    opacity="0.6"
                />
            </svg>

            {/* State information panel */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                right: '20px',
                backgroundColor: 'rgba(0,0,0,0.8)',
                color: '#ffffff',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                border: '1px solid rgba(0, 212, 255, 0.3)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <strong style={{ color: '#00ff88' }}>Quantum Bit #{quantumState.bitIndex}</strong>
                    </div>
                    <div>
                        {isLive && (
                            <span style={{ color: '#ff1493', fontSize: '12px' }}>
                                ● LIVE UPDATE
                            </span>
                        )}
                    </div>
                </div>
                <div style={{ marginTop: '8px', display: 'flex', gap: '20px' }}>
                    <span>
                        <strong>θ (Polar):</strong> {(quantumState.theta * 180 / Math.PI).toFixed(1)}°
                    </span>
                    <span>
                        <strong>φ (Azimuthal):</strong> {(quantumState.phi * 180 / Math.PI).toFixed(1)}°
                    </span>
                </div>
                <div style={{ marginTop: '4px', fontSize: '11px', color: '#8892b0' }}>
                    State Vector: |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩
                </div>
            </div>
        </div>
    );
};

export default SimpleBlochSphere;
