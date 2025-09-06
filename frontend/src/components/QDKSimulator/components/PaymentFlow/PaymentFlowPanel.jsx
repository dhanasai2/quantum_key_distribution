import React, { useState, useEffect } from 'react';
import {
    Paper, Typography, Box, Grid, Card, CardContent, Button,
    Stepper, Step, StepLabel, StepContent, Alert, Chip, LinearProgress,
    Divider, TextField, InputAdornment
} from '@mui/material';
import {
    CreditCard, Security, AccountBalance, Wifi, VpnKey,
    CheckCircle, Warning, PlayArrow, Refresh, Person, Payment
} from '@mui/icons-material';
import PaymentFlowDiagram from './PaymentFlowDiagram';
import TransactionLogger from './TransactionLogger';
import BankIntegration from './BankIntegration';

const PaymentFlowPanel = ({ qkdResults }) => {
    const [activeStep, setActiveStep] = useState(0);

    // **EDITABLE CARD DETAILS STATE**
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '4111 1111 1111 1234',
        expiry: '12/28',
        cvv: '123',
        cardHolder: 'John Doe'
    });

    const [paymentData, setPaymentData] = useState({
        amount: 1500.00,
        currency: 'USD',
        merchant: 'Amazon Store'
    });

    const [transactionLogs, setTransactionLogs] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [quantumKeyActive, setQuantumKeyActive] = useState(Boolean(qkdResults?.final_key));

    useEffect(() => {
        setQuantumKeyActive(Boolean(qkdResults?.final_key));
    }, [qkdResults]);

    // **CARD INPUT HANDLERS WITH REAL-TIME FORMATTING**
    const handleCardNumberChange = (event) => {
        let value = event.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        const formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        if (formattedValue.length <= 19) {
            setCardDetails(prev => ({ ...prev, cardNumber: formattedValue }));
        }
    };

    const handleExpiryChange = (event) => {
        let value = event.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        if (value.length <= 5) {
            setCardDetails(prev => ({ ...prev, expiry: value }));
        }
    };

    const handleCvvChange = (event) => {
        const value = event.target.value.replace(/[^0-9]/g, '');
        if (value.length <= 4) {
            setCardDetails(prev => ({ ...prev, cvv: value }));
        }
    };

    const handleCardHolderChange = (event) => {
        const value = event.target.value.replace(/[^a-zA-Z\s]/g, '');
        setCardDetails(prev => ({ ...prev, cardHolder: value }));
    };

    // **REAL-TIME AMOUNT UPDATE**
    const handleAmountChange = (event) => {
        const value = parseFloat(event.target.value) || 0;
        setPaymentData(prev => ({ ...prev, amount: value }));
    };

    const addTransactionLog = (entry) => {
        setTransactionLogs(prev => [{
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            cardNumber: cardDetails.cardNumber,
            cardHolder: cardDetails.cardHolder,
            amount: paymentData.amount,
            ...entry
        }, ...prev.slice(0, 19)]); // Keep last 20 entries
    };

    // **ENHANCED REAL-TIME PAYMENT SIMULATION**
    const simulatePaymentFlow = async () => {
        setIsProcessing(true);
        setActiveStep(0);
        setTransactionLogs([]); // Clear previous logs

        const steps = [
            {
                title: 'Customer initiates payment',
                encryption: 'TLS (AES-GCM, PKI)',
                duration: 800,
                status: 'success',
                details: `${cardDetails.cardHolder} submits $${paymentData.amount} payment using card ${cardDetails.cardNumber.slice(-4)}`
            },
            {
                title: 'Merchant Server processes',
                encryption: 'TLS + Session Key',
                duration: 600,
                status: 'success',
                details: `${paymentData.merchant} validates order and forwards to gateway`
            },
            {
                title: 'Payment Gateway → Bank',
                encryption: quantumKeyActive ? 'QKD + AES-GCM' : 'Classical RSA + AES',
                duration: 1200,
                status: quantumKeyActive ? 'quantum_secure' : 'warning',
                details: quantumKeyActive ?
                    `Quantum channel established for card ${cardDetails.cardNumber.slice(-4)}` :
                    `Using classical encryption for card ${cardDetails.cardNumber.slice(-4)}`
            },
            {
                title: 'Bank Processing System',
                encryption: quantumKeyActive ? 'QKD-derived AES' : 'Standard AES',
                duration: 1500,
                status: quantumKeyActive ? 'quantum_secure' : 'classical',
                details: `Bank authorizes $${paymentData.amount} transaction for ${cardDetails.cardHolder}`
            },
            {
                title: 'Transaction Complete',
                encryption: 'End-to-End Security Confirmed',
                duration: 400,
                status: 'complete',
                details: `Payment of $${paymentData.amount} successfully processed for ${cardDetails.cardHolder}`
            }
        ];

        for (let i = 0; i < steps.length; i++) {
            setActiveStep(i);

            addTransactionLog({
                step: i + 1,
                action: steps[i].title,
                encryption: steps[i].encryption,
                status: steps[i].status,
                securityLevel: quantumKeyActive ? 'QUANTUM' : 'CLASSICAL',
                details: steps[i].details
            });

            await new Promise(resolve => setTimeout(resolve, steps[i].duration));
        }

        setActiveStep(steps.length);
        setIsProcessing(false);

        addTransactionLog({
            step: 'FINAL',
            action: `✅ Payment of $${paymentData.amount} processed successfully`,
            encryption: quantumKeyActive ? 'Full Quantum Security Chain' : 'Classical Security Chain',
            status: 'complete',
            securityLevel: quantumKeyActive ? 'QUANTUM' : 'CLASSICAL',
            details: `Transaction completed for ${cardDetails.cardHolder} using card ending in ${cardDetails.cardNumber.slice(-4)}`
        });
    };

    const resetSimulation = () => {
        setActiveStep(0);
        setIsProcessing(false);
        setTransactionLogs([]);
    };

    const paymentSteps = [
        {
            label: 'Customer App/Browser',
            description: `${cardDetails.cardHolder} - TLS (AES-GCM, PKI)`,
            icon: <CreditCard />,
            color: '#2196f3'
        },
        {
            label: 'Merchant Server',
            description: `${paymentData.merchant} - TLS + Quantum-enhanced AES`,
            icon: <Wifi />,
            color: '#ff9800'
        },
        {
            label: 'Payment Gateway',
            description: quantumKeyActive ? 'QKD Channel Active' : 'Classical Network',
            icon: <Security />,
            color: quantumKeyActive ? '#4caf50' : '#f44336'
        },
        {
            label: 'Bank Server',
            description: quantumKeyActive ? 'QKD-derived AES' : 'Standard AES',
            icon: <AccountBalance />,
            color: quantumKeyActive ? '#4caf50' : '#ff5722'
        },
        {
            label: 'Processing Complete',
            description: `$${paymentData.amount} - Transaction Authorized`,
            icon: <CheckCircle />,
            color: '#4caf50'
        }
    ];

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Paper elevation={6} sx={{
                p: 3,
                mb: 3,
                background: 'linear-gradient(135deg, #1a1d29, #252837)',
                border: '1px solid rgba(100, 255, 218, 0.3)'
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" sx={{ color: '#64ffda', fontWeight: 'bold', mb: 1 }}>
                            🏦 Real-Time Quantum Payment Gateway
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#8892b0' }}>
                            Live demonstration of quantum-secured financial transactions
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Chip
                            label={quantumKeyActive ? 'QUANTUM SECURED' : 'CLASSICAL MODE'}
                            color={quantumKeyActive ? 'success' : 'warning'}
                            icon={quantumKeyActive ? <VpnKey /> : <Warning />}
                        />
                        <Button
                            variant="contained"
                            onClick={simulatePaymentFlow}
                            disabled={isProcessing || !cardDetails.cardNumber || !cardDetails.cardHolder}
                            startIcon={isProcessing ? <Refresh sx={{ animation: 'spin 1s linear infinite' }} /> : <PlayArrow />}
                            sx={{
                                bgcolor: quantumKeyActive ? '#4caf50' : '#ff9800',
                                '&:hover': {
                                    bgcolor: quantumKeyActive ? '#388e3c' : '#f57c00'
                                }
                            }}
                        >
                            {isProcessing ? 'Processing Payment...' : 'Start Payment Simulation'}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={resetSimulation}
                            startIcon={<Refresh />}
                            sx={{ borderColor: '#64ffda', color: '#64ffda' }}
                        >
                            Reset
                        </Button>
                    </Box>
                </Box>

                {!quantumKeyActive && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        ⚠️ No quantum key detected. Generate a quantum key in the "Quantum Generation" tab for enhanced security demonstration.
                    </Alert>
                )}
            </Paper>

            <Grid container spacing={3}>
                {/* Card Details Input - Left Side */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={4} sx={{ p: 3, bgcolor: '#1a1d29', mb: 3 }}>
                        <Typography variant="h6" sx={{ color: '#64ffda', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                            💳 Enter Your Card Details
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Card Number"
                                    value={cardDetails.cardNumber}
                                    onChange={handleCardNumberChange}
                                    placeholder="1234 5678 9012 3456"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <CreditCard sx={{ color: '#64ffda' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            color: 'white',
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            '& fieldset': {
                                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                            },
                                            '&:hover fieldset': { borderColor: '#64ffda' },
                                            '&.Mui-focused fieldset': { borderColor: '#64ffda' }
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            '&.Mui-focused': { color: '#64ffda' }
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Expiry Date"
                                    value={cardDetails.expiry}
                                    onChange={handleExpiryChange}
                                    placeholder="MM/YY"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            color: 'white',
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            '& fieldset': {
                                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                            },
                                            '&:hover fieldset': { borderColor: '#64ffda' },
                                            '&.Mui-focused fieldset': { borderColor: '#64ffda' }
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            '&.Mui-focused': { color: '#64ffda' }
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="CVV"
                                    value={cardDetails.cvv}
                                    onChange={handleCvvChange}
                                    placeholder="123"
                                    type="password"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            color: 'white',
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            '& fieldset': {
                                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                            },
                                            '&:hover fieldset': { borderColor: '#64ffda' },
                                            '&.Mui-focused fieldset': { borderColor: '#64ffda' }
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            '&.Mui-focused': { color: '#64ffda' }
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Cardholder Name"
                                    value={cardDetails.cardHolder}
                                    onChange={handleCardHolderChange}
                                    placeholder="John Doe"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Person sx={{ color: '#64ffda' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            color: 'white',
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            '& fieldset': {
                                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                            },
                                            '&:hover fieldset': { borderColor: '#64ffda' },
                                            '&.Mui-focused fieldset': { borderColor: '#64ffda' }
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            '&.Mui-focused': { color: '#64ffda' }
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Payment Amount"
                                    type="number"
                                    value={paymentData.amount}
                                    onChange={handleAmountChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Payment sx={{ color: '#64ffda' }} />
                                                <Typography sx={{ color: '#64ffda', ml: 0.5 }}>$</Typography>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            color: 'white',
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            '& fieldset': {
                                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                            },
                                            '&:hover fieldset': { borderColor: '#64ffda' },
                                            '&.Mui-focused fieldset': { borderColor: '#64ffda' }
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            '&.Mui-focused': { color: '#64ffda' }
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>

                        {/* Real-time Card Preview */}
                        <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(100, 255, 218, 0.05)', borderRadius: 2 }}>
                            <Typography variant="body2" sx={{ color: '#64ffda', mb: 1, fontWeight: 'bold' }}>
                                🎯 Real-time Preview:
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#ffffff' }}>
                                Card: {cardDetails.cardNumber || '**** **** **** ****'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#ffffff' }}>
                                Holder: {cardDetails.cardHolder || 'CARDHOLDER NAME'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#ffffff' }}>
                                Expiry: {cardDetails.expiry || 'MM/YY'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#ffffff' }}>
                                Amount: ${paymentData.amount || 0}
                            </Typography>
                        </Box>
                    </Paper>

                    {/* Bank Integration */}
                    <BankIntegration
                        paymentData={{ ...paymentData, ...cardDetails }}
                        quantumKeyActive={quantumKeyActive}
                        qkdResults={qkdResults}
                        isProcessing={isProcessing}
                    />
                </Grid>

                {/* Payment Flow Visualization - Right Side */}
                <Grid item xs={12} md={8}>
                    <PaymentFlowDiagram
                        activeStep={activeStep}
                        isProcessing={isProcessing}
                        quantumKeyActive={quantumKeyActive}
                        paymentData={{ ...paymentData, ...cardDetails }}
                    />

                    {/* Real-time Transaction Stepper */}
                    <Paper elevation={4} sx={{ p: 3, mt: 3, bgcolor: '#1a1d29' }}>
                        <Typography variant="h6" sx={{ color: '#64ffda', mb: 2 }}>
                            🔄 Real-time Transaction Flow
                        </Typography>
                        <Stepper activeStep={activeStep} orientation="vertical">
                            {paymentSteps.map((step, index) => (
                                <Step key={index}>
                                    <StepLabel
                                        icon={
                                            <Box sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                bgcolor: activeStep >= index ? step.color : '#666',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white'
                                            }}>
                                                {step.icon}
                                            </Box>
                                        }
                                    >
                                        <Typography sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                                            {step.label}
                                        </Typography>
                                    </StepLabel>
                                    <StepContent>
                                        <Typography sx={{ color: '#8892b0' }}>
                                            {step.description}
                                        </Typography>
                                        {index === 2 && (
                                            <Alert
                                                severity={quantumKeyActive ? "success" : "warning"}
                                                sx={{ mt: 1 }}
                                            >
                                                {quantumKeyActive
                                                    ? "🔐 Quantum channel established - Maximum security level"
                                                    : "⚠️ Using classical encryption - Generate quantum key for enhanced security"
                                                }
                                            </Alert>
                                        )}
                                        {isProcessing && activeStep === index && (
                                            <LinearProgress
                                                sx={{
                                                    mt: 2,
                                                    '& .MuiLinearProgress-bar': {
                                                        backgroundColor: step.color
                                                    }
                                                }}
                                            />
                                        )}
                                    </StepContent>
                                </Step>
                            ))}
                        </Stepper>
                    </Paper>
                </Grid>

                {/* Transaction Logs */}
                <Grid item xs={12}>
                    <TransactionLogger
                        logs={transactionLogs}
                        quantumKeyActive={quantumKeyActive}
                        cardDetails={cardDetails}
                    />
                </Grid>
            </Grid>

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </Box>
    );
};

export default PaymentFlowPanel;
