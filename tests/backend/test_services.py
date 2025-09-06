import sys
import os

# Add backend directory to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

import pytest
import asyncio
from backend.app.services.bb84_service import BB84Service
from backend.app.services.quantum_service import QuantumService
from backend.app.services.crypto_service import CryptoService

# Rest of your test code...

@pytest.fixture
def bb84_service():
    return BB84Service()

@pytest.fixture
def quantum_service():
    return QuantumService()

@pytest.fixture
def crypto_service():
    return CryptoService()

class TestBB84Service:
    @pytest.mark.asyncio
    async def test_run_complete_bb84(self, bb84_service):
        result = await bb84_service.run_complete_bb84("test message", 16)
        
        assert "message" in result
        assert "bb84_details" in result
        assert "final_key" in result
        assert "security_analysis" in result
        assert result["message"] == "test message"

    def test_analyze_security(self, bb84_service):
        # Test with low error rate
        analysis = bb84_service.analyze_security(0.05)
        assert analysis["secure"] == True
        assert analysis["security_level"] == "MEDIUM"
        
        # Test with high error rate
        analysis = bb84_service.analyze_security(0.15)
        assert analysis["secure"] == False
        assert analysis["security_level"] == "COMPROMISED"

class TestQuantumService:
    @pytest.mark.asyncio
    async def test_run_bb84_protocol(self, quantum_service):
        result = await quantum_service.run_bb84_protocol(8, False)
        
        assert "alice_bits" in result
        assert "alice_bases" in result
        assert "bob_bases" in result
        assert "bob_results" in result
        assert len(result["alice_bits"]) == 8

    @pytest.mark.asyncio
    async def test_generate_bloch_sphere_data(self, quantum_service):
        result = await quantum_service.generate_bloch_sphere_data(1.57, 0.785)
        
        assert "x" in result
        assert "y" in result
        assert "z" in result
        assert "theta" in result
        assert "phi" in result
        assert result["theta"] == 1.57
        assert result["phi"] == 0.785

class TestCryptoService:
    def test_key_expansion(self, crypto_service):
        quantum_key = [1, 0, 1, 1, 0, 0, 1, 0]
        expanded_key = crypto_service.key_expansion(quantum_key, 32)
        
        assert len(expanded_key) == 32
        assert isinstance(expanded_key, bytes)

    def test_encrypt_decrypt_aes(self, crypto_service):
        plaintext = "Test message"
        quantum_key = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0] * 16
        
        # Test encryption
        encrypt_result = crypto_service.encrypt_aes(plaintext, quantum_key)
        assert encrypt_result["success"] == True
        assert "ciphertext" in encrypt_result
        
        # Test decryption
        decrypt_result = crypto_service.decrypt_aes(
            encrypt_result["ciphertext"], 
            quantum_key
        )
        assert decrypt_result["success"] == True
        assert decrypt_result["plaintext"] == plaintext

if __name__ == "__main__":
    pytest.main([__file__])
