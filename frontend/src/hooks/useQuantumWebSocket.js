import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const useQuantumWebSocket = (connectionType = 'socketio', backendUrl = null) => {
    // ===== CONNECTION STATE =====
    const [isConnected, setIsConnected] = useState(false);
    const [socket, setSocket] = useState(null);
    const [backendStatus, setBackendStatus] = useState(null);
    const [connectionType_, setConnectionType] = useState(connectionType);

    // ===== QUANTUM DATA STATE =====
    const [quantumState, setQuantumState] = useState(null);
    const [quantumUpdates, setQuantumUpdates] = useState([]);
    const [qkdResults, setQkdResults] = useState(null);
    const [encryptionResults, setEncryptionResults] = useState(null);
    const [decryptionResults, setDecryptionResults] = useState(null);
    const [currentStatistics, setCurrentStatistics] = useState(null);

    // ===== IBM QUANTUM STATE =====
    const [ibmQuantumStatus, setIbmQuantumStatus] = useState(null);
    const [quantumBackendInfo, setQuantumBackendInfo] = useState(null);

    // ===== REAL-TIME DATA =====
    const [activityLog, setActivityLog] = useState([]);
    const [securityAlerts, setSecurityAlerts] = useState([]);
    const [realTimeData, setRealTimeData] = useState([]);
    const [eavesdropperChartData, setEavesdropperChartData] = useState([]);
    const [transmissionProgress, setTransmissionProgress] = useState(0);
    const [currentProgress, setCurrentProgress] = useState(0);

    // ===== TRANSMISSION STATE =====
    const [transmissionLogs, setTransmissionLogs] = useState([]);
    const [aliceData, setAliceData] = useState(null);
    const [bobData, setBobData] = useState(null);
    const [quantumHardwareFeedback, setQuantumHardwareFeedback] = useState([]);

    // ===== REFS =====
    const socketRef = useRef(null);
    const clientIdRef = useRef('quantum_client_' + Date.now());
    const reconnectTimeoutRef = useRef(null);

    // ===== UTILITY FUNCTIONS =====
    const addActivity = useCallback((action, type = 'LOG') => {
        const activity = { 
            action, 
            type, 
            timestamp: new Date().toISOString() 
        };
        setActivityLog(prev => [...prev.slice(-100), activity]);
    }, []);

    // ===== MESSAGE HANDLERS =====
    const handleQuantumStateUpdate = useCallback((data) => {
        setQuantumState(data);
        setQuantumUpdates(prev => [...prev.slice(-49), data]);

        // Update current statistics
        if (data.statistics) {
            setCurrentStatistics(data.statistics);
        }

        // Update progress
        if (data.progress !== undefined) {
            setTransmissionProgress(data.progress);
            setCurrentProgress(data.progress);
        }

        // Add to real-time data for charts
        if (data.bit_index !== undefined) {
            const chartData = {
                bitIndex: data.bit_index,
                errorRate: (data.statistics?.current_error_rate || 0) * 100,
                efficiency: (data.statistics?.efficiency || 0) * 100,
                basesMatch: data.bases_match ? 1 : 0,
                timestamp: new Date().toISOString()
            };
            setRealTimeData(prev => [...prev.slice(-99), chartData]);
        }

        // Update Alice and Bob data for transmission panel
        setAliceData({
            bit: data.alice_bit?.toString() || '0',
            basis: data.alice_basis_name?.charAt(0) || '+',
            state: `|${data.alice_bit || 0}⟩${data.alice_basis === 0 ? '_z' : '_x'}`
        });

        setBobData({
            basis: data.bob_basis_name?.charAt(0) || 'x',
            measured: data.bob_measurement?.toString() || '0',
            match: data.bases_match ? 'Yes' : 'No'
        });
    }, []);

    const handleBB84Complete = useCallback((result) => {
        console.log('✅ BB84 Protocol Complete:', result);
        setQkdResults(result);

        // Update transmission logs if provided
        if (result.transmission_logs) {
            setTransmissionLogs(result.transmission_logs);
        }

        // Reset progress
        setTransmissionProgress(1);
        setCurrentProgress(1);

        // Add completion to activity log
        addActivity(
            `🎉 BB84 Complete: ${result.bb84_details?.final_key_length}-bit key generated with ${(result.bb84_details?.error_rate * 100)?.toFixed(2)}% QBER`,
            'SUCCESS'
        );
    }, [addActivity]);

    const handleMessage = useCallback((message) => {
        const data = message.data || message;
        const messageType = message.type || message.event;

        switch (messageType) {
            case 'quantum_state_update':
                handleQuantumStateUpdate(data);
                break;

            case 'security_alert':
                setSecurityAlerts(prev => [...prev.slice(-10), {
                    ...data,
                    timestamp: new Date().toISOString()
                }]);
                addActivity(`🚨 ${data.message || data.action}`, 'SECURITY_ALERT');
                break;

            case 'activity_log':
                addActivity(data.action || data.message, data.type || 'LOG');
                break;

            case 'backend_status':
                setBackendStatus(data);
                break;

            case 'bb84_complete':
                handleBB84Complete(data);
                break;

            case 'quantum_hardware_feedback':
                setQuantumHardwareFeedback(prev => [...prev, data]);
                break;

            case 'encryption_result':
                console.log('🔐 Encryption Result:', data);
                setEncryptionResults(data);
                break;

            case 'decryption_result':
                console.log('🔓 Decryption Result:', data);
                setDecryptionResults(data);
                break;

            case 'eavesdropper_chart_update':
                setEavesdropperChartData(prev => [...prev, data]);
                break;

            case 'transmission_log_update':
                setTransmissionLogs(prev => [...prev, data.log_entry || data]);
                break;

            case 'quantum_initialization':
                console.log('🚀 IBM Quantum Initialization Result:', data);
                setIbmQuantumStatus(data);
                if (data.success) {
                    setQuantumBackendInfo({
                        backend_name: data.backend_name,
                        quantum_hardware: data.quantum_hardware,
                        operational: data.operational,
                        pending_jobs: data.pending_jobs
                    });
                }
                break;

            case 'backend_status_update':
                console.log('📊 Backend Status Update:', data);
                setQuantumBackendInfo(data);
                break;

            case 'quantum_fallback_notice':
                console.warn('⚠️ Quantum Fallback:', data.message);
                addActivity(`⚠️ ${data.message}`, 'FALLBACK');
                break;

            default:
                console.warn('Unhandled message type:', messageType, data);
        }
    }, [handleQuantumStateUpdate, handleBB84Complete, addActivity]);

    // ===== SOCKET.IO CONNECTION =====
    const connectSocketIO = useCallback(() => {
        console.log('🔌 Attempting to connect via Socket.IO...');
        
        const socketIOUrl = backendUrl || 'http://localhost:8000';
        const newSocket = io(socketIOUrl, {
            transports: ['websocket', 'polling'],
            timeout: 10000,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
            reconnectionDelayMax: 10000,
            maxReconnectionAttempts: 10,
            forceNew: true
        });

        // ===== CONNECTION EVENTS =====
        newSocket.on('connect', () => {
            console.log('✅ Connected to Enhanced QKD WebSocket Server (Socket.IO)');
            setIsConnected(true);
            setSocket(newSocket);
            socketRef.current = newSocket;
            addActivity('🟢 Socket.IO connection established', 'CONNECTION');

            // Clear any reconnection timeout
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
        });

        newSocket.on('disconnect', () => {
            console.log('❌ Disconnected from QKD WebSocket Server');
            setIsConnected(false);
            addActivity('🔌 Socket.IO connection closed', 'CONNECTION');

            // Set up reconnection timeout
            reconnectTimeoutRef.current = setTimeout(() => {
                console.log('🔄 Attempting to reconnect...');
                connectSocketIO();
            }, 3000);
        });

        newSocket.on('connect_error', (error) => {
            console.error('❌ Socket.IO connection error:', error);
            setIsConnected(false);
            addActivity('🚨 Socket.IO connection error', 'ERROR');
        });

        // ===== ALL EVENT HANDLERS =====
        const events = [
            'quantum_state_update', 'bb84_complete', 'encryption_result', 'decryption_result',
            'activity_log', 'security_alert', 'eavesdropper_chart_update', 'transmission_log_update',
            'quantum_initialization', 'backend_status_update', 'quantum_hardware_feedback',
            'quantum_fallback_notice', 'backend_status'
        ];

        events.forEach(event => {
            newSocket.on(event, (data) => {
                handleMessage({ type: event, data });
            });
        });

        return newSocket;
    }, [backendUrl, addActivity, handleMessage]);

    // ===== NATIVE WEBSOCKET CONNECTION =====
    const connectWebSocket = useCallback(() => {
        console.log('🔌 Attempting to connect via Native WebSocket...');
        
        const wsUrl = backendUrl || `wss://quantum-backend-bf4k.onrender.com/ws/${clientIdRef.current}?token=abc123`;
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log('✅ Connected to Quantum WebSocket server (Native)');
            setIsConnected(true);
            socketRef.current = socket;
            setSocket({ send: (data) => socket.send(data), emit: () => {} }); // Compatibility layer
            addActivity('🟢 Native WebSocket connection established', 'CONNECTION');

            // Send initial request to backend
            const initMessage = JSON.stringify({ type: 'get_backend_status' });
            socket.send(initMessage);
        };

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                handleMessage(message);
            } catch (err) {
                console.error('⚠ Failed to parse message:', err);
                addActivity('⚠ Invalid message format received', 'ERROR');
            }
        };

        socket.onclose = (event) => {
            console.log('🔴 Disconnected from Quantum WebSocket server', event.code);
            setIsConnected(false);
            addActivity('🔌 Native WebSocket connection closed', 'CONNECTION');

            // Reconnect after delay
            reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
        };

        socket.onerror = (err) => {
            console.error('🚨 Native WebSocket error:', err);
            addActivity('🚨 Native WebSocket encountered an error', 'ERROR');
        };

        return socket;
    }, [backendUrl, addActivity, handleMessage]);

    // ===== CONNECTION SETUP =====
    useEffect(() => {
        const connect = connectionType_ === 'socketio' ? connectSocketIO : connectWebSocket;
        const socket = connect();

        // Cleanup function
        return () => {
            console.log('🧹 Cleaning up WebSocket connection...');

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }

            if (socket) {
                if (connectionType_ === 'socketio') {
                    socket.removeAllListeners();
                    socket.close();
                } else {
                    socket.close();
                }
            }

            setIsConnected(false);
            setSocket(null);
            socketRef.current = null;
        };
    }, [connectionType_, connectSocketIO, connectWebSocket]);

    // ===== SEND MESSAGE FUNCTION =====
    const sendMessage = useCallback((message) => {
        if (!socketRef.current || !isConnected) {
            console.error('❌ No WebSocket connection available');
            return false;
        }

        try {
            if (connectionType_ === 'socketio') {
                // Socket.IO emit
                const eventName = message.type || 'message';
                const data = { ...message };
                delete data.type;
                socketRef.current.emit(eventName, data);
            } else {
                // Native WebSocket send
                socketRef.current.send(JSON.stringify(message));
            }
            return true;
        } catch (error) {
            console.error('❌ Failed to send message:', error);
            return false;
        }
    }, [isConnected, connectionType_]);

    // ===== IBM QUANTUM FUNCTIONS =====
    const initializeIBMQuantum = useCallback(async (token, instance = null) => {
        if (connectionType_ === 'socketio') {
            try {
                const socketIOUrl = backendUrl || 'http://localhost:8000';
                
                // First, validate token via REST API
                const response = await fetch(`${socketIOUrl}/api/quantum/iam-token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ api_key: token })
                });

                const tokenResult = await response.json();
                if (!tokenResult.success) {
                    return { success: false, error: tokenResult.error };
                }

                // Then initialize with the original token
                const initResponse = await fetch(`${socketIOUrl}/api/quantum/initialize`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, instance })
                });

                const result = await initResponse.json();

                if (result.success) {
                    setIbmQuantumStatus(result);
                    setQuantumBackendInfo({
                        backend_name: result.backend_name,
                        quantum_hardware: result.quantum_hardware,
                        operational: result.operational,
                        pending_jobs: result.pending_jobs
                    });
                }

                return result;
            } catch (error) {
                console.error('❌ IBM Quantum initialization error:', error);
                return { success: false, error: error.message };
            }
        } else {
            // For native WebSocket, send initialization message
            return sendMessage({
                type: 'initialize_ibm_quantum',
                token,
                instance
            });
        }
    }, [connectionType_, backendUrl, sendMessage]);

    const getQuantumBackendStatus = useCallback(async () => {
        if (connectionType_ === 'socketio') {
            try {
                const socketIOUrl = backendUrl || 'http://localhost:8000';
                const response = await fetch(`${socketIOUrl}/api/quantum/status`);
                const result = await response.json();

                if (result.success) {
                    setQuantumBackendInfo(result);
                }

                return result;
            } catch (error) {
                console.error('❌ Backend status error:', error);
                return { success: false, error: error.message };
            }
        } else {
            return sendMessage({ type: 'get_backend_status' });
        }
    }, [connectionType_, backendUrl, sendMessage]);

    // ===== QUANTUM OPERATIONS =====
    const startEnhancedBB84 = useCallback((message, keyLength, useRealQuantum = false) => {
        console.log(`🚀 Starting Enhanced BB84: ${keyLength}-bit key, Real Quantum: ${useRealQuantum}`);

        // Reset all related state
        setQkdResults(null);
        setTransmissionLogs([]);
        setQuantumUpdates([]);
        setRealTimeData([]);
        setTransmissionProgress(0);
        setCurrentProgress(0);
        setQuantumHardwareFeedback([]);

        return sendMessage({
            type: 'start_complete_bb84',
            message,
            key_length: keyLength,
            use_real_quantum: useRealQuantum
        });
    }, [sendMessage]);

    const startLiveBB84 = useCallback((keyLength, useRealQuantum = false) => {
        return startEnhancedBB84('Live BB84 Key Generation', keyLength, useRealQuantum);
    }, [startEnhancedBB84]);

    // ===== ENCRYPTION/DECRYPTION =====
    const encryptMessage = useCallback((plaintext) => {
        return sendMessage({ 
            type: 'encrypt_aes', 
            plaintext 
        });
    }, [sendMessage]);

    const decryptMessage = useCallback((ciphertext) => {
        return sendMessage({ 
            type: 'decrypt_aes', 
            ciphertext 
        });
    }, [sendMessage]);

    const encryptWithClassical = useCallback((plaintext) => {
        return encryptMessage(plaintext);
    }, [encryptMessage]);

    const decryptWithClassical = useCallback((ciphertext) => {
        return decryptMessage(ciphertext);
    }, [decryptMessage]);

    // ===== EAVESDROPPER ANALYSIS =====
    const simulateAdvancedEavesdropper = useCallback(() => {
        console.log('🕵️ Starting Advanced Eavesdropper Analysis');
        setEavesdropperChartData([]); // Reset chart data
        return sendMessage({ type: 'simulate_advanced_eavesdropper' });
    }, [sendMessage]);

    // ===== UTILITY FUNCTIONS =====
    const resetAllData = useCallback(() => {
        setQkdResults(null);
        setEncryptionResults(null);
        setDecryptionResults(null);
        setTransmissionLogs([]);
        setQuantumUpdates([]);
        setRealTimeData([]);
        setEavesdropperChartData([]);
        setActivityLog([]);
        setSecurityAlerts([]);
        setTransmissionProgress(0);
        setCurrentProgress(0);
        setQuantumHardwareFeedback([]);
    }, []);

    const sendCustomMessage = useCallback((eventName, data) => {
        return sendMessage({ type: eventName, ...data });
    }, [sendMessage]);

    // ===== CONNECTION TYPE SWITCHER =====
    const switchConnectionType = useCallback((newType) => {
        if (newType !== connectionType_) {
            // Close current connection
            if (socketRef.current) {
                if (connectionType_ === 'socketio') {
                    socketRef.current.removeAllListeners();
                    socketRef.current.close();
                } else {
                    socketRef.current.close();
                }
            }
            
            setIsConnected(false);
            setSocket(null);
            socketRef.current = null;
            setConnectionType(newType);
        }
    }, [connectionType_]);

    // ===== RETURN HOOK API =====
    return {
        // Connection state
        isConnected,
        socket,
        backendStatus,
        connectionType: connectionType_,

        // IBM Quantum state
        ibmQuantumStatus,
        quantumBackendInfo,

        // Quantum data
        quantumState,
        quantumUpdates,
        qkdResults,
        encryptionResults,
        decryptionResults,
        currentStatistics,

        // Real-time data
        activityLog,
        securityAlerts,
        realTimeData,
        eavesdropperChartData,
        transmissionProgress,
        currentProgress,

        // Transmission data
        transmissionLogs,
        aliceData,
        bobData,
        quantumHardwareFeedback,

        // IBM Quantum functions
        initializeIBMQuantum,
        getQuantumBackendStatus,

        // Quantum operations
        startEnhancedBB84,
        startLiveBB84,
        encryptMessage,
        decryptMessage,
        encryptWithClassical,
        decryptWithClassical,
        simulateAdvancedEavesdropper,

        // Utility functions
        resetAllData,
        sendMessage,
        sendCustomMessage,
        switchConnectionType
    };
};

export default useQuantumWebSocket;
