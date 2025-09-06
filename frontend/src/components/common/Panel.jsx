import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPanel = styled(Paper)(({ theme, glowColor = '#00d4ff' }) => ({
  background: 'rgba(255, 255, 255, 0.02)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${glowColor}10 0%, transparent 50%, ${glowColor}10 100%)`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
  },
  
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3)`,
    borderColor: `${glowColor}40`,
    
    '&::before': {
      opacity: 1,
    },
  },
}));

const Panel = ({ 
  title, 
  icon,
  children, 
  glowColor = '#00d4ff',
  padding = 3,
  ...props 
}) => {
  return (
    <StyledPanel elevation={3} glowColor={glowColor} {...props}>
      <Box sx={{ p: padding }}>
        {title && (
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              color: glowColor,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 3
            }}
          >
            {icon && <span>{icon}</span>}
            {title}
          </Typography>
        )}
        {children}
      </Box>
    </StyledPanel>
  );
};

export default Panel;
