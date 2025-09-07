import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const useQuantumWebSocket = (config = {}) => {
    // ===== CONFIGURATION =====
    const {
        primaryConnection = 'render', // 'render', 'localhost', or 'auto'
        fallbackConnection = 'localhost',
        renderUrl = 'wss://quantum-backend-bf4k.onrender.com',
        localhostUrl = 'http://localhost:8000',
        autoFallback = true
    } = config;

    // ===== CONNECTION STATE =====
    const [isConnected, setIsConnected] = useState(false);
    const [socket, setSocket] = useState(null);
    const [backendStatus, setBackendStatus] = useState(null);
    const [activeConnection, setActiveConnection] = useState(primaryConnection);
    const [connectionAttempts, setConnectionAttempts] = useState(0);

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
    const connectionTypeRef = useRef(primaryConnection);

    // ===== UTILITY FUNCTIONS =====
    const addActivity = useCallback((action, type = 'LOG') => {
        const activity = { 
            action, 
            type, 
            timestamp: new Date().toISOString(),
            connection: activeConnection
        };
        setActivityLog(prev => [...prev.slice(-100), activity]);
    }, [activeConnection]);

    // ===== MESSAGE HANDLERS =====
    const handleQuantumStateUpdate = useCallback((data) => {
        setQuantumState(data);
        setQuantumUpdates(prev => [...prev.slice(-49), data]);

        if (data.statistics) {
            setCurrentStatistics(data.statistics);
        }

        if (data.progress !== undefined) {
            setTransmissionProgress(data.progress);
            setCurrentProgress(data.progress);
        }

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

        if (result.transmission_logs) {
            setTransmissionLogs(result.transmission_logs);
        }

        setTransmissionProgress(1);
        setCurrentProgress(1);

        addActivity(
            `🎉 BB84 Complete: ${result.bb84_details?.final_key_length || result.final_key_length}-bit key generated with ${((result.bb84_details?.error_rate || result.error_rate) * 100)?.toFixed(2)}% QBER`,
            'SUCCESS'
        );
    }, [addActivity]);

    const handleMessage = useCallback((message) => {
        // Handle both Socket.IO and WebSocket message formats
        const data = message.data || message;
        const messageType = message.type || message.event;

        console.log(`📨 Received message [${activeConnection}]:`, messageType, data);

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
    }, [activeConnection, handleQuantumStateUpdate, handleBB84Complete, addActivity]);

    // ===== RENDER WEBSOCKET CONNECTION (NATIVE) =====
    const connectRenderWebSocket = useCallback(() => {
        return new Promise((resolve, reject) => {
            console.log('🔌 Attempting to connect to Render WebSocket...');
            
            const wsUrl = `${renderUrl}/ws/${clientIdRef.current}?token=abc123`;
            const socket = new WebSocket(wsUrl);

            const timeout = setTimeout(() => {
                socket.close();
                reject(new Error('Connection timeout'));
            }, 10000);

            socket.onopen = () => {
                clearTimeout(timeout);
                console.log('✅ Connected to Render Quantum WebSocket server');
                setIsConnected(true);
                setActiveConnection('render');
                socketRef.current = socket;
                setSocket({ 
                    send: (data) => socket.send(data), 
                    emit: (event, data) => socket.send(JSON.stringify({ type: event, ...data })),
                    close: () => socket.close(),
                    connectionType: 'websocket'
                });
                addActivity('🟢 Render WebSocket connection established', 'CONNECTION');

                // Send initial request to backend
                const initMessage = JSON.stringify({ type: 'get_backend_status' });
                socket.send(initMessage);
                
                resolve(socket);
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
                clearTimeout(timeout);
                console.log('🔴 Disconnected from Render WebSocket server', event.code);
                setIsConnected(false);
                addActivity('🔌 Render WebSocket connection closed', 'CONNECTION');
                
                if (event.code !== 1000) { // Not a normal closure
                    reject(new Error(`Connection closed with code ${event.code}`));
                }
            };

            socket.onerror = (err) => {
                clearTimeout(timeout);
                console.error('🚨 Render WebSocket error:', err);
                addActivity('🚨 Render WebSocket encountered an error', 'ERROR');
                reject(err);
            };
        });
    }, [renderUrl, addActivity, handleMessage]);

    // ===== LOCALHOST SOCKET.IO CONNECTION =====
    const connectLocalhostSocketIO = useCallback(() => {
        return new Promise((resolve, reject) => {
            console.log('🔌 Attempting to connect to Localhost Socket.IO...');
            
            const newSocket = io(localhostUrl, {
                transports: ['websocket', 'polling'],
                timeout: 10000,
                reconnection: false, // We handle reconnection manually
                forceNew: true
            });

            const timeout = setTimeout(() => {
                newSocket.close();
                reject(new Error('Socket.IO connection timeout'));
            }, 10000);

            newSocket.on('connect', () => {
                clearTimeout(timeout);
                console.log('✅ Connected to Localhost Socket.IO server');
                setIsConnected(true);
                setActiveConnection('localhost');
                socketRef.current = newSocket;
                setSocket(newSocket);
                addActivity('🟢 Localhost Socket.IO connection established', 'CONNECTION');

                // Setup all Socket.IO event listeners
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

                resolve(newSocket);
            });

            newSocket.on('connect_error', (error) => {
                clearTimeout(timeout);
                console.error('❌ Socket.IO connection error:', error);
                addActivity('🚨 Socket.IO connection error', 'ERROR');
                reject(error);
            });

            newSocket.on('disconnect', () => {
                setIsConnected(false);
                addActivity('🔌 Socket.IO connection closed', 'CONNECTION');
            });
        });
    }, [localhostUrl, addActivity, handleMessage]);

    // ===== SMART CONNECTION LOGIC =====
    const attemptConnection = useCallback(async (connectionType) => {
        try {
            setConnectionAttempts(prev => prev + 1);
            
            if (connectionType === 'render') {
                await connectRenderWebSocket();
                return true;
            } else if (connectionType === 'localhost') {
                await connectLocalhostSocketIO();
                return true;
            }
            return false;
        } catch (error) {
            console.error(`❌ Failed to connect via ${connectionType}:`, error);
            addActivity(`❌ ${connectionType} connection failed: ${error.message}`, 'ERROR');
            return false;
        }
    }, [connectRenderWebSocket, connectLocalhostSocketIO, addActivity]);

    const connectWithFallback = useCallback(async () => {
        const connectionsToTry = primaryConnection === 'auto' 
            ? ['render', 'localhost'] 
            : [primaryConnection, ...(autoFallback ? [fallbackConnection] : [])];

        for (const connectionType of connectionsToTry) {
            console.log(`🔄 Trying ${connectionType} connection...`);
            
            const success = await attemptConnection(connectionType);
            if (success) {
                connectionTypeRef.current = connectionType;
                setConnectionAttempts(0);
                return;
            }
            
            // Wait before trying next connection
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // If all connections failed, schedule retry
        console.log('❌ All connection attempts failed. Retrying in 5 seconds...');
        addActivity('❌ All connections failed. Retrying...', 'ERROR');
        
        reconnectTimeoutRef.current = setTimeout(() => {
            connectWithFallback();
        }, 5000);
    }, [primaryConnection, fallbackConnection, autoFallback, attemptConnection, addActivity]);

    // ===== CONNECTION SETUP =====
    useEffect(() => {
        connectWithFallback();

        // Cleanup function
        return () => {
            console.log('🧹 Cleaning up WebSocket connections...');

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }

            if (socketRef.current) {
                if (socketRef.current.removeAllListeners) {
                    socketRef.current.removeAllListeners();
                }
                if (socketRef.current.close) {
                    socketRef.current.close();
                } else if (socketRef.current.disconnect) {
                    socketRef.current.disconnect();
                }
            }

            setIsConnected(false);
            setSocket(null);
            socketRef.current = null;
        };
    }, [connectWithFallback]);

    // ===== SEND MESSAGE FUNCTION =====
    const sendMessage = useCallback((message) => {
        if (!socketRef.current || !isConnected) {
            console.error('❌ No WebSocket connection available');
            addActivity('❌ Cannot send message: No connection', 'ERROR');
            return false;
        }

        try {
            console.log(`📤 Sending message via ${activeConnection}:`, message);

            if (activeConnection === 'localhost' && socketRef.current.emit) {
                // Socket.IO emit
                const eventName = message.type || 'message';
                const data = { ...message };
                delete data.type;
                socketRef.current.emit(eventName, data);
            } else {
                // Native WebSocket send
                if (socketRef.current.send) {
                    socketRef.current.send(JSON.stringify(message));
                } else {
                    console.error('❌ Socket does not have send method');
                    return false;
                }
            }
            return true;
        } catch (error) {
            console.error('❌ Failed to send message:', error);
            addActivity(`❌ Failed to send message: ${error.message}`, 'ERROR');
            return false;
        }
    }, [isConnected, activeConnection, addActivity]);

    // ===== IBM QUANTUM FUNCTIONS =====
    const initializeIBMQuantum = useCallback(async (token, instance = null) => {
        if (activeConnection === 'localhost') {
            try {
                // First, validate token via REST API
                const response = await fetch(`${localhostUrl}/api/quantum/iam-token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ api_key: token })
                });

                const tokenResult = await response.json();
                if (!tokenResult.success) {
                    return { success: false, error: tokenResult.error };
                }

                // Then initialize with the original token
                const initResponse = await fetch(`${localhostUrl}/api/quantum/initialize`, {
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
            // For Render WebSocket, send initialization message
            return sendMessage({
                type: 'initialize_ibm_quantum',
                token,
                instance
            });
        }
    }, [activeConnection, localhostUrl, sendMessage]);

    const getQuantumBackendStatus = useCallback(async () => {
        if (activeConnection === 'localhost') {
            try {
                const response = await fetch(`${localhostUrl}/api/quantum/status`);
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
    }, [activeConnection, localhostUrl, sendMessage]);

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
        setEavesdropperChartData([]);
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

    const forceReconnect = useCallback(() => {
        if (socketRef.current) {
            if (socketRef.current.close) {
                socketRef.current.close();
            } else if (socketRef.current.disconnect) {
                socketRef.current.disconnect();
            }
        }
        setIsConnected(false);
        setSocket(null);
        socketRef.current = null;
        
        setTimeout(() => {
            connectWithFallback();
        }, 1000);
    }, [connectWithFallback]);

    const switchConnection = useCallback(async (newConnectionType) => {
        console.log(`🔄 Switching to ${newConnectionType} connection...`);
        
        // Close current connection
        if (socketRef.current) {
            if (socketRef.current.removeAllListeners) {
                socketRef.current.removeAllListeners();
            }
            if (socketRef.current.close) {
                socketRef.current.close();
            } else if (socketRef.current.disconnect) {
                socketRef.current.disconnect();
            }
        }

        setIsConnected(false);
        setSocket(null);
        socketRef.current = null;

        // Attempt new connection
        setTimeout(async () => {
            const success = await attemptConnection(newConnectionType);
            if (success) {
                connectionTypeRef.current = newConnectionType;
                addActivity(`✅ Switched to ${newConnectionType}`, 'CONNECTION');
            } else {
                addActivity(`❌ Failed to switch to ${newConnectionType}`, 'ERROR');
                // Fall back to original logic
                connectWithFallback();
            }
        }, 500);
    }, [attemptConnection, addActivity, connectWithFallback]);

    // ===== RETURN HOOK API =====
    return {
        // Connection state
        isConnected,
        socket,
        backendStatus,
        activeConnection,
        connectionAttempts,

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
        forceReconnect,
        switchConnection
    };
};

export default useQuantumWebSocket;
