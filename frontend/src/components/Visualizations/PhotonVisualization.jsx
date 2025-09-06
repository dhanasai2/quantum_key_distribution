import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const PhotonVisualization = ({ 
  photonData = [],
  showMeasurement = false,
  measurementBasis = 'Z'
}) => {
  const [visiblePhotons, setVisiblePhotons] = useState([]);
  const [measurementResults, setMeasurementResults] = useState([]);

  useEffect(() => {
    if (photonData.length > 0) {
      setVisiblePhotons(photonData.slice(0, 16)); // Show max 16 photons
    }
  }, [photonData]);

  const simulateMeasurement = (photon) => {
    const { bit, basis } = photon;
    
    // If measurement basis matches preparation basis, get exact result
    if (basis === measurementBasis) {
      return { result: bit, certainty: 1.0 };
    } else {
      // If bases don't match, 50% probability
      return { 
        result: Math.random() < 0.5 ? 0 : 1, 
        certainty: 0.5 
      };
    }
  };

  useEffect(() => {
    if (showMeasurement && visiblePhotons.length > 0) {
      const results = visiblePhotons.map(photon => simulateMeasurement(photon));
      setMeasurementResults(results);
    }
  }, [showMeasurement, visiblePhotons, measurementBasis]);

  const getPolarizationSymbol = (bit, basis) => {
    if (basis === 'Z') {
      return bit === 0 ? '↔' : '↕'; // Horizontal : Vertical
    } else {
      return bit === 0 ? '↗' : '↖'; // Diagonal : Anti-diagonal
    }
  };

  const getPolarizationColor = (bit, basis) => {
    if (basis === 'Z') {
      return bit === 0 ? '#00d4ff' : '#ff006b';
    } else {
      return bit === 0 ? '#00ff88' : '#ffc107';
    }
  };

  return (
    <Paper sx={{ p: 3, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#00d4ff' }}>
        🔬 Individual Photon Analysis
      </Typography>

      {/* Measurement Basis Indicator */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <Chip 
          label={`Measurement Basis: ${measurementBasis === 'Z' ? 'Rectilinear (↔/↕)' : 'Diagonal (↗/↖)'}`}
          color="primary"
          sx={{ fontSize: '14px' }}
        />
      </Box>

      {/* Photon Grid */}
      <Grid container spacing={1} sx={{ mb: 3 }}>
        <AnimatePresence>
          {visiblePhotons.map((photon, index) => {
            const measurementResult = measurementResults[index];
            const symbol = getPolarizationSymbol(photon.bit, photon.basis);
            const color = getPolarizationColor(photon.bit, photon.basis);
            
            return (
              <Grid item xs={3} sm={2} md={1.5} key={index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Box sx={{
                    width: '60px',
                    height: '60px',
                    border: `2px solid ${color}`,
                    borderRadius: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: `${color}10`,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: `0 0 20px ${color}`
                    }
                  }}>
                    {/* Photon polarization */}
                    <Typography 
                      variant="h6" 
                      sx={{ color: color, fontWeight: 'bold' }}
                    >
                      {symbol}
                    </Typography>
                    
                    {/* Photon number */}
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        position: 'absolute',
                        bottom: '-20px',
                        color: '#8892b0',
                        fontSize: '10px'
                      }}
                    >
                      #{index + 1}
                    </Typography>

                    {/* Measurement result overlay */}
                    {showMeasurement && measurementResult && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: measurementResult.certainty === 1.0 ? '#00ff88' : '#ffc107',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          color: 'black',
                          fontWeight: 'bold'
                        }}
                      >
                        {measurementResult.result}
                      </motion.div>
                    )}
                  </Box>
                </motion.div>
              </Grid>
            );
          })}
        </AnimatePresence>
      </Grid>

      {/* Statistics */}
      {visiblePhotons.length > 0 && (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
          gap: 2,
          mb: 3 
        }}>
          <Paper sx={{ p: 1, textAlign: 'center', backgroundColor: 'rgba(0, 212, 255, 0.1)' }}>
            <Typography variant="h6" sx={{ color: '#00d4ff' }}>
              {visiblePhotons.filter(p => p.basis === 'Z').length}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Z-basis
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 1, textAlign: 'center', backgroundColor: 'rgba(0, 255, 136, 0.1)' }}>
            <Typography variant="h6" sx={{ color: '#00ff88' }}>
              {visiblePhotons.filter(p => p.basis === 'X').length}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              X-basis
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 1, textAlign: 'center', backgroundColor: 'rgba(255, 0, 107, 0.1)' }}>
            <Typography variant="h6" sx={{ color: '#ff006b' }}>
              {visiblePhotons.filter(p => p.bit === 0).length}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              |0⟩ states
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 1, textAlign: 'center', backgroundColor: 'rgba(255, 193, 7, 0.1)' }}>
            <Typography variant="h6" sx={{ color: '#ffc107' }}>
              {visiblePhotons.filter(p => p.bit === 1).length}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              |1⟩ states
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Measurement Results */}
      {showMeasurement && measurementResults.length > 0 && (
        <Box sx={{ 
          p: 2, 
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 1 
        }}>
          <Typography variant="subtitle2" gutterBottom sx={{ color: '#ffffff' }}>
            Measurement Results
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            Bit sequence: {measurementResults.map(r => r.result).join('')}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Average accuracy: {(measurementResults.reduce((sum, r) => sum + r.certainty, 0) / measurementResults.length * 100).toFixed(1)}%
          </Typography>
        </Box>
      )}

      {/* Legend */}
      <Box sx={{ 
        mt: 2, 
        p: 2, 
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 1 
      }}>
        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '11px' }}>
          <strong>Legend:</strong> ↔ Horizontal (|0⟩, Z-basis), ↕ Vertical (|1⟩, Z-basis), 
          ↗ Diagonal (|0⟩, X-basis), ↖ Anti-diagonal (|1⟩, X-basis). 
          Green dots indicate perfect measurement, yellow dots indicate probabilistic measurement.
        </Typography>
      </Box>
    </Paper>
  );
};

export default PhotonVisualization;
