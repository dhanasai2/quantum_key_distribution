import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Grid, Card, CardContent, Chip } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SecurityDashboard = ({ realtimeMetrics }) => {
  const [metricsHistory, setMetricsHistory] = useState({
    keyRate: [],
    errorRate: [],
    efficiency: [],
    timestamps: []
  });

  useEffect(() => {
    if (realtimeMetrics) {
      setMetricsHistory(prev => {
        const newTimestamp = new Date(realtimeMetrics.timestamp * 1000).toLocaleTimeString();
        const maxPoints = 20;

        return {
          keyRate: [...prev.keyRate.slice(-maxPoints + 1), realtimeMetrics.key_generation_rate],
          errorRate: [...prev.errorRate.slice(-maxPoints + 1), realtimeMetrics.quantum_error_rate * 100],
          efficiency: [...prev.efficiency.slice(-maxPoints + 1), realtimeMetrics.channel_efficiency * 100],
          timestamps: [...prev.timestamps.slice(-maxPoints + 1), newTimestamp]
        };
      });
    }
  }, [realtimeMetrics]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff'
        }
      },
    },
    scales: {
      x: {
        ticks: { color: '#8892b0' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y: {
        ticks: { color: '#8892b0' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    },
    elements: {
      line: {
        tension: 0.4
      }
    }
  };

  const keyRateData = {
    labels: metricsHistory.timestamps,
    datasets: [
      {
        label: 'Key Rate (bps)',
        data: metricsHistory.keyRate,
        borderColor: '#00ff88',
        backgroundColor: 'rgba(0, 255, 136, 0.1)',
        fill: true,
      },
    ],
  };

  const errorRateData = {
    labels: metricsHistory.timestamps,
    datasets: [
      {
        label: 'Error Rate (%)',
        data: metricsHistory.errorRate,
        borderColor: '#00d4ff',
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        fill: true,
      },
    ],
  };

  return (
    <Paper elevation={3} sx={{ p: 3, height: 'fit-content' }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <span>🛡️</span>
        Security Metrics Dashboard
      </Typography>

      {realtimeMetrics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <Card sx={{ backgroundColor: 'rgba(0, 255, 136, 0.1)' }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="body2" color="textSecondary">
                  Key Rate
                </Typography>
                <Typography variant="h6" color="#00ff88">
                  {realtimeMetrics.key_generation_rate?.toFixed(0)} bps
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Card sx={{ backgroundColor: 'rgba(0, 212, 255, 0.1)' }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="body2" color="textSecondary">
                  QBER
                </Typography>
                <Typography variant="h6" color="#00d4ff">
                  {(realtimeMetrics.quantum_error_rate * 100)?.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Card sx={{ backgroundColor: 'rgba(255, 0, 107, 0.1)' }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="body2" color="textSecondary">
                  Efficiency
                </Typography>
                <Typography variant="h6" color="#ff006b">
                  {(realtimeMetrics.channel_efficiency * 100)?.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="body2" color="textSecondary">
                  Status
                </Typography>
                <Chip 
                  label={realtimeMetrics.backend_status} 
                  color={realtimeMetrics.backend_status === 'operational' ? 'success' : 'warning'}
                  size="small"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Key Generation Rate
              </Typography>
              <Box sx={{ height: 200 }}>
                <Line data={keyRateData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quantum Bit Error Rate
              </Typography>
              <Box sx={{ height: 200 }}>
                <Line data={errorRateData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {realtimeMetrics?.queue_length !== undefined && (
        <Card sx={{ mt: 2, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
          <CardContent>
            <Typography variant="body2" color="textSecondary">
              IBM Quantum Queue: {realtimeMetrics.queue_length} jobs
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Security Parameter: {realtimeMetrics.security_parameter?.toExponential(2)}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Paper>
  );
};

export default SecurityDashboard;
