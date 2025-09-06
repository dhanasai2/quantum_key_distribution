import numpy as np
from typing import List, Dict, Tuple
import random

class KeySifting:
    """Handle key sifting operations for quantum key distribution"""
    
    def __init__(self):
        pass
    
    def sift_keys(self, alice_bits: List[int], alice_bases: List[int], 
                  bob_bases: List[int], bob_results: List[int]) -> Dict:
        """
        Main key sifting function
        
        Args:
            alice_bits: Alice's original bit sequence
            alice_bases: Alice's preparation bases
            bob_bases: Bob's measurement bases  
            bob_results: Bob's measurement results
            
        Returns:
            Sifted key information
        """
        if len(alice_bits) != len(alice_bases) != len(bob_bases) != len(bob_results):
            raise ValueError("All input lists must have the same length")
        
        alice_sifted = []
        bob_sifted = []
        matching_indices = []
        discarded_indices = []
        
        for i in range(len(alice_bits)):
            if alice_bases[i] == bob_bases[i]:
                # Bases match - keep this bit
                alice_sifted.append(alice_bits[i])
                bob_sifted.append(bob_results[i])
                matching_indices.append(i)
            else:
                # Bases don't match - discard
                discarded_indices.append(i)
        
        # Calculate statistics
        total_bits = len(alice_bits)
        sifted_bits = len(alice_sifted)
        efficiency = sifted_bits / total_bits if total_bits > 0 else 0
        
        # Calculate error rate
        errors = sum(1 for a, b in zip(alice_sifted, bob_sifted) if a != b)
        error_rate = errors / sifted_bits if sifted_bits > 0 else 0
        
        return {
            'alice_sifted_key': alice_sifted,
            'bob_sifted_key': bob_sifted,
            'matching_indices': matching_indices,
            'discarded_indices': discarded_indices,
            'sifted_length': sifted_bits,
            'total_length': total_bits,
            'efficiency': efficiency,
            'error_count': errors,
            'error_rate': error_rate
        }
    
    def random_subset_comparison(self, alice_key: List[int], bob_key: List[int], 
                               fraction: float = 0.1) -> Dict:
        """
        Compare a random subset of the sifted key for error estimation
        
        Args:
            alice_key: Alice's sifted key
            bob_key: Bob's sifted key
            fraction: Fraction of key to use for comparison
            
        Returns:
            Comparison results
        """
        if len(alice_key) != len(bob_key):
            raise ValueError("Alice and Bob keys must have same length")
        
        key_length = len(alice_key)
        subset_size = max(1, int(key_length * fraction))
        
        # Randomly select indices for comparison
        comparison_indices = random.sample(range(key_length), subset_size)
        comparison_indices.sort()
        
        alice_subset = [alice_key[i] for i in comparison_indices]
        bob_subset = [bob_key[i] for i in comparison_indices]
        
        # Count errors in subset
        errors = sum(1 for a, b in zip(alice_subset, bob_subset) if a != b)
        error_rate = errors / subset_size if subset_size > 0 else 0
        
        # Remove compared bits from keys
        alice_remaining = [alice_key[i] for i in range(key_length) if i not in comparison_indices]
        bob_remaining = [bob_key[i] for i in range(key_length) if i not in comparison_indices]
        
        return {
            'comparison_indices': comparison_indices,
            'alice_subset': alice_subset,
            'bob_subset': bob_subset,
            'subset_errors': errors,
            'subset_error_rate': error_rate,
            'alice_remaining_key': alice_remaining,
            'bob_remaining_key': bob_remaining,
            'remaining_key_length': len(alice_remaining)
        }
    
    def calculate_mutual_information(self, alice_key: List[int], bob_key: List[int]) -> float:
        """Calculate mutual information between Alice and Bob's keys"""
        if len(alice_key) != len(bob_key) or len(alice_key) == 0:
            return 0.0
        
        # Calculate joint probabilities
        joint_counts = {'00': 0, '01': 0, '10': 0, '11': 0}
        total_pairs = len(alice_key)
        
        for a, b in zip(alice_key, bob_key):
            key = f"{a}{b}"
            joint_counts[key] += 1
        
        # Convert to probabilities
        joint_probs = {k: v / total_pairs for k, v in joint_counts.items()}
        
        # Calculate marginal probabilities
        prob_alice_0 = (joint_probs['00'] + joint_probs['01'])
        prob_alice_1 = (joint_probs['10'] + joint_probs['11'])
        prob_bob_0 = (joint_probs['00'] + joint_probs['10'])
        prob_bob_1 = (joint_probs['01'] + joint_probs['11'])
        
        # Calculate mutual information
        mutual_info = 0.0
        for ab in ['00', '01', '10', '11']:
            if joint_probs[ab] > 0:
                a, b = int(ab[0]), int(ab[1])
                prob_a = prob_alice_1 if a == 1 else prob_alice_0
                prob_b = prob_bob_1 if b == 1 else prob_bob_0
                
                if prob_a > 0 and prob_b > 0:
                    mutual_info += joint_probs[ab] * np.log2(joint_probs[ab] / (prob_a * prob_b))
        
        return mutual_info
    
    def optimize_sifting_strategy(self, historical_data: List[Dict]) -> Dict:
        """
        Analyze historical sifting data to optimize future strategies
        
        Args:
            historical_data: List of previous sifting results
            
        Returns:
            Optimization recommendations
        """
        if not historical_data:
            return {'recommendation': 'insufficient_data'}
        
        # Analyze efficiency trends
        efficiencies = [data['efficiency'] for data in historical_data if 'efficiency' in data]
        error_rates = [data['error_rate'] for data in historical_data if 'error_rate' in data]
        
        if not efficiencies or not error_rates:
            return {'recommendation': 'insufficient_data'}
        
        avg_efficiency = np.mean(efficiencies)
        avg_error_rate = np.mean(error_rates)
        efficiency_trend = np.polyfit(range(len(efficiencies)), efficiencies, 1)[0]
        error_trend = np.polyfit(range(len(error_rates)), error_rates, 1)[0]
        
        recommendations = []
        
        if avg_efficiency < 0.4:
            recommendations.append("Consider synchronizing basis choices more carefully")
        
        if avg_error_rate > 0.1:
            recommendations.append("High error rate detected - check for eavesdropping")
        
        if efficiency_trend < -0.01:
            recommendations.append("Efficiency declining - check quantum channel stability")
        
        if error_trend > 0.01:
            recommendations.append("Error rate increasing - investigate noise sources")
        
        return {
            'average_efficiency': avg_efficiency,
            'average_error_rate': avg_error_rate,
            'efficiency_trend': efficiency_trend,
            'error_trend': error_trend,
            'recommendations': recommendations,
            'status': 'analyzed'
        }
