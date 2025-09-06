from qiskit import QuantumCircuit
import numpy as np
from typing import Tuple

class PolarizationCircuit:
    """Quantum circuits for photon polarization states"""
    
    @staticmethod
    def create_polarized_photon(polarization_angle: float) -> QuantumCircuit:
        """
        Create a photon with specific polarization
        polarization_angle: angle in radians (0 = horizontal, π/2 = vertical)
        """
        qc = QuantumCircuit(1)
        
        # Rotate to desired polarization
        qc.ry(2 * polarization_angle, 0)
        
        return qc
    
    @staticmethod
    def horizontal_polarization() -> QuantumCircuit:
        """Create horizontal polarized photon |H⟩ = |0⟩"""
        qc = QuantumCircuit(1)
        # Already in |0⟩ state
        return qc
    
    @staticmethod
    def vertical_polarization() -> QuantumCircuit:
        """Create vertical polarized photon |V⟩ = |1⟩"""
        qc = QuantumCircuit(1)
        qc.x(0)  # |1⟩ state
        return qc
    
    @staticmethod
    def diagonal_polarization() -> QuantumCircuit:
        """Create diagonal polarized photon |D⟩ = |+⟩"""
        qc = QuantumCircuit(1)
        qc.h(0)  # (|0⟩ + |1⟩)/√2
        return qc
    
    @staticmethod
    def antidiagonal_polarization() -> QuantumCircuit:
        """Create anti-diagonal polarized photon |A⟩ = |-⟩"""
        qc = QuantumCircuit(1)
        qc.x(0)  # |1⟩
        qc.h(0)  # (|0⟩ - |1⟩)/√2
        return qc
    
    @staticmethod
    def polarizing_beam_splitter(measurement_basis: str) -> QuantumCircuit:
        """
        Simulate polarizing beam splitter measurement
        measurement_basis: 'rectilinear' or 'diagonal'
        """
        qc = QuantumCircuit(1, 1)
        
        if measurement_basis == 'diagonal':
            # Rotate diagonal basis to computational basis
            qc.h(0)
        
        qc.measure(0, 0)
        return qc
    
    def create_bb84_states(self) -> dict:
        """Create all four BB84 polarization states"""
        return {
            '|0⟩_Z': self.horizontal_polarization(),      # |0⟩ in Z-basis
            '|1⟩_Z': self.vertical_polarization(),        # |1⟩ in Z-basis  
            '|0⟩_X': self.diagonal_polarization(),        # |+⟩ in X-basis
            '|1⟩_X': self.antidiagonal_polarization()     # |-⟩ in X-basis
        }
    
    @staticmethod
    def get_polarization_angles() -> dict:
        """Get standard polarization angles"""
        return {
            'horizontal': 0,
            'vertical': np.pi/2,
            'diagonal': np.pi/4,
            'antidiagonal': 3*np.pi/4
        }
