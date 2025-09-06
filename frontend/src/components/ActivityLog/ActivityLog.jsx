import React from 'react';
import {
    Paper,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    Box
} from '@mui/material';
import {
    VpnKey,
    Security,
    Warning,
    CheckCircle,
    Info
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const ActivityLog = ({ activities = [] }) => {
    const getIcon = (action) => {
        switch (action) {
            case 'BB84_PROTOCOL_START':
            case 'BB84_PROTOCOL_COMPLETE':
                return <VpnKey sx={{ color: '#00d4ff' }} />;
            case 'EAVESDROPPER_DETECTED':
            case 'HIGH_ERROR_RATE':
                return <Warning sx={{ color: '#ff006b' }} />;
            case 'SECURITY_CHECK_PASSED':
                return <CheckCircle sx={{ color: '#00ff88' }} />;
            case 'ENCRYPTION_COMPLETE':
            case 'DECRYPTION_COMPLETE':
                return <Security sx={{ color: '#ffc107' }} />;
            default:
                return <Info sx={{ color: '#8892b0' }} />;
        }
    };

    const getSeverity = (action) => {
        if (action.includes('ERROR') || action.includes('EAVESDROPPER')) return 'error';
        if (action.includes('COMPLETE') || action.includes('PASSED')) return 'success';
        if (action.includes('START')) return 'info';
        return 'default';
    };

    return (
        <Paper sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.3)', height: '400px' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#00d4ff' }}>
                📋 Activity Log
            </Typography>
            <Box sx={{ height: '340px', overflow: 'auto' }}>
                <List dense>
                    {activities.slice().reverse().map((activity, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: '40px' }}>
                                {getIcon(activity.action)}
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" sx={{ color: '#ffffff' }}>
                                            {activity.action.replace(/_/g, ' ')}
                                        </Typography>
                                        <Chip
                                            label={getSeverity(activity.action)}
                                            size="small"
                                            color={getSeverity(activity.action)}
                                            sx={{ fontSize: '0.7rem', height: '20px' }}
                                        />
                                    </Box>
                                }
                                secondary={
                                    <Typography variant="caption" sx={{ color: '#8892b0' }}>
                                        {activity.timestamp ?
                                            formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }) :
                                            'Just now'
                                        }
                                    </Typography>
                                }
                            />
                        </ListItem>
                    ))}
                    {activities.length === 0 && (
                        <ListItem>
                            <ListItemText
                                primary={
                                    <Typography variant="body2" sx={{ color: '#8892b0', textAlign: 'center' }}>
                                        No activities recorded yet
                                    </Typography>
                                }
                            />
                        </ListItem>
                    )}
                </List>
            </Box>
        </Paper>
    );
};

export default ActivityLog;
