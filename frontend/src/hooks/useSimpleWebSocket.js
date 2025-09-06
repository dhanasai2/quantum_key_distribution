import { useState, useEffect, useRef } from 'react';

const useQuantumWebSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [quantumState, setQuantumState] = useState({ theta: Math.PI / 4, phi: 0 });
    const [activityLog, setActivityLog] = useState([]);
    const [securityAlerts, setSecurityAlerts] = useState([]);
    const [realTimeData, setRealTimeData] = useState([]);
    const [transmissionProgress, setTransmissionProgress] = useState(0);
    const [backendStatus, setBackendStatus] = useState(null);
    const [qkdResults, setQkdResults] = useState(null);
    const socketRef = useRef(null);
    const clientIdRef = useRef('quantum_client_' + Date.now());

    useEffect(() => {
        connectWebSocket();
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, []);

    const connectWebSocket = () => {
        try {
            const socket = new WebSocket(`ws://localhost:8000/ws/${clientIdRef.current}`);

            socket.onopen = () => {
                setIsConnected(true);
                socketRef.current = socket;
                addActivity('🟢 Real-time connection established', 'CONNECTION');

                // Request backend status
                sendMessage({ type: 'get_backend_status' });
            };

            socket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                handleMessage(message);
            };

            socket.onclose = () => {
                setIsConnected(false);
                socketRef.current = null;
                addActivity('🔴 Real-time connection lost', 'CONNECTION_LOST');

                // Auto-reconnect
                setTimeout(connectWebSocket, 3000);
            };

            socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

        } catch (error) {
            console.error('Failed to connect:', error);
        }
    };

    const handleMessage = (message) => {
        switch (message.type) {
            case 'quantum_state_update':
                const data = message.data;
                setQuantumState({
                    theta: data.quantum_state.theta,
                    phi: data.quantum_state.phi
                });
                setTransmissionProgress(data.progress || 0);

                // Update real-time charts
                setRealTimeData(prev => [...prev.slice(-100), {
                    time: Date.now(),
                    errorRate: (data.error_rate || 0) * 100,
                    keyRate: data.key_rate || 0,
                    efficiency: (data.efficiency || 0) * 100,
                    bitIndex: data.bit_index,
                    backend: data.backend_name,
                    isRealQuantum: data.use_real_quantum
                }]);

                // Log quantum bit transmission
                if (data.bit_index % 10 === 0) {  // Log every 10th bit
                    addActivity(
                        `Transmitted bit ${data.bit_index + 1}/${data.progress ? Math.round(1 / data.progress) : '?'} via ${data.backend_name}`,
                        'QUANTUM_TRANSMISSION'
                    );
                }
                break;

            case 'security_alert':
                setSecurityAlerts(prev => [...prev.slice(-10), message.data]);
                addActivity(`🚨 ${message.data.message}`, 'SECURITY_ALERT');
                break;

            case 'activity_log':
                addActivity(message.data.action, message.data.action);
                break;

            case 'backend_status':
                setBackendStatus(message.data);
                break;

            case 'bb84_complete':
                setQkdResults(message.data);
                break;
        }
    };

    const addActivity = (action, type) => {
        const activity = {
            action: typeof action === 'string' ? action : action.replace(/_/g, ' '),
            type,
            timestamp: new Date().toISOString()
        };
        setActivityLog(prev => [...prev.slice(-100), activity]);
    };

    const sendMessage = (message) => {
        if (socketRef.current && isConnected) {
            socketRef.current.send(JSON.stringify(message));
            return true;
        }
        return false;
    };

    const startQuantumBB84 = (message = "Hello Quantum World!", numBits = 100, useRealQuantum = false) => {
        return sendMessage({
            type: 'start_bb84_full',
            message,
            num_bits: numBits,
            use_real_quantum: useRealQuantum
        });
    };

    const simulateAdvancedEavesdropper = () => {
        return sendMessage({
            type: 'simulate_eavesdropper_advanced'
        });
    };

    return {
        isConnected,
        quantumState,
        activityLog,
        securityAlerts,
        realTimeData,
        transmissionProgress,
        backendStatus,
        qkdResults,
        startQuantumBB84,
        simulateAdvancedEavesdropper,
        sendMessage
    };
};

export default useQuantumWebSocket;
