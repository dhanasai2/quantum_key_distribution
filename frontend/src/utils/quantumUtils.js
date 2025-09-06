// Quantum utility functions for frontend calculations

export const calculateBlochCoordinates = (theta, phi) => {
  const x = Math.sin(theta) * Math.cos(phi);
  const y = Math.sin(theta) * Math.sin(phi);
  const z = Math.cos(theta);
  return { x, y, z };
};

export const formatQuantumState = (alpha, beta) => {
  const formatComplex = (real, imag) => {
    if (Math.abs(imag) < 1e-10) {
      return real.toFixed(3);
    } else if (Math.abs(real) < 1e-10) {
      return `${imag.toFixed(3)}i`;
    } else {
      const sign = imag >= 0 ? '+' : '-';
      return `${real.toFixed(3)}${sign}${Math.abs(imag).toFixed(3)}i`;
    }
  };
  
  const alphaStr = formatComplex(alpha.real || alpha, alpha.imag || 0);
  const betaStr = formatComplex(beta.real || beta, beta.imag || 0);
  
  return `${alphaStr}|0⟩ + ${betaStr}|1⟩`;
};

export const binaryStringToBits = (binaryString) => {
  return binaryString.split('').map(bit => parseInt(bit, 10));
};

export const bitsToBinaryString = (bits) => {
  return bits.join('');
};

export const calculateErrorRate = (aliceKey, bobKey) => {
  if (!aliceKey || !bobKey || aliceKey.length !== bobKey.length) {
    return 1.0;
  }
  
  const errors = aliceKey.reduce((count, bit, index) => {
    return bit !== bobKey[index] ? count + 1 : count;
  }, 0);
  
  return errors / aliceKey.length;
};

export const evaluateSecurityLevel = (errorRate, threshold = 0.11) => {
  if (errorRate <= 0.02) return { level: 'HIGH', color: '#00ff88' };
  if (errorRate <= 0.05) return { level: 'MEDIUM', color: '#ffc107' };
  if (errorRate <= threshold) return { level: 'LOW', color: '#ff9800' };
  return { level: 'COMPROMISED', color: '#ff006b' };
};

export const formatBinaryDisplay = (bits, groupSize = 8) => {
  if (!bits || bits.length === 0) return '';
  
  const binaryString = Array.isArray(bits) ? bits.join('') : bits;
  const groups = [];
  
  for (let i = 0; i < binaryString.length; i += groupSize) {
    groups.push(binaryString.slice(i, i + groupSize));
  }
  
  return groups.join(' ');
};

export const generateRandomBits = (length) => {
  return Array.from({ length }, () => Math.random() < 0.5 ? 0 : 1);
};

export const generateRandomBases = (length) => {
  return Array.from({ length }, () => Math.random() < 0.5 ? 0 : 1);
};

export const simulateQuantumMeasurement = (bit, preparationBasis, measurementBasis) => {
  // Perfect measurement when bases match
  if (preparationBasis === measurementBasis) {
    return bit;
  }
  
  // 50% chance when bases don't match (quantum mechanics)
  return Math.random() < 0.5 ? 0 : 1;
};

export const performKeySifting = (aliceBits, aliceBases, bobBases, bobResults) => {
  const aliceKey = [];
  const bobKey = [];
  const matchingIndices = [];
  
  for (let i = 0; i < aliceBits.length; i++) {
    if (aliceBases[i] === bobBases[i]) {
      aliceKey.push(aliceBits[i]);
      bobKey.push(bobResults[i]);
      matchingIndices.push(i);
    }
  }
  
  return { aliceKey, bobKey, matchingIndices };
};

export const estimateSecretKeyRate = (rawKeyLength, errorRate, efficiencyFactor = 0.8) => {
  // Simplified formula: R = H(X|Y) where H is binary entropy
  const binaryEntropy = (p) => {
    if (p === 0 || p === 1) return 0;
    return -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
  };
  
  const informationPerBit = 1 - binaryEntropy(errorRate);
  const secretKeyRate = rawKeyLength * informationPerBit * efficiencyFactor;
  
  return Math.max(0, secretKeyRate);
};

export const calculateQuantumAdvantage = (classicalKeyLength, quantumKeyLength, quantumSecurity) => {
  const classicalSecurity = Math.pow(2, classicalKeyLength);
  const quantumSecurityLevel = Math.pow(2, quantumKeyLength) * quantumSecurity;
  
  return {
    advantage: quantumSecurityLevel / classicalSecurity,
    classicalBits: classicalKeyLength,
    quantumBits: quantumKeyLength,
    securityGain: quantumSecurityLevel
  };
};

export const polarizationToBloch = (polarization) => {
  const polarizationMap = {
    'horizontal': { theta: Math.PI/2, phi: 0 },
    'vertical': { theta: Math.PI/2, phi: Math.PI },
    'diagonal': { theta: Math.PI/2, phi: Math.PI/2 },
    'antidiagonal': { theta: Math.PI/2, phi: 3*Math.PI/2 }
  };
  
  return polarizationMap[polarization] || { theta: 0, phi: 0 };
};

export const blochToPolarization = (theta, phi) => {
  const tolerance = 0.1;
  
  if (Math.abs(theta - Math.PI/2) < tolerance) {
    if (Math.abs(phi) < tolerance) return 'horizontal';
    if (Math.abs(phi - Math.PI/2) < tolerance) return 'diagonal';
    if (Math.abs(phi - Math.PI) < tolerance) return 'vertical';
    if (Math.abs(phi - 3*Math.PI/2) < tolerance) return 'antidiagonal';
  }
  
  return 'general';
};

export const calculateMutualInformation = (jointProbabilities) => {
  let mutualInfo = 0;
  
  for (let i = 0; i < jointProbabilities.length; i++) {
    for (let j = 0; j < jointProbabilities[i].length; j++) {
      const pXY = jointProbabilities[i][j];
      if (pXY > 0) {
        const pX = jointProbabilities[i].reduce((sum, p) => sum + p, 0);
        const pY = jointProbabilities.reduce((sum, row) => sum + row[j], 0);
        
        mutualInfo += pXY * Math.log2(pXY / (pX * pY));
      }
    }
  }
  
  return mutualInfo;
};

export const generateTomographyData = (measurements) => {
  const bases = ['X', 'Y', 'Z'];
  const results = {};
  
  bases.forEach(basis => {
    results[basis] = {
      '0': measurements[basis] ? measurements[basis]['0'] || 0 : 0,
      '1': measurements[basis] ? measurements[basis]['1'] || 0 : 0
    };
  });
  
  return results;
};

export const reconstructDensityMatrix = (tomographyData) => {
  // Simplified density matrix reconstruction
  const sigmaX = [[0, 1], [1, 0]];
  const sigmaY = [[0, -1], [1, 0]]; // Imaginary components handled separately
  const sigmaZ = [[1, 0], [0, -1]];
  const identity = [[1, 0], [0, 1]];
  
  // Extract expectation values
  const expX = (tomographyData.X['0'] - tomographyData.X['1']) / 
               (tomographyData.X['0'] + tomographyData.X['1']);
  const expY = (tomographyData.Y['0'] - tomographyData.Y['1']) / 
               (tomographyData.Y['0'] + tomographyData.Y['1']);
  const expZ = (tomographyData.Z['0'] - tomographyData.Z['1']) / 
               (tomographyData.Z['0'] + tomographyData.Z['1']);
  
  // Reconstruct density matrix: ρ = (I + r⃗·σ⃗)/2
  const rho = [
    [(1 + expZ) / 2, (expX - expY) / 2],
    [(expX + expY) / 2, (1 - expZ) / 2]
  ];
  
  return rho;
};

export const calculateFidelity = (rho1, rho2) => {
  // Simplified fidelity calculation for 2x2 matrices
  const trace = (matrix) => matrix[0][0] + matrix[1][1];
  
  // For pure states: F = |⟨ψ₁|ψ₂⟩|²
  // For mixed states: more complex calculation
  
  // Simplified calculation
  const overlap = Math.abs(
    rho1[0][0] * rho2[0][0] + 
    rho1[0][1] * rho2[0][1] + 
    rho1[1][0] * rho2[1][0] + 
    rho1[1][1] * rho2[1][1]
  );
  
  return Math.min(1, overlap);
};

export const simulateChannelNoise = (errorProbability) => {
  const applyError = () => Math.random() < errorProbability;
  
  return {
    bitFlip: applyError(),
    phaseFlip: applyError(),
    depolarizing: Math.random() * errorProbability
  };
};

export const estimateChannelCapacity = (errorRate, channelType = 'binary_symmetric') => {
  const binaryEntropy = (p) => {
    if (p === 0 || p === 1) return 0;
    return -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
  };
  
  switch (channelType) {
    case 'binary_symmetric':
      return 1 - binaryEntropy(errorRate);
    case 'binary_erasure':
      return 1 - errorRate;
    default:
      return 1 - binaryEntropy(errorRate);
  }
};

export const performErrorCorrection = (receivedBits, syndromes, codeType = 'hamming') => {
  if (codeType === 'hamming' && receivedBits.length === 7) {
    // Hamming (7,4) code correction
    const errorPosition = syndromes.reduce((pos, syndrome, index) => {
      return pos + syndrome * Math.pow(2, index);
    }, 0);
    
    const correctedBits = [...receivedBits];
    if (errorPosition > 0 && errorPosition <= 7) {
      correctedBits[errorPosition - 1] = 1 - correctedBits[errorPosition - 1];
    }
    
    return {
      corrected: correctedBits,
      errorDetected: errorPosition > 0,
      errorPosition: errorPosition
    };
  }
  
  return {
    corrected: receivedBits,
    errorDetected: false,
    errorPosition: 0
  };
};

export const calculateQuantumVolume = (nQubits, gateErrorRate, measurementErrorRate) => {
  // Simplified quantum volume calculation
  const circuitDepth = nQubits;
  const totalGateErrors = circuitDepth * gateErrorRate;
  const totalMeasurementErrors = nQubits * measurementErrorRate;
  const totalErrorRate = totalGateErrors + totalMeasurementErrors;
  
  const successProbability = Math.pow(1 - totalErrorRate, circuitDepth);
  const quantumVolume = successProbability > 2/3 ? Math.pow(2, nQubits) : 0;
  
  return {
    volume: quantumVolume,
    successProbability: successProbability,
    errorBudget: totalErrorRate
  };
};

export const formatScientificNotation = (number, precision = 2) => {
  if (number === 0) return '0';
  
  const exponent = Math.floor(Math.log10(Math.abs(number)));
  const mantissa = number / Math.pow(10, exponent);
  
  return `${mantissa.toFixed(precision)} × 10^${exponent}`;
};

export const convertToQuantumCircuitNotation = (bits, bases) => {
  return bits.map((bit, index) => {
    const basis = bases[index] === 0 ? 'Z' : 'X';
    const state = bit === 0 ? '0' : '1';
    return `|${state}⟩_${basis}`;
  });
};

// Quantum state utilities
export const createSuperpositionState = (alpha, beta) => {
  const norm = Math.sqrt(alpha * alpha + beta * beta);
  return {
    alpha: alpha / norm,
    beta: beta / norm,
    normalized: true
  };
};

export const measureQuantumState = (state, basis = 'Z') => {
  const { alpha, beta } = state;
  
  if (basis === 'Z') {
    const prob0 = alpha * alpha;
    const prob1 = beta * beta;
    return {
      outcome: Math.random() < prob0 ? 0 : 1,
      probabilities: { '0': prob0, '1': prob1 }
    };
  } else if (basis === 'X') {
    // Transform to X basis: |±⟩ = (|0⟩ ± |1⟩)/√2
    const alphaPlus = (alpha + beta) / Math.sqrt(2);
    const alphaMinus = (alpha - beta) / Math.sqrt(2);
    const probPlus = alphaPlus * alphaPlus;
    const probMinus = alphaMinus * alphaMinus;
    
    return {
      outcome: Math.random() < probPlus ? 0 : 1,
      probabilities: { '+': probPlus, '-': probMinus }
    };
  }
  
  return { outcome: 0, probabilities: { '0': 1 } };
};
