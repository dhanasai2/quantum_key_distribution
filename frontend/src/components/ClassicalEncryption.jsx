import React, { useState } from 'react';
import './ClassicalEncryption.css';

const ClassicalEncryption = () => {
    const [message, setMessage] = useState('');
    const [results, setResults] = useState({
        qkd: null,
        classical: null
    });
    const [eavesdropperActive, setEavesdropperActive] = useState(false);
    const [loading, setLoading] = useState({ qkd: false, classical: false });
    const [showComparison, setShowComparison] = useState(false);

    // Original simple encryption (placeholder for your existing logic)
    const handleOriginalEncrypt = async () => {
        alert(`Encrypting message: "${message}" with Quantum-Enhanced AES`);
        // Add your existing encryption logic here
    };

    const handleComparisonEncrypt = async (arch) => {
        setLoading(prev => ({ ...prev, [arch.toLowerCase()]: true }));

        const endpoint = arch === 'QKD'
            ? 'http://localhost:8000/api/qkd-encrypt'
            : 'http://localhost:8000/api/classical-encrypt';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    eavesdropperActive
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            setResults(prev => ({
                ...prev,
                [arch.toLowerCase()]: result
            }));
        } catch (error) {
            console.error(`${arch} encryption failed:`, error);
            alert(`${arch} encryption failed: ${error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, [arch.toLowerCase()]: false }));
        }
    };

    return (
        <div className="classical-encryption-container">
            {/* Enhanced Header */}
            <div className="header-section">
                <h1 className="main-title">
                    <span className="lock-icon">🔐</span>
                    {showComparison ? 'Quantum vs Classical Encryption Comparison' : 'Quantum-Enhanced AES Encryption'}
                </h1>

                {/* Toggle between original and comparison view */}
                <div className="view-toggle">
                    <button
                        className={`toggle-btn ${!showComparison ? 'active' : ''}`}
                        onClick={() => setShowComparison(false)}
                    >
                        🔒 Original Encryption
                    </button>
                    <button
                        className={`toggle-btn ${showComparison ? 'active' : ''}`}
                        onClick={() => setShowComparison(true)}
                    >
                        ⚡ Architecture Comparison
                    </button>
                </div>
            </div>

            {!showComparison ? (
                // Original Interface
                <div className="original-interface">
                    <div className="quantum-enhanced-section">
                        <h2>Quantum-Enhanced AES Encryption</h2>

                        <div className="input-group">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter your message to encrypt"
                                className="message-input original"
                            />
                        </div>

                        <button
                            className="encrypt-message-btn original"
                            onClick={handleOriginalEncrypt}
                            disabled={!message}
                        >
                            <span className="btn-icon">🔒</span>
                            <span className="btn-text">Encrypt Message</span>
                        </button>

                        <div className="original-results">
                            <p>Your encrypted results will appear here...</p>
                        </div>
                    </div>
                </div>
            ) : (
                // New Comparison Interface
                <div className="comparison-interface">
                    <div className="input-section">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter message for architecture comparison (e.g., 'Hello World')"
                            className="message-input comparison"
                        />

                        <div className="controls">
                            <label className="eavesdropper-toggle">
                                <input
                                    type="checkbox"
                                    checked={eavesdropperActive}
                                    onChange={(e) => setEavesdropperActive(e.target.checked)}
                                />
                                🕵️ Simulate Eavesdropper Attack
                            </label>
                        </div>
                    </div>

                    <div className="architectures-container">
                        <ArchitecturePanel
                            type="QKD"
                            title="Architecture A - QKD + AES-GCM"
                            subtitle="Quantum Key Distribution with Privacy Amplification"
                            onEncrypt={() => handleComparisonEncrypt('QKD')}
                            result={results.qkd}
                            loading={loading.qkd}
                            eavesdropperActive={eavesdropperActive}
                            message={message}
                        />

                        <div className="vs-divider">
                            <div className="vs-text">VS</div>
                        </div>

                        <ArchitecturePanel
                            type="Classical"
                            title="Architecture B - RSA + AES-GCM"
                            subtitle="Classical Public Key Cryptography"
                            onEncrypt={() => handleComparisonEncrypt('Classical')}
                            result={results.classical}
                            loading={loading.classical}
                            eavesdropperActive={eavesdropperActive}
                            message={message}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

const ArchitecturePanel = ({ type, title, subtitle, onEncrypt, result, loading, eavesdropperActive, message }) => {
    return (
        <div className={`architecture-panel ${type.toLowerCase()}`}>
            <div className="panel-header">
                <h3>{title}</h3>
                <p className="subtitle">{subtitle}</p>
            </div>

            <div className="process-flow">
                {type === 'QKD' ? (
                    <QKDProcessFlow result={result} eavesdropperActive={eavesdropperActive} />
                ) : (
                    <ClassicalProcessFlow result={result} />
                )}
            </div>

            <button
                onClick={onEncrypt}
                className="encrypt-btn"
                disabled={!message || loading}
            >
                {loading ? '🔄 Processing...' : `🚀 Encrypt & Send (${type})`}
            </button>

            {result && <ResultDisplay result={result} type={type} />}
        </div>
    );
};

const QKDProcessFlow = ({ result, eavesdropperActive }) => (
    <div className="process-steps">
        <div className="step">
            <h4>🔬 1. BB84 Quantum Key Distribution</h4>
            {result?.qkd ? (
                <div className="qkd-details">
                    <p><strong>Raw Key:</strong> {result.qkd.rawKey}...</p>
                    <p><strong>Reconciled Key:</strong> {result.qkd.reconciledKey}...</p>
                    <p><strong>QBER:</strong> {result.qkd.qber}%</p>
                    {result.qkd.qber > 11 && (
                        <div className="security-alert">
                            ⚠️ High QBER detected - Eavesdropper present!
                        </div>
                    )}
                </div>
            ) : (
                <p className="placeholder">🔄 Waiting for quantum key generation...</p>
            )}
        </div>

        <div className="step">
            <h4>🔐 2. Privacy Amplification (HKDF-SHA256)</h4>
            {result?.finalKey ? (
                <p><strong>Final AES Key:</strong> {result.finalKey.substring(0, 16)}...</p>
            ) : (
                <p className="placeholder">📊 Key will be amplified after QKD...</p>
            )}
        </div>

        <div className="step">
            <h4>🛡️ 3. AES-GCM Encryption</h4>
            {result?.encrypted ? (
                <div className="crypto-output">
                    <p><strong>IV:</strong> {result.encrypted.iv.substring(0, 16)}...</p>
                    <p><strong>Ciphertext:</strong> {result.encrypted.ciphertext.substring(0, 20)}...</p>
                    <p><strong>Auth Tag:</strong> {result.encrypted.tag.substring(0, 16)}...</p>
                </div>
            ) : (
                <p className="placeholder">🔒 Encrypted data will appear here...</p>
            )}
        </div>
    </div>
);

const ClassicalProcessFlow = ({ result }) => (
    <div className="process-steps">
        <div className="step">
            <h4>🔑 1. Generate AES Key</h4>
            {result?.aesKey ? (
                <p><strong>AES Key:</strong> {result.aesKey.substring(0, 16)}...</p>
            ) : (
                <p className="placeholder">🎲 Random AES key will be generated...</p>
            )}
        </div>

        <div className="step">
            <h4>📦 2. RSA-OAEP Key Wrapping</h4>
            {result?.wrappedKey ? (
                <p><strong>Wrapped Key:</strong> {result.wrappedKey.substring(0, 32)}...</p>
            ) : (
                <p className="placeholder">🗝️ RSA will wrap the AES key...</p>
            )}
        </div>

        <div className="step">
            <h4>🛡️ 3. AES-GCM Encryption</h4>
            {result?.encrypted ? (
                <div className="crypto-output">
                    <p><strong>IV:</strong> {result.encrypted.iv.substring(0, 16)}...</p>
                    <p><strong>Ciphertext:</strong> {result.encrypted.ciphertext.substring(0, 20)}...</p>
                    <p><strong>Auth Tag:</strong> {result.encrypted.tag.substring(0, 16)}...</p>
                </div>
            ) : (
                <p className="placeholder">🔒 Encrypted data will appear here...</p>
            )}
        </div>
    </div>
);

const ResultDisplay = ({ result, type }) => (
    <div className="result-display">
        <h4>📨 Transmission Result</h4>
        <div className="result-item">
            <strong>Original Message:</strong> {result.originalMessage}
        </div>
        <div className="result-item">
            <strong>Decrypted Message:</strong>
            <span className={result.decrypted === result.originalMessage ? 'success' : 'error'}>
                {result.decrypted || 'DECRYPTION FAILED'}
            </span>
        </div>
        <div className="status">
            {result.decrypted === result.originalMessage ?
                '✅ Message transmitted successfully!' :
                '❌ Message transmission failed!'
            }
        </div>
    </div>
);

export default ClassicalEncryption;
