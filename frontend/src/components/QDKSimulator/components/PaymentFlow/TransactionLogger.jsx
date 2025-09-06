import React from 'react';
import {
    Paper, Typography, Box, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton, Tooltip
} from '@mui/material';
import { CheckCircle, Cancel, Security, Download } from '@mui/icons-material';

const TransactionLogger = ({ logs, quantumKeyActive }) => {
    const downloadLogs = () => {
        const csvContent = [
            'Timestamp,Step,Action,Encryption,Security Level,Status,Details',
            ...logs.map(log =>
                `"${log.timestamp}","${log.step}","${log.action}","${log.encryption}","${log.securityLevel}","${log.status}","${log.details || ''}"`
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `payment_transaction_log_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <Paper elevation={4} sx={{ bgcolor: '#1a1d29' }}>
            <Box sx={{
                p: 3,
                borderBottom: '1px solid rgba(100, 255, 218, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Typography variant="h6" sx={{ color: '#64ffda', display: 'flex', alignItems: 'center', gap: 1 }}>
                    📋 Payment Transaction Logs
                    <Chip
                        label={`${logs.length} entries`}
                        size="small"
                        sx={{ bgcolor: '#2196f3', color: 'white' }}
                    />
                </Typography>

                <Tooltip title="Download Transaction Logs">
                    <IconButton
                        size="small"
                        onClick={downloadLogs}
                        disabled={logs.length === 0}
                        sx={{
                            color: '#64ffda',
                            bgcolor: 'rgba(100, 255, 218, 0.1)',
                            '&:hover': {
                                bgcolor: 'rgba(100, 255, 218, 0.2)',
                                transform: 'scale(1.1)'
                            }
                        }}
                    >
                        <Download />
                    </IconButton>
                </Tooltip>
            </Box>

            <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ bgcolor: '#252837', color: '#64ffda', fontWeight: 'bold' }}>
                                Time
                            </TableCell>
                            <TableCell sx={{ bgcolor: '#252837', color: '#64ffda', fontWeight: 'bold' }}>
                                Step
                            </TableCell>
                            <TableCell sx={{ bgcolor: '#252837', color: '#64ffda', fontWeight: 'bold' }}>
                                Action
                            </TableCell>
                            <TableCell sx={{ bgcolor: '#252837', color: '#64ffda', fontWeight: 'bold' }}>
                                Encryption
                            </TableCell>
                            <TableCell sx={{ bgcolor: '#252837', color: '#64ffda', fontWeight: 'bold' }}>
                                Security
                            </TableCell>
                            <TableCell sx={{ bgcolor: '#252837', color: '#64ffda', fontWeight: 'bold' }}>
                                Status
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow
                                key={log.id}
                                sx={{
                                    '&:hover': {
                                        bgcolor: 'rgba(100, 255, 218, 0.05)'
                                    },
                                    bgcolor: log.status === 'complete' ? 'rgba(76, 175, 80, 0.05)' :
                                        log.status === 'quantum_secure' ? 'rgba(0, 255, 136, 0.05)' :
                                            log.status === 'warning' ? 'rgba(255, 152, 0, 0.05)' : 'transparent'
                                }}
                            >
                                <TableCell sx={{ color: '#ffffff', fontSize: '0.75rem' }}>
                                    {log.timestamp}
                                </TableCell>
                                <TableCell sx={{ color: '#64ffda', fontWeight: 'bold' }}>
                                    {log.step}
                                </TableCell>
                                <TableCell sx={{ color: '#ffffff' }}>
                                    {log.action}
                                </TableCell>
                                <TableCell sx={{
                                    color: log.encryption?.includes('QKD') ? '#4caf50' : '#ff9800',
                                    fontFamily: 'monospace',
                                    fontSize: '0.75rem'
                                }}>
                                    {log.encryption}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={log.securityLevel}
                                        size="small"
                                        sx={{
                                            bgcolor: log.securityLevel === 'QUANTUM' ? '#4caf50' : '#ff9800',
                                            color: 'white',
                                            fontSize: '0.7rem'
                                        }}
                                        icon={log.securityLevel === 'QUANTUM' ? <Security /> : undefined}
                                    />
                                </TableCell>
                                <TableCell>
                                    {log.status === 'complete' || log.status === 'quantum_secure' || log.status === 'success' ? (
                                        <CheckCircle sx={{ color: '#4caf50', fontSize: 18 }} />
                                    ) : log.status === 'warning' ? (
                                        <Cancel sx={{ color: '#ff9800', fontSize: 18 }} />
                                    ) : (
                                        <Cancel sx={{ color: '#f44336', fontSize: 18 }} />
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {logs.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography sx={{ color: '#8892b0', fontStyle: 'italic' }}>
                        No transaction logs yet. Start a payment simulation to see real-time logs.
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};

export default TransactionLogger;
