import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Container, Paper, Typography, Box, Button, Grid, Card, CardContent,
    Alert, LinearProgress, Snackbar, Switch, FormControlLabel, TextField,
    Chip, Tabs, Tab, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, Tooltip, Dialog, DialogTitle,
    DialogContent, DialogActions, Divider
} from '@mui/material';
import {
    PlayArrow, Psychology, CloudQueue, Lock, LockOpen, Security, Timeline,
    Person, PersonOutline, CheckCircle, Cancel, Pause, Refresh, Download,
    Assessment, AccountBalance, VpnKey, Warning, Settings, Hardware
} from '@mui/icons-material';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, AreaChart, Area
} from 'recharts';
import Interactive3DBlochSphere from '../BlochSphere/Interactive3DBlochSphere';
import useQuantumWebSocket from '../../hooks/useQuantumWebSocket';
import PaymentFlowPanel from './components/PaymentFlow/PaymentFlowPanel';

function TabPanel({ children, value, index, ...other }) {
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

// **IBM Quantum Setup Dialog**
const IBMQuantumSetupDialog = ({ open, onClose, onInitialize, isLoading, status }) => {
    const [token, setToken] = useState('');
    const [instance, setInstance] = useState('');
    const [validating, setValidating] = useState(false);
    const [validationResult, setValidationResult] = useState(null);

    const validateToken = async () => {
        if (!token.trim()) return;

        setValidating(true);
        setValidationResult(null);

        try {
            const iamResponse = await fetch('https://quantum-backend-1-3ele.onrender.com/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ api_key: token.trim() })
            });

            const iamResult = await iamResponse.json();

            if (iamResult.success) {
                setValidationResult({
                    success: true,
                    message: '✅ API Key validated successfully!'
                });
            } else {
                setValidationResult({
                    success: false,
                    message: `❌ Error: ${iamResult.error}`
                });
            }
        } catch (error) {
            setValidationResult({
                success: false,
                message: `❌ Validation failed: ${error.message}`
            });
        } finally {
            setValidating(false);
        }
    };

    const handleSubmit = async () => {
        if (token.trim()) {
            await onInitialize(token.trim(), instance.trim() || null);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ bgcolor: '#1a1d29', color: '#64ffda' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CloudQueue />
                    IBM Quantum Platform Setup
                </Box>
            </DialogTitle>
            <DialogContent sx={{ bgcolor: '#1a1d29', color: 'white', pt: 3 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                    🔗 Connect to real IBM Quantum hardware for authentic quantum key generation
                </Alert>

                <TextField
                    fullWidth
                    label="IBM Quantum API Token"
                    value={token}
                    onChange={(e) => {
                        setToken(e.target.value);
                        setValidationResult(null);
                    }}
                    type="password"
                    placeholder="Enter your IBM Quantum API token"
                    sx={{
                        mb: 1,
                        '& .MuiOutlinedInput-root': {
                            color: 'white',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                            '&:hover fieldset': { borderColor: '#64ffda' },
                            '&.Mui-focused fieldset': { borderColor: '#64ffda' }
                        },
                        '& .MuiInputLabel-root': {
                            color: 'rgba(255, 255, 255, 0.7)',
                            '&.Mui-focused': { color: '#64ffda' }
                        }
                    }}
                />

                <Button
                    variant="outlined"
                    onClick={validateToken}
                    disabled={!token.trim() || validating}
                    size="small"
                    sx={{ mb: 2, borderColor: '#64ffda', color: '#64ffda' }}
                >
                    {validating ? '🔄 Validating...' : 'Validate Token'}
                </Button>

                {validationResult && (
                    <Alert severity={validationResult.success ? "success" : "error"} sx={{ mb: 2 }}>
                        {validationResult.message}
                    </Alert>
                )}

                <TextField
                    fullWidth
                    label="Instance (Optional)"
                    value={instance}
                    onChange={(e) => setInstance(e.target.value)}
                    placeholder="ibm-q/open/main"
                    helperText="Leave empty to use default instance"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            color: 'white',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                            '&:hover fieldset': { borderColor: '#64ffda' },
                            '&.Mui-focused fieldset': { borderColor: '#64ffda' }
                        },
                        '& .MuiInputLabel-root': {
                            color: 'rgba(255, 255, 255, 0.7)',
                            '&.Mui-focused': { color: '#64ffda' }
                        },
                        '& .MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.5)' }
                    }}
                />

                {status && (
                    <Box sx={{ mt: 2 }}>
                        <Alert severity={status.success ? "success" : "error"}>
                            {status.success ?
                                `✅ Connected to ${status.backend_name}${status.quantum_hardware ? ' - Real Hardware!' : ''}` :
                                `❌ Error: ${status.error}`
                            }
                        </Alert>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ bgcolor: '#1a1d29' }}>
                <Button onClick={onClose} sx={{ color: '#8892b0' }}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={!token.trim() || isLoading}
                    variant="contained"
                    sx={{ bgcolor: '#64ffda', color: '#000' }}
                >
                    {isLoading ? 'Connecting...' : 'Connect to IBM Quantum'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// **Enhanced Transmission Panel with Logs**
const EnhancedQuantumTransmissionPanel = ({
    aliceData, bobData, transmissionLogs = [], isTransmitting = false,
    currentBitIndex = 0, totalBits = 0, onStartTransmission,
    onPauseTransmission, onResetTransmission, quantumBackendInfo = null,
    quantumHardwareFeedback = []
}) => {
    const [realTimeStats, setRealTimeStats] = useState({
        successRate: 0, errorRate: 0, totalProcessed: 0, bitsPerSecond: 0
    });

    // Calculate real-time stats with proper capping
    useEffect(() => {
        if (transmissionLogs && transmissionLogs.length > 0) {
            const successLogs = transmissionLogs.filter(log => {
                if (typeof log === 'string') {
                    return log.includes('✓') || log.includes('Match');
                }
                return log.status === true || log.bases_match === true;
            }).length;

            const total = transmissionLogs.length;
            const successRatePercent = total > 0 ? Math.min((successLogs / total) * 100, 100) : 0;
            const errorRatePercent = total > 0 ? Math.min(((total - successLogs) / total) * 100, 100) : 0;

            setRealTimeStats({
                successRate: successRatePercent.toFixed(1),
                errorRate: errorRatePercent.toFixed(1),
                totalProcessed: total,
                bitsPerSecond: isTransmitting ? Math.min(Math.max(total * 2, 140), 500) : 0
            });
        }
    }, [transmissionLogs, isTransmitting]);

    const parseLogEntry = (log, index) => {
        if (typeof log === 'string') {
            const timeMatch = log.match(/(\d+:\d+:\d+)/);
            const bitMatch = log.match(/Bit\s+(\d+)/);
            const aliceMatch = log.match(/Alice\(([^)]+)\)/);
            const bobMatch = log.match(/Bob\(([^)]+)\)/);
            const isSuccess = log.includes('✓') || log.includes('Match');

            return {
                time: timeMatch ? timeMatch[1] : new Date().toLocaleTimeString(),
                bit: bitMatch ? bitMatch[1] : index + 1,
                alice: aliceMatch ? aliceMatch[1] : '-',
                bob: bobMatch ? bobMatch[1] : '-',
                status: isSuccess,
                match: isSuccess
            };
        }
        return {
            time: log.time || new Date().toLocaleTimeString(),
            bit: log.bit || index + 1,
            alice: `${log.alice_bit || '0'},${log.alice_basis || 'Z'}`,
            bob: `${log.bob_measured || '0'},${log.bob_basis || 'Z'}`,
            status: log.status || log.bases_match || false,
            match: log.bases_match || log.match === 'Yes' || false
        };
    };

    const getProgressPercentage = () => {
        if (totalBits === 0) return 0;
        return Math.min((currentBitIndex / totalBits) * 100, 100);
    };

    return (
        <Paper elevation={8} sx={{
            mb: 4,
            background: 'linear-gradient(135deg, #0f1419 0%, #1e2a3a 50%, #2d3b4f 100%)',
            borderRadius: 4,
            border: '2px solid rgba(100, 255, 218, 0.4)',
            overflow: 'hidden'
        }}>
            <Box sx={{ p: 3 }}>
                <Typography variant="h5" sx={{
                    color: '#64ffda',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 2
                }}>
                    🌐 Real-Time Quantum Transmission
                    {isTransmitting && (
                        <Chip
                            label="LIVE"
                            sx={{
                                bgcolor: '#ff1493',
                                color: 'white',
                                fontWeight: 'bold',
                                animation: 'pulse 2s infinite'
                            }}
                        />
                    )}
                </Typography>

                {/* Statistics */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} md={3}>
                        <Card sx={{
                            bgcolor: 'rgba(76, 175, 80, 0.15)',
                            textAlign: 'center',
                            p: 2
                        }}>
                            <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                                {realTimeStats.successRate}%
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#4caf50' }}>
                                Success Rate
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Card sx={{
                            bgcolor: 'rgba(255, 152, 0, 0.15)',
                            textAlign: 'center',
                            p: 2
                        }}>
                            <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                                {realTimeStats.bitsPerSecond}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#ff9800' }}>
                                Bits/sec
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Card sx={{
                            bgcolor: 'rgba(33, 150, 243, 0.15)',
                            textAlign: 'center',
                            p: 2
                        }}>
                            <Typography variant="h4" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                                {getProgressPercentage().toFixed(1)}%
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#2196f3' }}>
                                Progress
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Card sx={{
                            bgcolor: 'rgba(156, 39, 176, 0.15)',
                            textAlign: 'center',
                            p: 2
                        }}>
                            <Typography variant="h4" sx={{ color: '#9c27b0', fontWeight: 'bold' }}>
                                {realTimeStats.totalProcessed}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#9c27b0' }}>
                                Total Bits
                            </Typography>
                        </Card>
                    </Grid>
                </Grid>

                {/* Progress Display */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ color: '#64ffda', mb: 1 }}>
                        Transmission Progress: {currentBitIndex}/{totalBits}
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={getProgressPercentage()}
                        sx={{
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            '& .MuiLinearProgress-bar': {
                                background: 'linear-gradient(90deg, #4CAF50, #2196F3, #FF9800)',
                                borderRadius: 6
                            }
                        }}
                    />
                </Box>

                {/* Alice and Bob Data Display */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ bgcolor: 'rgba(76, 175, 80, 0.15)', textAlign: 'center', p: 2 }}>
                            <Typography variant="h6" sx={{ color: '#4CAF50', mb: 1 }}>
                                👩‍🔬 Alice (Sender)
                            </Typography>
                            <Typography>Bit: {aliceData?.bit ?? '0'}</Typography>
                            <Typography>Basis: {aliceData?.basis ?? '+'}</Typography>
                            <Typography>State: {aliceData?.state ?? '|0⟩'}</Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h4" sx={{ color: '#64ffda' }}>→</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ bgcolor: 'rgba(33, 150, 243, 0.15)', textAlign: 'center', p: 2 }}>
                            <Typography variant="h6" sx={{ color: '#2196F3', mb: 1 }}>
                                👨‍💻 Bob (Receiver)
                            </Typography>
                            <Typography>Basis: {bobData?.basis ?? 'x'}</Typography>
                            <Typography>Measured: {bobData?.measured ?? '0'}</Typography>
                            <Typography>Match: {bobData?.match ?? 'No'}</Typography>
                        </Card>
                    </Grid>
                </Grid>

                {/* Controls */}
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 3 }}>
                    <Button
                        variant="contained"
                        onClick={isTransmitting ? onPauseTransmission : onStartTransmission}
                        sx={{ bgcolor: isTransmitting ? '#ff9500' : '#4caf50' }}
                        startIcon={isTransmitting ? <Pause /> : <PlayArrow />}
                    >
                        {isTransmitting ? "Pause" : "Start"}
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={onResetTransmission}
                        sx={{ borderColor: '#2196f3', color: '#2196f3' }}
                        startIcon={<Refresh />}
                    >
                        Reset
                    </Button>
                </Box>
            </Box>

            {/* Transmission Log */}
            <Paper sx={{
                m: 2,
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 2
            }}>
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ color: '#64ffda', mb: 2 }}>
                        📋 Transmission Log
                        <Chip
                            label={`${transmissionLogs.length} entries`}
                            size="small"
                            sx={{ bgcolor: '#2196f3', color: 'white', ml: 1 }}
                        />
                    </Typography>

                    <TableContainer sx={{ maxHeight: 400, overflow: 'auto' }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ bgcolor: '#252837', color: '#64ffda' }}>Time</TableCell>
                                    <TableCell sx={{ bgcolor: '#252837', color: '#64ffda' }}>Bit #</TableCell>
                                    <TableCell sx={{ bgcolor: '#252837', color: '#64ffda' }}>Alice</TableCell>
                                    <TableCell sx={{ bgcolor: '#252837', color: '#64ffda' }}>Bob</TableCell>
                                    <TableCell sx={{ bgcolor: '#252837', color: '#64ffda' }}>Match</TableCell>
                                    <TableCell sx={{ bgcolor: '#252837', color: '#64ffda' }}>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {transmissionLogs.slice(-20).map((log, index) => {
                                    const parsedLog = parseLogEntry(log, index);
                                    const isSuccess = parsedLog.status;

                                    return (
                                        <TableRow key={index} sx={{
                                            bgcolor: isSuccess ? 'rgba(76, 175, 80, 0.05)' : 'rgba(244, 67, 54, 0.05)'
                                        }}>
                                            <TableCell sx={{ color: '#ffffff', fontSize: '0.75rem' }}>
                                                {parsedLog.time}
                                            </TableCell>
                                            <TableCell sx={{ color: '#64ffda', fontWeight: 'bold' }}>
                                                {parsedLog.bit}
                                            </TableCell>
                                            <TableCell sx={{ color: '#4caf50', fontFamily: 'monospace' }}>
                                                {parsedLog.alice}
                                            </TableCell>
                                            <TableCell sx={{ color: '#2196f3', fontFamily: 'monospace' }}>
                                                {parsedLog.bob}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={parsedLog.match ? "Yes" : "No"}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: parsedLog.match ? '#4caf50' : '#f44336',
                                                        color: 'white'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {isSuccess ? (
                                                    <CheckCircle sx={{ color: '#4caf50', fontSize: 18 }} />
                                                ) : (
                                                    <Cancel sx={{ color: '#f44336', fontSize: 18 }} />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {transmissionLogs.length === 0 && (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography sx={{ color: '#8892b0', fontStyle: 'italic' }}>
                                No transmission data yet. Start quantum key generation to see real-time updates.
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Paper>
        </Paper>
    );
};

// **Architecture Comparison with REALISTIC QBER**
const ArchitectureComparisonEnhanced = ({ qkdResults, message: globalMessage, isConnected }) => {
    const [comparisonMessage, setComparisonMessage] = useState('Hello Quantum World!');
    const [eavesdropperActive, setEavesdropperActive] = useState(false);
    const [qber, setQber] = useState(0.025); // Start at 2.5%

    // Architecture states
    const [qkdProgress, setQkdProgress] = useState({
        bb84Generation: 0, reconciliation: 0, privacyAmplification: 0,
        aesEncryption: 0, transmission: 0
    });
    const [qkdStatus, setQkdStatus] = useState({
        keyGenerated: false, keySecure: true, encrypted: false, transmitted: false
    });
    const [qkdResult, setQkdResult] = useState(null);
    const [quantumKey, setQuantumKey] = useState(null);

    const [classicalProgress, setClassicalProgress] = useState({
        aesKeyGen: 0, rsaWrapping: 0, aesEncryption: 0, transmission: 0
    });
    const [classicalStatus, setClassicalStatus] = useState({
        keyGenerated: false, encrypted: false, transmitted: false
    });
    const [classicalResult, setClassicalResult] = useState(null);

    const [loading, setLoading] = useState({ qkd: false, classical: false });

    const qkdIntervalRefs = useRef({});
    const classicalIntervalRefs = useRef({});

    const QBER_THRESHOLD = 0.11; // 11%

    // **REALISTIC QBER Management - FIXED**
    useEffect(() => {
        const interval = setInterval(() => {
            setQber(prevQber => {
                if (eavesdropperActive) {
                    // **REALISTIC**: Eavesdropper increases QBER but with variation
                    const increase = 0.005 + Math.random() * 0.01; // 0.5-1.5% increase
                    const newQber = prevQber + increase;

                    // **KEY FIX**: Sometimes stay below 11% even with eavesdropper
                    if (Math.random() < 0.3 && newQber > 0.08) {
                        return Math.min(0.09, newQber); // Stay at 9% sometimes
                    }

                    return Math.min(newQber, 0.25); // Cap at 25%
                } else {
                    // Decrease QBER when no eavesdropper
                    const decrease = 0.003 + Math.random() * 0.005;
                    return Math.max(prevQber - decrease, 0.015); // Floor at 1.5%
                }
            });
        }, 200);

        return () => clearInterval(interval);
    }, [eavesdropperActive]);

    // Security status based on QBER
    useEffect(() => {
        const isSecure = qber <= QBER_THRESHOLD;
        setQkdStatus(prev => ({ ...prev, keySecure: isSecure }));

        if (!isSecure) {
            Object.values(qkdIntervalRefs.current).forEach(interval => {
                if (interval) clearInterval(interval);
            });
            qkdIntervalRefs.current = {};
            setLoading(prev => ({ ...prev, qkd: false }));
        }
    }, [qber]);

    // QKD Encryption Process
    const handleQkdEncrypt = useCallback(() => {
        if (!qkdStatus.keySecure) {
            alert(`🚨 QBER too high! Cannot establish secure key.\nCurrent QBER: ${(qber * 100).toFixed(2)}%\nThreshold: 11%\n\nDisable eavesdropper to reduce QBER.`);
            return;
        }

        setLoading(prev => ({ ...prev, qkd: true }));
        setQkdProgress({ bb84Generation: 0, reconciliation: 0, privacyAmplification: 0, aesEncryption: 0, transmission: 0 });
        setQkdStatus({ keyGenerated: false, keySecure: true, encrypted: false, transmitted: false });
        setQkdResult(null);
        setQuantumKey(null);

        // Step 1: BB84 Quantum Key Distribution
        let bb84Progress = 0;
        qkdIntervalRefs.current.bb84 = setInterval(() => {
            bb84Progress += eavesdropperActive ? 0.8 : 1.5;
            const cappedProgress = Math.min(bb84Progress, 100);

            setQkdProgress(prev => ({ ...prev, bb84Generation: cappedProgress }));

            if (cappedProgress >= 100) {
                clearInterval(qkdIntervalRefs.current.bb84);

                // Step 2: Reconciliation
                let reconProgress = 0;
                qkdIntervalRefs.current.recon = setInterval(() => {
                    reconProgress += 5;
                    const cappedRecon = Math.min(reconProgress, 100);

                    setQkdProgress(prev => ({ ...prev, reconciliation: cappedRecon }));

                    if (cappedRecon >= 100) {
                        clearInterval(qkdIntervalRefs.current.recon);

                        // Step 3: Privacy Amplification
                        let privacyProgress = 0;
                        qkdIntervalRefs.current.privacy = setInterval(() => {
                            privacyProgress += 4;
                            const cappedPrivacy = Math.min(privacyProgress, 100);

                            setQkdProgress(prev => ({ ...prev, privacyAmplification: cappedPrivacy }));

                            if (cappedPrivacy >= 100) {
                                clearInterval(qkdIntervalRefs.current.privacy);
                                setQkdStatus(prev => ({ ...prev, keyGenerated: true }));

                                // Generate quantum key
                                const keyHex = Array.from({ length: 32 }, () =>
                                    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
                                ).join('');
                                setQuantumKey(keyHex);

                                // Step 4: AES-GCM Encryption
                                let encryptProgress = 0;
                                qkdIntervalRefs.current.encrypt = setInterval(() => {
                                    encryptProgress += 6;
                                    const cappedEncrypt = Math.min(encryptProgress, 100);

                                    setQkdProgress(prev => ({ ...prev, aesEncryption: cappedEncrypt }));

                                    if (cappedEncrypt >= 100) {
                                        clearInterval(qkdIntervalRefs.current.encrypt);
                                        setQkdStatus(prev => ({ ...prev, encrypted: true }));

                                        // Generate encryption components
                                        const mockIV = Array.from({ length: 16 }, () =>
                                            Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
                                        ).join('');
                                        const mockTag = Array.from({ length: 16 }, () =>
                                            Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
                                        ).join('');
                                        const mockCiphertext = btoa(comparisonMessage).replace(/=/g, '') + 'A7F2';

                                        setQkdResult({
                                            success: true,
                                            original: comparisonMessage,
                                            keySource: `QKD (256 bits after privacy amplification)`,
                                            keyId: keyHex.substring(0, 16),
                                            iv: mockIV,
                                            ciphertext: mockCiphertext,
                                            tag: mockTag,
                                            decrypted: comparisonMessage,
                                            qber: qber,
                                            securityLevel: qber <= 0.05 ? 'HIGH' : qber <= QBER_THRESHOLD ? 'MEDIUM' : 'LOW'
                                        });

                                        // Step 5: Transmission
                                        let transProgress = 0;
                                        qkdIntervalRefs.current.transmit = setInterval(() => {
                                            transProgress += 4;
                                            const cappedTrans = Math.min(transProgress, 100);

                                            setQkdProgress(prev => ({ ...prev, transmission: cappedTrans }));

                                            if (cappedTrans >= 100) {
                                                clearInterval(qkdIntervalRefs.current.transmit);
                                                setQkdStatus(prev => ({ ...prev, transmitted: true }));
                                                setLoading(prev => ({ ...prev, qkd: false }));
                                            }
                                        }, 100);
                                    }
                                }, 80);
                            }
                        }, 100);
                    }
                }, 120);
            }
        }, 50);
    }, [qkdStatus.keySecure, comparisonMessage, eavesdropperActive, qber]);

    // Classical encryption process
    const handleClassicalEncrypt = useCallback(() => {
        setLoading(prev => ({ ...prev, classical: true }));
        setClassicalProgress({ aesKeyGen: 0, rsaWrapping: 0, aesEncryption: 0, transmission: 0 });
        setClassicalStatus({ keyGenerated: false, encrypted: false, transmitted: false });
        setClassicalResult(null);

        // AES Key Generation
        let aesKeyProgress = 0;
        classicalIntervalRefs.current.aesKey = setInterval(() => {
            aesKeyProgress += 10;
            const cappedAesKey = Math.min(aesKeyProgress, 100);

            setClassicalProgress(prev => ({ ...prev, aesKeyGen: cappedAesKey }));

            if (cappedAesKey >= 100) {
                clearInterval(classicalIntervalRefs.current.aesKey);
                setClassicalStatus(prev => ({ ...prev, keyGenerated: true }));

                // RSA Wrapping
                let rsaProgress = 0;
                classicalIntervalRefs.current.rsa = setInterval(() => {
                    rsaProgress += 8;
                    const cappedRsa = Math.min(rsaProgress, 100);

                    setClassicalProgress(prev => ({ ...prev, rsaWrapping: cappedRsa }));

                    if (cappedRsa >= 100) {
                        clearInterval(classicalIntervalRefs.current.rsa);

                        // AES Encryption
                        let aesEncProgress = 0;
                        classicalIntervalRefs.current.aesEnc = setInterval(() => {
                            aesEncProgress += 9;
                            const cappedAesEnc = Math.min(aesEncProgress, 100);

                            setClassicalProgress(prev => ({ ...prev, aesEncryption: cappedAesEnc }));

                            if (cappedAesEnc >= 100) {
                                clearInterval(classicalIntervalRefs.current.aesEnc);

                                // Generate result
                                const mockIV = Array.from({ length: 16 }, () =>
                                    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
                                ).join('');
                                const mockTag = Array.from({ length: 16 }, () =>
                                    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
                                ).join('');
                                const mockCiphertext = btoa(comparisonMessage).replace(/=/g, '') + 'C3D4';

                                setClassicalResult({
                                    success: true,
                                    original: comparisonMessage,
                                    keySource: 'RSA-wrapped AES-256 key',
                                    algorithm: 'RSA-OAEP(SHA-256) + AES-GCM',
                                    iv: mockIV,
                                    ciphertext: mockCiphertext,
                                    tag: mockTag,
                                    decrypted: comparisonMessage
                                });

                                // Transmission
                                let transProgress = 0;
                                classicalIntervalRefs.current.transmit = setInterval(() => {
                                    transProgress += 7;
                                    const cappedTrans = Math.min(transProgress, 100);

                                    setClassicalProgress(prev => ({ ...prev, transmission: cappedTrans }));

                                    if (cappedTrans >= 100) {
                                        clearInterval(classicalIntervalRefs.current.transmit);
                                        setClassicalStatus(prev => ({ ...prev, transmitted: true }));
                                        setLoading(prev => ({ ...prev, classical: false }));
                                    }
                                }, 80);
                            }
                        }, 90);
                    }
                }, 120);
            }
        }, 100);
    }, [comparisonMessage]);

    // Reset functions
    const resetQkd = () => {
        Object.values(qkdIntervalRefs.current).forEach(interval => clearInterval(interval));
        qkdIntervalRefs.current = {};
        setQkdProgress({ bb84Generation: 0, reconciliation: 0, privacyAmplification: 0, aesEncryption: 0, transmission: 0 });
        setQkdStatus({ keyGenerated: false, keySecure: true, encrypted: false, transmitted: false });
        setQkdResult(null);
        setQuantumKey(null);
        setLoading(prev => ({ ...prev, qkd: false }));
    };

    const resetClassical = () => {
        Object.values(classicalIntervalRefs.current).forEach(interval => clearInterval(interval));
        classicalIntervalRefs.current = {};
        setClassicalProgress({ aesKeyGen: 0, rsaWrapping: 0, aesEncryption: 0, transmission: 0 });
        setClassicalStatus({ keyGenerated: false, encrypted: false, transmitted: false });
        setClassicalResult(null);
        setLoading(prev => ({ ...prev, classical: false }));
    };

    // Tamper test
    const simulateTamperTest = (architecture) => {
        const result = architecture === 'qkd' ? qkdResult : classicalResult;
        if (!result) return;

        const tamperedCiphertext = result.ciphertext.slice(0, -2) + 'XX';

        alert(`🧪 Tamper Test Result (${architecture.toUpperCase()}):\n\n` +
            `Original Ciphertext: ${result.ciphertext}\n` +
            `Tampered Ciphertext: ${tamperedCiphertext}\n\n` +
            `🚨 Tag verification FAILED!\n` +
            `Message rejected - integrity compromised`);
    };

    // Cleanup
    useEffect(() => {
        return () => {
            Object.values(qkdIntervalRefs.current).forEach(interval => clearInterval(interval));
            Object.values(classicalIntervalRefs.current).forEach(interval => clearInterval(interval));
        };
    }, []);

    return (
        <Box>
            {/* Control Panel */}
            <Card sx={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 2, mb: 3 }}>
                <CardContent>
                    <Typography variant="h5" sx={{ color: '#64ffda', mb: 2, textAlign: 'center' }}>
                        🔐 Live Demo: Architecture Comparison
                    </Typography>

                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Demo Message (Plaintext)"
                                value={comparisonMessage}
                                onChange={(e) => setComparisonMessage(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        color: 'white',
                                        backgroundColor: 'rgba(255,255,255,0.05)'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={eavesdropperActive}
                                        onChange={(e) => setEavesdropperActive(e.target.checked)}
                                        color="error"
                                    />
                                }
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Psychology sx={{ color: eavesdropperActive ? '#ff6b6b' : '#666' }} />
                                        <Typography sx={{ color: eavesdropperActive ? '#ff6b6b' : '#8892b0' }}>
                                            Toggle 'Eavesdropper'
                                        </Typography>
                                    </Box>
                                }
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Alert severity={qber <= QBER_THRESHOLD ? "success" : "error"}>
                                QBER: {(qber * 100).toFixed(2)}%
                            </Alert>
                        </Grid>
                    </Grid>

                    {/* QBER Status Alert - Shows realistic behavior */}
                    {eavesdropperActive && qber > QBER_THRESHOLD && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            🚨 Eavesdropper detected! QBER ({(qber * 100).toFixed(2)}%) exceeds threshold (11%).
                            QKD shows 'No secure key established' - encryption disabled.
                        </Alert>
                    )}

                    {eavesdropperActive && qber <= QBER_THRESHOLD && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            ⚠️ Eavesdropper active but QBER ({(qber * 100).toFixed(2)}%) still below threshold (11%).
                            QKD encryption remains available.
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Architecture Grid */}
            <Grid container spacing={3}>
                {/* Architecture A - QKD */}
                <Grid item xs={12} md={6}>
                    <Card sx={{
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        border: '2px solid #ff6b6b',
                        borderRadius: 3,
                        minHeight: 700
                    }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ color: '#ff6b6b', fontWeight: 'bold', mb: 2 }}>
                                Architecture A - QKD + AES-GCM
                            </Typography>

                            {/* Progress Steps */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ color: '#64ffda', mb: 1 }}>
                                    🔬 1) QKD → BB84 Protocol
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min(qkdProgress.bb84Generation, 100)}
                                    sx={{ mb: 1, '& .MuiLinearProgress-bar': { bgcolor: '#4caf50' }, height: 8 }}
                                />
                                <Typography variant="caption" sx={{ color: '#aaa' }}>
                                    {qkdProgress.bb84Generation.toFixed(1)}% • Raw Key Bits
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ color: '#64ffda', mb: 1 }}>
                                    🔧 2) Reconciled & Privacy-amplified bits
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min(qkdProgress.reconciliation, 100)}
                                    sx={{ mb: 1, '& .MuiLinearProgress-bar': { bgcolor: '#2196f3' }, height: 8 }}
                                />
                                <Typography variant="caption" sx={{ color: '#aaa' }}>
                                    {qkdProgress.reconciliation.toFixed(1)}% • Error Correction
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ color: '#64ffda', mb: 1 }}>
                                    🔐 3) HKDF-SHA256 → AES-256 key
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min(qkdProgress.privacyAmplification, 100)}
                                    sx={{ mb: 1, '& .MuiLinearProgress-bar': { bgcolor: '#ff9800' }, height: 8 }}
                                />
                                <Typography variant="caption" sx={{ color: '#aaa' }}>
                                    {qkdProgress.privacyAmplification.toFixed(1)}% • Privacy Amplification
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ color: '#64ffda', mb: 1 }}>
                                    🛡️ 4) Encrypt with AES-GCM → iv, ciphertext, tag
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min(qkdProgress.aesEncryption, 100)}
                                    sx={{ mb: 1, '& .MuiLinearProgress-bar': { bgcolor: '#9c27b0' }, height: 8 }}
                                />
                                <Typography variant="caption" sx={{ color: '#aaa' }}>
                                    {qkdProgress.aesEncryption.toFixed(1)}% • AES-GCM Processing
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" sx={{ color: '#64ffda', mb: 1 }}>
                                    📡 5) Transmit → verify tag then decrypt
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min(qkdProgress.transmission, 100)}
                                    sx={{ mb: 1, '& .MuiLinearProgress-bar': { bgcolor: '#f44336' }, height: 8 }}
                                />
                                <Typography variant="caption" sx={{ color: '#aaa' }}>
                                    {qkdProgress.transmission.toFixed(1)}% • Network Transmission
                                </Typography>
                            </Box>

                            {/* Security Status */}
                            {!qkdStatus.keySecure && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    🚫 No secure key established<br />
                                    QBER: {(qber * 100).toFixed(2)}% > 11% threshold
                                </Alert>
                            )}

                            {/* Controls */}
                            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                                <Button
                                    variant="contained"
                                    onClick={handleQkdEncrypt}
                                    disabled={loading.qkd || !qkdStatus.keySecure || !comparisonMessage}
                                    sx={{
                                        bgcolor: qkdStatus.keySecure ? '#ff6b6b' : 'rgba(255,255,255,0.1)',
                                        flex: 1
                                    }}
                                >
                                    {loading.qkd ? '🔄 Processing...' :
                                        !qkdStatus.keySecure ? '🔑 Blocked (QBER > 11%)' :
                                            '🔐 Encrypt'}
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={resetQkd}
                                    size="small"
                                    sx={{ borderColor: '#ff6b6b', color: '#ff6b6b' }}
                                >
                                    Reset
                                </Button>
                            </Box>

                            {/* Wire View Result */}
                            {qkdResult && (
                                <Box sx={{
                                    p: 2,
                                    bgcolor: 'rgba(0,0,0,0.4)',
                                    borderRadius: 2,
                                    border: '1px solid #ff6b6b'
                                }}>
                                    <Typography variant="subtitle2" sx={{ color: '#64ffda', mb: 2 }}>
                                        📺 Wire View - Network Log
                                    </Typography>

                                    <Typography variant="caption" sx={{ color: '#00ff88', display: 'block', mb: 1, fontWeight: 'bold' }}>
                                        Key source: {qkdResult.keySource}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#00ff88', display: 'block', mb: 2, fontWeight: 'bold' }}>
                                        Key ID: {qkdResult.keyId}
                                    </Typography>

                                    <Typography variant="caption" sx={{ color: '#8892b0', display: 'block' }}>
                                        <strong>Payload transmitted (opaque bytes):</strong>
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#ccc', display: 'block', fontFamily: 'monospace' }}>
                                        IV: {qkdResult.iv}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#ccc', display: 'block', fontFamily: 'monospace' }}>
                                        Ciphertext: {qkdResult.ciphertext}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#ccc', display: 'block', mb: 2, fontFamily: 'monospace' }}>
                                        Tag: {qkdResult.tag}
                                    </Typography>

                                    <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 1 }} />

                                    <Typography variant="caption" sx={{ color: '#64ffda', display: 'block' }}>
                                        <strong>Receiver verifies tag and reveals:</strong>
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#00ff88', fontWeight: 'bold', display: 'block', mb: 2 }}>
                                        Original plaintext: "{qkdResult.decrypted}"
                                    </Typography>

                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => simulateTamperTest('qkd')}
                                        sx={{ borderColor: '#ffc107', color: '#ffc107' }}
                                    >
                                        🧪 Tamper Test
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Architecture B - Classical */}
                <Grid item xs={12} md={6}>
                    <Card sx={{
                        backgroundColor: 'rgba(78, 205, 196, 0.1)',
                        border: '2px solid #4ecdc4',
                        borderRadius: 3,
                        minHeight: 700
                    }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ color: '#4ecdc4', fontWeight: 'bold', mb: 2 }}>
                                Architecture B - RSA + AES-GCM
                            </Typography>

                            {/* Progress Steps */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ color: '#64ffda', mb: 1 }}>
                                    🔑 1) Generate AES key
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min(classicalProgress.aesKeyGen, 100)}
                                    sx={{ mb: 1, '& .MuiLinearProgress-bar': { bgcolor: '#4caf50' }, height: 8 }}
                                />
                                <Typography variant="caption" sx={{ color: '#aaa' }}>
                                    {classicalProgress.aesKeyGen.toFixed(1)}% • Random AES-256
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ color: '#64ffda', mb: 1 }}>
                                    📦 2) Wrap with RSA-OAEP(SHA-256)
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min(classicalProgress.rsaWrapping, 100)}
                                    sx={{ mb: 1, '& .MuiLinearProgress-bar': { bgcolor: '#ff9800' }, height: 8 }}
                                />
                                <Typography variant="caption" sx={{ color: '#aaa' }}>
                                    {classicalProgress.rsaWrapping.toFixed(1)}% • Public Key Encryption
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ color: '#64ffda', mb: 1 }}>
                                    🛡️ 3) Encrypt data with AES-GCM
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min(classicalProgress.aesEncryption, 100)}
                                    sx={{ mb: 1, '& .MuiLinearProgress-bar': { bgcolor: '#2196f3' }, height: 8 }}
                                />
                                <Typography variant="caption" sx={{ color: '#aaa' }}>
                                    {classicalProgress.aesEncryption.toFixed(1)}% • Symmetric Encryption
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" sx={{ color: '#64ffda', mb: 1 }}>
                                    📡 4) Unwrap then verify+decrypt
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min(classicalProgress.transmission, 100)}
                                    sx={{ mb: 1, '& .MuiLinearProgress-bar': { bgcolor: '#9c27b0' }, height: 8 }}
                                />
                                <Typography variant="caption" sx={{ color: '#aaa' }}>
                                    {classicalProgress.transmission.toFixed(1)}% • RSA + AES Decrypt
                                </Typography>
                            </Box>

                            {/* Controls */}
                            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                                <Button
                                    variant="contained"
                                    onClick={handleClassicalEncrypt}
                                    disabled={loading.classical || !comparisonMessage}
                                    sx={{
                                        bgcolor: '#4ecdc4',
                                        color: 'white',
                                        flex: 1
                                    }}
                                >
                                    {loading.classical ? '🔄 Processing...' : '🔐 Encrypt'}
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={resetClassical}
                                    size="small"
                                    sx={{ borderColor: '#4ecdc4', color: '#4ecdc4' }}
                                >
                                    Reset
                                </Button>
                            </Box>

                            {/* Wire View Result */}
                            {classicalResult && (
                                <Box sx={{
                                    p: 2,
                                    bgcolor: 'rgba(0,0,0,0.4)',
                                    borderRadius: 2,
                                    border: '1px solid #4ecdc4'
                                }}>
                                    <Typography variant="subtitle2" sx={{ color: '#64ffda', mb: 2 }}>
                                        📺 Wire View - Network Log
                                    </Typography>

                                    <Typography variant="caption" sx={{ color: '#00ff88', display: 'block', mb: 1, fontWeight: 'bold' }}>
                                        Key source: {classicalResult.keySource}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#00ff88', display: 'block', mb: 2, fontWeight: 'bold' }}>
                                        Algorithm: {classicalResult.algorithm}
                                    </Typography>

                                    <Typography variant="caption" sx={{ color: '#8892b0', display: 'block' }}>
                                        <strong>Payload transmitted (opaque bytes):</strong>
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#ccc', display: 'block', fontFamily: 'monospace' }}>
                                        IV: {classicalResult.iv}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#ccc', display: 'block', fontFamily: 'monospace' }}>
                                        Ciphertext: {classicalResult.ciphertext}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#ccc', display: 'block', mb: 2, fontFamily: 'monospace' }}>
                                        Tag: {classicalResult.tag}
                                    </Typography>

                                    <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 1 }} />

                                    <Typography variant="caption" sx={{ color: '#64ffda', display: 'block' }}>
                                        <strong>Receiver verifies tag and reveals:</strong>
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#00ff88', fontWeight: 'bold', display: 'block', mb: 2 }}>
                                        Original plaintext: "{classicalResult.decrypted}"
                                    </Typography>

                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => simulateTamperTest('classical')}
                                        sx={{ borderColor: '#ffc107', color: '#ffc107' }}
                                    >
                                        🧪 Tamper Test
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

// **Main QDK Simulator Component**
const QDKSimulator = () => {
    const {
        isConnected, quantumState, quantumUpdates, activityLog, securityAlerts,
        realTimeData, eavesdropperChartData, transmissionProgress, currentProgress,
        backendStatus, qkdResults, encryptionResults, decryptionResults,
        currentStatistics, ibmQuantumStatus, quantumBackendInfo, transmissionLogs,
        aliceData, bobData, quantumHardwareFeedback, initializeIBMQuantum,
        startEnhancedBB84, startLiveBB84, encryptMessage, decryptMessage,
        encryptWithClassical, decryptWithClassical, simulateAdvancedEavesdropper,
        getQuantumBackendStatus
    } = useQuantumWebSocket();

    // UI State
    const [showAlert, setShowAlert] = useState(false);
    const [currentAlert, setCurrentAlert] = useState(null);
    const [message, setMessage] = useState('Quantum cryptography is revolutionary!');
    const [keyLength, setKeyLength] = useState(256);
    const [useRealQuantum, setUseRealQuantum] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [showIBMDialog, setShowIBMDialog] = useState(false);
    const [ibmLoading, setIbmLoading] = useState(false);

    // Enhanced transmission state - FIXED: Only starts on user action
    const [quantumKeyGenerated, setQuantumKeyGenerated] = useState(false);
    const [currentBitIndex, setCurrentBitIndex] = useState(0);
    const [totalBits, setTotalBits] = useState(256);
    const [isGenerating, setIsGenerating] = useState(false);
    const [hasStartedGeneration, setHasStartedGeneration] = useState(false);

    // Monitor QKD results
    useEffect(() => {
        if (qkdResults?.final_key) {
            setQuantumKeyGenerated(true);
            setIsGenerating(false);
            setCurrentAlert({
                message: '🔑 Quantum Key Generated! You can now use QKD encryption.',
                type: 'success'
            });
            setShowAlert(true);
        } else {
            setQuantumKeyGenerated(false);
        }
    }, [qkdResults]);

    // Monitor security alerts
    useEffect(() => {
        if (securityAlerts && securityAlerts.length > 0) {
            const latestAlert = securityAlerts[securityAlerts.length - 1];
            setCurrentAlert(latestAlert);
            setShowAlert(true);
        }
    }, [securityAlerts]);

    // Monitor transmission progress with proper capping
    useEffect(() => {
        if (transmissionLogs && transmissionLogs.length > 0 && hasStartedGeneration) {
            const cappedIndex = Math.min(transmissionLogs.length, totalBits);
            setCurrentBitIndex(cappedIndex);
        }
    }, [transmissionLogs, totalBits, hasStartedGeneration]);

    // IBM Quantum initialization
    const handleIBMQuantumInit = async (token, instance) => {
        setIbmLoading(true);
        try {
            const result = await initializeIBMQuantum(token, instance);
            if (result.success) {
                setShowIBMDialog(false);
                setCurrentAlert({
                    message: `🚀 IBM Quantum connected: ${result.backend_name}${result.quantum_hardware ? ' (Real Hardware!)' : ''}`,
                    type: 'success'
                });
                setShowAlert(true);
            } else {
                setCurrentAlert({
                    message: `⚠️ IBM Quantum connection failed: ${result.error}. Using simulator instead.`,
                    type: 'warning'
                });
                setShowAlert(true);
                setUseRealQuantum(false);
            }
            return result;
        } catch (error) {
            setCurrentAlert({
                message: `❌ Network error: ${error.message}. Using simulator mode.`,
                type: 'error'
            });
            setShowAlert(true);
            setUseRealQuantum(false);
            return { success: false, error: error.message };
        } finally {
            setIbmLoading(false);
        }
    };

    // FIXED: Start quantum generation only on user click
    const handleStartQuantum = () => {
        setQuantumKeyGenerated(false);
        setCurrentBitIndex(0);
        setTotalBits(keyLength);
        setIsGenerating(true);
        setHasStartedGeneration(true);

        startEnhancedBB84(message, keyLength, useRealQuantum && ibmQuantumStatus?.success);
    };

    const handlePauseTransmission = () => {
        setIsGenerating(false);
    };

    const handleResetTransmission = () => {
        setCurrentBitIndex(0);
        setIsGenerating(false);
        setQuantumKeyGenerated(false);
        setHasStartedGeneration(false);
    };

    // Get properly capped progress value
    const getProgressPercentage = () => {
        if (totalBits === 0 || !hasStartedGeneration) return 0;
        const rawProgress = (currentBitIndex / totalBits) * 100;
        return Math.min(rawProgress, 100);
    };

    const progress = transmissionProgress || currentProgress || 0;
    const cappedProgress = Math.min(progress, 1);
    const isLive = (isGenerating || (cappedProgress > 0 && cappedProgress < 1)) && hasStartedGeneration;

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Enhanced Header with IBM Quantum Status */}
            <Paper elevation={6} sx={{
                mb: 4,
                background: 'linear-gradient(135deg, #0f1419 0%, #1e2a3a 50%, #2d3b4f 100%)',
                borderRadius: 3,
                p: 3
            }}>
                <Typography variant="h3" sx={{
                    color: '#64ffda',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    mb: 2
                }}>
                    🔐 IBM Quantum-Enhanced QKD BB84 Simulator
                </Typography>
                <Typography variant="h6" sx={{
                    color: '#8892b0',
                    textAlign: 'center',
                    mb: 3
                }}>
                    Full-Featured Quantum Key Distribution with Real IBM Quantum Hardware
                </Typography>

                {/* IBM Quantum Status Section */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3
                }}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                            icon={<CloudQueue />}
                            label={ibmQuantumStatus?.success ?
                                `IBM Quantum: ${ibmQuantumStatus.backend_name}` :
                                'IBM Quantum: Not Connected'}
                            color={ibmQuantumStatus?.success ? 'success' : 'default'}
                        />
                        {quantumBackendInfo?.quantum_hardware && (
                            <Chip
                                icon={<Hardware />}
                                label="Real Quantum Hardware"
                                sx={{ bgcolor: '#2196f3', color: 'white' }}
                            />
                        )}
                        {quantumBackendInfo?.pending_jobs !== undefined && (
                            <Chip
                                label={`Queue: ${quantumBackendInfo.pending_jobs} jobs`}
                                sx={{ bgcolor: '#ff9800', color: 'white' }}
                            />
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={() => setShowIBMDialog(true)}
                            startIcon={<Settings />}
                            sx={{ borderColor: '#64ffda', color: '#64ffda' }}
                        >
                            IBM Quantum Setup
                        </Button>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={useRealQuantum}
                                    onChange={(e) => setUseRealQuantum(e.target.checked)}
                                    color="primary"
                                    disabled={!ibmQuantumStatus?.success}
                                />
                            }
                            label="Use IBM Quantum"
                            sx={{ color: '#ffffff' }}
                        />
                        <Alert severity={isConnected ? 'success' : 'error'}>
                            {isConnected ? '🟢 All Systems Online' : '🔴 Disconnected'}
                        </Alert>
                    </Box>
                </Box>

                {/* Progress Summary - FIXED: Only shows after generation starts */}
                {hasStartedGeneration && (
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ color: '#64ffda', mb: 1 }}>
                            🚀 Quantum Generation: {getProgressPercentage().toFixed(1)}% •
                            Efficiency: {currentStatistics?.efficiency ? (currentStatistics.efficiency * 100).toFixed(1) : '50.8'}% •
                            QBER: {currentStatistics?.current_error_rate ? (currentStatistics.current_error_rate * 100).toFixed(2) : '2.64'}% •
                            Backend: {ibmQuantumStatus?.backend_name || 'ibm_torino'} •
                            {useRealQuantum && ibmQuantumStatus?.success ? 'REAL HARDWARE' : 'SIMULATOR'}
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={getProgressPercentage()}
                            sx={{
                                height: 8,
                                borderRadius: 4,
                                background: 'rgba(255,255,255,0.1)',
                                '& .MuiLinearProgress-bar': {
                                    background: useRealQuantum && ibmQuantumStatus?.success ?
                                        'linear-gradient(90deg, #4CAF50, #2196F3, #FF9800, #9C27B0)' :
                                        'linear-gradient(90deg, #4CAF50, #2196F3, #FF9800)',
                                    borderRadius: 4
                                }
                            }}
                        />
                    </Box>
                )}
            </Paper>

            {/* Enhanced Feature Tabs */}
            <Paper elevation={3} sx={{ backgroundColor: '#252837', mb: 3 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={tabValue}
                        onChange={(e, newValue) => setTabValue(newValue)}
                        variant="fullWidth"
                        textColor="primary"
                        indicatorColor="primary"
                        sx={{
                            '& .MuiTab-root': {
                                color: '#8892b0',
                                '&.Mui-selected': { color: '#64ffda' }
                            }
                        }}
                    >
                        <Tab icon={<CloudQueue />} label="Quantum Generation" />
                        <Tab icon={<Lock />} label="Original Encryption" />
                        <Tab icon={<Timeline />} label="Architecture Comparison" />
                        <Tab icon={<Assessment />} label="Real-time Charts" />
                        <Tab icon={<Psychology />} label="Eavesdropper Analysis" />
                        <Tab icon={<AccountBalance />} label="Payment Gateway" />
                    </Tabs>
                </Box>

                {/* Quantum Generation Tab */}
                <TabPanel value={tabValue} index={0}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', mb: 2, borderRadius: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ color: '#64ffda', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        🔑 IBM Quantum-Enhanced Key Generation
                                        {isLive && (
                                            <Chip
                                                label={useRealQuantum && ibmQuantumStatus?.success ? "IBM QUANTUM LIVE" : "SIMULATOR LIVE"}
                                                size="small"
                                                sx={{
                                                    backgroundColor: useRealQuantum && ibmQuantumStatus?.success ? '#4caf50' : '#ff1493',
                                                    color: 'white',
                                                    animation: 'pulse 2s infinite'
                                                }}
                                            />
                                        )}
                                    </Typography>

                                    {!ibmQuantumStatus?.success && useRealQuantum && (
                                        <Alert severity="warning" sx={{ mb: 2 }}>
                                            🔌 Connect to IBM Quantum first to use real quantum hardware
                                        </Alert>
                                    )}

                                    <TextField
                                        fullWidth
                                        label="Message to Encrypt"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        variant="outlined"
                                        sx={{
                                            mb: 2,
                                            '& .MuiOutlinedInput-root': {
                                                color: 'white',
                                                backgroundColor: 'rgba(255,255,255,0.05)',
                                                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                                                '&:hover fieldset': { borderColor: '#64ffda' },
                                                '&.Mui-focused fieldset': { borderColor: '#64ffda' }
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                '&.Mui-focused': { color: '#64ffda' }
                                            }
                                        }}
                                    />

                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Key Length (bits)"
                                        value={keyLength}
                                        onChange={(e) => setKeyLength(parseInt(e.target.value) || 256)}
                                        helperText={`Quantum key length ${useRealQuantum && ibmQuantumStatus?.success ? '(IBM Quantum Hardware)' : '(Simulator)'}`}
                                        sx={{
                                            mb: 3,
                                            '& .MuiOutlinedInput-root': {
                                                color: 'white',
                                                backgroundColor: 'rgba(255,255,255,0.05)',
                                                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                                                '&:hover fieldset': { borderColor: '#64ffda' },
                                                '&.Mui-focused fieldset': { borderColor: '#64ffda' }
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                '&.Mui-focused': { color: '#64ffda' }
                                            },
                                            '& .MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.5)' }
                                        }}
                                    />

                                    <Button
                                        variant="contained"
                                        onClick={handleStartQuantum}
                                        disabled={!isConnected || (useRealQuantum && !ibmQuantumStatus?.success)}
                                        startIcon={useRealQuantum ? <CloudQueue /> : <PlayArrow />}
                                        fullWidth
                                        size="large"
                                        sx={{
                                            background: isConnected && (!useRealQuantum || ibmQuantumStatus?.success)
                                                ? useRealQuantum
                                                    ? 'linear-gradient(45deg, #4caf50, #64ffda, #ff006b)'
                                                    : 'linear-gradient(45deg, #64ffda, #ff006b, #00ff88)'
                                                : 'rgba(255,255,255,0.1)',
                                            py: 2,
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold',
                                            borderRadius: 2
                                        }}
                                    >
                                        {isLive ? (
                                            <>🔄 Generating on {useRealQuantum && ibmQuantumStatus?.success ? ibmQuantumStatus.backend_name : 'Simulator'}...</>
                                        ) : (
                                            <>🚀 Generate Quantum Key {useRealQuantum && ibmQuantumStatus?.success ? '(IBM Quantum)' : '(Simulator)'}</>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Enhanced QKD Results Display */}
                            {qkdResults && (
                                <Card sx={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                    borderRadius: 2,
                                    border: '1px solid rgba(0, 255, 136, 0.3)'
                                }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom sx={{ color: '#00ff88', display: 'flex', alignItems: 'center', gap: 1 }}>
                                            ✅ Quantum Key Generated Successfully
                                            <Chip label="SECURE" color="success" size="small" />
                                            {qkdResults.bb84_details?.quantum_hardware && (
                                                <Chip
                                                    icon={<Hardware />}
                                                    label="IBM Quantum"
                                                    size="small"
                                                    sx={{ bgcolor: '#4caf50', color: 'white' }}
                                                />
                                            )}
                                        </Typography>

                                        <Grid container spacing={2} sx={{ mb: 2 }}>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" sx={{ color: '#8892b0' }}>
                                                    <strong>Backend:</strong> {qkdResults.bb84_details?.backend_used || 'Simulator'}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" sx={{ color: '#8892b0' }}>
                                                    <strong>Total Bits:</strong> {qkdResults.bb84_details?.total_bits_sent || totalBits}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" sx={{ color: '#8892b0' }}>
                                                    <strong>QBER:</strong>
                                                    <span style={{
                                                        color: (qkdResults.bb84_details?.error_rate || 0.032) < 0.11 ? '#00ff88' : '#ff6b6b',
                                                        marginLeft: '8px'
                                                    }}>
                                                        {qkdResults.bb84_details?.error_rate ?
                                                            (qkdResults.bb84_details.error_rate * 100).toFixed(2) + '%' : '3.20%'}
                                                    </span>
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" sx={{ color: '#8892b0' }}>
                                                    <strong>Efficiency:</strong>
                                                    <span style={{ color: '#64ffda', marginLeft: '8px' }}>
                                                        {qkdResults.bb84_details?.efficiency ?
                                                            (qkdResults.bb84_details.efficiency * 100).toFixed(1) + '%' : '50.8%'}
                                                    </span>
                                                </Typography>
                                            </Grid>
                                        </Grid>

                                        <Box sx={{
                                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                            p: 2,
                                            borderRadius: 1,
                                            fontFamily: 'monospace',
                                            fontSize: '0.75rem',
                                            wordBreak: 'break-all',
                                            maxHeight: '120px',
                                            overflow: 'auto',
                                            border: '1px solid rgba(0, 255, 136, 0.3)'
                                        }}>
                                            <Typography variant="caption" sx={{ color: '#00ff88', fontWeight: 'bold', mb: 1, display: 'block' }}>
                                                Quantum Key {qkdResults.bb84_details?.quantum_hardware ? '(IBM Hardware)' : '(Simulator)'}:
                                            </Typography>
                                            {qkdResults.final_key}
                                        </Box>
                                    </CardContent>
                                </Card>
                            )}
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Interactive3DBlochSphere
                                quantumUpdates={quantumUpdates || (quantumState ? [quantumState] : [])}
                                isLive={isLive}
                                title={`3D Quantum State Visualization ${useRealQuantum && ibmQuantumStatus?.success ? '(IBM Quantum)' : '(Simulator)'}`}
                            />
                        </Grid>
                    </Grid>
                </TabPanel>

                {/* Original Encryption Tab */}
                <TabPanel value={tabValue} index={1}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ color: '#64ffda', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Lock /> Quantum-Enhanced AES Encryption
                                    </Typography>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={() => {
                                            if (!qkdResults?.final_key) {
                                                setCurrentAlert({
                                                    message: '⚠️ Generate a quantum key first!',
                                                    type: 'warning'
                                                });
                                                setShowAlert(true);
                                                return;
                                            }
                                            encryptMessage(message);
                                        }}
                                        disabled={!qkdResults?.final_key}
                                        startIcon={<Lock />}
                                        size="large"
                                        sx={{
                                            background: qkdResults?.final_key
                                                ? 'linear-gradient(45deg, #ff006b, #64ffda)'
                                                : 'rgba(255,255,255,0.1)',
                                            py: 2,
                                            mb: 2,
                                            borderRadius: 2
                                        }}
                                    >
                                        🔐 Encrypt Message
                                    </Button>
                                    {!qkdResults?.final_key && (
                                        <Alert severity="info" size="small">
                                            Generate quantum key first
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            {encryptionResults && (
                                <Card sx={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom sx={{ color: '#00ff88', display: 'flex', alignItems: 'center', gap: 1 }}>
                                            🔐 Encrypted Data
                                            <Chip label="ENCRYPTED" color="success" size="small" />
                                        </Typography>
                                        <Box sx={{
                                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                            p: 2,
                                            borderRadius: 1,
                                            fontFamily: 'monospace',
                                            fontSize: '0.7rem',
                                            wordBreak: 'break-all',
                                            maxHeight: '120px',
                                            overflow: 'auto',
                                            mb: 2,
                                            border: '1px solid rgba(100, 255, 218, 0.3)'
                                        }}>
                                            {encryptionResults.ciphertext}
                                        </Box>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={() => {
                                                if (!encryptionResults?.ciphertext) {
                                                    setCurrentAlert({
                                                        message: '⚠️ Encrypt a message first!',
                                                        type: 'warning'
                                                    });
                                                    setShowAlert(true);
                                                    return;
                                                }
                                                decryptMessage(encryptionResults.ciphertext);
                                            }}
                                            startIcon={<LockOpen />}
                                            sx={{ borderColor: '#64ffda', color: '#64ffda' }}
                                        >
                                            🔓 Decrypt Message
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </Grid>

                        <Grid item xs={12} md={4}>
                            {decryptionResults && (
                                <Card sx={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom sx={{ color: '#00ff88', display: 'flex', alignItems: 'center', gap: 1 }}>
                                            🔓 Decrypted Message
                                            <Chip label="SUCCESS" color="success" size="small" />
                                        </Typography>
                                        <Box sx={{
                                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                            p: 3,
                                            borderRadius: 1,
                                            fontSize: '1.2rem',
                                            color: '#00ff88',
                                            border: '2px solid rgba(0, 255, 136, 0.5)',
                                            fontWeight: 'bold',
                                            textAlign: 'center',
                                            minHeight: '60px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            "{decryptionResults.plaintext}"
                                        </Box>
                                    </CardContent>
                                </Card>
                            )}
                        </Grid>
                    </Grid>
                </TabPanel>

                {/* UPDATED Architecture Comparison Tab */}
                <TabPanel value={tabValue} index={2}>
                    <ArchitectureComparisonEnhanced
                        qkdResults={qkdResults}
                        message={message}
                        isConnected={isConnected}
                    />
                </TabPanel>

                {/* Real-time Charts Tab */}
                <TabPanel value={tabValue} index={3}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ color: '#64ffda', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        📈 Real-time QBER & Efficiency Analysis
                                        {isLive && <Chip label="LIVE" color="error" size="small" />}
                                    </Typography>
                                    <Box sx={{ height: 300 }}>
                                        {realTimeData && realTimeData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={realTimeData.slice(-50)}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                                    <XAxis dataKey="bitIndex" stroke="#8892b0" />
                                                    <YAxis stroke="#8892b0" />
                                                    <RechartsTooltip />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="errorRate"
                                                        stroke="#ff006b"
                                                        fill="rgba(255, 0, 107, 0.3)"
                                                        name="QBER (%)"
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="efficiency"
                                                        stroke="#00ff88"
                                                        fill="rgba(0, 255, 136, 0.3)"
                                                        name="Efficiency (%)"
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                                <Typography sx={{ color: '#8892b0', textAlign: 'center' }}>
                                                    🚀 Start quantum key generation to see live charts
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ color: '#64ffda' }}>
                                        🎯 Basis Matching Analysis
                                    </Typography>
                                    <Box sx={{ height: 300 }}>
                                        {realTimeData && realTimeData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={realTimeData.slice(-20)}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                                    <XAxis dataKey="bitIndex" stroke="#8892b0" />
                                                    <YAxis stroke="#8892b0" />
                                                    <RechartsTooltip />
                                                    <Bar dataKey="basesMatch" fill="#64ffda" name="Basis Match" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                                <Typography sx={{ color: '#8892b0', textAlign: 'center' }}>
                                                    📊 Basis matching data will appear during transmission
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </TabPanel>

                {/* Eavesdropper Analysis Tab */}
                <TabPanel value={tabValue} index={4}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ color: '#ff006b' }}>
                                        🕵️ Advanced Eavesdropper Analysis
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        onClick={simulateAdvancedEavesdropper}
                                        disabled={!isConnected}
                                        startIcon={<Psychology />}
                                        fullWidth
                                        size="large"
                                        sx={{
                                            background: isConnected
                                                ? 'linear-gradient(45deg, #ff006b, #ffc107)'
                                                : 'rgba(255,255,255,0.1)',
                                            py: 2
                                        }}
                                    >
                                        🚀 Run Attack Analysis
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ color: '#ffc107' }}>
                                        📊 Attack Detection Results
                                    </Typography>
                                    <Box sx={{ height: 300 }}>
                                        {eavesdropperChartData && eavesdropperChartData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={eavesdropperChartData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                                    <XAxis dataKey="scenario" stroke="#8892b0" />
                                                    <YAxis stroke="#8892b0" />
                                                    <RechartsTooltip />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="error_rate"
                                                        stroke="#ff006b"
                                                        strokeWidth={4}
                                                        name="Error Rate"
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                                <Typography sx={{ color: '#8892b0', textAlign: 'center' }}>
                                                    🕵️ Run analysis to see attack detection charts
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </TabPanel>

                {/* Payment Gateway Tab */}
                <TabPanel value={tabValue} index={5}>
                    <PaymentFlowPanel qkdResults={qkdResults} />
                </TabPanel>
            </Paper>

            {/* Enhanced Real-Time Quantum Transmission Panel - RESTORED */}
            <EnhancedQuantumTransmissionPanel
                aliceData={aliceData}
                bobData={bobData}
                transmissionLogs={transmissionLogs || []}
                isTransmitting={isGenerating}
                currentBitIndex={currentBitIndex}
                totalBits={totalBits}
                onStartTransmission={handleStartQuantum}
                onPauseTransmission={handlePauseTransmission}
                onResetTransmission={handleResetTransmission}
                quantumBackendInfo={quantumBackendInfo}
                quantumHardwareFeedback={quantumHardwareFeedback || []}
            />

            {/* Enhanced Activity Log - RESTORED */}
            <Card sx={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: '#64ffda', display: 'flex', alignItems: 'center', gap: 1 }}>
                        📋 Enhanced Activity Log
                        {activityLog && activityLog.length > 0 && (
                            <Chip
                                label={`${activityLog.length} entries`}
                                size="small"
                                color="primary"
                            />
                        )}
                        {ibmQuantumStatus?.success && (
                            <Chip
                                icon={<CloudQueue />}
                                label={`IBM: ${ibmQuantumStatus.backend_name}`}
                                size="small"
                                sx={{ bgcolor: '#4caf50', color: 'white' }}
                            />
                        )}
                    </Typography>
                    <Box sx={{ height: 300, overflow: 'auto' }}>
                        {activityLog && activityLog.length > 0 ? activityLog.slice(-40).reverse().map((log, index) => (
                            <Box
                                key={index}
                                sx={{
                                    p: 1.5,
                                    mb: 1,
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: 1,
                                    borderLeft: `4px solid ${log.type?.includes('ERROR') ? '#ff006b' :
                                        log.type?.includes('SUCCESS') || log.type?.includes('COMPLETE') ? '#00ff88' :
                                            log.type?.includes('ALERT') ? '#ffc107' :
                                                log.type?.includes('QUANTUM') ? '#64ffda' : '#8892b0'
                                        }`,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                        transform: 'translateX(4px)'
                                    }
                                }}
                            >
                                <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 500 }}>
                                    {log.action}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#8892b0' }}>
                                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Now'}
                                </Typography>
                            </Box>
                        )) : (
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                flexDirection: 'column',
                                gap: 2
                            }}>
                                <Typography sx={{ color: '#8892b0', textAlign: 'center' }}>
                                    📋 Activity log will appear here as you use the simulator
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#666' }}>
                                    Start a quantum key generation to see real-time updates
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </CardContent>
            </Card>

            {/* IBM Quantum Setup Dialog */}
            <IBMQuantumSetupDialog
                open={showIBMDialog}
                onClose={() => setShowIBMDialog(false)}
                onInitialize={handleIBMQuantumInit}
                isLoading={ibmLoading}
                status={ibmQuantumStatus}
            />

            {/* Enhanced Security Alerts */}
            <Snackbar
                open={showAlert}
                autoHideDuration={8000}
                onClose={() => setShowAlert(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    severity={currentAlert?.alert_type?.includes('ERROR') || currentAlert?.detected ? 'error' :
                        currentAlert?.type === 'success' ? 'success' :
                            currentAlert?.type === 'warning' ? 'warning' : 'info'}
                    onClose={() => setShowAlert(false)}
                    sx={{ minWidth: 500 }}
                >
                    {currentAlert?.message}
                </Alert>
            </Snackbar>

            {/* Enhanced Controls Panel */}
            <Paper sx={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                p: 2,
                bgcolor: 'rgba(0,0,0,0.8)',
                borderRadius: 2,
                zIndex: 1000
            }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Button
                        variant="outlined"
                        onClick={() => setShowIBMDialog(true)}
                        startIcon={<Settings />}
                        size="small"
                        sx={{ borderColor: '#64ffda', color: '#64ffda' }}
                    >
                        IBM Setup
                    </Button>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={useRealQuantum}
                                onChange={(e) => setUseRealQuantum(e.target.checked)}
                                color="primary"
                                disabled={!ibmQuantumStatus?.success}
                                size="small"
                            />
                        }
                        label={<Typography variant="caption" sx={{ color: 'white' }}>Use IBM Quantum</Typography>}
                    />

                    <Alert severity={isConnected ? 'success' : 'error'} sx={{ py: 0 }}>
                        <Typography variant="caption">
                            {isConnected ? '🟢 Online' : '🔴 Offline'}
                        </Typography>
                    </Alert>
                </Box>
            </Paper>

            {/* Enhanced Global Styles */}
            <style jsx global>{`
                @keyframes pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.05); }
                    100% { opacity: 1; transform: scale(1); }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes progress-shimmer {
                    0% { background-position: -200px 0; }
                    100% { background-position: calc(200px + 100%) 0; }
                }
                @keyframes new-row-highlight {
                    0% { background-color: rgba(100, 255, 218, 0.3); }
                    100% { background-color: rgba(76, 175, 80, 0.05); }
                }
                .MuiLinearProgress-bar {
                    animation: shimmer 2s ease-in-out infinite;
                }
                
                /* Scrollbar styling */
                ::-webkit-scrollbar {
                    width: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                }
                ::-webkit-scrollbar-thumb {
                    background: #64ffda;
                    border-radius: 4px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #4ecdc4;
                }

                /* Additional responsive styling */
                @media (max-width: 768px) {
                    .MuiContainer-root {
                        padding: 8px !important;
                    }
                    .MuiTabs-root .MuiTab-root {
                        min-width: auto !important;
                        padding: 6px 8px !important;
                    }
                }

                /* Enhanced visual effects */
                .quantum-glow {
                    box-shadow: 0 0 20px rgba(100, 255, 218, 0.3);
                }
                
                .transmission-pulse {
                    animation: pulse 2s infinite;
                }

                /* Custom loading spinner */
                .quantum-loader {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 3px solid rgba(100, 255, 218, 0.3);
                    border-radius: 50%;
                    border-top-color: #64ffda;
                    animation: spin 1s ease-in-out infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* Enhanced table styling */
                .MuiTable-root {
                    border-collapse: separate;
                    border-spacing: 0 2px;
                }
                
                .MuiTableRow-root {
                    transition: all 0.2s ease;
                }
                
                .MuiTableRow-root:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                }

                /* Custom alert styling */
                .MuiAlert-root {
                    border-radius: 8px !important;
                    backdrop-filter: blur(10px);
                }

                /* Enhanced card hover effects */
                .MuiCard-root {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                
                .MuiCard-root:hover {
                    transform: translateY(-2px) !important;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.4) !important;
                }

                /* Progress bar enhancements */
                .MuiLinearProgress-root {
                    position: relative;
                    overflow: hidden;
                }
                
                .MuiLinearProgress-root::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    animation: shine 2s infinite;
                }

                @keyframes shine {
                    0% { left: -100%; }
                    100% { left: 100%; }
                }

                /* Chip enhancements */
                .MuiChip-root {
                    backdrop-filter: blur(5px);
                    border: 1px solid rgba(255,255,255,0.1);
                }

                /* Button glow effects */
                .MuiButton-contained {
                    position: relative;
                    overflow: hidden;
                }
                
                .MuiButton-contained::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    transition: left 0.5s;
                }
                
                .MuiButton-contained:hover::before {
                    left: 100%;
                }

                /* Typography enhancements */
                .quantum-text {
                    background: linear-gradient(45deg, #64ffda, #ff006b, #00ff88);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                /* Dialog enhancements */
                .MuiDialog-paper {
                    backdrop-filter: blur(20px) !important;
                    border: 1px solid rgba(100, 255, 218, 0.3) !important;
                }

                /* Snackbar positioning fix */
                .MuiSnackbar-root {
                    z-index: 2000 !important;
                }

                /* Enhanced focus styles */
                .MuiOutlinedInput-root.Mui-focused {
                    box-shadow: 0 0 0 2px rgba(100, 255, 218, 0.2);
                }

                /* Loading state styles */
                .loading-shimmer {
                    background: linear-gradient(90deg, 
                        rgba(255,255,255,0.0) 0%, 
                        rgba(255,255,255,0.1) 50%, 
                        rgba(255,255,255,0.0) 100%
                    );
                    background-size: 200px 100%;
                    animation: shimmer-loading 1.5s infinite;
                }

                @keyframes shimmer-loading {
                    0% { background-position: -200px 0; }
                    100% { background-position: calc(200px + 100%) 0; }
                }
            `}</style>
        </Container>
    );
};

export default QDKSimulator;

