# QKD BB84 Simulator Setup Guide

## System Requirements

### Hardware Requirements
- **CPU**: Multi-core processor (Intel i5/AMD Ryzen 5 or better)
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 5GB free space
- **Network**: Stable internet connection for IBM Quantum access

### Software Requirements
- **Python**: 3.9 or higher
- **Node.js**: 16.x or higher
- **npm/yarn**: Latest version
- **Git**: For cloning repository
- **Docker**: Optional, for containerized deployment

## Quick Start

### 1. Clone Repository
git clone https://github.com/your-repo/qkd-bb84-simulator.git
cd qkd-bb84-simulator


### 2. Backend Setup
cd backend
python -m venv venv
source venv/bin/activate # On Windows: venv\Scripts\activate
pip install -r requirements.txt
### 3. Environment Configuration
Create `.env` file in backend directory:
IBM_QUANTUM_TOKEN=your_ibm_quantum_token_here
IBM_QUANTUM_INSTANCE=ibm_brisbane
QISKIT_BACKEND=aer_simulator
DEBUG=True
CORS_ORIGINS=http://localhost:3000

### 4. Frontend Setup
cd ../frontend
npm install

### 5. Start Services
Terminal 1 (Backend):
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

Terminal 2 (Frontend):
cd frontend
npm start


### 6. Access Application
Open browser and navigate to: `http://localhost:3000`

## Detailed Installation

### IBM Quantum Setup

#### 1. Create IBM Quantum Account
1. Visit [IBM Quantum](https://quantum-computing.ibm.com/)
2. Create free account
3. Navigate to account settings
4. Copy API token

#### 2. Configure Token
Add token to backend `.env` file:
IBM_QUANTUM_TOKEN=your_actual_token_here
#### 3. Test Connection
from qiskit_ibm_runtime import QiskitRuntimeService

Test connection
service = QiskitRuntimeService(
channel="ibm_quantum",
token="your_token_here"
)
print("Available backends:", service.backends())

### Development Environment

#### Python Virtual Environment
Create virtual environment
python -m venv qkd-env

Activate (Linux/Mac)
source qkd-env/bin/activate

Activate (Windows)
qkd-env\Scripts\activate

Install dependencies
pip install -r requirements.txt

#### Node.js Dependencies
Install frontend dependencies
cd frontend
npm install

Install development dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom