import matplotlib.pyplot as plt
from qiskit import QuantumCircuit
from qiskit.visualization import circuit_drawer
import base64
from io import BytesIO
from typing import Dict, List

class CircuitDrawer:
    """Enhanced quantum circuit visualization"""
    
    def __init__(self):
        self.style = {
            'backgroundcolor': '#1a1d29',
            'textcolor': 'white',
            'gatetextcolor': 'white',
            'linecolor': 'white',
            'cregcolor': 'cyan',
            'gatefacecolor': '#252837',
            'gateedgecolor': 'white'
        }
    
    def draw_bb84_circuit(self, alice_bit: int, alice_basis: int, bob_basis: int) -> dict:
        """Draw a single BB84 circuit"""
        qc = QuantumCircuit(1, 1, name='BB84')
        
        # Alice's preparation
        if alice_bit == 1:
            qc.x(0)
        if alice_basis == 1:  # X-basis
            qc.h(0)
        
        qc.barrier(label='Transmission')
        
        # Bob's measurement
        if bob_basis == 1:  # X-basis
            qc.h(0)
        qc.measure(0, 0)
        
        # Create the drawing
        img_data = self._circuit_to_image(qc)
        
        return {
            'circuit_image': img_data,
            'alice_bit': alice_bit,
            'alice_basis': alice_basis,
            'bob_basis': bob_basis,
            'bases_match': alice_basis == bob_basis
        }
    
    def draw_multiple_bb84_circuits(self, circuits_data: List[Dict]) -> dict:
        """Draw multiple BB84 circuits in a grid"""
        num_circuits = len(circuits_data)
        cols = min(4, num_circuits)
        rows = (num_circuits + cols - 1) // cols
        
        fig, axes = plt.subplots(rows, cols, figsize=(4*cols, 2*rows))
        if num_circuits == 1:
            axes = [axes]
        elif rows == 1:
            axes = [axes]
        else:
            axes = axes.flatten()
        
        fig.patch.set_facecolor('#1a1d29')
        
        for i, circuit_data in enumerate(circuits_data):
            if i >= len(axes):
                break
                
            qc = self._create_bb84_circuit_from_data(circuit_data)
            
            # Draw circuit on subplot
            ax = axes[i]
            ax.set_facecolor('#1a1d29')
            
            # Use text representation for simplicity in subplot
            title = f"Qubit {i+1}: A({circuit_data['alice_bit']},{circuit_data['alice_basis']}) B({circuit_data['bob_basis']})"
            match_status = "✓" if circuit_data['alice_basis'] == circuit_data['bob_basis'] else "✗"
            ax.text(0.5, 0.5, f"{title}\n{match_status}", 
                   ha='center', va='center', transform=ax.transAxes,
                   color='white', fontsize=8)
            ax.set_xlim(0, 1)
            ax.set_ylim(0, 1)
            ax.axis('off')
        
        # Hide unused subplots
        for i in range(num_circuits, len(axes)):
            axes[i].axis('off')
        
        plt.tight_layout()
        
        # Convert to base64
        buffer = BytesIO()
        plt.savefig(buffer, format='png', facecolor='#1a1d29', edgecolor='none')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        
        return {
            'image_data': image_base64,
            'num_circuits': num_circuits,
            'matching_bases': sum(1 for cd in circuits_data if cd['alice_basis'] == cd['bob_basis'])
        }
    
    def draw_eavesdropper_circuit(self, alice_bit: int, alice_basis: int, 
                                eve_basis: int, bob_basis: int) -> dict:
        """Draw BB84 circuit with eavesdropper"""
        qc = QuantumCircuit(1, 2, name='BB84_with_Eve')
        
        # Alice's preparation
        if alice_bit == 1:
            qc.x(0)
        if alice_basis == 1:
            qc.h(0)
        
        qc.barrier(label='Alice→Eve')
        
        # Eve's measurement
        if eve_basis == 1:
            qc.h(0)
        qc.measure(0, 0)  # Eve measures
        
        # Eve resends (simplified - just reset and prepare again)
        qc.barrier(label='Eve→Bob')
        
        # Bob's measurement
        if bob_basis == 1:
            qc.h(0)
        qc.measure(0, 1)  # Bob measures
        
        img_data = self._circuit_to_image(qc)
        
        return {
            'circuit_image': img_data,
            'alice_bit': alice_bit,
            'alice_basis': alice_basis,
            'eve_basis': eve_basis,
            'bob_basis': bob_basis,
            'eavesdropping': True
        }
    
    def _create_bb84_circuit_from_data(self, data: Dict) -> QuantumCircuit:
        """Helper to create circuit from data dictionary"""
        qc = QuantumCircuit(1, 1)
        
        if data['alice_bit'] == 1:
            qc.x(0)
        if data['alice_basis'] == 1:
            qc.h(0)
        qc.barrier()
        if data['bob_basis'] == 1:
            qc.h(0)
        qc.measure(0, 0)
        
        return qc
    
    def _circuit_to_image(self, circuit: QuantumCircuit) -> str:
        """Convert circuit to base64 image"""
        try:
            fig = circuit_drawer(circuit, output='mpl', style=self.style, 
                               plot_barriers=True, fold=20)
            
            buffer = BytesIO()
            fig.savefig(buffer, format='png', facecolor='#1a1d29', 
                       edgecolor='none', bbox_inches='tight')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.getvalue()).decode()
            plt.close(fig)
            
            return image_base64
        except Exception as e:
            # Fallback to text representation
            return str(circuit)
    
    def create_protocol_flowchart(self) -> dict:
        """Create BB84 protocol flowchart"""
        fig, ax = plt.subplots(figsize=(12, 8))
        fig.patch.set_facecolor('#1a1d29')
        ax.set_facecolor('#1a1d29')
        
        # Define flowchart steps
        steps = [
            (2, 7, "Alice generates\nrandom bits"),
            (2, 6, "Alice chooses\nrandom bases"),
            (2, 5, "Alice prepares\nqubits"),
            (6, 5, "Quantum\nTransmission"),
            (10, 6, "Bob chooses\nrandom bases"),
            (10, 5, "Bob measures\nqubits"),
            (6, 3, "Public discussion\nof bases"),
            (6, 2, "Key sifting"),
            (6, 1, "Error checking"),
            (6, 0, "Final shared key")
        ]
        
        # Draw boxes and text
        for x, y, text in steps:
            rect = plt.Rectangle((x-0.8, y-0.3), 1.6, 0.6, 
                               facecolor='#252837', edgecolor='cyan', linewidth=2)
            ax.add_patch(rect)
            ax.text(x, y, text, ha='center', va='center', color='white', fontsize=10)
        
        # Draw arrows
        arrows = [
            (2, 6.7, 2, 6.3),  # bits to bases
            (2, 5.7, 2, 5.3),  # bases to qubits
            (2.8, 5, 5.2, 5),  # qubits to transmission
            (6.8, 5, 9.2, 5),  # transmission to Bob
            (10, 5.7, 10, 6.3),  # measurement to bases
            (8, 5, 8, 3.3),     # to discussion
            (6, 2.7, 6, 2.3),   # discussion to sifting
            (6, 1.7, 6, 1.3),   # sifting to error check
            (6, 0.7, 6, 0.3)    # error check to key
        ]
        
        for x1, y1, x2, y2 in arrows:
            ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                       arrowprops=dict(arrowstyle='->', color='cyan', lw=2))
        
        ax.set_xlim(0, 12)
        ax.set_ylim(-0.5, 7.5)
        ax.set_title('BB84 Protocol Flowchart', color='white', fontsize=16, fontweight='bold')
        ax.axis('off')
        
        plt.tight_layout()
        
        # Convert to base64
        buffer = BytesIO()
        plt.savefig(buffer, format='png', facecolor='#1a1d29', edgecolor='none')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        
        return {
            'flowchart_image': image_base64,
            'description': 'Complete BB84 protocol flowchart showing all steps from bit generation to final shared key'
        }
