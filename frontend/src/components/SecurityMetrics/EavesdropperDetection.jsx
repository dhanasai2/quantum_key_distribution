import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Alert,
  LinearProgress,
  Chip,
  Grid,
  Button
} from '@mui/material';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';

const EavesdropperDetection = ({ 
  errorRate, 
  threshold = 0.11, 
  isMonitoring,
  onStartMonitoring,
  onStopMonitoring
}) => {
  const [alertLevel, setAlertLevel] = useState('safe');
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [timestamps, setTimestamps] = useState([]);

  useEffect(() => {
    if (errorRate !== undefined) {
      const now = new Date().toLocaleTimeString();
      setDetectionHistory(prev => [...prev.slice(-19), errorRate * 100]);
      setTimestamps(prev => [...prev.slice(-19), now]);

      if (errorRate > threshold) {
        setAlertLevel('danger');
      } else if (errorRate > threshold * 0.7) {
        setAlertLevel('warning');
      } else {
        setAlertLevel('safe');
      }
    }
  }, [errorRate, threshold]);

  const chartData = {
    labels: timestamps,
    datasets: [
      {
        label: 'Error Rate (%)',
        data: detectionHistory,
        borderColor: '#ff006b',
        backgroundColor: 'rgba(255, 0, 107, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Security Threshold (%)',
        data: Array(timestamps.length).fill(threshold * 100),
        borderColor: '#ffc107',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        pointRadius: 0,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#ffffff' }
      },
    },
    scales: {
      x: {
        ticks: { color: '#8892b0' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y: {
        ticks: { color: '#8892b0' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        min: 0,
        max: Math.max(threshold * 200, 25)
      }
    }
  };

  const getAlertConfig = () => {
    switch (alertLevel) {
      case 'danger':
        return {
          severity: 'error',
          color: '#ff006b',
          message: 'EAVESDROPPING DETECTED! Error rate exceeds security threshold.',
          icon: '🚨',
          action: 'ABORT TRANSMISSION'
        };
      case 'warning':
        return {
          severity: 'warning',
          color: '#ffc107',
          message: 'Elevated error rate detected. Monitor closely.',
          icon: '⚠️',
          action: 'INCREASE MONITORING'
        };
      default:
        return {
          severity: 'success',
          color: '#00ff88',
          message: 'Channel secure. No eavesdropping detected.',
          icon: '🛡️',
          action: 'CONTINUE TRANSMISSION'
        };
    }
  };

  const alertConfig = getAlertConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper elevation={3} sx={{ p: 3, backgroundColor: 'rgba(255, 0, 107, 0.05)' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#ff006b', mb: 3 }}>
          🕵️ Eavesdropper Detection System
        </Typography>

        {/* Current Status Alert */}
        <Alert 
          severity={alertConfig.severity} 
          sx={{ 
            mb: 3,
            '& .MuiAlert-message': { fontSize: '14px' },
            animation: alertLevel === 'danger' ? 'pulse 2s infinite' : 'none'
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {alertConfig.icon} {alertConfig.message}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Recommended Action: {alertConfig.action}
          </Typography>
        </Alert>

        {/* Monitoring Controls */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant={isMonitoring ? "outlined" : "contained"}
            color={isMonitoring ? "error" : "primary"}
            onClick={isMonitoring ? onStopMonitoring : onStartMonitoring}
            sx={{ minWidth: '140px' }}
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
          
          <Chip 
            label={isMonitoring ? 'MONITORING ACTIVE' : 'MONITORING INACTIVE'}
            color={isMonitoring ? 'success' : 'default'}
            size="small"
            sx={{ 
              animation: isMonitoring ? 'pulse 2s infinite' : 'none'
            }}
          />
        </Box>

        {/* Real-time Metrics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={4}>
            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(255, 0, 107, 0.1)' }}>
              <Typography variant="h5" sx={{ color: '#ff006b' }}>
                {((errorRate || 0) * 100).toFixed(2)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Current QBER
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(255, 193, 7, 0.1)' }}>
              <Typography variant="h5" sx={{ color: '#ffc107' }}>
                {(threshold * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Threshold
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(0, 255, 136, 0.1)' }}>
              <Typography variant="h5" sx={{ color: '#00ff88' }}>
                {errorRate ? ((threshold - errorRate) / threshold * 100).toFixed(0) : 100}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Security Margin
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Detection Progress */}
        {isMonitoring && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom sx={{ color: '#8892b0' }}>
              Detection Sensitivity
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(errorRate || 0) / threshold * 100}
              sx={{ 
                height: 10,
                borderRadius: 5,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  backgroundColor: alertConfig.color
                }
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption" sx={{ color: '#00ff88' }}>Safe</Typography>
              <Typography variant="caption" sx={{ color: '#ffc107' }}>Warning</Typography>
              <Typography variant="caption" sx={{ color: '#ff006b' }}>Danger</Typography>
            </Box>
          </Box>
        )}

        {/* Error Rate History Chart */}
        {detectionHistory.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ color: '#ffffff' }}>
              Error Rate Timeline
            </Typography>
            <Box sx={{ height: 200, backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 1, p: 1 }}>
              <Line data={chartData} options={chartOptions} />
            </Box>
          </Box>
        )}

        {/* Detection Statistics */}
        <Paper sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ color: '#8892b0' }}>
            Detection Statistics
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">
                Average Error Rate:
              </Typography>
              <Typography variant="body1" sx={{ color: '#ffffff', fontFamily: 'monospace' }}>
                {detectionHistory.length > 0 
                  ? (detectionHistory.reduce((a, b) => a + b, 0) / detectionHistory.length).toFixed(3)
                  : '0.000'
                }%
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">
                Detection Confidence:
              </Typography>
              <Typography variant="body1" sx={{ color: '#ffffff', fontFamily: 'monospace' }}>
                {errorRate ? (Math.min(100, (errorRate / threshold) * 100)).toFixed(1) : '0.0'}%
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Technical Information */}
        <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 1 }}>
          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '12px', lineHeight: 1.5 }}>
            <strong>Note:</strong> The BB84 protocol can detect eavesdropping through quantum bit error rate (QBER) analysis. 
            Any measurement by an eavesdropper introduces detectable errors due to the no-cloning theorem and quantum measurement disturbance.
          </Typography>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default EavesdropperDetection;
