const API_BASE_URL = 'http://127.0.0.1:8000';

class QKDApiService {
    async generateQuantumKey(message, keyLength = 256, useRealQuantum = false) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/qkd/generate-key`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    key_length: keyLength,
                    use_real_quantum: useRealQuantum
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Key generation failed: ${errorData.detail || response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async encryptMessage(plaintext, quantumKey) {
        if (!quantumKey || quantumKey.length === 0) {
            throw new Error('No quantum key available. Please generate a key first.');
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/encryption/encrypt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    plaintext,
                    quantum_key: quantumKey
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Encryption failed: ${errorData.detail || response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Encryption Error:', error);
            throw error;
        }
    }

    async decryptMessage(ciphertext, quantumKey) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/encryption/decrypt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ciphertext,
                    quantum_key: quantumKey
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Decryption failed: ${errorData.detail || response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Decryption Error:', error);
            throw error;
        }
    }

    // ... other methods remain the same
}

export default new QKDApiService();
