import React from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Chip,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';

const DecryptionPanel = ({ decryptionResult, isDecrypting, originalMessage }) => {
  if (isDecrypting) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#00d4ff' }}>
            🔓 Decrypting Message...
          </Typography>
          <CircularProgress sx={{ mt: 2, mb: 2 }} />
          <Typography variant="body2" color="textSecondary">
            Using quantum key to decrypt received message
          </Typography>
        </Box>
      </motion.div>
    );
  }

  if (!decryptionResult) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body1">
          Encrypt a message first to see decryption results
        </Typography>
      </Box>
    );
  }

  if (!decryptionResult.success) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ color: '#ff006b', mb: 2 }}>
          ❌ Decryption Failed
        </Typography>
        <Alert severity="error">
          Error: {decryptionResult.error}
        </Alert>
      </Box>
    );
  }

  const isMessageIntact = decryptionResult.plaintext === originalMessage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#00d4ff', mb: 3 }}>
          🔓 Message Decryption Results
        </Typography>

        {/* Success/Failure Indicator */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Chip 
            label={isMessageIntact ? "✅ Message Successfully Decrypted!" : "⚠️ Message Integrity Warning"}
            color={isMessageIntact ? 'success' : 'warning'}
            sx={{ 
              fontSize: '16px',
              fontWeight: 'bold',
              p: 2,
              animation: isMessageIntact ? 'pulse 2s infinite' : 'none'
            }}
          />
        </Box>

        {/* Decrypted Message Display */}
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          backgroundColor: isMessageIntact ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 193, 7, 0.1)',
          border: `2px solid ${isMessageIntact ? '#00ff88' : '#ffc107'}`
        }}>
          <Typography variant="subtitle1" gutterBottom sx={{ 
            color: isMessageIntact ? '#00ff88' : '#ffc107' 
          }}>
            Decrypted Message
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold',
              color: isMessageIntact ? '#00ff88' : '#ffc107',
              textAlign: 'center',
              p: 2,
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderRadius: 1,
              wordBreak: 'break-word'
            }}
          >
            "{decryptionResult.plaintext}"
          </Typography>
        </Paper>

        {/* Verification Results */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Paper sx={{ 
              p: 2, 
              textAlign: 'center',
              backgroundColor: isMessageIntact ? 'rgba(0, 255, 136, 0.05)' : 'rgba(255, 193, 7, 0.05)'
            }}>
              <Typography variant="h6" sx={{ 
                color: isMessageIntact ? '#00ff88' : '#ffc107' 
              }}>
                {isMessageIntact ? '✓' : '⚠'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Message Integrity
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(0, 212, 255, 0.05)' }}>
              <Typography variant="h6" sx={{ color: '#00d4ff' }}>
                {decryptionResult.key_length} bits
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Key Length Used
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Message Comparison */}
        <Paper sx={{ p: 2, mb: 3, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ color: '#8892b0' }}>
            Message Verification
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Original Message:
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: 'monospace',
                  backgroundColor: 'rgba(0, 212, 255, 0.1)',
                  p: 1,
                  borderRadius: 1,
                  wordBreak: 'break-word'
                }}
              >
                "{originalMessage}"
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Decrypted Message:
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: 'monospace',
                  backgroundColor: isMessageIntact ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 193, 7, 0.1)',
                  p: 1,
                  borderRadius: 1,
                  wordBreak: 'break-word'
                }}
              >
                "{decryptionResult.plaintext}"
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Security Assessment */}
        {isMessageIntact ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              🛡️ <strong>Quantum Security Verified:</strong> The message was successfully transmitted 
              and decrypted without tampering. The quantum key distribution protocol ensured secure communication.
            </Typography>
          </Alert>
        ) : (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              ⚠️ <strong>Potential Security Issue:</strong> The decrypted message differs from the original. 
              This could indicate eavesdropping or transmission errors in the quantum channel.
            </Typography>
          </Alert>
        )}

        {/* Technical Summary */}
        <Paper sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ color: '#8892b0' }}>
            Quantum Cryptography Summary
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.6 }}>
            This demonstration shows how quantum key distribution (BB84 protocol) enables 
            provably secure communication. The quantum keys are used with classical AES encryption 
            to create a hybrid quantum-classical cryptosystem that provides information-theoretic security.
          </Typography>
        </Paper>
      </Box>
    </motion.div>
  );
};

export default DecryptionPanel;
