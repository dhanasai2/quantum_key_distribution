import { useState, useEffect, useRef } from 'react';

const useWebSocket = (url) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [quantumState, setQuantumState] = useState({ theta: 0, phi: 0 });
    const [securityAlerts, setSecurityAlerts] = useState([]);
    const [activityLog, setActivityLog] = useState([]);

    const clientId = useRef(Math.random().toString(36).substring(7));

    useEffect(() => {
        const ws = new WebSocket(`${url}/${clientId.current}`);

        ws.onopen = () => {
            setIsConnected(true);
            setSocket(ws);
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            setMessages(prev => [...prev.slice(-100), message]); // Keep last 100 messages

            switch (message.type) {
                case 'quantum_state_update':
                    setQuantumState(message.data.quantum_state);
                    break;
                case 'security_alert':
                    setSecurityAlerts(prev => [...prev.slice(-20), message.data]);
                    break;
                case 'activity_log':
                    setActivityLog(prev => [...prev.slice(-50), message.data]);
                    break;
            }
        };

        ws.onclose = () => {
            setIsConnected(false);
            setSocket(null);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            ws.close();
        };
    }, [url]);

    const sendMessage = (message) => {
        if (socket && isConnected) {
            socket.send(JSON.stringify(message));
        }
    };

    return {
        isConnected,
        quantumState,
        securityAlerts,
        activityLog,
        messages,
        sendMessage
    };
};

export default useWebSocket;
