import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Switch, 
  FormControlLabel,
  Typography,
  Chip,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';

const InputPanel = ({ 
  message, 
  setMessage, 
  keyLength, 
  setKeyLength, 
  useRealQuantum, 
  setUseRealQuantum,
  numQubits,
  setNumQubits 
}) => {
  const [messageError, setMessageError] = useState('');

  const handleMessageChange = (event) => {
    const value = event.target.value;
    setMessage(value);
    
    if (value.length === 0) {
      setMessageError('Message cannot be empty');
    } else if (value.length > 1000) {
      setMessageError('Message too long (max 1000 characters)');
    } else {
      setMessageError('');
    }
  };

  const handleKeyLengthChange = (event) => {
    const value = parseInt(event.target.value);
    setKeyLength(value);
    
    // Adjust number of qubits based on key length
    setNumQubits(Math.max(value * 3, 32)); // Account for ~50% efficiency
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: 3, border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#00d4ff', mb: 3 }}>
          📝 Input Configuration
        </Typography>
        
        {/* Message Input */}
        <TextField
          fullWidth
          label="Secret Message"
          placeholder="Enter your secret message..."
          value={message}
          onChange={handleMessageChange}
          error={!!messageError}
          helperText={messageError || `${message.length}/1000 characters`}
          multiline
          rows={3}
          sx={{ mb: 3 }}
          variant="outlined"
        />

        {/* Key Length Selection */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Key Length (bytes)</InputLabel>
          <Select
            value={keyLength}
            onChange={handleKeyLengthChange}
            label="Key Length (bytes)"
          >
            <MenuItem value={8}>8 bytes (64 bits)</MenuItem>
            <MenuItem value={16}>16 bytes (128 bits)</MenuItem>
            <MenuItem value={32}>32 bytes (256 bits)</MenuItem>
            <MenuItem value={64}>64 bytes (512 bits)</MenuItem>
          </Select>
        </FormControl>

        {/* Number of Qubits Display */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Quantum Protocol Settings
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Chip 
              label={`${numQubits} qubits`}
              color="primary" 
              size="small"
            />
            <Chip 
              label={`~${Math.floor(numQubits * 0.5)} key bits expected`}
              variant="outlined" 
              size="small"
            />
          </Box>
        </Box>

        {/* Real Quantum Toggle */}
        <FormControlLabel
          control={
            <Switch
              checked={useRealQuantum}
              onChange={(e) => setUseRealQuantum(e.target.checked)}
              color="primary"
            />
          }
          label="Use Real IBM Quantum Hardware"
          sx={{ mb: 2 }}
        />

        {/* Information Alert */}
        {useRealQuantum ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            Real quantum hardware will be used. Execution time may vary based on queue status.
          </Alert>
        ) : (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Using quantum simulator. Add IBM Quantum token for real hardware execution.
          </Alert>
        )}

        {/* Binary Preview */}
        {message && (
          <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 1 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Binary Representation:
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                fontSize: '12px',
                color: '#00d4ff'
              }}
            >
              {message.split('').map(char => 
                char.charCodeAt(0).toString(2).padStart(8, '0')
              ).join(' ')}
            </Typography>
          </Box>
        )}
      </Box>
    </motion.div>
  );
};

export default InputPanel;
