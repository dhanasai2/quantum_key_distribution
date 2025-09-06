import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';
import { Paper, Typography, Box } from '@mui/material';

const SecurityChart = ({ data, title = "Security Metrics" }) => {
    const formatData = (rawData) => {
        return rawData.map((item, index) => ({
            time: index,
            errorRate: (item.error_rate || 0) * 100,
            keyRate: item.key_rate || 0,
            efficiency: (item.efficiency || 0) * 100
        }));
    };

    const chartData = formatData(data || []);

    return (
        <Paper sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#00d4ff' }}>
                📈 {title}
            </Typography>
            <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="time" stroke="#8892b0" />
                        <YAxis stroke="#8892b0" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1a1d29',
                                border: '1px solid #00d4ff',
                                borderRadius: '8px'
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="errorRate"
                            stackId="1"
                            stroke="#ff006b"
                            fill="rgba(255, 0, 107, 0.3)"
                            name="Error Rate (%)"
                        />
                        <Area
                            type="monotone"
                            dataKey="efficiency"
                            stackId="2"
                            stroke="#00ff88"
                            fill="rgba(0, 255, 136, 0.3)"
                            name="Efficiency (%)"
                        />
                        <Line
                            type="monotone"
                            dataKey="keyRate"
                            stroke="#00d4ff"
                            strokeWidth={2}
                            name="Key Rate"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default SecurityChart;
