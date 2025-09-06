// Cryptographic utility functions

export const stringToBytes = (str) => {
  return new TextEncoder().encode(str);
};

export const bytesToString = (bytes) => {
  return new TextDecoder().decode(bytes);
};

export const bitsToBytes = (bits) => {
  const bytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    const byte = bits.slice(i, i + 8).reduce((acc, bit, index) => {
      return acc + bit * Math.pow(2, 7 - index);
    }, 0);
    bytes.push(byte);
  }
  return new Uint8Array(bytes);
};

export const bytesToBits = (bytes) => {
  const bits = [];
  for (const byte of bytes) {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i) & 1);
    }
  }
  return bits;
};

export const xorBytes = (bytes1, bytes2) => {
  const result = new Uint8Array(Math.min(bytes1.length, bytes2.length));
  for (let i = 0; i < result.length; i++) {
    result[i] = bytes1[i] ^ bytes2[i];
  }
  return result;
};

export const generateRandomBytes = (length) => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
};

export const hashSHA256 = async (data) => {
  const encoder = new TextEncoder();
  const dataBytes = typeof data === 'string' ? encoder.encode(data) : data;
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
  return new Uint8Array(hashBuffer);
};

export const expandKey = async (seed, targetLength) => {
  let expanded = await hashSHA256(seed);
  
  while (expanded.length < targetLength) {
    const nextHash = await hashSHA256(expanded);
    const combined = new Uint8Array(expanded.length + nextHash.length);
    combined.set(expanded);
    combined.set(nextHash, expanded.length);
    expanded = combined;
  }
  
  return expanded.slice(0, targetLength);
};

export const calculateHMAC = async (key, message) => {
  const encoder = new TextEncoder();
  const keyBytes = typeof key === 'string' ? encoder.encode(key) : key;
  const messageBytes = typeof message === 'string' ? encoder.encode(message) : message;
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageBytes);
  return new Uint8Array(signature);
};

export const verifyHMAC = async (key, message, signature) => {
  const calculatedHMAC = await calculateHMAC(key, message);
  
  if (calculatedHMAC.length !== signature.length) {
    return false;
  }
  
  for (let i = 0; i < calculatedHMAC.length; i++) {
    if (calculatedHMAC[i] !== signature[i]) {
      return false;
    }
  }
  
  return true;
};

export const encryptAES = async (plaintext, key) => {
  const encoder = new TextEncoder();
  const plaintextBytes = typeof plaintext === 'string' ? encoder.encode(plaintext) : plaintext;
  
  const iv = generateRandomBytes(16);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    cryptoKey,
    plaintextBytes
  );
  
  const result = new Uint8Array(iv.length + encrypted.byteLength);
  result.set(iv);
  result.set(new Uint8Array(encrypted), iv.length);
  
  return result;
};

export const decryptAES = async (ciphertext, key) => {
  const iv = ciphertext.slice(0, 16);
  const encrypted = ciphertext.slice(16);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    cryptoKey,
    encrypted
  );
  
  return new Uint8Array(decrypted);
};

export const base64Encode = (bytes) => {
  const binary = Array.from(bytes).map(byte => String.fromCharCode(byte)).join('');
  return btoa(binary);
};

export const base64Decode = (base64) => {
  const binary = atob(base64);
  return new Uint8Array(Array.from(binary).map(char => char.charCodeAt(0)));
};
