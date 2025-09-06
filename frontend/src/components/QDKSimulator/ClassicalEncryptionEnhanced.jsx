import React, { useState } from 'react';
import {
    Grid, Card, CardContent, Typography, Button, Box, Alert, Chip,
    TextField, FormControlLabel, Switch, Tab, Tabs
} from '@mui/material';
import { Lock, LockOpen, Security, Timeline, Psychology } from '@mui/icons-material';

function TabPanel({ children, value, index, ...other }) {
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
        </div>
    );
}

const ClassicalEncryptionEnhanced = ({
    qkdResults,
    encryptionResults,
    decryptionResults,
    isConnected,
    message,
    setMessage,
    handleEncrypt,
    handleDecrypt
}) => {
    const [tabValue, setTabValue] = useState(0);
    const [comparisonMessage, setComparisonMessage] = useState('Hello Quantum World!');
    const [eavesdropperActive, setEavesdropperActive] = useState(false);
    const [comparisonResults, setComparisonResults] = useState({
        qkd: null,
        classical: null
    });
    const [loading, setLoading] = useState({ qkd: false, classical: false });

    const handleComparisonEncrypt = async (arch) => {
        setLoading(prev => ({ ...prev, [arch.toLowerCase()]: true }));

        const endpoint = arch === 'QKD'
            ? 'http://localhost:8000/api/qkd-encrypt'
            : 'http://localhost:8000/api/classical-encrypt';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: comparisonMessage,
                    eavesdropperActive
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            setComparisonResults(prev => ({
                ...prev,
                [arch.toLowerCase()]: result
            }));
        } catch (error) {
            console.error(`${arch} encryption failed:`, error);
        } finally {
            setLoading(prev => ({ ...prev, [arch.toLowerCase()]: false }));
        }
    };

    return (
        <Box>
            {/* Enhanced Header */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs
                    value={tabValue}
                    onChange={(e, newValue) => setTabValue(newValue)}
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{
                        '& .MuiTab-root': {
                            color: '#8892b0',
                            '&.Mui-selected': {
                                color: '#00d4ff'
                            }
                        }
                    }}
                >
                    <Tab
                        icon={<Lock />}
                        label="🔒 Original Encryption"
                        sx={{ fontSize: '0.9rem' }}
                    />
                    <Tab
                        icon={<Timeline />}
                        label="⚡ Architecture Comparison"
                        sx={{ fontSize: '0.9rem' }}
                    />
                </Tabs>
            </Box>

            {/* Original Encryption Tab */}
            <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 2 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ color: '#00d4ff', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Lock /> Quantum-Enhanced AES Encryption
                                </Typography>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={handleEncrypt}
                                    disabled={!qkdResults?.final_key}
                                    startIcon={<Lock />}
                                    size="large"
                                    sx={{
                                        background: qkdResults?.final_key
                                            ? 'linear-gradient(45deg, #ff006b, #00d4ff)'
                                            : 'rgba(255,255,255,0.1)',
                                        py: 2,
                                        mb: 2,
                                        borderRadius: 2,
                                        '&:hover': {
                                            background: qkdResults?.final_key
                                                ? 'linear-gradient(45deg, #cc0055, #0099cc)'
                                                : 'rgba(255,255,255,0.15)'
                                        },
                                        '&:disabled': {
                                            background: 'rgba(255,255,255,0.1)',
                                            color: 'rgba(255,255,255,0.3)'
                                        }
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
                                    <Box
                                        sx={{
                                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                            p: 2,
                                            borderRadius: 1,
                                            fontFamily: 'monospace',
                                            fontSize: '0.7rem',
                                            wordBreak: 'break-all',
                                            maxHeight: '120px',
                                            overflow: 'auto',
                                            mb: 2,
                                            border: '1px solid rgba(0, 212, 255, 0.3)'
                                        }}
                                    >
                                        {encryptionResults.ciphertext}
                                    </Box>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={handleDecrypt}
                                        startIcon={<LockOpen />}
                                        sx={{
                                            borderColor: '#00d4ff',
                                            color: '#00d4ff',
                                            '&:hover': {
                                                borderColor: '#0099cc',
                                                backgroundColor: 'rgba(0, 212, 255, 0.1)'
                                            }
                                        }}
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
                                    <Box
                                        sx={{
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
                                        }}
                                    >
                                        "{decryptionResults.plaintext}"
                                    </Box>
                                </CardContent>
                            </Card>
                        )}
                    </Grid>
                </Grid>
            </TabPanel>

            {/* Architecture Comparison Tab */}
            <TabPanel value={tabValue} index={1}>
                <Box>
                    {/* Input Section */}
                    <Card sx={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 2, mb: 3 }}>
                        <CardContent>
                            <Typography variant="h5" sx={{ color: '#64ffda', mb: 3, textAlign: 'center' }}>
                                🔐 Quantum vs Classical Encryption Comparison
                            </Typography>

                            <Grid container spacing={3} alignItems="center" justifyContent="center">
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Message for Comparison"
                                        value={comparisonMessage}
                                        onChange={(e) => setComparisonMessage(e.target.value)}
                                        placeholder="Enter message (e.g., 'Hello World')"
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
                                <Grid item xs={12} md={6}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={eavesdropperActive}
                                                onChange={(e) => setEavesdropperActive(e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Psychology sx={{ color: eavesdropperActive ? '#ff6b6b' : '#666' }} />
                                                <Typography sx={{ color: eavesdropperActive ? '#ff6b6b' : '#8892b0' }}>
                                                    🕵️ Simulate Eavesdropper Attack
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Architecture Comparison */}
                    <Grid container spacing={2}>
                        {/* QKD Architecture */}
                        <Grid item xs={12} md={5}>
                            <ArchitecturePanel
                                type="QKD"
                                title="Architecture A - QKD + AES-GCM"
                                subtitle="Quantum Key Distribution with Privacy Amplification"
                                onEncrypt={() => handleComparisonEncrypt('QKD')}
                                result={comparisonResults.qkd}
                                loading={loading.qkd}
                                eavesdropperActive={eavesdropperActive}
                                message={comparisonMessage}
                            />
                        </Grid>

                        {/* VS Divider */}
                        <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Box
                                sx={{
                                    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontSize: '32px',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    padding: '20px',
                                    border: '2px solid #64ffda',
                                    borderRadius: '50%',
                                    width: '80px',
                                    height: '80px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                VS
                            </Box>
                        </Grid>

                        {/* Classical Architecture */}
                        <Grid item xs={12} md={5}>
                            <ArchitecturePanel
                                type="Classical"
                                title="Architecture B - RSA + AES-GCM"
                                subtitle="Classical Public Key Cryptography"
                                onEncrypt={() => handleComparisonEncrypt('Classical')}
                                result={comparisonResults.classical}
                                loading={loading.classical}
                                eavesdropperActive={eavesdropperActive}
                                message={comparisonMessage}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </TabPanel>
        </Box>
    );
};

const ArchitecturePanel = ({ type, title, subtitle, onEncrypt, result, loading, message }) => {
    return (
        <Card sx={{
            backgroundColor: type === 'QKD'
                ? 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 107, 107, 0.05))'
                : 'linear-gradient(135deg, rgba(78, 205, 196, 0.1), rgba(78, 205, 196, 0.05))',
            border: `2px solid ${type === 'QKD' ? '#ff6b6b' : '#4ecdc4'}`,
            borderRadius: 2,
            minHeight: 500
        }}>
            <CardContent>
                <Typography variant="h6" sx={{ color: '#64ffda', mb: 1 }}>
                    {title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
                    {subtitle}
                </Typography>

                {/* Process Steps */}
                <Box sx={{ mb: 3 }}>
                    {type === 'QKD' ? (
                        <QKDProcessFlow result={result} />
                    ) : (
                        <ClassicalProcessFlow result={result} />
                    )}
                </Box>

                {/* Encrypt Button */}
                <Button
                    fullWidth
                    variant="contained"
                    onClick={onEncrypt}
                    disabled={!message || loading}
                    size="large"
                    sx={{
                        background: type === 'QKD'
                            ? 'linear-gradient(45deg, #ff6b6b, #ff8e8e)'
                            : 'linear-gradient(45deg, #4ecdc4, #6bcf7f)',
                        color: 'white',
                        py: 2,
                        borderRadius: 2,
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)'
                        },
                        '&:disabled': {
                            opacity: 0.5,
                            transform: 'none'
                        }
                    }}
                >
                    {loading ? '🔄 Processing...' : `🚀 Encrypt & Send (${type})`}
                </Button>

                {/* Results */}
                {result && <ResultDisplay result={result} type={type} />}
            </CardContent>
        </Card>
    );
};

const QKDProcessFlow = ({ result }) => (
    <Box>
        {[
            { title: '🔬 1. BB84 Quantum Key Distribution', data: result?.qkd },
            { title: '🔐 2. Privacy Amplification (HKDF-SHA256)', data: result?.finalKey },
            { title: '🛡️ 3. AES-GCM Encryption', data: result?.encrypted }
        ].map((step, index) => (
            <Box key={index} sx={{
                mb: 2,
                p: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 1,
                borderLeft: '4px solid #ff6b6b'
            }}>
                <Typography variant="body2" sx={{ color: '#64ffda', fontWeight: 'bold', mb: 1 }}>
                    {step.title}
                </Typography>
                {step.data ? (
                    <Typography variant="caption" sx={{ color: '#ffffff', fontFamily: 'monospace' }}>
                        {typeof step.data === 'object' ? JSON.stringify(step.data).substring(0, 50) + '...' :
                            step.data.toString().substring(0, 50) + '...'}
                    </Typography>
                ) : (
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic' }}>
                        🔄 Waiting for process...
                    </Typography>
                )}
            </Box>
        ))}
    </Box>
);

const ClassicalProcessFlow = ({ result }) => (
    <Box>
        {[
            { title: '🔑 1. Generate AES Key', data: result?.aesKey },
            { title: '📦 2. RSA-OAEP Key Wrapping', data: result?.wrappedKey },
            { title: '🛡️ 3. AES-GCM Encryption', data: result?.encrypted }
        ].map((step, index) => (
            <Box key={index} sx={{
                mb: 2,
                p: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 1,
                borderLeft: '4px solid #4ecdc4'
            }}>
                <Typography variant="body2" sx={{ color: '#64ffda', fontWeight: 'bold', mb: 1 }}>
                    {step.title}
                </Typography>
                {step.data ? (
                    <Typography variant="caption" sx={{ color: '#ffffff', fontFamily: 'monospace' }}>
                        {typeof step.data === 'object' ? JSON.stringify(step.data).substring(0, 50) + '...' :
                            step.data.toString().substring(0, 50) + '...'}
                    </Typography>
                ) : (
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic' }}>
                        🔄 Waiting for process...
                    </Typography>
                )}
            </Box>
        ))}
    </Box>
);

const ResultDisplay = ({ result, type }) => (
    <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 1, border: '1px solid #64ffda' }}>
        <Typography variant="body2" sx={{ color: '#64ffda', fontWeight: 'bold', mb: 1 }}>
            📨 Transmission Result
        </Typography>
        <Typography variant="caption" sx={{ color: '#ffffff' }}>
            <strong>Original:</strong> {result.originalMessage}
        </Typography>
        <br />
        <Typography variant="caption" sx={{
            color: result.decrypted === result.originalMessage ? '#4ecdc4' : '#ff6b6b',
            fontWeight: 'bold'
        }}>
            <strong>Decrypted:</strong> {result.decrypted || 'DECRYPTION FAILED'}
        </Typography>
        <br />
        <Typography variant="caption" sx={{
            color: result.decrypted === result.originalMessage ? '#00ff88' : '#ff6b6b',
            fontWeight: 'bold'
        }}>
            {result.decrypted === result.originalMessage ?
                '✅ Message transmitted successfully!' :
                '❌ Message transmission failed!'
            }
        </Typography>
    </Box>
);

export default ClassicalEncryptionEnhanced;
