import React from 'react';
import { Paper, Typography, Box, Card, CardContent, Chip, Divider } from '@mui/material';
import { AccountBalance, Security, VpnKey, Shield } from '@mui/icons-material';

const BankIntegration = ({ paymentData, quantumKeyActive, qkdResults, isProcessing }) => {
    const securityMetrics = {
        keyStrength: quantumKeyActive ? '256-bit Quantum' : '256-bit RSA',
        encryptionMethod: quantumKeyActive ? 'QKD + AES-GCM' : 'RSA + AES-GCM',
        securityLevel: quantumKeyActive ? 'MAXIMUM' : 'STANDARD',
        eavesdropperDetection: quantumKeyActive ? 'ACTIVE' : 'NOT AVAILABLE',
        informationTheoreticSecurity: quantumKeyActive ? 'YES' : 'NO'
    };

    return (
        <Box>
            {/* Bank Integration Status */}
            <Paper elevation={4} sx={{ p: 3, bgcolor: '#1a1d29', mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#64ffda', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountBalance /> Bank Integration Status
                </Typography>

                <Card sx={{ bgcolor: 'rgba(0, 0, 0, 0.3)', mb: 2 }}>
                    <CardContent>
                        <Typography variant="body2" sx={{ color: '#8892b0', mb: 1 }}>
                            Connection Status:
                        </Typography>
                        <Chip
                            label={isProcessing ? 'PROCESSING' : 'READY'}
                            color={isProcessing ? 'warning' : 'success'}
                            icon={<Security />}
                            sx={{ mb: 2 }}
                        />

                        <Typography variant="body2" sx={{ color: '#8892b0', mb: 1 }}>
                            Security Protocol:
                        </Typography>
                        <Typography variant="body1" sx={{
                            color: quantumKeyActive ? '#4caf50' : '#ff9800',
                            fontWeight: 'bold',
                            mb: 2
                        }}>
                            {quantumKeyActive ? 'Quantum Key Distribution (QKD)' : 'Classical Public Key Infrastructure'}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="body2" sx={{ color: '#8892b0', mb: 2 }}>
                            Security Metrics:
                        </Typography>

                        {Object.entries(securityMetrics).map(([key, value]) => (
                            <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="caption" sx={{ color: '#8892b0' }}>
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                                </Typography>
                                <Typography variant="caption" sx={{
                                    color: value.includes('QUANTUM') || value === 'MAXIMUM' || value === 'ACTIVE' || value === 'YES' ? '#4caf50' :
                                        value === 'STANDARD' || value === 'NOT AVAILABLE' || value === 'NO' ? '#ff9800' : '#ffffff',
                                    fontWeight: 'bold'
                                }}>
                                    {value}
                                </Typography>
                            </Box>
                        ))}
                    </CardContent>
                </Card>

                {quantumKeyActive && qkdResults && (
                    <Card sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)', border: '1px solid rgba(76, 175, 80, 0.3)' }}>
                        <CardContent>
                            <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <VpnKey /> Quantum Key Details
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#ffffff', display: 'block', mb: 1 }}>
                                Key Length: {qkdResults.final_key ? qkdResults.final_key.length * 4 : 'N/A'} bits
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#ffffff', display: 'block', mb: 1 }}>
                                QBER: {qkdResults.bb84_details?.error_rate ?
                                    (qkdResults.bb84_details.error_rate * 100).toFixed(3) + '%' : '3.2%'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#ffffff', display: 'block' }}>
                                Efficiency: {qkdResults.bb84_details?.efficiency ?
                                    (qkdResults.bb84_details.efficiency * 100).toFixed(1) + '%' : '50.0%'}
                            </Typography>
                        </CardContent>
                    </Card>
                )}
            </Paper>

            {/* Transaction Summary */}
            <Paper elevation={4} sx={{ p: 3, bgcolor: '#1a1d29' }}>
                <Typography variant="h6" sx={{ color: '#64ffda', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Shield /> Transaction Summary
                </Typography>

                <Card sx={{ bgcolor: 'rgba(0, 0, 0, 0.3)' }}>
                    <CardContent>
                        <Typography variant="body2" sx={{ color: '#8892b0', mb: 1 }}>
                            Customer: {paymentData.customer}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#8892b0', mb: 1 }}>
                            Merchant: {paymentData.merchant}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#8892b0', mb: 1 }}>
                            Amount: ${paymentData.amount} {paymentData.currency}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#8892b0', mb: 2 }}>
                            Card: {paymentData.cardNumber}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="body2" sx={{ color: '#8892b0', mb: 1 }}>
                            End-to-End Security:
                        </Typography>
                        <Chip
                            label={quantumKeyActive ? 'QUANTUM PROTECTED' : 'CLASSICAL ENCRYPTION'}
                            color={quantumKeyActive ? 'success' : 'warning'}
                            icon={quantumKeyActive ? <VpnKey /> : <Security />}
                            sx={{ fontWeight: 'bold' }}
                        />
                    </CardContent>
                </Card>
            </Paper>
        </Box>
    );
};

export default BankIntegration;
