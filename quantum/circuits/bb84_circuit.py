from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit.quantum_info import Statevector
import numpy as np
from typing import List, Tuple

class BB84Circuit:
    """Complete BB84 quantum circuit implementation"""
    
    def __init__(self, num_qubits: int = 1):
        self.num_qubits = num_qubits
        self.qreg = QuantumRegister(num_qubits, 'q')
        self.creg = ClassicalRegister(num_qubits, 'c')
        self.circuit = QuantumCircuit(self.qreg, self.creg)
    
    def alice_prepare_qubit(self, bit_value: int, basis: int) -> QuantumCircuit:
        """
        Alice prepares a qubit in the specified state
        bit_value: 0 or 1 (the bit to encode)
        basis: 0 (Z-basis) or 1 (X-basis)
        """
        qc = QuantumCircuit(1, 1)
        
        # Prepare the bit value
        if bit_value == 1:
            qc.x(0)  # |1⟩ state
        
        # Apply basis rotation if needed
        if basis == 1:  # X-basis (diagonal)
            qc.h(0)  # Rotate to |+⟩ or |-⟩
        
        return qc
    
    def bob_measure_qubit(self, basis: int) -> QuantumCircuit:
        """
        Bob measures the qubit in the specified basis
        basis: 0 (Z-basis) or 1 (X-basis)
        """
        qc = QuantumCircuit(1, 1)
        
        # Apply basis rotation if needed
        if basis == 1:  # X-basis measurement
            qc.h(0)
        
        # Measure
        qc.measure(0, 0)
        return qc
    
    def create_full_bb84_circuit(self, alice_bit: int, alice_basis: int, 
                                bob_basis: int) -> QuantumCircuit:
        """Create complete BB84 circuit for one qubit"""
        qc = QuantumCircuit(1, 1)
        
        # Alice preparation
        if alice_bit == 1:
            qc.x(0)
        if alice_basis == 1:
            qc.h(0)
        
        # Add barrier for visualization
        qc.barrier()
        
        # Bob measurement
        if bob_basis == 1:
            qc.h(0)
        qc.measure(0, 0)
        
        return qc
    
    def simulate_quantum_channel(self, circuit: QuantumCircuit, 
                                noise_level: float = 0.0) -> QuantumCircuit:
        """Simulate quantum channel with potential noise"""
        noisy_circuit = circuit.copy()
        
        if noise_level > 0:
            # Add depolarizing noise
            for i in range(circuit.num_qubits):
                if np.random.random() < noise_level:
                    # Apply random Pauli error
                    error = np.random.choice(['X', 'Y', 'Z'])
                    if error == 'X':
                        noisy_circuit.x(i)
                    elif error == 'Y':
                        noisy_circuit.y(i)
                    elif error == 'Z':
                        noisy_circuit.z(i)
        
        return noisy_circuit
    
    def create_entangled_state(self) -> QuantumCircuit:
        """Create Bell state for quantum teleportation demo"""
        qc = QuantumCircuit(2, 2)
        qc.h(0)
        qc.cx(0, 1)
        return qc
