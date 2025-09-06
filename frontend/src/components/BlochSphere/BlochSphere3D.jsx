import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import { Paper, Typography, Slider, Box, Grid, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import axios from 'axios';

const BlochSphere = ({ theta, phi, blochCoords }) => {
  const sphereRef = useRef();
  const vectorRef = useRef();

  useFrame(() => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group>
      {/* Main sphere */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshPhongMaterial
          color="#00d4ff"
          transparent
          opacity={0.3}
          wireframe={false}
        />
      </mesh>

      {/* Wireframe */}
      <mesh>
        <sphereGeometry args={[2.01, 16, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.2}
          wireframe={true}
        />
      </mesh>

      {/* Axes */}
      <Line
        points={[[-2.5, 0, 0], [2.5, 0, 0]]}
        color="#ff006b"
        lineWidth={3}
      />
      <Line
        points={[[0, -2.5, 0], [0, 2.5, 0]]}
        color="#00ff88"
        lineWidth={3}
      />
      <Line
        points={[[0, 0, -2.5], [0, 0, 2.5]]}
        color="#00d4ff"
        lineWidth={3}
      />

      {/* State vector */}
      {blochCoords && (
        <group>
          <Line
            points={[[0, 0, 0], [blochCoords.x * 2, blochCoords.y * 2, blochCoords.z * 2]]}
            color="#ffff00"
            lineWidth={5}
          />
          <mesh position={[blochCoords.x * 2, blochCoords.y * 2, blochCoords.z * 2]}>
            <sphereGeometry args={[0.1]} />
            <meshPhongMaterial color="#ffff00" />
          </mesh>
        </group>
      )}

      {/* Labels */}
      <Text
        position={[2.8, 0, 0]}
        fontSize={0.3}
        color="#ff006b"
        anchorX="center"
        anchorY="middle"
      >
        X
      </Text>
      <Text
        position={[0, 2.8, 0]}
        fontSize={0.3}
        color="#00ff88"
        anchorX="center"
        anchorY="middle"
      >
        Y
      </Text>
      <Text
        position={[0, 0, 2.8]}
        fontSize={0.3}
        color="#00d4ff"
        anchorX="center"
        anchorY="middle"
      >
        |0⟩
      </Text>
      <Text
        position={[0, 0, -2.8]}
        fontSize={0.3}
        color="#00d4ff"
        anchorX="center"
        anchorY="middle"
      >
        |1⟩
      </Text>

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </group>
  );
};

const BlochSphere3D = () => {
  const [theta, setTheta] = useState(0);
  const [phi, setPhi] = useState(0);
  const [blochData, setBlochData] = useState(null);

  const updateBlochSphere = async (newTheta, newPhi) => {
    try {
      const response = await axios.post('http://localhost:8000/api/qkd/bloch-sphere', {
        theta: newTheta,
        phi: newPhi
      });
      setBlochData(response.data);
    } catch (error) {
      console.error('Bloch sphere update error:', error);
    }
  };

  useEffect(() => {
    updateBlochSphere(theta, phi);
  }, [theta, phi]);

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <span>🌐</span>
        3D Quantum State Bloch Sphere
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box sx={{ height: 500, border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: 2 }}>
            <Canvas camera={{ position: [5, 5, 5] }}>
              <BlochSphere theta={theta} phi={phi} blochCoords={blochData} />
              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
            </Canvas>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quantum State Controls
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  θ (Theta): {theta.toFixed(2)} rad
                </Typography>
                <Slider
                  value={theta}
                  onChange={(_, value) => setTheta(value)}
                  min={0}
                  max={Math.PI}
                  step={0.01}
                  sx={{ color: '#00d4ff' }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  φ (Phi): {phi.toFixed(2)} rad
                </Typography>
                <Slider
                  value={phi}
                  onChange={(_, value) => setPhi(value)}
                  min={0}
                  max={2 * Math.PI}
                  step={0.01}
                  sx={{ color: '#ff006b' }}
                />
              </Box>
            </CardContent>
          </Card>

          {blochData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quantum State
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    θ = {blochData.theta.toFixed(3)}°, φ = {blochData.phi.toFixed(3)}°
                  </Typography>

                  <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2 }}>
                    |ψ⟩ = {blochData.amplitudes.alpha.toFixed(3)}|0⟩ + {blochData.amplitudes.beta.toFixed(3)}|1⟩
                  </Typography>

                  <Typography variant="body2" color="textSecondary">
                    Bloch Coordinates:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    x: {blochData.x.toFixed(3)}<br />
                    y: {blochData.y.toFixed(3)}<br />
                    z: {blochData.z.toFixed(3)}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BlochSphere3D;
