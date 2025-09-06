import hkdf from 'js-crypto-hkdf';

class QuantumCryptoService {
    constructor() {
        this.encoder = new TextEncoder();
        this.decoder = new TextDecoder();
    }

    // Convert quantum key to usable AES key using HKDF
    async deriveAESKey(quantumKey, salt, info = 'QKD-to-AES') {
        try {
            // Convert hex quantum key to bytes
            const quantumKeyBytes = this.hexToBytes(quantumKey);

            // Use HKDF to derive a proper AES-256 key
            const derivedKey = await hkdf.compute(
                quantumKeyBytes,    // Input Key Material (IKM) - your quantum key
                'SHA-256',          // Hash algorithm
                32,                 // Output key length (256 bits)
                this.encoder.encode(info), // Context info
                salt                // Salt for key derivation
            );

            // Import the derived key for AES-GCM
            return await crypto.subtle.importKey(
                'raw',
                derivedKey,
                { name: 'AES-GCM' },
                false,
                ['encrypt', 'decrypt']
            );
        } catch (error) {
            throw new Error(`Key derivation failed: ${error.message}`);
        }
    }

    // AES-GCM Encryption
    async encryptWithAESGCM(plaintext, quantumKey) {
        try {
            // Generate random salt and IV
            const salt = crypto.getRandomValues(new Uint8Array(32));
            const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM

            // Derive AES key from quantum key
            const aesKey = await this.deriveAESKey(quantumKey, salt);

            // Encrypt the plaintext
            const plaintextBytes = this.encoder.encode(plaintext);
            const ciphertext = await crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv,
                    tagLength: 128 // 128-bit authentication tag
                },
                aesKey,
                plaintextBytes
            );

            // Return all components needed for decryption
            return {
                ciphertext: this.bytesToHex(new Uint8Array(ciphertext)),
                iv: this.bytesToHex(iv),
                salt: this.bytesToHex(salt),
                algorithm: 'AES-GCM-256-HKDF',
                keyDerivation: 'HKDF-SHA256'
            };
        } catch (error) {
            throw new Error(`Encryption failed: ${error.message}`);
        }
    }

    // AES-GCM Decryption
    async decryptWithAESGCM(encryptedData, quantumKey) {
        try {
            const { ciphertext, iv, salt } = encryptedData;

            // Convert hex strings back to bytes
            const ciphertextBytes = this.hexToBytes(ciphertext);
            const ivBytes = this.hexToBytes(iv);
            const saltBytes = this.hexToBytes(salt);

            // Derive the same AES key
            const aesKey = await this.deriveAESKey(quantumKey, saltBytes);

            // Decrypt the ciphertext
            const decryptedBytes = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: ivBytes,
                    tagLength: 128
                },
                aesKey,
                ciphertextBytes
            );

            return this.decoder.decode(decryptedBytes);
        } catch (error) {
            throw new Error(`Decryption failed: ${error.message}`);
        }
    }

    // Utility functions
    hexToBytes(hex) {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return bytes;
    }

    bytesToHex(bytes) {
        return Array.from(bytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // Verify quantum key quality
    verifyQuantumKey(quantumKey, minEntropy = 128) {
        if (!quantumKey || quantumKey.length < minEntropy / 4) {
            throw new Error(`Quantum key too short. Need at least ${minEntropy} bits`);
        }

        // Basic entropy check (you can enhance this)
        const uniqueChars = new Set(quantumKey.toLowerCase()).size;
        if (uniqueChars < 12) {
            console.warn('Low entropy detected in quantum key');
        }

        return true;
    }
}

export default QuantumCryptoService;
