import React from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Chip,
  Grid,
  CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';

const EncryptionPanel = ({ encryptionResult, isEncrypting }) => {
  if (isEncrypting) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#00ff88' }}>
            🔒 Encrypting Message...
          </Typography>
          <CircularProgress sx={{ mt: 2, mb: 2 }} />
          <Typography variant="body2" color="textSecondary">
            Applying AES encryption with quantum-derived key
          </Typography>
        </Box>
      </motion.div>
    );
  }

  if (!encryptionResult) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body1">
          Generate a quantum key first to encrypt your message
        </Typography>
      </Box>
    );
  }

  if (!encryptionResult.success) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ color: '#ff006b', mb: 2 }}>
          ❌ Encryption Failed
        </Typography>
        <Typography variant="body2" color="error">
          Error: {encryptionResult.error}
        </Typography>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#00ff88', mb: 3 }}>
          🔒 AES Encryption Results
        </Typography>

        {/* Encryption Statistics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(0, 255, 136, 0.1)' }}>
              <Typography variant="h6" sx={{ color: '#00ff88' }}>
                AES-{encryptionResult.aes_key_length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Encryption Standard
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(0, 212, 255, 0.1)' }}>
              <Typography variant="h6" sx={{ color: '#00d4ff' }}>
                {encryptionResult.key_length} bits
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Quantum Key Used
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Success Indicator */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Chip 
            label="✅ Message Successfully Encrypted"
            color="success"
            sx={{ 
              fontSize: '14px',
              fontWeight: 'bold',
              animation: 'pulse 2s infinite'
            }}
          />
        </Box>

        {/* Encrypted Data Display */}
        <Paper sx={{ p: 2, mb: 3, backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <Typography variant="subtitle1" gutterBottom sx={{ color: '#00ff88' }}>
            Encrypted Ciphertext
          </Typography>
          <Box sx={{ 
            backgroundColor: 'rgba(0, 255, 136, 0.05)',
            p: 2,
            borderRadius: 1,
            border: '1px solid rgba(0, 255, 136, 0.2)'
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                fontSize: '12px',
                lineHeight: 1.5,
                color: '#ffffff'
              }}
            >
              {encryptionResult.ciphertext}
            </Typography>
          </Box>
        </Paper>

        {/* Technical Details */}
        <Paper sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ color: '#8892b0' }}>
            Technical Details
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">
                Initialization Vector (IV):
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  wordBreak: 'break-all',
                  color: '#00d4ff'
                }}
              >
                {encryptionResult.iv}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">
                Encryption Mode:
              </Typography>
              <Typography variant="body2" sx={{ color: '#00ff88' }}>
                AES-GCM (Galois/Counter Mode)
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Security Notice */}
        <Box sx={{ 
          mt: 2, 
          p: 2, 
          backgroundColor: 'rgba(0, 255, 136, 0.1)',
          borderRadius: 1,
          border: '1px solid rgba(0, 255, 136, 0.3)'
        }}>
          <Typography variant="body2" sx={{ color: '#00ff88', textAlign: 'center' }}>
            🛡️ Your message is now quantum-secured using post-quantum cryptography principles
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
};

export default EncryptionPanel;
