// src/components/EncryptionPanel.jsx
import React, { useState } from 'react';
import { Button } from './common/Button';
import './EncryptionPanel.css';

const EncryptionPanel = () => {
    const [message, setMessage] = useState('');
    const [architecture, setArchitecture] = useState('QKD'); // 'QKD' or 'Classical'
    const [results, setResults] = useState({
        qkd: null,
        classical: null
    });
    const [eavesdropperActive, setEavesdropperActive] = useState(false);

    const handleEncrypt = async (arch) => {
        const endpoint = arch === 'QKD' ? '/api/qkd-encrypt' : '/api/classical-encrypt';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    eavesdropperActive
                })
            });

            const result = await response.json();

            setResults(prev => ({
                ...prev,
                [arch.toLowerCase()]: result
            }));
        } catch (error) {
            console.error(`${arch} encryption failed:`, error);
        }
    };

    return (
        <div className="encryption-panel">
            <div className="input-section">
                <h2>Quantum vs Classical Encryption Demo</h2>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter message (e.g., '101' or 'HELLO')"
                    className="message-input"
                />

                <div className="controls">
                    <label>
                        <input
                            type="checkbox"
                            checked={eavesdropperActive}
                            onChange={(e) => setEavesdropperActive(e.target.checked)}
                        />
                        Simulate Eavesdropper Attack
                    </label>
                </div>
            </div>

            <div className="architectures-container">
                <ArchitecturePanel
                    type="QKD"
                    title="Architecture A - QKD + AES-GCM"
                    onEncrypt={() => handleEncrypt('QKD')}
                    result={results.qkd}
                    eavesdropperActive={eavesdropperActive}
                />

                <ArchitecturePanel
                    type="Classical"
                    title="Architecture B - RSA + AES-GCM"
                    onEncrypt={() => handleEncrypt('Classical')}
                    result={results.classical}
                    eavesdropperActive={eavesdropperActive}
                />
            </div>
        </div>
    );
};
