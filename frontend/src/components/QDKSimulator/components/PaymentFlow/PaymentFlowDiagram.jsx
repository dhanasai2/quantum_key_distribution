import React from 'react';
import { Paper, Typography, Box, Avatar, Chip } from '@mui/material';
import { ArrowForward, Security, CreditCard, AccountBalance, Wifi, StoreMallDirectory } from '@mui/icons-material';

const PaymentFlowDiagram = ({ activeStep, isProcessing, quantumKeyActive, paymentData }) => {
    const nodes = [
        {
            id: 'customer',
            label: 'Customer App/Browser',
            icon: <CreditCard />,
            color: '#2196f3',
            description: `Initiates $${paymentData.amount} payment`
        },
        {
            id: 'merchant',
            label: 'Merchant Server',
            icon: <StoreMallDirectory />,
            color: '#ff9800',
            description: 'Validates & forwards'
        },
        {
            id: 'gateway',
            label: 'Payment Gateway',
            icon: <Security />,
            color: quantumKeyActive ? '#4caf50' : '#f44336',
            description: quantumKeyActive ? 'QKD Channel' : 'Classical Network'
        },
        {
            id: 'bank',
            label: 'Bank Server',
            icon: <AccountBalance />,
            color: quantumKeyActive ? '#4caf50' : '#ff5722',
            description: 'Processes transaction'
        },
        {
            id: 'processing',
            label: 'Bank Processing System',
            icon: <AccountBalance />,
            color: '#9c27b0',
            description: 'Final authorization'
        }
    ];

    return (
        <Paper elevation={4} sx={{ p: 3, bgcolor: '#1a1d29' }}>
            <Typography variant="h6" sx={{ color: '#64ffda', mb: 3 }}>
                🌐 Payment Architecture Flow
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                {nodes.map((node, index) => (
                    <React.Fragment key={node.id}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120 }}>
                            <Avatar
                                sx={{
                                    width: 80,
                                    height: 80,
                                    bgcolor: activeStep >= index ? node.color : '#666',
                                    mb: 1,
                                    border: activeStep === index && isProcessing ? `3px solid ${node.color}` : 'none',
                                    animation: activeStep === index && isProcessing ? 'pulse 2s infinite' : 'none'
                                }}
                            >
                                {node.icon}
                            </Avatar>
                            <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 'bold', textAlign: 'center', mb: 1 }}>
                                {node.label}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#8892b0', textAlign: 'center', mb: 1 }}>
                                {node.description}
                            </Typography>
                            {index === 2 && (
                                <Chip
                                    label={quantumKeyActive ? 'QUANTUM' : 'CLASSICAL'}
                                    size="small"
                                    sx={{
                                        bgcolor: quantumKeyActive ? '#4caf50' : '#f44336',
                                        color: 'white',
                                        fontSize: '0.7rem'
                                    }}
                                />
                            )}
                        </Box>

                        {index < nodes.length - 1 && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <ArrowForward
                                    sx={{
                                        color: activeStep > index ? nodes[index + 1].color : '#666',
                                        fontSize: 30,
                                        animation: activeStep === index + 1 && isProcessing ? 'pulse 1s infinite' : 'none'
                                    }}
                                />
                                <Typography variant="caption" sx={{ color: '#8892b0', mt: 1, textAlign: 'center' }}>
                                    {index === 0 && 'TLS (AES-GCM, PKI)'}
                                    {index === 1 && 'TLS + Quantum AES'}
                                    {index === 2 && (quantumKeyActive ? 'Quantum Channel (QKD)' : 'Classical Network')}
                                    {index === 3 && 'QKD-derived AES'}
                                </Typography>
                            </Box>
                        )}
                    </React.Fragment>
                ))}
            </Box>

            {/* Payment Details */}
            <Box sx={{ p: 2, bgcolor: 'rgba(100, 255, 218, 0.05)', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ color: '#64ffda', mb: 2 }}>
                    💳 Transaction Details
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                    <Box>
                        <Typography variant="body2" sx={{ color: '#8892b0' }}>Amount:</Typography>
                        <Typography variant="h6" sx={{ color: '#ffffff' }}>${paymentData.amount}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" sx={{ color: '#8892b0' }}>Merchant:</Typography>
                        <Typography variant="body1" sx={{ color: '#ffffff' }}>{paymentData.merchant}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" sx={{ color: '#8892b0' }}>Card:</Typography>
                        <Typography variant="body1" sx={{ color: '#ffffff' }}>{paymentData.cardNumber}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" sx={{ color: '#8892b0' }}>Security:</Typography>
                        <Typography variant="body1" sx={{
                            color: quantumKeyActive ? '#4caf50' : '#ff9800',
                            fontWeight: 'bold'
                        }}>
                            {quantumKeyActive ? 'Quantum Secured' : 'Classical TLS'}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.05); }
                }
            `}</style>
        </Paper>
    );
};

export default PaymentFlowDiagram;
