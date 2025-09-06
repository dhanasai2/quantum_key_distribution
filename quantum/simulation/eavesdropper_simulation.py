import numpy as np
import random
from typing import List, Dict, Tuple, Optional
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

class EavesdropperSimulation:
    """Advanced eavesdropper attack simulations"""
    
    def __init__(self):
        self.simulator = AerSimulator()
        
    def intercept_resend_attack(self, alice_bits: List[int], alice_bases: List[int],
                              bob_bases: List[int], interception_rate: float = 1.0) -> Dict:
        """
        Simulate intercept-and-resend attack by Eve
        
        Args:
            alice_bits: Alice's bit sequence
            alice_bases: Alice's preparation bases
            bob_bases: Bob's measurement bases
            interception_rate: Fraction of qubits Eve intercepts
            
        Returns:
            Attack simulation results
        """
        num_qubits = len(alice_bits)
        eve_bases = np.random.randint(0, 2, num_qubits)
        eve_measurements = []
        eve_resent_bits = []
        intercepted_indices = []
        
        for i in range(num_qubits):
            if random.random() < interception_rate:
                # Eve intercepts this qubit
                intercepted_indices.append(i)
                
                # Eve measures in her chosen basis
                if alice_bases[i] == eve_bases[i]:
                    # Same basis - Eve gets correct result
                    measurement = alice_bits[i]
                else:
                    # Different basis - quantum mechanics gives 50% chance
                    measurement = random.randint(0, 1)
                
                eve_measurements.append(measurement)
                eve_resent_bits.append(measurement)
            else:
                # Qubit passes through untouched
                eve_measurements.append(None)
                eve_resent_bits.append(alice_bits[i])
        
        # Bob receives Eve's resent qubits
        bob_results = []
        for i in range(num_qubits):
            received_bit = eve_resent_bits[i]
            received_basis = alice_bases[i]  # Basis is preserved in resending
            
            if received_basis == bob_bases[i]:
                # Bases match - Bob gets the bit
                bob_results.append(received_bit)
            else:
                # Bases don't match - 50% chance
                bob_results.append(random.randint(0, 1))
        
        # Calculate error rates
        alice_bob_errors = sum(1 for a, b in zip(alice_bits, bob_results) if a != b)
        total_pairs = len(alice_bits)
        error_rate_with_eve = alice_bob_errors / total_pairs if total_pairs > 0 else 0
        
        # Theoretical error rate without Eve (only basis mismatch)
        basis_mismatches = sum(1 for a, b in zip(alice_bases, bob_bases) if a != b)
        theoretical_error_without_eve = (basis_mismatches * 0.5) / total_pairs
        
        return {
            'attack_type': 'intercept_resend',
            'interception_rate': interception_rate,
            'intercepted_indices': intercepted_indices,
            'eve_bases': eve_bases.tolist(),
            'eve_measurements': eve_measurements,
            'eve_resent_bits': eve_resent_bits,
            'bob_results': bob_results,
            'error_rate_with_eve': error_rate_with_eve,
            'theoretical_error_without_eve': theoretical_error_without_eve,
            'additional_error_from_eve': error_rate_with_eve - theoretical_error_without_eve,
            'detection_probability': min(1.0, error_rate_with_eve / 0.11)  # BB84 threshold
        }
    
    def beam_splitting_attack(self, alice_bits: List[int], alice_bases: List[int],
                            splitting_ratio: float = 0.5, storage_time: float = 1.0) -> Dict:
        """
        Simulate beam splitting attack where Eve stores qubits
        
        Args:
            alice_bits: Alice's bit sequence
            alice_bases: Alice's preparation bases
            splitting_ratio: Fraction of light Eve splits off
            storage_time: Time Eve can store quantum states (seconds)
            
        Returns:
            Beam splitting attack results
        """
        num_qubits = len(alice_bits)
        eve_stored_qubits = []
        bob_received_intensity = []
        
        # Quantum storage decoherence
        storage_fidelity = np.exp(-storage_time / 0.1)  # 0.1s decoherence time
        
        for i in range(num_qubits):
            if random.random() < splitting_ratio:
                # Eve splits the beam
                eve_stored_qubits.append({
                    'index': i,
                    'bit': alice_bits[i],
                    'basis': alice_bases[i],
                    'intensity': splitting_ratio,
                    'storage_fidelity': storage_fidelity
                })
                
                # Bob receives reduced intensity
                bob_intensity = 1.0 - splitting_ratio
                bob_received_intensity.append(bob_intensity)
            else:
                # No splitting - Bob gets full intensity
                bob_received_intensity.append(1.0)
        
        # Detection probability depends on intensity
        detection_threshold = 0.5  # Minimum intensity for reliable detection
        detection_failures = sum(1 for intensity in bob_received_intensity 
                               if intensity < detection_threshold)
        
        # Eve can measure stored qubits later (after basis reconciliation)
        eve_information_bits = len([q for q in eve_stored_qubits 
                                  if q['storage_fidelity'] > 0.8])
        
        return {
            'attack_type': 'beam_splitting',
            'splitting_ratio': splitting_ratio,
            'storage_time': storage_time,
            'storage_fidelity': storage_fidelity,
            'eve_stored_qubits': eve_stored_qubits,
            'bob_received_intensity': bob_received_intensity,
            'detection_failures': detection_failures,
            'eve_information_bits': eve_information_bits,
            'attack_efficiency': eve_information_bits / num_qubits,
            'detection_probability': detection_failures / num_qubits
        }
    
    def photon_number_splitting_attack(self, alice_bits: List[int], alice_bases: List[int],
                                     multi_photon_probability: float = 0.1) -> Dict:
        """
        Simulate photon number splitting (PNS) attack
        
        Args:
            alice_bits: Alice's bit sequence
            alice_bases: Alice's preparation bases
            multi_photon_probability: Probability of multi-photon pulses
            
        Returns:
            PNS attack results
        """
        num_qubits = len(alice_bits)
        multi_photon_pulses = []
        eve_extracted_photons = []
        
        for i in range(num_qubits):
            if random.random() < multi_photon_probability:
                # Multi-photon pulse detected
                photon_count = np.random.poisson(2) + 1  # At least 1 photon
                
                multi_photon_pulses.append({
                    'index': i,
                    'bit': alice_bits[i],
                    'basis': alice_bases[i],
                    'photon_count': photon_count
                })
                
                if photon_count > 1:
                    # Eve can extract photons without being detected
                    extracted_count = photon_count - 1
                    eve_extracted_photons.extend([{
                        'index': i,
                        'bit': alice_bits[i],
                        'basis': alice_bases[i],
                        'extracted_photon': j
                    } for j in range(extracted_count)])
        
        # Eve's information gain
        eve_total_information = len(eve_extracted_photons)
        
        # This attack is harder to detect as Bob still receives one photon per pulse
        detection_probability = 0.05  # Very low detection rate
        
        return {
            'attack_type': 'photon_number_splitting',
            'multi_photon_probability': multi_photon_probability,
            'multi_photon_pulses': multi_photon_pulses,
            'eve_extracted_photons': eve_extracted_photons,
            'eve_total_information': eve_total_information,
            'information_gain_rate': eve_total_information / num_qubits,
            'detection_probability': detection_probability
        }
    
    def man_in_the_middle_attack(self, alice_bits: List[int], alice_bases: List[int],
                               bob_bases: List[int]) -> Dict:
        """
        Simulate complete man-in-the-middle attack
        
        Args:
            alice_bits: Alice's bit sequence
            alice_bases: Alice's preparation bases
            bob_bases: Bob's measurement bases
            
        Returns:
            MITM attack results
        """
        num_qubits = len(alice_bits)
        
        # Eve intercepts all communications
        eve_alice_bases = np.random.randint(0, 2, num_qubits)
        eve_alice_measurements = []
        
        # Eve measures Alice's qubits
        for i in range(num_qubits):
            if alice_bases[i] == eve_alice_bases[i]:
                eve_alice_measurements.append(alice_bits[i])
            else:
                eve_alice_measurements.append(random.randint(0, 1))
        
        # Eve prepares new qubits for Bob
        eve_bob_bases = np.random.randint(0, 2, num_qubits)
        eve_bob_bits = eve_alice_measurements.copy()
        
        # Bob measures Eve's prepared qubits
        bob_results = []
        for i in range(num_qubits):
            if eve_bob_bases[i] == bob_bases[i]:
                bob_results.append(eve_bob_bits[i])
            else:
                bob_results.append(random.randint(0, 1))
        
        # Eve learns partial information from basis reconciliation
        alice_eve_matching = sum(1 for a, e in zip(alice_bases, eve_alice_bases) if a == e)
        eve_bob_matching = sum(1 for e, b in zip(eve_bob_bases, bob_bases) if e == b)
        
        # Information available to Eve
        eve_information_about_alice = alice_eve_matching / num_qubits
        eve_information_about_bob = eve_bob_matching / num_qubits
        
        # Error rate analysis
        alice_bob_direct_errors = sum(1 for a, b in zip(alice_bits, bob_results) if a != b)
        error_rate = alice_bob_direct_errors / num_qubits
        
        return {
            'attack_type': 'man_in_the_middle',
            'eve_alice_bases': eve_alice_bases.tolist(),
            'eve_alice_measurements': eve_alice_measurements,
            'eve_bob_bases': eve_bob_bases.tolist(),
            'eve_bob_bits': eve_bob_bits,
            'bob_results': bob_results,
            'alice_eve_basis_matches': alice_eve_matching,
            'eve_bob_basis_matches': eve_bob_matching,
            'eve_information_about_alice': eve_information_about_alice,
            'eve_information_about_bob': eve_information_about_bob,
            'total_error_rate': error_rate,
            'detection_probability': 0.8  # High chance of detection due to increased errors
        }
    
    def collective_attack_simulation(self, num_signals: int, 
                                   attack_strategy: str = 'optimal') -> Dict:
        """
        Simulate collective attack where Eve measures multiple signals jointly
        
        Args:
            num_signals: Number of quantum signals
            attack_strategy: Attack strategy ('optimal', 'individual', 'joint')
            
        Returns:
            Collective attack analysis
        """
        # This is a simplified simulation of collective attacks
        # In practice, this would involve complex quantum information theory
        
        if attack_strategy == 'optimal':
            # Theoretical optimal collective attack
            information_per_signal = 0.5  # Maximum information Eve can extract
            detection_probability = 0.15  # Harder to detect than individual attacks
            
        elif attack_strategy == 'individual':
            # Individual attack on each signal
            information_per_signal = 0.25
            detection_probability = 0.25
            
        elif attack_strategy == 'joint':
            # Joint measurement on pairs of signals
            information_per_signal = 0.35
            detection_probability = 0.20
            
        else:
            information_per_signal = 0.1
            detection_probability = 0.5
        
        total_information = information_per_signal * num_signals
        
        # Quantum Chernoff bound for detection
        if num_signals > 50:
            detection_probability = min(1.0, detection_probability * np.sqrt(num_signals / 50))
        
        return {
            'attack_type': 'collective',
            'attack_strategy': attack_strategy,
            'num_signals': num_signals,
            'information_per_signal': information_per_signal,
            'total_information_extracted': total_information,
            'detection_probability': detection_probability,
            'security_analysis': {
                'secure_key_rate': max(0, 1 - 2 * information_per_signal),
                'information_leakage': total_information,
                'recommended_action': 'ABORT' if information_per_signal > 0.4 else 'PROCEED'
            }
        }
    
    def adaptive_attack_simulation(self, alice_bits: List[int], alice_bases: List[int],
                                 learning_rounds: int = 5) -> Dict:
        """
        Simulate adaptive attack where Eve learns and adjusts strategy
        
        Args:
            alice_bits: Alice's bit sequence
            alice_bases: Alice's preparation bases  
            learning_rounds: Number of learning iterations
            
        Returns:
            Adaptive attack results
        """
        num_qubits = len(alice_bits)
        
        # Initial random strategy
        eve_strategy = {'Z_preference': 0.5, 'X_preference': 0.5}
        learning_history = []
        
        for round_num in range(learning_rounds):
            round_results = {
                'round': round_num,
                'strategy': eve_strategy.copy(),
                'measurements': [],
                'success_rate': 0
            }
            
            # Eve chooses bases based on current strategy
            eve_bases = []
            eve_measurements = []
            
            for i in range(num_qubits):
                if random.random() < eve_strategy['Z_preference']:
                    eve_basis = 0  # Z-basis
                else:
                    eve_basis = 1  # X-basis
                
                eve_bases.append(eve_basis)
                
                # Measure
                if alice_bases[i] == eve_basis:
                    measurement = alice_bits[i]
                    success = True
                else:
                    measurement = random.randint(0, 1)
                    success = False
                
                eve_measurements.append(measurement)
                round_results['measurements'].append({
                    'qubit': i,
                    'eve_basis': eve_basis,
                    'measurement': measurement,
                    'success': success
                })
            
            # Calculate success rate
            successes = sum(1 for m in round_results['measurements'] if m['success'])
            round_results['success_rate'] = successes / num_qubits
            
            # Update strategy based on results (simplified learning)
            if round_num < learning_rounds - 1:
                # Analyze which basis was more successful
                z_successes = sum(1 for m in round_results['measurements'] 
                                if m['eve_basis'] == 0 and m['success'])
                x_successes = sum(1 for m in round_results['measurements'] 
                                if m['eve_basis'] == 1 and m['success'])
                
                z_attempts = sum(1 for m in round_results['measurements'] if m['eve_basis'] == 0)
                x_attempts = sum(1 for m in round_results['measurements'] if m['eve_basis'] == 1)
                
                z_rate = z_successes / z_attempts if z_attempts > 0 else 0
                x_rate = x_successes / x_attempts if x_attempts > 0 else 0
                
                # Adjust preferences
                learning_rate = 0.1
                if z_rate > x_rate:
                    eve_strategy['Z_preference'] = min(1.0, eve_strategy['Z_preference'] + learning_rate)
                    eve_strategy['X_preference'] = 1.0 - eve_strategy['Z_preference']
                else:
                    eve_strategy['X_preference'] = min(1.0, eve_strategy['X_preference'] + learning_rate)
                    eve_strategy['Z_preference'] = 1.0 - eve_strategy['X_preference']
            
            learning_history.append(round_results)
        
        final_success_rate = learning_history[-1]['success_rate']
        improvement = final_success_rate - learning_history[0]['success_rate']
        
        return {
            'attack_type': 'adaptive',
            'learning_rounds': learning_rounds,
            'initial_strategy': learning_history[0]['strategy'],
            'final_strategy': learning_history[-1]['strategy'],
            'initial_success_rate': learning_history[0]['success_rate'],
            'final_success_rate': final_success_rate,
            'improvement': improvement,
            'learning_history': learning_history,
            'detection_probability': max(0.1, final_success_rate - 0.5)  # Higher success rate more detectable
        }
