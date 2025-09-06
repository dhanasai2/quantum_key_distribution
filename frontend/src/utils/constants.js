// Application constants

export const QUANTUM_CONSTANTS = {
  PLANCK_CONSTANT: 6.62607015e-34,
  LIGHT_SPEED: 299792458,
  ELECTRON_CHARGE: 1.602176634e-19,
  BOLTZMANN_CONSTANT: 1.380649e-23
};

export const BB84_CONSTANTS = {
  MAX_ERROR_RATE: 0.11,
  RECOMMENDED_ERROR_RATE: 0.05,
  MIN_KEY_LENGTH: 64,
  DEFAULT_KEY_LENGTH: 256,
  SECURITY_PARAMETER: 1e-10
};

export const POLARIZATION_STATES = {
  HORIZONTAL: { angle: 0, symbol: '↔', basis: 'Z', bit: 0 },
  VERTICAL: { angle: 90, symbol: '↕', basis: 'Z', bit: 1 },
  DIAGONAL: { angle: 45, symbol: '↗', basis: 'X', bit: 0 },
  ANTIDIAGONAL: { angle: 135, symbol: '↖', basis: 'X', bit: 1 }
};

export const MEASUREMENT_BASES = {
  Z: { name: 'Rectilinear', symbol: '+', description: 'Horizontal/Vertical measurement' },
  X: { name: 'Diagonal', symbol: '×', description: 'Diagonal/Anti-diagonal measurement' },
  Y: { name: 'Circular', symbol: '○', description: 'Left/Right circular measurement' }
};

export const SECURITY_LEVELS = {
  HIGH: { threshold: 0.02, color: '#00ff88', description: 'Highly secure' },
  MEDIUM: { threshold: 0.05, color: '#ffc107', description: 'Moderately secure' },
  LOW: { threshold: 0.11, color: '#ff9800', description: 'Minimally secure' },
  COMPROMISED: { threshold: 1.0, color: '#ff006b', description: 'Security compromised' }
};

export const QUANTUM_GATES = {
  I: { name: 'Identity', matrix: [[1, 0], [0, 1]], symbol: 'I' },
  X: { name: 'Pauli-X', matrix: [[0, 1], [1, 0]], symbol: 'X' },
  Y: { name: 'Pauli-Y', matrix: [[0, -1], [1, 0]], symbol: 'Y' },
  Z: { name: 'Pauli-Z', matrix: [[1, 0], [0, -1]], symbol: 'Z' },
  H: { name: 'Hadamard', matrix: [[1, 1], [1, -1]], symbol: 'H' },
  S: { name: 'Phase', matrix: [[1, 0], [0, 1]], symbol: 'S' },
  T: { name: 'T-gate', matrix: [[1, 0], [0, 0.7071067811865476]], symbol: 'T' }
};

export const API_ENDPOINTS = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  QKD: {
    GENERATE_KEY: '/api/qkd/generate-key',
    SIMULATE_EAVESDROPPER: '/api/qkd/simulate-eavesdropper',
    BLOCH_SPHERE: '/api/qkd/bloch-sphere',
    METRICS: '/api/qkd/metrics'
  },
  ENCRYPTION: {
    ENCRYPT: '/api/encryption/encrypt',
    DECRYPT: '/api/encryption/decrypt'
  },
  SIMULATION: {
    START: '/api/simulation/start',
    STATUS: '/api/simulation/status',
    NOISE_MODEL: '/api/simulation/noise-model'
  },
  WEBSOCKET: '/ws/quantum-updates'
};

export const CHART_COLORS = {
  PRIMARY: '#00d4ff',
  SECONDARY: '#ff006b',
  SUCCESS: '#00ff88',
  WARNING: '#ffc107',
  ERROR: '#f44336',
  BACKGROUND: 'rgba(255, 255, 255, 0.1)',
  GRID: 'rgba(255, 255, 255, 0.2)'
};

export const ANIMATION_DURATIONS = {
  FAST: 200,
  NORMAL: 500,
  SLOW: 1000,
  QUANTUM_TRANSITION: 2000,
  PHOTON_TRANSMISSION: 3000
};

export const RESPONSIVE_BREAKPOINTS = {
  MOBILE: 480,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE_DESKTOP: 1200
};

export const QUANTUM_NOISE_MODELS = {
  DEPOLARIZING: { name: 'Depolarizing', description: 'Random Pauli errors' },
  BIT_FLIP: { name: 'Bit Flip', description: 'X gate errors' },
  PHASE_FLIP: { name: 'Phase Flip', description: 'Z gate errors' },
  AMPLITUDE_DAMPING: { name: 'Amplitude Damping', description: 'Energy loss' },
  PHASE_DAMPING: { name: 'Phase Damping', description: 'Dephasing' }
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed',
  QUANTUM_BACKEND_ERROR: 'Quantum backend unavailable',
  INVALID_INPUT: 'Invalid input parameters',
  ENCRYPTION_FAILED: 'Encryption process failed',
  DECRYPTION_FAILED: 'Decryption process failed',
  KEY_GENERATION_FAILED: 'Key generation failed'
};

export const SUCCESS_MESSAGES = {
  KEY_GENERATED: 'Quantum key successfully generated',
  MESSAGE_ENCRYPTED: 'Message successfully encrypted',
  MESSAGE_DECRYPTED: 'Message successfully decrypted',
  SIMULATION_STARTED: 'Simulation started successfully',
  BACKEND_CONNECTED: 'Connected to quantum backend'
};

export default {
  QUANTUM_CONSTANTS,
  BB84_CONSTANTS,
  POLARIZATION_STATES,
  MEASUREMENT_BASES,
  SECURITY_LEVELS,
  QUANTUM_GATES,
  API_ENDPOINTS,
  CHART_COLORS,
  ANIMATION_DURATIONS,
  RESPONSIVE_BREAKPOINTS,
  QUANTUM_NOISE_MODELS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};
