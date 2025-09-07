import { useState, useEffect, useRef, useCallback } from 'react';

const useQuantumWebSocket = () => {
  // ===== CONNECTION STATE =====
  const [isConnected, setIsConnected] = useState(false);
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
  const clientIdRef = useRef('quantum_client_' + Date.now());
  const reconnectTimeoutRef = useRef(null);

  // ===== WEBSOCKET CONNECTION =====
  useEffect(() => {
    const connectWebSocket = () => {
      const socket = new WebSocket(
        `wss://quantum-backend-bf4k.onrender.com/ws/${clientIdRef.current}?token=abc123`
      );

      socket.onopen = () => {
        console.log('✅ Connected to Quantum WebSocket server');
        setIsConnected(true);
        socketRef.current = socket;
        addActivity('🟢 Real-time connection established', 'CONNECTION');

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
        addActivity('🔌 Connection closed', 'CONNECTION');

        // Reconnect after delay
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
      };

      socket.onerror = (err) => {
        console.error('🚨 WebSocket error:', err);
        addActivity('🚨 WebSocket encountered an error', 'ERROR');
      };
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  // ===== HANDLE INCOMING MESSAGES =====
  const handleMessage = useCallback((message) => {
    switch (message.type) {
      case 'quantum_state_update':
        const data = message.data;
        setQuantumState(data);
        setQuantumUpdates(prev => [...prev.slice(-49), data]);

        if (data.statistics) setCurrentStatistics(data.statistics);
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
        break;

      case 'security_alert':
        setSecurityAlerts(prev => [...prev.slice(-10), message.data]);
        addActivity(`🚨 ${message.data.message}`, 'SECURITY_ALERT');
        break;

      case 'activity_log':
        addActivity(message.data.action, message.data.type || 'LOG');
        break;

      case 'backend_status':
        setBackendStatus(message.data);
        break;

      case 'bb84_complete':
        setQkdResults(message.data);
        if (message.data.transmission_logs) setTransmissionLogs(message.data.transmission_logs);
        setTransmissionProgress(1);
        setCurrentProgress(1);
        addActivity(
          `🎉 BB84 Complete: ${message.data.bb84_details?.final_key_length}-bit key generated with ${(message.data.bb84_details?.error_rate * 100)?.toFixed(2)}% QBER`,
          'SUCCESS'
        );
        break;

      case 'quantum_hardware_feedback':
        setQuantumHardwareFeedback(prev => [...prev, message.data]);
        break;

      case 'encryption_result':
        setEncryptionResults(message.data);
        break;

      case 'decryption_result':
        setDecryptionResults(message.data);
        break;

      case 'eavesdropper_chart_update':
        setEavesdropperChartData(prev => [...prev, message.data]);
        break;

      default:
        console.warn('Unhandled message type:', message.type);
    }
  }, []);

  // ===== UTILITIES =====
  const addActivity = useCallback((action, type) => {
    const activity = { action, type, timestamp: new Date().toISOString() };
    setActivityLog(prev => [...prev.slice(-100), activity]);
  }, []);

  const sendMessage = useCallback((msg) => {
    if (socketRef.current && isConnected) {
      socketRef.current.send(JSON.stringify(msg));
      return true;
    }
    return false;
  }, [isConnected]);

  // ===== QUANTUM OPERATIONS =====
  const startEnhancedBB84 = useCallback((message, keyLength, useRealQuantum = false) => {
    setQkdResults(null);
    setTransmissionLogs([]);
    setQuantumUpdates([]);
    setRealTimeData([]);
    setTransmissionProgress(0);
    setCurrentProgress(0);
    setQuantumHardwareFeedback([]);

    return sendMessage({ type: 'start_complete_bb84', message, key_length: keyLength, use_real_quantum: useRealQuantum });
  }, [sendMessage]);

  const startLiveBB84 = useCallback((keyLength, useRealQuantum = false) => {
    return startEnhancedBB84('Live BB84 Key Generation', keyLength, useRealQuantum);
  }, [startEnhancedBB84]);

  const simulateAdvancedEavesdropper = useCallback(() => {
    return sendMessage({ type: 'simulate_advanced_eavesdropper' });
  }, [sendMessage]);

  const encryptMessage = useCallback((plaintext) => sendMessage({ type: 'encrypt_aes', plaintext }), [sendMessage]);
  const decryptMessage = useCallback((ciphertext) => sendMessage({ type: 'decrypt_aes', ciphertext }), [sendMessage]);

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

  return {
    isConnected,
    quantumState,
    quantumUpdates,
    qkdResults,
    encryptionResults,
    decryptionResults,
    currentStatistics,
    backendStatus,
    ibmQuantumStatus,
    quantumBackendInfo,
    activityLog,
    securityAlerts,
    realTimeData,
    eavesdropperChartData,
    transmissionProgress,
    currentProgress,
    transmissionLogs,
    aliceData,
    bobData,
    quantumHardwareFeedback,
    startEnhancedBB84,
    startLiveBB84,
    simulateAdvancedEavesdropper,
    encryptMessage,
    decryptMessage,
    sendMessage,
    resetAllData
  };
};

export default useQuantumWebSocket;
