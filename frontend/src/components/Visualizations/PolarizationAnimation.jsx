import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { motion } from 'framer-motion';

const PolarizationAnimation = ({ 
  currentPolarization = 'horizontal',
  isAnimating = false,
  onAnimationComplete 
}) => {
  const [animationPhase, setAnimationPhase] = useState(0);

  const polarizations = {
    horizontal: { angle: 0, symbol: '↔', color: '#00d4ff', name: 'Horizontal |0⟩' },
    vertical: { angle: 90, symbol: '↕', color: '#ff006b', name: 'Vertical |1⟩' },
    diagonal: { angle: 45, symbol: '↗', color: '#00ff88', name: 'Diagonal |+⟩' },
    antidiagonal: { angle: 135, symbol: '↖', color: '#ffc107', name: 'Anti-diagonal |-⟩' }
  };

  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setAnimationPhase(prev => {
          const newPhase = (prev + 10) % 360;
          if (newPhase === 0 && onAnimationComplete) {
            onAnimationComplete();
          }
          return newPhase;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isAnimating, onAnimationComplete]);

  const currentPol = polarizations[currentPolarization];

  return (
    <Paper sx={{ p: 3, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#00d4ff' }}>
        📊 Photon Polarization States
      </Typography>

      {/* Polarization Visualization */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '200px',
        position: 'relative'
      }}>
        {/* Background circle */}
        <Box sx={{
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          border: '2px dashed rgba(255, 255, 255, 0.3)',
          position: 'absolute'
        }} />

        {/* Polarization vector */}
        <motion.div
          animate={{
            rotate: isAnimating ? animationPhase : currentPol.angle
          }}
          transition={{ duration: 0.1 }}
          style={{
            width: '120px',
            height: '2px',
            backgroundColor: currentPol.color,
            transformOrigin: 'center',
            position: 'relative',
            boxShadow: `0 0 10px ${currentPol.color}`
          }}
        >
          {/* Arrow head */}
          <Box sx={{
            position: 'absolute',
            right: '-5px',
            top: '-3px',
            width: 0,
            height: 0,
            borderLeft: '8px solid ' + currentPol.color,
            borderTop: '4px solid transparent',
            borderBottom: '4px solid transparent'
          }} />
        </motion.div>

        {/* Center dot */}
        <Box sx={{
          position: 'absolute',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
        }} />

        {/* Angle markers */}
        {[0, 45, 90, 135].map(angle => (
          <Box
            key={angle}
            sx={{
              position: 'absolute',
              transform: `rotate(${angle}deg) translateX(75px)`,
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.5)'
            }}
          />
        ))}
      </Box>

      {/* Current State Info */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Chip 
          label={currentPol.name}
          sx={{ 
            backgroundColor: currentPol.color + '20',
            color: currentPol.color,
            border: `1px solid ${currentPol.color}`,
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        />
      </Box>

      {/* Polarization States Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: 1,
        mt: 2 
      }}>
        {Object.entries(polarizations).map(([key, pol]) => (
          <Box
            key={key}
            sx={{
              p: 1,
              textAlign: 'center',
              backgroundColor: key === currentPolarization 
                ? `${pol.color}20` 
                : 'rgba(255, 255, 255, 0.05)',
              borderRadius: 1,
              border: key === currentPolarization 
                ? `1px solid ${pol.color}` 
                : '1px solid transparent',
              transition: 'all 0.3s ease'
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ color: pol.color, mb: 0.5 }}
            >
              {pol.symbol}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ color: '#8892b0', fontSize: '10px' }}
            >
              {pol.name}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Animation Status */}
      {isAnimating && (
        <Box sx={{ 
          mt: 2, 
          p: 1, 
          textAlign: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 1
        }}>
          <Typography variant="body2" color="textSecondary">
            🔄 Animating polarization rotation... {animationPhase}°
          </Typography>
        </Box>
      )}

      {/* Technical Info */}
      <Box sx={{ 
        mt: 2, 
        p: 2, 
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 1 
      }}>
        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '11px' }}>
          In BB84, photon polarizations encode quantum bits. Horizontal/Vertical represent 
          the rectilinear basis (0°/90°), while Diagonal/Anti-diagonal represent the 
          diagonal basis (45°/135°).
        </Typography>
      </Box>
    </Paper>
  );
};

export default PolarizationAnimation;
