import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from qiskit.quantum_info import Statevector
from qiskit.visualization import plot_bloch_vector
import base64
from io import BytesIO

class BlochRenderer:
    """Render Bloch sphere visualizations for quantum states"""
    
    def __init__(self):
        self.fig_size = (8, 8)
        self.dpi = 100
        
    def render_state_vector(self, statevector: Statevector, title: str = "Quantum State") -> dict:
        """
        Render a quantum state on the Bloch sphere
        
        Args:
            statevector: The quantum state to visualize
            title: Title for the plot
            
        Returns:
            Dictionary with Bloch coordinates and image data
        """
        # Calculate Bloch vector coordinates
        bloch_coords = statevector.to_bloch()
        
        # Create Bloch sphere plot
        fig = plt.figure(figsize=self.fig_size, dpi=self.dpi)
        ax = fig.add_subplot(111, projection='3d')
        
        # Draw sphere
        u = np.linspace(0, 2 * np.pi, 50)
        v = np.linspace(0, np.pi, 50)
        sphere_x = np.outer(np.cos(u), np.sin(v))
        sphere_y = np.outer(np.sin(u), np.sin(v))
        sphere_z = np.outer(np.ones(np.size(u)), np.cos(v))
        
        ax.plot_surface(sphere_x, sphere_y, sphere_z, alpha=0.1, color='lightblue')
        
        # Draw axes
        ax.plot([-1.2, 1.2], [0, 0], [0, 0], 'k-', alpha=0.3)
        ax.plot([0, 0], [-1.2, 1.2], [0, 0], 'k-', alpha=0.3)
        ax.plot([0, 0], [0, 0], [-1.2, 1.2], 'k-', alpha=0.3)
        
        # Draw state vector
        ax.quiver(0, 0, 0, bloch_coords[0], bloch_coords[1], bloch_coords[2], 
                 color='red', arrow_length_ratio=0.1, linewidth=3)
        
        # Add labels
        ax.text(1.3, 0, 0, 'X', fontsize=12)
        ax.text(0, 1.3, 0, 'Y', fontsize=12)
        ax.text(0, 0, 1.3, '|0⟩', fontsize=12)
        ax.text(0, 0, -1.3, '|1⟩', fontsize=12)
        
        ax.set_xlim([-1.2, 1.2])
        ax.set_ylim([-1.2, 1.2])
        ax.set_zlim([-1.2, 1.2])
        ax.set_title(title, fontsize=14, fontweight='bold')
        ax.set_box_aspect([1,1,1])
        
        # Convert to base64 image
        buffer = BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight', dpi=self.dpi)
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        
        return {
            'bloch_coordinates': {
                'x': float(bloch_coords[0]),
                'y': float(bloch_coords[1]),
                'z': float(bloch_coords[2])
            },
            'image_data': image_base64,
            'state_amplitudes': {
                'alpha': complex(statevector[0]),
                'beta': complex(statevector[1])
            }
        }
    
    def render_multiple_states(self, states: list, labels: list = None) -> dict:
        """Render multiple quantum states on the same Bloch sphere"""
        if labels is None:
            labels = [f"State {i+1}" for i in range(len(states))]
        
        fig = plt.figure(figsize=self.fig_size, dpi=self.dpi)
        ax = fig.add_subplot(111, projection='3d')
        
        # Draw sphere
        u = np.linspace(0, 2 * np.pi, 30)
        v = np.linspace(0, np.pi, 30)
        sphere_x = np.outer(np.cos(u), np.sin(v))
        sphere_y = np.outer(np.sin(u), np.sin(v))
        sphere_z = np.outer(np.ones(np.size(u)), np.cos(v))
        
        ax.plot_surface(sphere_x, sphere_y, sphere_z, alpha=0.1, color='lightblue')
        
        # Draw axes
        ax.plot([-1.2, 1.2], [0, 0], [0, 0], 'k-', alpha=0.3)
        ax.plot([0, 0], [-1.2, 1.2], [0, 0], 'k-', alpha=0.3)
        ax.plot([0, 0], [0, 0], [-1.2, 1.2], 'k-', alpha=0.3)
        
        colors = ['red', 'blue', 'green', 'orange', 'purple']
        all_coords = []
        
        # Draw all state vectors
        for i, state in enumerate(states):
            if isinstance(state, Statevector):
                bloch_coords = state.to_bloch()
            else:
                bloch_coords = state  # Assume it's already coordinates
                
            color = colors[i % len(colors)]
            ax.quiver(0, 0, 0, bloch_coords[0], bloch_coords[1], bloch_coords[2], 
                     color=color, arrow_length_ratio=0.1, linewidth=2, label=labels[i])
            
            all_coords.append({
                'label': labels[i],
                'coordinates': {
                    'x': float(bloch_coords[0]),
                    'y': float(bloch_coords[1]),
                    'z': float(bloch_coords[2])
                }
            })
        
        # Add labels
        ax.text(1.3, 0, 0, 'X', fontsize=12)
        ax.text(0, 1.3, 0, 'Y', fontsize=12)
        ax.text(0, 0, 1.3, '|0⟩', fontsize=12)
        ax.text(0, 0, -1.3, '|1⟩', fontsize=12)
        
        ax.set_xlim([-1.2, 1.2])
        ax.set_ylim([-1.2, 1.2])
        ax.set_zlim([-1.2, 1.2])
        ax.set_title('Multiple Quantum States', fontsize=14, fontweight='bold')
        ax.legend()
        ax.set_box_aspect([1,1,1])
        
        # Convert to base64 image
        buffer = BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight', dpi=self.dpi)
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        
        return {
            'states': all_coords,
            'image_data': image_base64
        }
    
    def create_animation_frames(self, theta_range: list, phi_range: list) -> list:
        """Create frames for Bloch sphere animation"""
        frames = []
        
        for theta, phi in zip(theta_range, phi_range):
            # Calculate Bloch coordinates
            x = np.sin(theta) * np.cos(phi)
            y = np.sin(theta) * np.sin(phi)
            z = np.cos(theta)
            
            # Create statevector
            alpha = np.cos(theta/2)
            beta = np.sin(theta/2) * np.exp(1j * phi)
            statevector = Statevector([alpha, beta])
            
            frame_data = self.render_state_vector(
                statevector, 
                f"θ={theta:.2f}, φ={phi:.2f}"
            )
            frames.append(frame_data)
        
        return frames
