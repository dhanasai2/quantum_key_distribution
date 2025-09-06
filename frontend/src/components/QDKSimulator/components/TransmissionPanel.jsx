import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  LinearProgress,
  Chip,
  Grid
} from '@mui/material';
import { motion } from 'framer-motion';

const TransmissionPanel = ({ 
  isTransmitting, 
  transmissionProgress, 
  channelNoise,
  eavesdropperPresent 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const transmissionSteps = [
    'Initializing quantum channel...',
    'Preparing photon polarizations...',
    'Transmitting quantum states...',
    'Monitoring for eavesdropping...',
    'Completing transmission...'
  ];

  useEffect(() => {
    if (isTransmitting) {
      const interval = setInterval(() => {
        setCurrentStep(prev => Math.min(prev + 1, transmissionSteps.length - 1));
      }, 800);
      
      return () => clearInterval(interval);
    } else {
      setCurrentStep(0);
    }
  }, [isTransmitting]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#ff006b', mb: 3 }}>
          📡 Quantum Channel Transmission
        </Typography>

        {/* Alice and Bob Visualization */}
        <Box sx={{ mb: 4, position: 'relative' }}>
          <Grid container alignItems="center" spacing={2}>
            {/* Alice */}
            <Grid item xs={3}>
              <Paper sx={{ 
                p: 3, 
                textAlign: 'center',
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                border: '2px solid #00d4ff'
              }}>
                <Typography variant="h4">👩‍💻</Typography>
                <Typography variant="h6" sx={{ color: '#00d4ff' }}>
                  ALICE
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Sender
                </Typography>
              </Paper>
            </Grid>

            {/* Quantum Channel */}
            <Grid item xs={6}>
              <Box sx={{ position: 'relative' }}>
                {/* Channel visualization */}
                <Box sx={{
                  height: '60px',
                  background: 'linear-gradient(90deg, #00d4ff, #ff006b)',
                  borderRadius: '30px',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}>
                  {/* Photon animation */}
                  {isTransmitting && (
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: '100%', opacity: [0, 1, 1, 0] }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "linear" 
                      }}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        transform: 'translateY(-50%)',
                        width: '20px',
                        height: '20px',
                        background: '#ffff00',
                        borderRadius: '50%',
                        boxShadow: '0 0 20px #ffff00'
                      }}
                    />
                  )}
                  
                  {/* Eavesdropper indicator */}
                  {eavesdropperPresent && (
                    <Box sx={{
                      position: 'absolute',
                      top: '-30px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(255, 0, 107, 0.9)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      animation: 'pulse 1s infinite'
                    }}>
                      🕵️ EVE
                    </Box>
                  )}
                </Box>

                {/* Progress bar */}
                {isTransmitting && (
                  <LinearProgress 
                    variant="determinate" 
                    value={transmissionProgress} 
                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  />
                )}
              </Box>
            </Grid>

            {/* Bob */}
            <Grid item xs={3}>
              <Paper sx={{ 
                p: 3, 
                textAlign: 'center',
                backgroundColor: 'rgba(255, 0, 107, 0.1)',
                border: '2px solid #ff006b'
              }}>
                <Typography variant="h4">👨‍💻</Typography>
                <Typography variant="h6" sx={{ color: '#ff006b' }}>
                  BOB
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Receiver
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Transmission Status */}
        {isTransmitting && (
          <Paper sx={{ 
            p: 2, 
            mb: 3,
            backgroundColor: 'rgba(255, 0, 107, 0.05)',
            border: '1px solid rgba(255, 0, 107, 0.2)'
          }}>
            <Typography variant="body1" gutterBottom sx={{ color: '#ff006b' }}>
              {transmissionSteps[currentStep]}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              {transmissionSteps.map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: index <= currentStep ? '#ff006b' : 'rgba(255, 255, 255, 0.2)',
                    transition: 'background-color 0.3s ease'
                  }}
                />
              ))}
            </Box>
          </Paper>
        )}

        {/* Channel Parameters */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Paper sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
              <Typography variant="subtitle2" gutterBottom sx={{ color: '#8892b0' }}>
                Channel Noise Level
              </Typography>
              <Chip 
                label={`${((channelNoise || 0) * 100).toFixed(2)}%`}
                color={channelNoise < 0.05 ? 'success' : channelNoise < 0.15 ? 'warning' : 'error'}
                size="small"
              />
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
              <Typography variant="subtitle2" gutterBottom sx={{ color: '#8892b0' }}>
                Security Status
              </Typography>
              <Chip 
                label={eavesdropperPresent ? 'Eavesdropper Detected' : 'Secure Channel'}
                color={eavesdropperPresent ? 'error' : 'success'}
                size="small"
              />
            </Paper>
          </Grid>
        </Grid>

        {/* Photon Polarization States */}
        <Paper sx={{ p: 2, mt: 2, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ color: '#8892b0' }}>
            Photon Polarization States
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip label="↔ Horizontal (|0⟩)" size="small" />
            <Chip label="↕ Vertical (|1⟩)" size="small" />
            <Chip label="↗ Diagonal (|+⟩)" size="small" />
            <Chip label="↖ Anti-diagonal (|-⟩)" size="small" />
          </Box>
        </Paper>

        {!isTransmitting && (
          <Box sx={{ 
            mt: 3, 
            p: 2, 
            textAlign: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 1
          }}>
            <Typography variant="body2" color="textSecondary">
              Ready to transmit quantum-encrypted data through secure channel
            </Typography>
          </Box>
        )}
      </Box>
    </motion.div>
  );
};

export default TransmissionPanel;
