import numpy as np
import matplotlib.pyplot as plt
from qiskit.quantum_info import Statevector, DensityMatrix
from qiskit.visualization import plot_state_qsphere, plot_state_hinton
import base64
from io import BytesIO

class StateVisualization:
    """Advanced quantum state visualization tools"""
    
    def __init__(self):
        plt.style.use('dark_background')
        
    def plot_probability_distribution(self, statevector: Statevector) -> dict:
        """Plot probability distribution of measurement outcomes"""
        probabilities = statevector.probabilities()
        num_qubits = statevector.num_qubits
        
        # Create basis state labels
        labels = [f"|{format(i, f'0{num_qubits}b')}⟩" for i in range(2**num_qubits)]
        
        fig, ax = plt.subplots(figsize=(10, 6))
        bars = ax.bar(range(len(probabilities)), probabilities, 
                     color='cyan', alpha=0.7, edgecolor='white')
        
        ax.set_xlabel('Basis States', fontsize=12, color='white')
        ax.set_ylabel('Probability', fontsize=12, color='white')
        ax.set_title('Measurement Probability Distribution', fontsize=14, color='white')
        ax.set_xticks(range(len(labels)))
        ax.set_xticklabels(labels, rotation=45, color='white')
        ax.tick_params(colors='white')
        ax.grid(True, alpha=0.3)
        
        # Add probability values on bars
        for i, (bar, prob) in enumerate(zip(bars, probabilities)):
            if prob > 0.01:  # Only show significant probabilities
                ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                       f'{prob:.3f}', ha='center', va='bottom', color='white')
        
        plt.tight_layout()
        
        # Convert to base64
        buffer = BytesIO()
        plt.savefig(buffer, format='png', facecolor='black', edgecolor='none')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        
        return {
            'probabilities': probabilities.tolist(),
            'labels': labels,
            'image_data': image_base64
        }
    
    def plot_phase_diagram(self, statevector: Statevector) -> dict:
        """Plot phase diagram showing amplitude and phase information"""
        amplitudes = statevector.data
        magnitudes = np.abs(amplitudes)
        phases = np.angle(amplitudes)
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
        
        # Magnitude plot
        num_qubits = statevector.num_qubits
        labels = [f"|{format(i, f'0{num_qubits}b')}⟩" for i in range(len(amplitudes))]
        
        bars1 = ax1.bar(range(len(magnitudes)), magnitudes, 
                       color='lightcoral', alpha=0.7, edgecolor='white')
        ax1.set_xlabel('Basis States', color='white')
        ax1.set_ylabel('Amplitude Magnitude', color='white')
        ax1.set_title('Amplitude Magnitudes', color='white')
        ax1.set_xticks(range(len(labels)))
        ax1.set_xticklabels(labels, rotation=45, color='white')
        ax1.tick_params(colors='white')
        ax1.grid(True, alpha=0.3)
        
        # Phase plot
        bars2 = ax2.bar(range(len(phases)), phases, 
                       color='lightgreen', alpha=0.7, edgecolor='white')
        ax2.set_xlabel('Basis States', color='white')
        ax2.set_ylabel('Phase (radians)', color='white')
        ax2.set_title('Phases', color='white')
        ax2.set_xticks(range(len(labels)))
        ax2.set_xticklabels(labels, rotation=45, color='white')
        ax2.tick_params(colors='white')
        ax2.grid(True, alpha=0.3)
        ax2.set_ylim([-np.pi, np.pi])
        
        plt.tight_layout()
        
        # Convert to base64
        buffer = BytesIO()
        plt.savefig(buffer, format='png', facecolor='black', edgecolor='none')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        
        return {
            'magnitudes': magnitudes.tolist(),
            'phases': phases.tolist(),
            'labels': labels,
            'image_data': image_base64
        }
    
    def plot_density_matrix_heatmap(self, density_matrix: DensityMatrix) -> dict:
        """Plot density matrix as heatmap"""
        dm_data = density_matrix.data
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
        
        # Real part
        im1 = ax1.imshow(np.real(dm_data), cmap='RdBu', aspect='equal')
        ax1.set_title('Density Matrix - Real Part', color='white')
        ax1.set_xlabel('Basis State Index', color='white')
        ax1.set_ylabel('Basis State Index', color='white')
        plt.colorbar(im1, ax=ax1, label='Real Part')
        ax1.tick_params(colors='white')
        
        # Imaginary part
        im2 = ax2.imshow(np.imag(dm_data), cmap='RdBu', aspect='equal')
        ax2.set_title('Density Matrix - Imaginary Part', color='white')
        ax2.set_xlabel('Basis State Index', color='white')
        ax2.set_ylabel('Basis State Index', color='white')
        plt.colorbar(im2, ax=ax2, label='Imaginary Part')
        ax2.tick_params(colors='white')
        
        plt.tight_layout()
        
        # Convert to base64
        buffer = BytesIO()
        plt.savefig(buffer, format='png', facecolor='black', edgecolor='none')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        
        return {
            'real_part': np.real(dm_data).tolist(),
            'imaginary_part': np.imag(dm_data).tolist(),
            'image_data': image_base64
        }
    
    def create_entanglement_visualization(self, bell_state_type: str = 'phi_plus') -> dict:
        """Create visualization for Bell states"""
        bell_states = {
            'phi_plus': np.array([1, 0, 0, 1]) / np.sqrt(2),
            'phi_minus': np.array([1, 0, 0, -1]) / np.sqrt(2),
            'psi_plus': np.array([0, 1, 1, 0]) / np.sqrt(2),
            'psi_minus': np.array([0, 1, -1, 0]) / np.sqrt(2)
        }
        
        if bell_state_type not in bell_states:
            bell_state_type = 'phi_plus'
        
        statevector = Statevector(bell_states[bell_state_type])
        
        # Create visualization
        prob_data = self.plot_probability_distribution(statevector)
        phase_data = self.plot_phase_diagram(statevector)
        
        return {
            'bell_state_type': bell_state_type,
            'state_vector': bell_states[bell_state_type].tolist(),
            'probability_plot': prob_data,
            'phase_plot': phase_data,
            'entanglement_measure': self.calculate_entanglement_entropy(statevector)
        }
    
    def calculate_entanglement_entropy(self, statevector: Statevector) -> float:
        """Calculate entanglement entropy (for 2-qubit states)"""
        if statevector.num_qubits != 2:
            return 0.0
        
        # Partial trace over second qubit
        rho = DensityMatrix(statevector)
        rho_A = rho.partial_trace([1])  # Trace out qubit 1
        
        # Calculate von Neumann entropy
        eigenvals = np.linalg.eigvals(rho_A.data)
        eigenvals = eigenvals[eigenvals > 1e-12]  # Remove numerical zeros
        entropy = -np.sum(eigenvals * np.log2(eigenvals))
        
        return float(entropy)
