import numpy as np
from typing import List, Dict, Tuple
import random

class ErrorCorrection:
    """Error correction and privacy amplification for QKD"""
    
    def __init__(self):
        self.syndrome_tables = self._generate_syndrome_tables()
    
    def _generate_syndrome_tables(self) -> Dict:
        """Generate lookup tables for error correction"""
        # Hamming(7,4) code syndrome table
        hamming_7_4 = {
            (0, 0, 0): 0,  # No error
            (0, 0, 1): 1,  # Error in bit 1
            (0, 1, 0): 2,  # Error in bit 2
            (0, 1, 1): 3,  # Error in bit 3
            (1, 0, 0): 4,  # Error in bit 4
            (1, 0, 1): 5,  # Error in bit 5
            (1, 1, 0): 6,  # Error in bit 6
            (1, 1, 1): 7,  # Error in bit 7
        }
        
        return {
            'hamming_7_4': hamming_7_4
        }
    
    def hamming_encode(self, data_bits: List[int]) -> List[int]:
        """
        Encode data using Hamming(7,4) code
        
        Args:
            data_bits: 4-bit data sequence
            
        Returns:
            7-bit encoded sequence
        """
        if len(data_bits) != 4:
            raise ValueError("Hamming(7,4) requires exactly 4 data bits")
        
        d1, d2, d3, d4 = data_bits
        
        # Calculate parity bits
        p1 = (d1 + d2 + d4) % 2  # Parity for positions 1,2,4
        p2 = (d1 + d3 + d4) % 2  # Parity for positions 1,3,4
        p3 = (d2 + d3 + d4) % 2  # Parity for positions 2,3,4
        
        # Construct codeword: p1, p2, d1, p3, d2, d3, d4
        return [p1, p2, d1, p3, d2, d3, d4]
    
    def hamming_decode(self, received_bits: List[int]) -> Tuple[List[int], bool, int]:
        """
        Decode received bits using Hamming(7,4) code
        
        Args:
            received_bits: 7-bit received sequence
            
        Returns:
            Tuple of (decoded_data, error_detected, error_position)
        """
        if len(received_bits) != 7:
            raise ValueError("Hamming(7,4) requires exactly 7 received bits")
        
        r1, r2, r3, r4, r5, r6, r7 = received_bits
        
        # Calculate syndrome
        s1 = (r1 + r3 + r5 + r7) % 2
        s2 = (r2 + r3 + r6 + r7) % 2
        s3 = (r4 + r5 + r6 + r7) % 2
        
        syndrome = (s1, s2, s3)
        error_position = self.syndrome_tables['hamming_7_4'].get(syndrome, 0)
        
        # Correct error if detected
        corrected = received_bits.copy()
        if error_position > 0:
            corrected[error_position - 1] = 1 - corrected[error_position - 1]
        
        # Extract data bits (positions 3, 5, 6, 7 in 1-indexed)
        data_bits = [corrected[2], corrected[4], corrected[5], corrected[6]]
        
        return data_bits, error_position > 0, error_position
    
    def cascade_protocol(self, alice_key: List[int], bob_key: List[int], 
                        error_rate_estimate: float) -> Dict:
        """
        Implement CASCADE error correction protocol
        
        Args:
            alice_key: Alice's sifted key
            bob_key: Bob's sifted key (with errors)
            error_rate_estimate: Estimated error rate
            
        Returns:
            Error correction results
        """
        if len(alice_key) != len(bob_key):
            raise ValueError("Keys must have equal length")
        
        alice_corrected = alice_key.copy()
        bob_corrected = bob_key.copy()
        key_length = len(alice_key)
        
        # Determine block size based on error rate
        if error_rate_estimate > 0:
            block_size = max(1, int(1 / error_rate_estimate))
        else:
            block_size = key_length
        
        iterations = 0
        max_iterations = 10
        corrections_made = 0
        
        while iterations < max_iterations:
            errors_found = False
            
            # Divide key into blocks
            for start in range(0, key_length, block_size):
                end = min(start + block_size, key_length)
                
                # Calculate parities
                alice_parity = sum(alice_corrected[start:end]) % 2
                bob_parity = sum(bob_corrected[start:end]) % 2
                
                if alice_parity != bob_parity:
                    # Error detected in this block
                    errors_found = True
                    
                    # For simplicity, correct the first bit in the block
                    # In real CASCADE, binary search would be used
                    if end - start > 1:
                        mid = (start + end) // 2
                        bob_corrected[mid] = 1 - bob_corrected[mid]
                        corrections_made += 1
            
            if not errors_found:
                break
                
            iterations += 1
            # Reduce block size for next iteration
            block_size = max(1, block_size // 2)
        
        # Calculate final error rate
        final_errors = sum(1 for a, b in zip(alice_corrected, bob_corrected) if a != b)
        final_error_rate = final_errors / key_length if key_length > 0 else 0
        
        return {
            'alice_corrected': alice_corrected,
            'bob_corrected': bob_corrected,
            'iterations': iterations,
            'corrections_made': corrections_made,
            'final_errors': final_errors,
            'final_error_rate': final_error_rate,
            'success': final_error_rate < 0.01  # Consider successful if <1% error
        }
    
    def privacy_amplification(self, shared_key: List[int], target_length: int, 
                            eve_information_bound: float = 0.1) -> Dict:
        """
        Perform privacy amplification using universal hashing
        
        Args:
            shared_key: The error-corrected shared key
            target_length: Desired length of final secure key
            eve_information_bound: Upper bound on Eve's information
            
        Returns:
            Privacy amplification results
        """
        key_length = len(shared_key)
        
        if target_length >= key_length:
            return {
                'amplified_key': shared_key,
                'compression_ratio': 1.0,
                'security_parameter': 0,
                'success': False,
                'message': 'Target length too large for privacy amplification'
            }
        
        # Calculate required compression for security
        # Leftover hash lemma: final key length <= original - log2(1/epsilon) - eve_info
        security_parameter = 1e-6  # Epsilon for security
        eve_info_bits = key_length * eve_information_bound
        max_secure_length = key_length - np.log2(1 / security_parameter) - eve_info_bits
        
        final_target_length = min(target_length, int(max_secure_length))
        
        if final_target_length <= 0:
            return {
                'amplified_key': [],
                'compression_ratio': 0.0,
                'security_parameter': security_parameter,
                'success': False,
                'message': 'Cannot generate secure key with given parameters'
            }
        
        # Simple hash-based privacy amplification
        # In practice, would use more sophisticated universal hash families
        amplified_key = []
        
        # Use XOR-based hashing for simplicity
        hash_matrix = np.random.randint(0, 2, (final_target_length, key_length))
        
        for i in range(final_target_length):
            hash_bit = 0
            for j in range(key_length):
                hash_bit ^= (shared_key[j] * hash_matrix[i, j])
            amplified_key.append(hash_bit)
        
        compression_ratio = len(amplified_key) / key_length
        
        return {
            'amplified_key': amplified_key,
            'original_length': key_length,
            'amplified_length': len(amplified_key),
            'compression_ratio': compression_ratio,
            'security_parameter': security_parameter,
            'eve_information_bound': eve_information_bound,
            'hash_matrix': hash_matrix.tolist(),
            'success': True
        }
    
    def calculate_error_correction_efficiency(self, original_errors: int, 
                                           corrected_errors: int,
                                           communication_cost: int) -> Dict:
        """Calculate efficiency metrics for error correction"""
        
        if original_errors == 0:
            correction_rate = 1.0
        else:
            correction_rate = (original_errors - corrected_errors) / original_errors
        
        if communication_cost == 0:
            efficiency = float('inf')
        else:
            efficiency = (original_errors - corrected_errors) / communication_cost
        
        return {
            'original_errors': original_errors,
            'corrected_errors': corrected_errors,
            'errors_fixed': original_errors - corrected_errors,
            'correction_rate': correction_rate,
            'communication_cost': communication_cost,
            'efficiency': efficiency,
            'residual_error_rate': corrected_errors / max(1, original_errors + corrected_errors)
        }
    
    def ldpc_encode(self, data_bits: List[int], code_rate: float = 0.5) -> List[int]:
        """
        Simplified LDPC encoding (Low-Density Parity-Check)
        
        Args:
            data_bits: Data to encode
            code_rate: Code rate (k/n ratio)
            
        Returns:
            Encoded codeword
        """
        k = len(data_bits)  # Number of data bits
        n = int(k / code_rate)  # Total codeword length
        parity_bits = n - k
        
        # Generate random sparse parity check matrix (simplified)
        # In practice, this would be a carefully designed LDPC matrix
        parity_matrix = np.zeros((parity_bits, k), dtype=int)
        
        # Make it sparse - each row has ~3 ones
        for i in range(parity_bits):
            positions = np.random.choice(k, min(3, k), replace=False)
            parity_matrix[i, positions] = 1
        
        # Calculate parity bits
        parity_values = []
        for i in range(parity_bits):
            parity = 0
            for j in range(k):
                parity ^= (data_bits[j] * parity_matrix[i, j])
            parity_values.append(parity)
        
        # Combine data and parity bits
        codeword = data_bits + parity_values
        
        return codeword
    
    def estimate_channel_capacity(self, error_rate: float) -> Dict:
        """
        Estimate channel capacity for given error rate
        
        Args:
            error_rate: Binary symmetric channel error rate
            
        Returns:
            Channel capacity information
        """
        def binary_entropy(p):
            if p == 0 or p == 1:
                return 0
            return -p * np.log2(p) - (1 - p) * np.log2(1 - p)
        
        # Channel capacity for binary symmetric channel
        capacity = 1 - binary_entropy(error_rate)
        
        # Shannon limit for error correction
        shannon_limit = capacity
        
        # Practical achievable rates
        practical_rate = capacity * 0.8  # Account for practical limitations
        
        return {
            'error_rate': error_rate,
            'channel_capacity': capacity,
            'shannon_limit': shannon_limit,
            'practical_achievable_rate': practical_rate,
            'binary_entropy': binary_entropy(error_rate)
        }
