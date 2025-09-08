import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const useQuantumWebSocket = () => {
    // ===== CONNECTION STATE =====
    const [isConnected, setIsConnected] = useState(false);
    const [socket, setSocket] = useState(null);
    const [backendStatus, setBackendStatus] = useState(null);

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
    const reconnectTimeoutRef = useRef(null);

    // ===== SOCKET CONNECTION SETUP =====
    useEffect(() => {
        const connectSocket = () => {
            console.log('🔌 Attempting to connect to Quantum WebSocket...');

            const newSocket = io('https://mnh8wn6h-8000.inc1.devtunnels.ms', {
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
                console.log('✅ Connected to Enhanced QKD WebSocket Server');
                setIsConnected(true);
                setSocket(newSocket);
                socketRef.current = newSocket;

                // Clear any reconnection timeout
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
            });

            newSocket.on('disconnect', () => {
                console.log('❌ Disconnected from QKD WebSocket Server');
                setIsConnected(false);

                // Set up reconnection timeout
                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log('🔄 Attempting to reconnect...');
                    connectSocket();
                }, 3000);
            });

            newSocket.on('connect_error', (error) => {
                console.error('❌ WebSocket connection error:', error);
                setIsConnected(false);
            });

            // ===== IBM QUANTUM EVENTS =====
            newSocket.on('quantum_initialization', (data) => {
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
            });

            newSocket.on('backend_status_update', (data) => {
                console.log('📊 Backend Status Update:', data);
                setQuantumBackendInfo(data);
            });

            newSocket.on('quantum_hardware_feedback', (data) => {
                console.log('🔮 Hardware Feedback:', data);
                setQuantumHardwareFeedback(prev => [...prev, data]);
            });

            newSocket.on('quantum_fallback_notice', (data) => {
                console.warn('⚠ Quantum Fallback:', data.message);
                setActivityLog(prev => [...prev, {
                    action:  ${data.message},
                    timestamp: new Date().toISOString(),
                    type: 'FALLBACK'
                }]);
            });

            // ===== QUANTUM STATE EVENTS =====
            newSocket.on('quantum_state_update', (data) => {
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
                    state: |${data.alice_bit || 0}⟩${data.alice_basis === 0 ? '_z' : '_x'}
                });

                setBobData({
                    basis: data.bob_basis_name?.charAt(0) || 'x',
                    measured: data.bob_measurement?.toString() || '0',
                    match: data.bases_match ? 'Yes' : 'No'
                });
            });

            // ===== TRANSMISSION LOG EVENTS =====
            newSocket.on('transmission_log_update', (data) => {
                console.log('📝 Transmission Log Update:', data);
                setTransmissionLogs(prev => [...prev, data.log_entry]);
            });

            // ===== BB84 COMPLETION =====
            newSocket.on('bb84_complete', (result) => {
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
                setActivityLog(prev => [...prev, {
                    action: 🎉 BB84 Complete: ${result.bb84_details?.final_key_length}-bit key generated with ${(result.bb84_details?.error_rate * 100)?.toFixed(2)}% QBER,
                    timestamp: new Date().toISOString(),
                    type: 'SUCCESS'
                }]);
            });

            // ===== ACTIVITY & LOGGING =====
            newSocket.on('activity_log', (log) => {
                setActivityLog(prev => [...prev, {
                    ...log,
                    timestamp: log.timestamp || new Date().toISOString()
                }]);
            });

            newSocket.on('security_alert', (alert) => {
                console.warn('🚨 Security Alert:', alert);
                setSecurityAlerts(prev => [...prev, {
                    ...alert,
                    timestamp: new Date().toISOString()
                }]);
            });

            // ===== EAVESDROPPER ANALYSIS =====
            newSocket.on('eavesdropper_chart_update', (data) => {
                setEavesdropperChartData(prev => [...prev, data]);
            });

            // ===== ENCRYPTION/DECRYPTION =====
            newSocket.on('encryption_result', (result) => {
                console.log('🔐 Encryption Result:', result);
                setEncryptionResults(result);
            });

            newSocket.on('decryption_result', (result) => {
                console.log('🔓 Decryption Result:', result);
                setDecryptionResults(result);
            });

            // ===== BACKEND STATUS =====
            newSocket.on('backend_status', (status) => {
                console.log('⚡ Backend Status:', status);
                setBackendStatus(status.data);
            });

            return newSocket;
        };

        const socket = connectSocket();

        // Cleanup function
        return () => {
            console.log('🧹 Cleaning up WebSocket connection...');

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }

            if (socket) {
                socket.removeAllListeners();
                socket.close();
            }

            setIsConnected(false);
            setSocket(null);
            socketRef.current = null;
        };
    }, []);

    // ===== IBM QUANTUM FUNCTIONS =====
    const initializeIBMQuantum = useCallback(async (token, instance = null) => {
        if (!socket) {
            console.error('❌ No WebSocket connection available');
            return { success: false, error: 'No connection to server' };
        }

        try {
            // First, validate token via REST API
            const response = await fetch('http://localhost:8000/api/quantum/iam-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ api_key: token })
            });

            const tokenResult = await response.json();

            if (!tokenResult.success) {
                return { success: false, error: tokenResult.error };
            }

            // Then initialize with the original token
            const initResponse = await fetch('http://localhost:8000/api/quantum/initialize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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
    }, [socket]);

    const getQuantumBackendStatus = useCallback(async () => {
        if (!socket) return null;

        try {
            const response = await fetch('http://localhost:8000/api/quantum/status');
            const result = await response.json();

            if (result.success) {
                setQuantumBackendInfo(result);
            }

            return result;
        } catch (error) {
            console.error('❌ Backend status error:', error);
            return { success: false, error: error.message };
        }
    }, [socket]);

    // ===== QUANTUM KEY GENERATION =====
    const startEnhancedBB84 = useCallback((message, keyLength, useRealQuantum = false) => {
        if (!socket) {
            console.error('❌ No WebSocket connection');
            return;
        }

        console.log(🚀 Starting Enhanced BB84: ${keyLength}-bit key, Real Quantum: ${useRealQuantum});

        // Reset all related state
        setQkdResults(null);
        setTransmissionLogs([]);
        setQuantumUpdates([]);
        setRealTimeData([]);
        setTransmissionProgress(0);
        setCurrentProgress(0);
        setQuantumHardwareFeedback([]);

        socket.emit('start_complete_bb84', {
            message,
            key_length: keyLength,
            use_real_quantum: useRealQuantum
        });
    }, [socket]);

    const startLiveBB84 = useCallback((keyLength, useRealQuantum = false) => {
        startEnhancedBB84('Live BB84 Key Generation', keyLength, useRealQuantum);
    }, [startEnhancedBB84]);

    // ===== ENCRYPTION/DECRYPTION =====
    const encryptMessage = useCallback((plaintext) => {
        if (!socket) {
            console.error('❌ No WebSocket connection');
            return;
        }

        socket.emit('encrypt_aes', { plaintext });
    }, [socket]);

    const decryptMessage = useCallback((ciphertext) => {
        if (!socket) {
            console.error('❌ No WebSocket connection');
            return;
        }

        socket.emit('decrypt_aes', { ciphertext });
    }, [socket]);

    const encryptWithClassical = useCallback((plaintext) => {
        // Placeholder for classical encryption
        encryptMessage(plaintext);
    }, [encryptMessage]);

    const decryptWithClassical = useCallback((ciphertext) => {
        // Placeholder for classical decryption
        decryptMessage(ciphertext);
    }, [decryptMessage]);

    // ===== EAVESDROPPER ANALYSIS =====
    const simulateAdvancedEavesdropper = useCallback(() => {
        if (!socket) {
            console.error('❌ No WebSocket connection');
            return;
        }

        console.log('🕵 Starting Advanced Eavesdropper Analysis');
        setEavesdropperChartData([]); // Reset chart data
        socket.emit('simulate_advanced_eavesdropper');
    }, [socket]);

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
        if (!socket) {
            console.error('❌ No WebSocket connection');
            return;
        }

        socket.emit(eventName, data);
    }, [socket]);

    // ===== RETURN HOOK API =====
    return {
        // Connection state
        isConnected,
        socket,
        backendStatus,

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
        sendCustomMessage
    };
};

export default useQuantumWebSocket;
