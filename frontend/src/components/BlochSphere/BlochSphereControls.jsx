import React from 'react';
import {
  Box,
  Typography,
  Slider,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { motion } from 'framer-motion';

const BlochSphereControls = ({
  theta,
  phi,
  onThetaChange,
  onPhiChange,
  onPresetState,
  blochData
}) => {
  const presetStates = [
    { name: '|0⟩', theta: 0, phi: 0, description: 'Ground state' },
    { name: '|1⟩', theta: Math.PI, phi: 0, description: 'Excited state' },
    { name: '|+⟩', theta: Math.PI / 2, phi: 0, description: 'Plus state' },
    { name: '|-⟩', theta: Math.PI / 2, phi: Math.PI, description: 'Minus state' },
    { name: '|+i⟩', theta: Math.PI / 2, phi: Math.PI / 2, description: 'Plus i state' },
    { name: '|-i⟩', theta: Math.PI / 2, phi: 3 * Math.PI / 2, description: 'Minus i state' }
  ];

  const handlePresetClick = (preset) => {
    onThetaChange(preset.theta);
    onPhiChange(preset.phi);
    onPresetState(preset);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ height: '100%' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#00d4ff', mb: 3 }}>
          🎛️ Quantum State Controls
        </Typography>

        {/* Angle Controls */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ color: '#ffffff' }}>
            Bloch Sphere Angles
          </Typography>

          {/* Theta Control */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom sx={{ color: '#8892b0' }}>
              θ (Theta): {(theta * 180 / Math.PI).toFixed(1)}° ({theta.toFixed(3)} rad)
            </Typography>
            <Slider
              value={theta}
              onChange={(_, value) => onThetaChange(value)}
              min={0}
              max={Math.PI}
              step={0.01}
              sx={{
                color: '#00d4ff',
                '& .MuiSlider-thumb': {
                  boxShadow: '0 0 10px rgba(0, 212, 255, 0.5)'
                }
              }}
            />
          </Box>

          {/* Phi Control */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom sx={{ color: '#8892b0' }}>
              φ (Phi): {(phi * 180 / Math.PI).toFixed(1)}° ({phi.toFixed(3)} rad)
            </Typography>
            <Slider
              value={phi}
              onChange={(_, value) => onPhiChange(value)}
              min={0}
              max={2 * Math.PI}
              step={0.01}
              sx={{
                color: '#ff006b',
                '& .MuiSlider-thumb': {
                  boxShadow: '0 0 10px rgba(255, 0, 107, 0.5)'
                }
              }}
            />
          </Box>
        </Box>

        {/* Preset States */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ color: '#ffffff' }}>
            Preset Quantum States
          </Typography>
          <Grid container spacing={1}>
            {presetStates.map((preset, index) => (
              <Grid item xs={6} key={index}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={() => handlePresetClick(preset)}
                  sx={{
                    mb: 1,
                    color: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      borderColor: '#00d4ff',
                      backgroundColor: 'rgba(0, 212, 255, 0.1)'
                    }
                  }}
                >
                  {preset.name}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Current State Info */}
        {blochData && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ color: '#ffffff' }}>
              Current State
            </Typography>
            <Box sx={{
              p: 2,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 1,
              border: '1px solid rgba(0, 212, 255, 0.2)'
            }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  color: '#00d4ff',
                  mb: 1
                }}
              >
                |ψ⟩ = {blochData.amplitudes?.alpha?.toFixed(3)}|0⟩ + {blochData.amplitudes?.beta?.toFixed(3)}|1⟩
              </Typography>

              <Grid container spacing={1} sx={{ mt: 1 }}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="textSecondary">X:</Typography>
                  <Typography variant="body2" sx={{ color: '#ff006b', fontFamily: 'monospace' }}>
                    {blochData.x?.toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="textSecondary">Y:</Typography>
                  <Typography variant="body2" sx={{ color: '#00ff88', fontFamily: 'monospace' }}>
                    {blochData.y?.toFixed(3)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="textSecondary">Z:</Typography>
                  <Typography variant="body2" sx={{ color: '#00d4ff', fontFamily: 'monospace' }}>
                    {blochData.z?.toFixed(3)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}

        {/* Measurement Probabilities */}
        {blochData && (
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ color: '#ffffff' }}>
              Measurement Probabilities
            </Typography>
            <Box sx={{
              p: 2,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 1,
              border: '1px solid rgba(0, 255, 136, 0.2)'
            }}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">P(|0⟩)</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {((1 + blochData.z) / 2).toFixed(3)}
                  </Typography>
                </Box>
                <Box sx={{
                  height: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 4,
                  overflow: 'hidden'
                }}>
                  <Box sx={{
                    height: '100%',
                    width: `${((1 + blochData.z) / 2) * 100}%`,
                    backgroundColor: '#00d4ff',
                    transition: 'width 0.3s ease'
                  }} />
                </Box>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">P(|1⟩)</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {((1 - blochData.z) / 2).toFixed(3)}
                  </Typography>
                </Box>
                <Box sx={{
                  height: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 4,
                  overflow: 'hidden'
                }}>
                  <Box sx={{
                    height: '100%',
                    width: `${((1 - blochData.z) / 2) * 100}%`,
                    backgroundColor: '#ff006b',
                    transition: 'width 0.3s ease'
                  }} />
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </motion.div>
  );
};

export default BlochSphereControls;
