// src/components/ArchitecturePanel.jsx
const ArchitecturePanel = ({ type, title, onEncrypt, result, eavesdropperActive }) => {
    return (
        <div className={`architecture-panel ${type.toLowerCase()}`}>
            <h3>{title}</h3>

            <div className="process-flow">
                {type === 'QKD' ? (
                    <QKDProcessFlow result={result} eavesdropperActive={eavesdropperActive} />
                ) : (
                    <ClassicalProcessFlow result={result} />
                )}
            </div>

            <Button onClick={onEncrypt} className="encrypt-btn">
                Encrypt & Send ({type})
            </Button>

            {result && <ResultDisplay result={result} type={type} />}
        </div>
    );
};

const QKDProcessFlow = ({ result, eavesdropperActive }) => (
    <div className="process-steps">
        <div className="step">
            <h4>1. BB84 Quantum Key Distribution</h4>
            {result?.qkd && (
                <div className="qkd-details">
                    <p>Raw Key: {result.qkd.rawKey}</p>
                    <p>Reconciled Key: {result.qkd.reconciledKey}</p>
                    <p>QBER: {result.qkd.qber}%</p>
                    {result.qkd.qber > 11 && (
                        <div className="security-alert">
                            ⚠️ High QBER detected - Eavesdropper present!
                        </div>
                    )}
                </div>
            )}
        </div>

        <div className="step">
            <h4>2. Privacy Amplification (HKDF-SHA256)</h4>
            {result?.finalKey && (
                <p>Final AES Key: {result.finalKey.substring(0, 16)}...</p>
            )}
        </div>

        <div className="step">
            <h4>3. AES-GCM Encryption</h4>
            {result?.encrypted && (
                <div className="crypto-output">
                    <p>IV: {result.encrypted.iv}</p>
                    <p>Ciphertext: {result.encrypted.ciphertext}</p>
                    <p>Auth Tag: {result.encrypted.tag}</p>
                </div>
            )}
        </div>
    </div>
);

const ClassicalProcessFlow = ({ result }) => (
    <div className="process-steps">
        <div className="step">
            <h4>1. Generate AES Key</h4>
            {result?.aesKey && (
                <p>AES Key: {result.aesKey.substring(0, 16)}...</p>
            )}
        </div>

        <div className="step">
            <h4>2. RSA-OAEP Key Wrapping</h4>
            {result?.wrappedKey && (
                <p>Wrapped Key: {result.wrappedKey.substring(0, 32)}...</p>
            )}
        </div>

        <div className="step">
            <h4>3. AES-GCM Encryption</h4>
            {result?.encrypted && (
                <div className="crypto-output">
                    <p>IV: {result.encrypted.iv}</p>
                    <p>Ciphertext: {result.encrypted.ciphertext}</p>
                    <p>Auth Tag: {result.encrypted.tag}</p>
                </div>
            )}
        </div>
    </div>
);
