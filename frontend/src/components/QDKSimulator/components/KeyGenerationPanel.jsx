import React from 'react';
import { 
  Box, 
  Typography, 
  LinearProgress, 
  Chip,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { motion } from 'framer-motion';
import { formatBinaryDisplay } from '../../../utils/quantumUtils';

const KeyGenerationPanel = ({ bb84Result, isGenerating }) => {
  if (isGenerating) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#00d4ff' }}>
            🔑 Generating Quantum Key...
          </Typography>
          <LinearProgress sx={{ mt: 2, mb: 2 }} />
          <Typography variant="body2" color="textSecondary">
            Preparing quantum states and performing BB84 protocol
          </Typography>
        </Box>
      </motion.div>
    );
  }

  if (!bb84Result) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body1">
          Click "Generate Quantum Key" to start the BB84 protocol
        </Typography>
      </Box>
    );
  }

  const efficiencyRate = bb84Result.key_length / bb84Result.alice_bits.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#00d4ff', mb: 3 }}>
          🔑 BB84 Key Generation Results
        </Typography>

        {/* Key Statistics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(0, 255, 136, 0.1)' }}>
              <Typography variant="h5" sx={{ color: '#00ff88' }}>
                {bb84Result.key_length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Key Length (bits)
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(0, 212, 255, 0.1)' }}>
              <Typography variant="h5" sx={{ color: '#00d4ff' }}>
                {(bb84Result.error_rate * 100).toFixed(2)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Error Rate
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(255, 0, 107, 0.1)' }}>
              <Typography variant="h5" sx={{ color: '#ff006b' }}>
                {(efficiencyRate * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Efficiency
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
              <Chip 
                label={bb84Result.backend_used}
                color="primary"
                size="small"
              />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Backend
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Final Quantum Key */}
        <Paper sx={{ p: 2, mb: 3, backgroundColor: 'rgba(0, 255, 136, 0.05)' }}>
          <Typography variant="subtitle1" gutterBottom sx={{ color: '#00ff88' }}>
            Generated Quantum Key
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontFamily: 'monospace',
              wordBreak: 'break-all',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              p: 1,
              borderRadius: 1,
              fontSize: '14px'
            }}
          >
            {formatBinaryDisplay(bb84Result.alice_key)}
          </Typography>
        </Paper>

        {/* Protocol Details Table */}
        <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Qubit #</TableCell>
                <TableCell>Alice Bit</TableCell>
                <TableCell>Alice Basis</TableCell>
                <TableCell>Bob Basis</TableCell>
                <TableCell>Bob Result</TableCell>
                <TableCell>Match</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bb84Result.alice_bits.slice(0, 10).map((bit, index) => (
                <TableRow 
                  key={index}
                  sx={{ 
                    backgroundColor: bb84Result.matching_bases[index] 
                      ? 'rgba(0, 255, 136, 0.1)' 
                      : 'rgba(255, 0, 107, 0.05)'
                  }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{bit}</TableCell>
                  <TableCell>
                    <Chip 
                      label={bb84Result.alice_bases[index] === 0 ? 'Z' : 'X'}
                      size="small"
                      color={bb84Result.alice_bases[index] === 0 ? 'primary' : 'secondary'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={bb84Result.bob_bases[index] === 0 ? 'Z' : 'X'}
                      size="small"
                      color={bb84Result.bob_bases[index] === 0 ? 'primary' : 'secondary'}
                    />
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{bb84Result.bob_results[index]}</TableCell>
                  <TableCell>
                    <Chip 
                      label={bb84Result.matching_bases[index] ? '✓' : '✗'}
                      size="small"
                      color={bb84Result.matching_bases[index] ? 'success' : 'error'}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {bb84Result.alice_bits.length > 10 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', fontStyle: 'italic' }}>
                    ... and {bb84Result.alice_bits.length - 10} more qubits
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </motion.div>
  );
};

export default KeyGenerationPanel;
