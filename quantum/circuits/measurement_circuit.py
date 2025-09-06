from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
import numpy as np
from typing import List, Dict

class MeasurementCircuit:
    """Quantum measurement circuits for various bases"""
    
    @staticmethod
    def z_basis_measurement() -> QuantumCircuit:
        """Standard computational basis measurement"""
        qc = QuantumCircuit(1, 1)
        qc.measure(0, 0)
        return qc
    
    @staticmethod
    def x_basis_measurement() -> QuantumCircuit:
        """X-basis (Hadamard) measurement"""
        qc = QuantumCircuit(1, 1)
        qc.h(0)  # Rotate X-basis to Z-basis
        qc.measure(0, 0)
        return qc
    
    @staticmethod
    def y_basis_measurement() -> QuantumCircuit:
        """Y-basis measurement"""
        qc = QuantumCircuit(1, 1)
        qc.sdg(0)  # S† gate
        qc.h(0)    # Hadamard
        qc.measure(0, 0)
        return qc
    
    @staticmethod
    def create_measurement_circuit(basis_list: List[str]) -> QuantumCircuit:
        """
        Create measurement circuit for multiple qubits with different bases
        basis_list: list of basis strings ['Z', 'X', 'Y'] for each qubit
        """
        num_qubits = len(basis_list)
        qc = QuantumCircuit(num_qubits, num_qubits)
        
        for i, basis in enumerate(basis_list):
            if basis.upper() == 'X':
                qc.h(i)
            elif basis.upper() == 'Y':
                qc.sdg(i)
                qc.h(i)
            # Z basis needs no rotation
            
            qc.measure(i, i)
        
        return qc
    
    @staticmethod
    def bell_basis_measurement() -> QuantumCircuit:
        """Bell basis measurement for two qubits"""
        qc = QuantumCircuit(2, 2)
        
        # Transform Bell basis to computational basis
        qc.cx(0, 1)
        qc.h(0)
        
        qc.measure_all()
        return qc
    
    def create_tomography_circuits(self, num_qubits: int = 1) -> List[QuantumCircuit]:
        """Create circuits for quantum state tomography"""
        circuits = []
        
        if num_qubits == 1:
            # Single qubit tomography: X, Y, Z measurements
            bases = ['Z', 'X', 'Y']
            for basis in bases:
                qc = QuantumCircuit(1, 1)
                if basis == 'X':
                    qc.h(0)
                elif basis == 'Y':
                    qc.sdg(0)
                    qc.h(0)
                qc.measure(0, 0)
                circuits.append(qc)
        
        return circuits
    
    def create_process_tomography_circuits(self) -> List[QuantumCircuit]:
        """Create circuits for quantum process tomography"""
        circuits = []
        input_states = ['|0⟩', '|1⟩', '|+⟩', '|i⟩']  # Tomographically complete set
        
        for state in input_states:
            qc = QuantumCircuit(1, 1)
            
            # Prepare input state
            if state == '|1⟩':
                qc.x(0)
            elif state == '|+⟩':
                qc.h(0)
            elif state == '|i⟩':
                qc.h(0)
                qc.s(0)
            
            # Add the process to be characterized here
            # (This would be added by the user)
            
            circuits.append(qc)
        
        return circuits
