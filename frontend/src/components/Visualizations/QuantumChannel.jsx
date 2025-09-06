import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';

const QuantumChannel = ({ 
  isTransmitting, 
  photonCount = 1, 
  channelLength = 400,
  noiseLevel = 0 
}) => {
  const [photons, setPhotons] = useState([]);

  useEffect(() => {
    if (isTransmitting) {
      const interval = setInterval(() => {
        const newPhoton = {
          id: Date.now() + Math.random(),
          polarization: Math.random() < 0.5 ? 'horizontal' : 'vertical',
          position: 0,
          speed: 2 + Math.random() * 2,
          hasNoise: Math.random() < noiseLevel
        };
        
        setPhotons(prev => [...prev, newPhoton]);
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isTransmitting, noiseLevel]);

  useEffect(() => {
    const updatePhotons = () => {
      setPhotons(prev => 
        prev
          .map(photon => ({
            ...photon,
            position: photon.position + photon.speed
          }))
          .filter(photon => photon.position < channelLength + 50)
      );
    };

    const interval = setInterval(updatePhotons, 50);
    return () => clearInterval(interval);
  }, [channelLength]);

  return (
    <Paper sx={{ p: 3, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#00d4ff' }}>
        📡 Quantum Communication Channel
      </Typography>
      
      <Box sx={{ 
        position: 'relative',
        height: '120px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 2,
        overflow: 'hidden',
        border: '2px solid rgba(0, 212, 255, 0.3)'
      }}>
        {/* Alice */}
        <Box sx={{
          position: 'absolute',
          left: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#00d4ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '12px',
          boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)'
        }}>
          ALICE
        </Box>

        {/* Bob */}
        <Box sx={{
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#ff006b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '12px',
          boxShadow: '0 0 20px rgba(255, 0, 107, 0.5)'
        }}>
          BOB
        </Box>

        {/* Quantum Channel */}
        <Box sx={{
          position: 'absolute',
          left: '80px',
          right: '80px',
          top: '50%',
          transform: 'translateY(-50%)',
          height: '4px',
          background: 'linear-gradient(90deg, #00d4ff, #ff006b)',
          borderRadius: '2px'
        }} />

        {/* Photons */}
        {photons.map(photon => (
          <motion.div
            key={photon.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              left: `${80 + photon.position}px`,
              top: '50%',
              transform: 'translateY(-50%)',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: photon.hasNoise ? '#ff9800' : '#ffff00',
              boxShadow: `0 0 15px ${photon.hasNoise ? '#ff9800' : '#ffff00'}`,
              zIndex: 10
            }}
          >
            {/* Polarization indicator */}
            <Box sx={{
              position: 'absolute',
              top: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '8px',
              color: 'white',
              fontWeight: 'bold'
            }}>
              {photon.polarization === 'horizontal' ? '↔' : '↕'}
            </Box>
          </motion.div>
        ))}

        {/* Channel noise visualization */}
        {noiseLevel > 0 && (
          <Box sx={{
            position: 'absolute',
            left: '80px',
            right: '80px',
            top: 0,
            bottom: 0,
            background: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 10px,
              rgba(255, 152, 0, ${noiseLevel * 0.3}) 11px,
              rgba(255, 152, 0, ${noiseLevel * 0.3}) 12px
            )`,
            pointerEvents: 'none'
          }} />
        )}
      </Box>

      {/* Channel Information */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          Photons transmitted: {photons.filter(p => p.position > channelLength).length}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Channel noise: {(noiseLevel * 100).toFixed(1)}%
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Status: {isTransmitting ? 'TRANSMITTING' : 'IDLE'}
        </Typography>
      </Box>
    </Paper>
  );
};

export default QuantumChannel;
