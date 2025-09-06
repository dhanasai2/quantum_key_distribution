import React from 'react';
import { AppBar, Toolbar, Typography, Box, Chip } from '@mui/material';
import { motion } from 'framer-motion';

const Header = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#252837', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <Toolbar>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            🔐 Quantum Key Distribution Simulator
          </Typography>
        </motion.div>
        
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <Chip 
            label="BB84 Protocol" 
            color="primary" 
            variant="outlined" 
            size="small"
          />
          <Chip 
            label="IBM Quantum" 
            color="success" 
            variant="outlined" 
            size="small"
          />
          <Chip 
            label="Real-time" 
            color="secondary" 
            variant="outlined" 
            size="small"
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
