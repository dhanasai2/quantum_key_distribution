import numpy as np
import random
from typing import List, Dict, Tuple, Optional
from qiskit import QuantumCircuit
from .noise_models import NoiseModels

class ChannelSimulation:
    """Simulate realistic quantum communication channels"""
    
    def __init__(self):
        self.noise_models = NoiseModels()
        
    def simulate_fiber_optic_channel(self, distance_km: float, 
                                   wavelength_nm: float = 1550) -> Dict:
        """
        Simulate fiber optic quantum channel
        
        Args:
            distance_km: Distance in kilometers
            wavelength_nm: Wavelength in nanometers
            
        Returns:
            Channel characteristics
        """
        # Fiber attenuation (dB/km) at different wavelengths
        attenuation_coeffs = {
            850: 3.5,   # dB/km
            1310: 0.35, # dB/km  
            1550: 0.20  # dB/km (optimal for telecom)
        }
        
        # Find closest wavelength
        closest_wavelength = min(attenuation_coeffs.keys(), 
                               key=lambda x: abs(x - wavelength_nm))
        attenuation_db_per_km = attenuation_coeffs[closest_wavelength]
        
        # Calculate total loss
        total_loss_db = attenuation_db_per_km * distance_km
        transmission_efficiency = 10 ** (-total_loss_db / 10)
        
        # Additional effects
        dispersion_ps_per_nm_km = 17  # Typical for standard fiber at 1550nm
        total_dispersion = dispersion_ps_per_nm_km * distance_km
        
        # Nonlinear effects (simplified)
        nonlinear_threshold_km = 100  # Distance where nonlinear effects become significant
        nonlinear_noise = max(0, (distance_km - nonlinear_threshold_km) / 1000)
        
        return {
            'distance_km': distance_km,
            'wavelength_nm': wavelength_nm,
            'attenuation_db_per_km': attenuation_db_per_km,
            'total_loss_db': total_loss_db,
            'transmission_efficiency': transmission_efficiency,
            'dispersion_ps_per_nm_km': dispersion_ps_per_nm_km,
            'total_dispersion_ps': total_dispersion,
            'nonlinear_noise_level': nonlinear_noise,
            'estimated_error_rate': min(0.5, 0.01 + nonlinear_noise + (1 - transmission_efficiency) * 0.1)
        }
    
    def simulate_free_space_channel(self, distance_km: float, 
                                   weather_condition: str = 'clear',
                                   elevation_angle: float = 45.0) -> Dict:
        """
        Simulate free-space optical quantum channel
        
        Args:
            distance_km: Distance in kilometers
            weather_condition: Weather condition ('clear', 'hazy', 'light_rain', 'heavy_rain')
            elevation_angle: Elevation angle in degrees
            
        Returns:
            Free-space channel characteristics
        """
        # Atmospheric attenuation coefficients (dB/km)
        weather_attenuation = {
            'clear': 0.2,
            'hazy': 2.0,
            'light_rain': 6.0,
            'heavy_rain': 25.0,
            'fog': 50.0
        }
        
        attenuation_coeff = weather_attenuation.get(weather_condition, 2.0)
        
        # Elevation angle effect (more atmosphere at low angles)
        elevation_factor = 1 / np.sin(np.radians(elevation_angle))
        effective_distance = distance_km * elevation_factor
        
        # Calculate losses
        atmospheric_loss_db = attenuation_coeff * effective_distance
        geometric_loss_db = 20 * np.log10(distance_km * 1000)  # Beam divergence
        
        total_loss_db = atmospheric_loss_db + geometric_loss_db
        transmission_efficiency = 10 ** (-total_loss_db / 10)
        
        # Atmospheric turbulence (scintillation)
        turbulence_variance = 0.1 * (distance_km / 10) ** 1.2  # Simplified model
        
        # Background noise (daylight, thermal)
        background_noise = 0.01 if weather_condition == 'clear' else 0.05
        
        return {
            'distance_km': distance_km,
            'weather_condition': weather_condition,
            'elevation_angle': elevation_angle,
            'atmospheric_loss_db': atmospheric_loss_db,
            'geometric_loss_db': geometric_loss_db,
            'total_loss_db': total_loss_db,
            'transmission_efficiency': transmission_efficiency,
            'turbulence_variance': turbulence_variance,
            'background_noise_level': background_noise,
            'estimated_error_rate': min(0.5, 0.005 + turbulence_variance + background_noise)
        }
    
    def simulate_detector_characteristics(self, detector_type: str = 'superconducting') -> Dict:
        """
        Simulate single-photon detector characteristics
        
        Args:
            detector_type: Type of detector ('superconducting', 'avalanche', 'transition_edge')
            
        Returns:
            Detector characteristics
        """
        detector_specs = {
            'superconducting': {
                'quantum_efficiency': 0.95,
                'dark_count_rate': 100,      # counts/second
                'timing_jitter': 50e-12,     # seconds
                'dead_time': 10e-9,          # seconds
                'operating_temperature': 0.3 # Kelvin
            },
            'avalanche': {
                'quantum_efficiency': 0.70,
                'dark_count_rate': 1000,
                'timing_jitter': 500e-12,
                'dead_time': 50e-9,
                'operating_temperature': 200  # Kelvin
            },
            'transition_edge': {
                'quantum_efficiency': 0.98,
                'dark_count_rate': 10,
                'timing_jitter': 1e-12,
                'dead_time': 1e-6,
                'operating_temperature': 0.1
            }
        }
        
        return detector_specs.get(detector_type, detector_specs['avalanche'])
    
    def simulate_polarization_drift(self, time_hours: float, 
                                   temperature_stability: float = 1.0) -> Dict:
        """
        Simulate polarization drift in optical fibers
        
        Args:
            time_hours: Time duration in hours
            temperature_stability: Temperature stability factor (1.0 = perfect)
            
        Returns:
            Polarization drift characteristics
        """
        # Polarization drift rate (degrees per hour)
        base_drift_rate = 5.0  # degrees/hour for standard fiber
        
        # Temperature effect
        temp_drift_factor = 2.0 / temperature_stability
        effective_drift_rate = base_drift_rate * temp_drift_factor
        
        # Calculate total drift
        total_drift_degrees = effective_drift_rate * time_hours
        
        # Convert to error probability
        # Maximum error when drift is 45 degrees (worst case for linear polarization)
        error_probability = min(0.5, abs(np.sin(np.radians(total_drift_degrees))) * 0.5)
        
        return {
            'time_hours': time_hours,
            'base_drift_rate_deg_per_hour': base_drift_rate,
            'temperature_stability': temperature_stability,
            'effective_drift_rate': effective_drift_rate,
            'total_drift_degrees': total_drift_degrees,
            'polarization_error_probability': error_probability
        }
    
    def simulate_timing_synchronization(self, clock_accuracy_ppm: float = 1.0,
                                      distance_km: float = 10.0) -> Dict:
        """
        Simulate timing synchronization issues
        
        Args:
            clock_accuracy_ppm: Clock accuracy in parts per million
            distance_km: Distance for propagation delay calculation
            
        Returns:
            Timing synchronization characteristics
        """
        # Speed of light in fiber (approximately 2/3 of c)
        speed_of_light_fiber = 2e8  # m/s
        
        # Propagation delay
        propagation_delay = (distance_km * 1000) / speed_of_light_fiber
        
        # Clock drift over time
        time_window_seconds = 1.0  # 1 second measurement window
        clock_drift_seconds = (clock_accuracy_ppm * 1e-6) * time_window_seconds
        
        # Timing jitter (random component)
        timing_jitter_rms = 100e-12  # 100 ps RMS
        
        # Calculate timing error probability
        total_timing_uncertainty = clock_drift_seconds + timing_jitter_rms
        bit_duration = 1e-9  # 1 ns bit duration (1 Gbps)
        
        timing_error_probability = min(0.1, total_timing_uncertainty / bit_duration)
        
        return {
            'propagation_delay_seconds': propagation_delay,
            'clock_accuracy_ppm': clock_accuracy_ppm,
            'clock_drift_seconds': clock_drift_seconds,
            'timing_jitter_rms_seconds': timing_jitter_rms,
            'total_timing_uncertainty': total_timing_uncertainty,
            'timing_error_probability': timing_error_probability
        }
    
    def create_realistic_channel_model(self, channel_type: str = 'fiber',
                                     distance_km: float = 50.0,
                                     **kwargs) -> Dict:
        """
        Create comprehensive realistic channel model
        
        Args:
            channel_type: 'fiber' or 'free_space'
            distance_km: Channel distance
            **kwargs: Additional channel-specific parameters
            
        Returns:
            Complete channel model
        """
        if channel_type == 'fiber':
            channel_params = self.simulate_fiber_optic_channel(distance_km, **kwargs)
        else:
            channel_params = self.simulate_free_space_channel(distance_km, **kwargs)
        
        # Add detector characteristics
        detector_params = self.simulate_detector_characteristics(
            kwargs.get('detector_type', 'superconducting')
        )
        
        # Add polarization drift
        polarization_params = self.simulate_polarization_drift(
            kwargs.get('time_hours', 1.0),
            kwargs.get('temperature_stability', 1.0)
        )
        
        # Add timing synchronization
        timing_params = self.simulate_timing_synchronization(
            kwargs.get('clock_accuracy_ppm', 1.0),
            distance_km
        )
        
        # Combine all effects to estimate total error rate
        transmission_loss_error = 1 - channel_params['transmission_efficiency']
        detector_error = 1 - detector_params['quantum_efficiency']
        polarization_error = polarization_params['polarization_error_probability']
        timing_error = timing_params['timing_error_probability']
        
        total_error_rate = min(0.5, 
            channel_params.get('estimated_error_rate', 0.01) +
            detector_error * 0.1 +
            polarization_error +
            timing_error
        )
        
        return {
            'channel_type': channel_type,
            'distance_km': distance_km,
            'channel_characteristics': channel_params,
            'detector_characteristics': detector_params,
            'polarization_drift': polarization_params,
            'timing_synchronization': timing_params,
            'total_error_rate': total_error_rate,
            'channel_capacity_estimate': 1 - total_error_rate  # Simplified estimate
        }
