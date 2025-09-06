import numpy as np
from qiskit import QuantumCircuit
from qiskit_aer.noise import NoiseModel, depolarizing_error, amplitude_damping_error, phase_damping_error
from qiskit_aer.noise import coherent_unitary_error, pauli_error
from typing import Dict, List, Optional

class NoiseModels:
    """Quantum channel noise models for realistic simulations"""
    
    def __init__(self):
        self.noise_models = {}
        
    def create_depolarizing_noise_model(self, error_prob: float) -> NoiseModel:
        """
        Create depolarizing noise model
        
        Args:
            error_prob: Probability of depolarizing error
            
        Returns:
            NoiseModel for use with Qiskit Aer
        """
        noise_model = NoiseModel()
        
        # Single-qubit depolarizing error
        error = depolarizing_error(error_prob, 1)
        
        # Add errors to all single-qubit gates
        noise_model.add_all_qubit_quantum_error(error, ['u1', 'u2', 'u3', 'x', 'y', 'z', 'h', 's', 't'])
        
        # Two-qubit depolarizing error
        error_2q = depolarizing_error(error_prob, 2)
        noise_model.add_all_qubit_quantum_error(error_2q, ['cx', 'cy', 'cz'])
        
        return noise_model
    
    def create_amplitude_damping_model(self, gamma: float) -> NoiseModel:
        """
        Create amplitude damping noise model (energy loss)
        
        Args:
            gamma: Damping parameter (0 to 1)
            
        Returns:
            NoiseModel with amplitude damping
        """
        noise_model = NoiseModel()
        
        # Amplitude damping error
        error = amplitude_damping_error(gamma)
        
        # Add to all single-qubit gates
        noise_model.add_all_qubit_quantum_error(error, ['u1', 'u2', 'u3', 'x', 'y', 'z', 'h', 's', 't'])
        
        return noise_model
    
    def create_phase_damping_model(self, gamma: float) -> NoiseModel:
        """
        Create phase damping noise model (dephasing)
        
        Args:
            gamma: Dephasing parameter (0 to 1)
            
        Returns:
            NoiseModel with phase damping
        """
        noise_model = NoiseModel()
        
        # Phase damping error
        error = phase_damping_error(gamma)
        
        # Add to all single-qubit gates
        noise_model.add_all_qubit_quantum_error(error, ['u1', 'u2', 'u3', 'x', 'y', 'z', 'h', 's', 't'])
        
        return noise_model
    
    def create_pauli_noise_model(self, prob_x: float, prob_y: float, prob_z: float) -> NoiseModel:
        """
        Create Pauli noise model with custom probabilities
        
        Args:
            prob_x: Probability of X error
            prob_y: Probability of Y error  
            prob_z: Probability of Z error
            
        Returns:
            NoiseModel with Pauli errors
        """
        noise_model = NoiseModel()
        
        # Pauli error
        error = pauli_error([('X', prob_x), ('Y', prob_y), ('Z', prob_z), ('I', 1 - prob_x - prob_y - prob_z)])
        
        # Add to all single-qubit gates
        noise_model.add_all_qubit_quantum_error(error, ['u1', 'u2', 'u3', 'x', 'y', 'z', 'h', 's', 't'])
        
        return noise_model
    
    def create_combined_noise_model(self, depolarizing_prob: float = 0.001,
                                   amplitude_damping_gamma: float = 0.01,
                                   phase_damping_gamma: float = 0.01) -> NoiseModel:
        """
        Create realistic combined noise model
        
        Args:
            depolarizing_prob: Depolarizing error probability
            amplitude_damping_gamma: Amplitude damping parameter
            phase_damping_gamma: Phase damping parameter
            
        Returns:
            Combined NoiseModel
        """
        noise_model = NoiseModel()
        
        # Combine different error types
        depol_error = depolarizing_error(depolarizing_prob, 1)
        amp_error = amplitude_damping_error(amplitude_damping_gamma)
        phase_error = phase_damping_error(phase_damping_gamma)
        
        # Compose errors (simplified - in practice would need careful composition)
        combined_error = depol_error.compose(amp_error).compose(phase_error)
        
        # Add to gates
        noise_model.add_all_qubit_quantum_error(combined_error, ['u1', 'u2', 'u3', 'x', 'y', 'z', 'h', 's', 't'])
        
        # Two-qubit errors
        depol_error_2q = depolarizing_error(depolarizing_prob * 2, 2)  # Higher error rate for 2Q gates
        noise_model.add_all_qubit_quantum_error(depol_error_2q, ['cx', 'cy', 'cz'])
        
        return noise_model
    
    def create_custom_channel_noise(self, transmission_loss: float = 0.1,
                                   detector_efficiency: float = 0.9,
                                   dark_count_rate: float = 1e-6) -> Dict:
        """
        Create custom optical channel noise parameters
        
        Args:
            transmission_loss: Fraction of photons lost in transmission
            detector_efficiency: Detector efficiency (0 to 1)
            dark_count_rate: Dark count rate of detectors
            
        Returns:
            Dictionary with noise parameters
        """
        return {
            'transmission_loss': transmission_loss,
            'detector_efficiency': detector_efficiency,
            'dark_count_rate': dark_count_rate,
            'thermal_noise': 0.01,  # Thermal noise level
            'timing_jitter': 1e-9,  # Timing uncertainty in seconds
            'polarization_drift': 0.05  # Polarization drift over time
        }
    
    def apply_channel_noise_to_circuit(self, circuit: QuantumCircuit, 
                                     noise_params: Dict) -> QuantumCircuit:
        """
        Apply channel noise effects to a quantum circuit
        
        Args:
            circuit: Original quantum circuit
            noise_params: Noise parameters from create_custom_channel_noise
            
        Returns:
            Noisy quantum circuit
        """
        noisy_circuit = circuit.copy()
        
        # Simulate transmission loss as measurement errors
        transmission_loss = noise_params.get('transmission_loss', 0.1)
        detector_efficiency = noise_params.get('detector_efficiency', 0.9)
        
        # Add probabilistic errors before measurements
        for i in range(circuit.num_qubits):
            # Transmission loss - randomly apply bit flip
            if np.random.random() < transmission_loss:
                noisy_circuit.x(i)
            
            # Detector inefficiency - randomly apply phase flip
            if np.random.random() < (1 - detector_efficiency):
                noisy_circuit.z(i)
        
        return noisy_circuit
    
    def estimate_channel_capacity(self, noise_params: Dict) -> Dict:
        """
        Estimate quantum channel capacity given noise parameters
        
        Args:
            noise_params: Channel noise parameters
            
        Returns:
            Channel capacity analysis
        """
        # Simplified channel capacity calculation
        transmission_loss = noise_params.get('transmission_loss', 0.1)
        detector_efficiency = noise_params.get('detector_efficiency', 0.9)
        error_rate = noise_params.get('error_rate', 0.01)
        
        # Effective transmission rate
        effective_transmission = (1 - transmission_loss) * detector_efficiency
        
        # Binary entropy function
        def binary_entropy(p):
            if p == 0 or p == 1:
                return 0
            return -p * np.log2(p) - (1 - p) * np.log2(1 - p)
        
        # Channel capacity (bits per channel use)
        capacity = effective_transmission * (1 - binary_entropy(error_rate))
        
        return {
            'channel_capacity': capacity,
            'effective_transmission_rate': effective_transmission,
            'error_rate': error_rate,
            'binary_entropy': binary_entropy(error_rate),
            'theoretical_maximum': 1.0  # Perfect channel capacity
        }
    
    def create_device_specific_noise_model(self, device_name: str = 'ibm_brisbane') -> Dict:
        """
        Create device-specific noise model based on real quantum hardware
        
        Args:
            device_name: Name of quantum device
            
        Returns:
            Device-specific noise parameters
        """
        # Simplified device parameters (in practice, would fetch from IBMQ)
        device_params = {
            'ibm_brisbane': {
                'gate_error_1q': 1e-4,
                'gate_error_2q': 1e-3,
                'readout_error': 0.02,
                'coherence_time_t1': 100e-6,  # seconds
                'coherence_time_t2': 80e-6,   # seconds
                'gate_time': 50e-9,           # seconds
                'connectivity': 'heavy_hex'
            },
            'generic': {
                'gate_error_1q': 1e-3,
                'gate_error_2q': 1e-2,
                'readout_error': 0.05,
                'coherence_time_t1': 50e-6,
                'coherence_time_t2': 30e-6,
                'gate_time': 100e-9,
                'connectivity': 'all_to_all'
            }
        }
        
        return device_params.get(device_name, device_params['generic'])
