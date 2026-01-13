# 🔐 Quantum-Enhanced Cryptography Simulator

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Qiskit](https://img.shields.io/badge/Qiskit-Latest-purple.svg)](https://qiskit.org/)
[![IBM Quantum](https://img.shields.io/badge/IBM_Quantum-Supported-red.svg)](https://quantum.ibm.com/)

A comprehensive, interactive **Quantum Key Distribution (QKD) Simulator** implementing the **BB84 protocol** with real **IBM Quantum hardware integration**.  
Built for **educational purposes** and **quantum cryptography research**.

---

## 🌟 Features

### 🔬 Quantum Key Distribution
- **BB84 Protocol** implementation with full simulation  
- **IBM Quantum Integration** – run on real hardware or simulators  
- **3D Bloch Sphere Visualization** of quantum states  
- **QBER (Quantum Bit Error Rate)** monitoring  

### 🛡️ Cryptographic Systems
- Compare **Quantum QKD vs Classical (RSA + AES)**  
- **Wire Protocol Visualization** of actual encrypted data transmission  
- **Tamper Detection** with integrity verification  
- **Secure Key Management** with quantum-safe methods  

### 🕵️ Security Analysis
- **Eavesdropper Simulation (Eve)** with QBER impact  
- **Real-time Attack Detection** & breach visualization  
- **Performance Metrics** (success rates, errors, efficiency)  
- **Security Alerts & Logs**  

### 💳 Payment Gateway Integration
- **Quantum-Secured Transactions** demo  
- **Multi-currency support**  
- **Transaction logs** with quantum-safe audit trails  

### 📊 Analytics & Monitoring
- **Real-time charts**: QBER, basis matching, efficiency  
- **Alice-Bob Communication Logs**  
- **System-wide event monitoring**  
- **Performance dashboards**  

---

## 🚀 Demo

[![Quantum Simulator Demo](https://via.placeholder.com/800x400/0f1419/64ffda?text=Quantum+Cryptography+Simulator+Demo)](https://your-demo-link.com)

🔗 **Live Demo**: [https://your-demo-link.com](https://your-demo-link.com)

---

## 🛠️ Technology Stack

### Frontend
- React 18.2+  
- Material-UI (MUI)  
- Recharts (Data Visualization)  
- Three.js (3D Bloch Sphere)  
- WebSocket (real-time communication)  

### Backend
- Python 3.9+  
- FastAPI  
- Qiskit (Quantum SDK)  
- SQLite / PostgreSQL  
- WebSockets  

### Quantum Computing
- IBM Quantum Hardware  
- Qiskit Runtime  
- BB84 Protocol Simulation  
- Local Quantum Simulators  

---

## 📋 Prerequisites

- **Node.js** ≥ 18  
- **Python** ≥ 3.9  
- **npm / yarn**  
- **Git**  

🔑 Optional:  
- **IBM Quantum Account** (for real hardware access)  
- **Docker** (for container deployment)  

---

## ⚡ Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/dhanasai2/quantum_key_distribution.git
cd quantum_key_distribution
2. Backend Setup
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
3. Frontend Setup
cd frontend
npm install
npm start
➡️ Open: http://localhost:3000

🔧 Configuration
Backend .env
env
BACKEND_HOST=localhost
BACKEND_PORT=8000
DEBUG=true

IBM_QUANTUM_TOKEN=your_ibm_quantum_token
IBM_QUANTUM_INSTANCE=ibm-q/open/main

DATABASE_URL=sqlite:///./quantum_demo.db
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret
Frontend .env
env
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_WEBSOCKET_URL=ws://localhost:8000/ws
REACT_APP_IBM_QUANTUM_ENABLED=true
📖 Usage Guide
Start backend & frontend servers

Configure IBM Quantum token (optional)

Generate secure quantum keys using BB84

Compare Quantum vs Classical encryption

Simulate Eavesdropping attacks

Monitor performance in real-time dashboards

🧪 Testing
Run Tests
# Backend
cd backend
pytest tests/ -v

# Frontend
cd frontend
npm test
✅ Unit, Integration, Quantum Protocol, and Security tests included.

🎯 Project Structure

quantum-cryptography-demo/
├── frontend/         # React app
│   ├── src/components
│   │   ├── QKDSimulator/
│   │   ├── BlochSphere/
│   │   └── PaymentFlow/
│   └── package.json
│
├── backend/          # FastAPI backend
│   ├── app/quantum
│   ├── app/cryptography
│   ├── app/websockets
│   └── main.py
│
├── docs/             # Documentation
├── tests/            # Test files
├── docker-compose.yml
└── README.md
🚀 Deployment
Local with Docker
docker-compose up --build
Production
# Frontend
npm run build

# Backend
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
Cloud options: Vercel / Netlify (frontend), Heroku / AWS / GCP (backend), RDS / MongoDB Atlas (DB).

📚 Learning Resources
📖 Quantum Computation & Quantum Information – Nielsen & Chuang

📖 Quantum Cryptography: Public Key Distribution and Coin Tossing – Bennett & Brassard

📖 Qiskit Textbook

🎓 IBM Qiskit Global Summer School

🤝 Contributing
We welcome contributions! 🚀

Fork repo

Create feature branch: git checkout -b feature/awesome-feature

Commit: git commit -m "Add awesome feature"

Push: git push origin feature/awesome-feature

Open PR

🐛 Troubleshooting
IBM Quantum errors → check token & instance

WebSocket issues → confirm backend is running

Simulation errors → upgrade Qiskit pip install --upgrade qiskit

Frontend build errors → clear node_modules & reinstall

📄 License
MIT License © 2025 Sai Gundumogula
See LICENSE for details.

🙏 Acknowledgments
IBM Quantum Team

Qiskit Community

Material-UI

Charles Bennett & Gilles Brassard (BB84 Protocol)

Quantum Cryptography Research Community

📞 Contact
👤 Sai Gundumogula
📧 Email: saigundumogula5@gmail.com
🏫 JNTU University – Information Technology
💻 GitHub: dhanasai2


⚡ Built with cutting-edge quantum technology & modern web frameworks
🔬 Advancing quantum cryptography education through interactive simulation
🚀 Ready for the quantum future of cybersecurity
