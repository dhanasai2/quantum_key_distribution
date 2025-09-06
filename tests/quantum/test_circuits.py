import sys
import os

# Add project root to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

import pytest
import numpy as np
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from quantum.circuits.bb84_circuit import BB84Circuit
from quantum.protocols.bb84_protocol import BB84Protocol

# Rest of your test code...

class TestBB84Circuit:
    def setup_method(self):
        self.bb84_circuit = BB84Circuit()
        self.simulator = AerSimulator()

    def test_create_alice_circuit(self):
        # Test |0⟩ in Z-basis
        qc = self.bb84_circuit.create_alice_circuit(0, 0)
        assert qc.num_qubits == 1
        assert qc.num_clbits == 1
        
        # Test |1⟩ in Z-basis
        qc = self.bb84_circuit.create_alice_circuit(1, 0)
        assert qc.count_ops().get('x', 0) == 1
        
        # Test |0⟩ in X-basis
        qc = self.bb84_circuit.create_alice_circuit(0, 1)
        assert qc.count_ops().get('h', 0) == 1

    def test_create_bob_circuit(self):
        # Test Z-basis measurement
        qc = self.bb84_circuit.create_bob_circuit(0)
        assert qc.count_ops().get('measure', 0) == 1
        
        # Test X-basis measurement
        qc = self.bb84_circuit.create_bob_circuit(1)
        assert qc.count_ops().get('h', 0) == 1

    def test_combined_circuit_execution(self):
        # Test perfect case - same bases
        alice_qc = self.bb84_circuit.create_alice_circuit(1, 0)  # |1⟩ Z-basis
        bob_qc = self.bb84_circuit.create_bob_circuit(0)         # Z-basis measurement
        
        combined = self.bb84_circuit.combine_circuits(alice_qc, bob_qc)
        job = self.simulator.run(combined, shots=100)
        result = job.result()
        counts = result.get_counts()
        
        # Should always measure |1⟩
        assert counts.get('1', 0) > counts.get('0', 0)

class TestBB84Protocol:
    def setup_method(self):
        self.protocol = BB84Protocol(num_qubits=16)

    def test_generate_random_bits(self):
        bits = self.protocol.generate_random_bits(10)
        assert len(bits) == 10
        assert all(bit in [0, 1] for bit in bits)

    def test_generate_random_bases(self):
        bases = self.protocol.generate_random_bases(10)
        assert len(bases) == 10
        assert all(basis in [0, 1] for basis in bases)

    @pytest.mark.asyncio
    async def test_simulate_quantum_transmission(self):
        alice_bits = [0, 1, 0, 1]
        alice_bases = [0, 0, 1, 1]
        bob_bases = [0, 1, 1, 0]
        
        results = self.protocol.simulate_quantum_transmission(
            alice_bits, alice_bases, bob_bases
        )
        
        assert len(results) == 4
        assert all(result in [0, 1] for result in results)

    def test_perform_key_sifting(self):
        alice_bits = [0, 1, 0, 1, 1, 0]
        alice_bases = [0, 0, 1, 1, 0, 1]
        bob_bases = [0, 1, 1, 0, 0, 1]
        bob_results = [0, 0, 1, 0, 1, 0]
        
        result = self.protocol.perform_key_sifting(
            alice_bits, alice_bases, bob_bases, bob_results
        )
        
        # Bases match at indices: 0, 2, 4, 5
        assert len(result['alice_sifted_key']) == 4
        assert len(result['bob_sifted_key']) == 4
        assert result['sifted_key_length'] == 4

    def test_estimate_eavesdropping_probability(self):
        # Low error rate
        analysis = self.protocol.estimate_eavesdropping_probability(0.02)
        assert analysis['eavesdropping_probability'] == 0.0
        assert analysis['security_level'] == "HIGH"
        
        # High error rate
        analysis = self.protocol.estimate_eavesdropping_probability(0.15)
        assert analysis['eavesdropping_probability'] == 1.0
        assert analysis['security_level'] == "COMPROMISED"

    @pytest.mark.asyncio
    async def test_run_complete_protocol(self):
        result = await self.protocol.run_complete_protocol(16, 0.02)
        
        assert 'alice_bits' in result
        assert 'sifting_results' in result
        assert 'eavesdropping_analysis' in result
        assert len(result['alice_bits']) == 16

if __name__ == "__main__":
    pytest.main([__file__])
