import numpy as np
from typing import List, Dict, Tuple, Optional
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit_aer import AerSimulator
from qiskit.quantum_info import Statevector
import random

class BB84Protocol:
    """Complete implementation of the BB84 Quantum Key Distribution protocol"""
    
    def __init__(self, num_qubits: int = 100):
        self.num_qubits = num_qubits
        self.simulator = AerSimulator()
        
    def generate_random_bits(self, length: int) -> List[int]:
        """Generate random bit sequence"""
        return [random.randint(0, 1) for _ in range(length)]
    
    def generate_random_bases(self, length: int) -> List[int]:
        """Generate random basis sequence (0=Z-basis, 1=X-basis)"""
        return [random.randint(0, 1) for _ in range(length)]
    
    def create_alice_circuit(self, bit: int, basis: int) -> QuantumCircuit:
        """
        Create quantum circuit for Alice's qubit preparation
        
        Args:
            bit: The bit value to encode (0 or 1)
            basis: The basis to use (0=Z-basis, 1=X-basis)
            
        Returns:
            QuantumCircuit: The prepared quantum circuit
        """
        qc = QuantumCircuit(1, 1)
        
        # Prepare the bit value
        if bit == 1:
            qc.x(0)  # |1⟩ state
        
        # Apply basis rotation if using X-basis
        if basis == 1:  # X-basis
            qc.h(0)  # Create superposition for diagonal encoding
            
        return qc
    
    def create_bob_circuit(self, basis: int) -> QuantumCircuit:
        """
        Create quantum circuit for Bob's measurement
        
        Args:
            basis: The measurement basis (0=Z-basis, 1=X-basis)
            
        Returns:
            QuantumCircuit: The measurement circuit
        """
        qc = QuantumCircuit(1, 1)
        
        # Apply basis rotation if measuring in X-basis
        if basis == 1:  # X-basis measurement
            qc.h(0)
            
        qc.measure(0, 0)
        return qc
    
    def combine_circuits(self, alice_qc: QuantumCircuit, bob_qc: QuantumCircuit) -> QuantumCircuit:
        """Combine Alice's preparation and Bob's measurement circuits"""
        combined = QuantumCircuit(1, 1)
        
        # Add Alice's preparation
        combined.compose(alice_qc, inplace=True)
        
        # Add barrier for visualization
        combined.barrier()
        
        # Add Bob's measurement
        combined.compose(bob_qc, inplace=True, clbits=[0])
        
        return combined
    
    def simulate_quantum_transmission(self, alice_bits: List[int], alice_bases: List[int], 
                                    bob_bases: List[int], noise_level: float = 0.0) -> List[int]:
        """
        Simulate the quantum transmission of qubits from Alice to Bob
        
        Args:
            alice_bits: Alice's bit sequence
            alice_bases: Alice's basis sequence
            bob_bases: Bob's measurement basis sequence
            noise_level: Amount of noise in the quantum channel (0.0 to 1.0)
            
        Returns:
            List of Bob's measurement results
        """
        bob_results = []
        
        for i in range(len(alice_bits)):
            # Create Alice's circuit
            alice_qc = self.create_alice_circuit(alice_bits[i], alice_bases[i])
            
            # Create Bob's circuit
            bob_qc = self.create_bob_circuit(bob_bases[i])
            
            # Combine circuits
            combined_qc = self.combine_circuits(alice_qc, bob_qc)
            
            # Add noise if specified
            if noise_level > 0:
                combined_qc = self.add_channel_noise(combined_qc, noise_level)
            
            # Execute the circuit
            job = self.simulator.run(combined_qc, shots=1)
            result = job.result()
            counts = result.get_counts()
            
            # Extract measurement result
            measurement = int(list(counts.keys())[0])
            bob_results.append(measurement)
        
        return bob_results
    
    def add_channel_noise(self, circuit: QuantumCircuit, noise_level: float) -> QuantumCircuit:
        """
        Add noise to simulate realistic quantum channel
        
        Args:
            circuit: The quantum circuit
            noise_level: Probability of error (0.0 to 1.0)
            
        Returns:
            Noisy quantum circuit
        """
        noisy_circuit = circuit.copy()
        
        # Add random Pauli errors with given probability
        if random.random() < noise_level:
            error_type = random.choice(['X', 'Y', 'Z'])
            
            # Insert error before measurement
            if error_type == 'X':
                noisy_circuit.x(0)
            elif error_type == 'Y':
                noisy_circuit.y(0)
            elif error_type == 'Z':
                noisy_circuit.z(0)
        
        return noisy_circuit
    
    def perform_key_sifting(self, alice_bits: List[int], alice_bases: List[int],
                           bob_bases: List[int], bob_results: List[int]) -> Dict:
        """
        Perform key sifting step of BB84 protocol
        
        Args:
            alice_bits: Alice's original bit sequence
            alice_bases: Alice's basis sequence
            bob_bases: Bob's measurement basis sequence
            bob_results: Bob's measurement results
            
        Returns:
            Dictionary containing sifted keys and metadata
        """
        alice_sifted_key = []
        bob_sifted_key = []
        matching_indices = []
        
        # Keep only bits where bases match
        for i in range(len(alice_bits)):
            if alice_bases[i] == bob_bases[i]:
                alice_sifted_key.append(alice_bits[i])
                bob_sifted_key.append(bob_results[i])
                matching_indices.append(i)
        
        # Calculate error rate
        if len(alice_sifted_key) > 0:
            errors = sum(1 for a, b in zip(alice_sifted_key, bob_sifted_key) if a != b)
            error_rate = errors / len(alice_sifted_key)
        else:
            error_rate = 1.0
        
        return {
            'alice_sifted_key': alice_sifted_key,
            'bob_sifted_key': bob_sifted_key,
            'matching_indices': matching_indices,
            'sifted_key_length': len(alice_sifted_key),
            'error_rate': error_rate,
            'efficiency': len(alice_sifted_key) / len(alice_bits) if alice_bits else 0
        }
    
    def estimate_eavesdropping_probability(self, error_rate: float) -> Dict:
        """
        Estimate probability of eavesdropping based on error rate
        
        Args:
            error_rate: Observed quantum bit error rate
            
        Returns:
            Dictionary with eavesdropping analysis
        """
        # Theoretical thresholds
        natural_error_threshold = 0.02  # Expected natural error rate
        bb84_security_threshold = 0.11   # Maximum secure error rate for BB84
        
        if error_rate <= natural_error_threshold:
            eavesdropping_probability = 0.0
            security_level = "HIGH"
            recommendation = "PROCEED"
        elif error_rate <= bb84_security_threshold:
            # Linear interpolation for eavesdropping probability
            eavesdropping_probability = (error_rate - natural_error_threshold) / (bb84_security_threshold - natural_error_threshold)
            security_level = "MEDIUM"
            recommendation = "PROCEED WITH CAUTION"
        else:
            eavesdropping_probability = 1.0
            security_level = "COMPROMISED"
            recommendation = "ABORT TRANSMISSION"
        
        return {
            'error_rate': error_rate,
            'eavesdropping_probability': eavesdropping_probability,
            'security_level': security_level,
            'recommendation': recommendation,
            'bb84_threshold': bb84_security_threshold,
            'natural_threshold': natural_error_threshold
        }
    
    def run_complete_protocol(self, num_qubits: Optional[int] = None, 
                            noise_level: float = 0.0) -> Dict:
        """
        Run the complete BB84 protocol
        
        Args:
            num_qubits: Number of qubits to use (uses instance default if None)
            noise_level: Channel noise level
            
        Returns:
            Complete protocol results
        """
        if num_qubits is None:
            num_qubits = self.num_qubits
        
        # Step 1: Alice generates random bits and bases
        alice_bits = self.generate_random_bits(num_qubits)
        alice_bases = self.generate_random_bases(num_qubits)
        
        # Step 2: Bob generates random measurement bases
        bob_bases = self.generate_random_bases(num_qubits)
        
        # Step 3: Simulate quantum transmission
        bob_results = self.simulate_quantum_transmission(
            alice_bits, alice_bases, bob_bases, noise_level
        )
        
        # Step 4: Key sifting
        sifting_results = self.perform_key_sifting(
            alice_bits, alice_bases, bob_bases, bob_results
        )
        
        # Step 5: Eavesdropping analysis
        eavesdropping_analysis = self.estimate_eavesdropping_probability(
            sifting_results['error_rate']
        )
        
        return {
            'alice_bits': alice_bits,
            'alice_bases': alice_bases,
            'bob_bases': bob_bases,
            'bob_results': bob_results,
            'sifting_results': sifting_results,
            'eavesdropping_analysis': eavesdropping_analysis,
            'protocol_parameters': {
                'num_qubits': num_qubits,
                'noise_level': noise_level
            }
        }
    
    def calculate_secret_key_rate(self, sifted_key_length: int, error_rate: float,
                                 error_correction_efficiency: float = 1.2) -> Dict:
        """
        Calculate theoretical secret key generation rate
        
        Args:
            sifted_key_length: Length of sifted key
            error_rate: Quantum bit error rate
            error_correction_efficiency: Error correction efficiency factor
            
        Returns:
            Secret key rate analysis
        """
        # Binary entropy function
        def binary_entropy(p):
            if p == 0 or p == 1:
                return 0
            return -p * np.log2(p) - (1 - p) * np.log2(1 - p)
        
        # Information reconciliation cost
        reconciliation_cost = error_correction_efficiency * binary_entropy(error_rate)
        
        # Privacy amplification (simplified)
        if error_rate < 0.11:  # Below BB84 threshold
            information_per_bit = 1 - binary_entropy(error_rate) - reconciliation_cost
        else:
            information_per_bit = 0  # No secure key can be generated
        
        secret_key_length = max(0, int(sifted_key_length * information_per_bit))
        
        return {
            'sifted_key_length': sifted_key_length,
            'information_per_bit': information_per_bit,
            'reconciliation_cost': reconciliation_cost,
            'secret_key_length': secret_key_length,
            'key_rate': information_per_bit,
            'efficiency': secret_key_length / sifted_key_length if sifted_key_length > 0 else 0
        }
    
    def generate_protocol_statistics(self, results: Dict) -> Dict:
        """Generate comprehensive protocol statistics"""
        
        sifting = results['sifting_results']
        eavesdropping = results['eavesdropping_analysis']
        
        # Calculate secret key rate
        secret_key_analysis = self.calculate_secret_key_rate(
            sifting['sifted_key_length'],
            sifting['error_rate']
        )
        
        return {
            'transmission_statistics': {
                'total_qubits_sent': len(results['alice_bits']),
                'basis_matching_rate': sifting['efficiency'],
                'sifted_key_length': sifting['sifted_key_length'],
                'error_rate': sifting['error_rate'],
                'successful_transmission_rate': 1 - sifting['error_rate']
            },
            'security_statistics': {
                'eavesdropping_probability': eavesdropping['eavesdropping_probability'],
                'security_level': eavesdropping['security_level'],
                'protocol_security': eavesdropping['error_rate'] < eavesdropping['bb84_threshold'],
                'recommended_action': eavesdropping['recommendation']
            },
            'key_generation_statistics': {
                'secret_key_length': secret_key_analysis['secret_key_length'],
                'key_generation_rate': secret_key_analysis['key_rate'],
                'overall_efficiency': secret_key_analysis['efficiency'],
                'information_per_sifted_bit': secret_key_analysis['information_per_bit']
            }
        }
