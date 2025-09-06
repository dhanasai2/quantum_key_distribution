import React from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(MuiButton)(({ theme, variant }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  padding: '12px 24px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
    transition: 'left 0.5s',
  },
  
  '&:hover::before': {
    left: '100%',
  },
  
  ...(variant === 'quantum' && {
    background: 'linear-gradient(45deg, #00d4ff, #ff006b)',
    color: 'white',
    boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
    
    '&:hover': {
      boxShadow: '0 0 30px rgba(0, 212, 255, 0.5)',
      transform: 'translateY(-2px)',
    },
  }),
}));

const Button = ({ 
  children, 
  loading = false, 
  variant = 'contained',
  quantum = false,
  ...props 
}) => {
  return (
    <StyledButton
      variant={quantum ? 'quantum' : variant}
      disabled={loading}
      {...props}
    >
      {loading && (
        <CircularProgress
          size={20}
          sx={{ 
            position: 'absolute',
            left: '50%',
            top: '50%',
            marginLeft: '-10px',
            marginTop: '-10px'
          }}
        />
      )}
      <span style={{ opacity: loading ? 0 : 1 }}>
        {children}
      </span>
    </StyledButton>
  );
};

export default Button;
