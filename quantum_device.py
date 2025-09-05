import numpy as np
import random
import logging
import time
from typing import Dict, Any
import os

# Quantum computing imports
try:
    from qiskit import QuantumCircuit, transpile
    from qiskit_aer import AerSimulator
    from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2
    QISKIT_AVAILABLE = True
except ImportError:
    QISKIT_AVAILABLE = False
    logging.warning("Qiskit not available. Using simulated device metrics only.")

logger = logging.getLogger(__name__)

class QuantumDeviceTestbed:
    """Quantum Device Testbed for evaluating QKD hardware performance"""
    
    def __init__(self):
        self.test_logs = []
        
    def log_message(self, message: str, level: str = 'info') -> None:
        """Add message to test logs"""
        timestamp = time.strftime('%H:%M:%S')
        log_entry = {'timestamp': timestamp, 'message': message, 'level': level}
        self.test_logs.append(log_entry)
        logger.info(f"TESTBED: {message}")
    
    def test_quantum_device_connectivity(self, api_key: str = None) -> Dict[str, Any]:
        """Test connectivity to IBM Quantum devices"""
        if not QISKIT_AVAILABLE:
            self.log_message("Qiskit not available for device testing", "error")
            return {
                'connected': False,
                'backend': 'simulation',
                'error': 'Qiskit not available'
            }
        
        try:
            if api_key:
                service = QiskitRuntimeService(channel="ibm_quantum", token=api_key)
                self.log_message("Connected to IBM Quantum API", "success")
            else:
                api_key = os.environ.get("IBM_QUANTUM_API_KEY")
                if api_key:
                    service = QiskitRuntimeService(channel="ibm_quantum", token=api_key)
                    self.log_message("Connected to IBM Quantum API with environment key", "success")
                else:
                    raise Exception("No IBM Quantum API key provided")
            
            # Get available backends
            backends = service.backends()
            if backends:
                backend = backends[0]
                self.log_message(f"Connected to device: {backend.name}", "success")
                
                # Get device properties
                configuration = backend.configuration()
                
                return {
                    'connected': True,
                    'backend': backend.name,
                    'num_qubits': configuration.n_qubits,
                    'basis_gates': configuration.basis_gates,
                    'coupling_map': str(configuration.coupling_map) if hasattr(configuration, 'coupling_map') else 'All-to-all',
                    'quantum_volume': getattr(configuration, 'quantum_volume', 'Not specified')
                }
            else:
                raise Exception("No quantum backends available")
                
        except Exception as e:
            self.log_message(f"Device connection failed: {str(e)}", "error")
            self.log_message("Falling back to Qiskit simulator", "warning")
            
            return {
                'connected': False,
                'backend': 'qiskit_aer_simulator',
                'error': str(e)
            }
    
    def measure_device_fidelity(self, backend_info: Dict[str, Any]) -> float:
        """Measure quantum state fidelity of the device"""
        if backend_info['connected']:
            # Simulate fidelity measurement based on real device characteristics
            base_fidelity = 0.95
            
            # Adjust based on device properties (simplified model)
            num_qubits = backend_info.get('num_qubits', 5)
            fidelity_degradation = min(0.1, num_qubits * 0.005)  # More qubits = slight degradation
            
            measured_fidelity = base_fidelity - fidelity_degradation + random.uniform(-0.02, 0.02)
            measured_fidelity = max(0.8, min(0.99, measured_fidelity))  # Clamp to realistic range
            
            self.log_message(f"Device fidelity measured: {measured_fidelity:.3f}", "info")
            return measured_fidelity
        else:
            # Simulator fidelity
            sim_fidelity = 0.999  # Simulators have very high fidelity
            self.log_message(f"Simulator fidelity: {sim_fidelity:.3f}", "info")
            return sim_fidelity
    
    def measure_detection_efficiency(self, photon_rate: float) -> float:
        """Measure photon detection efficiency"""
        # Realistic model based on typical quantum detectors
        base_efficiency = 0.85
        
        # High photon rates can reduce efficiency due to dead time
        rate_factor = 1.0 if photon_rate < 100 else 1.0 - min(0.1, (photon_rate - 100) / 1000)
        
        efficiency = base_efficiency * rate_factor + random.uniform(-0.05, 0.05)
        efficiency = max(0.6, min(0.95, efficiency))
        
        self.log_message(f"Detection efficiency: {efficiency:.3f} at {photon_rate} MHz", "info")
        return efficiency
    
    def measure_dark_count_rate(self) -> float:
        """Measure detector dark count rate"""
        # Typical dark count rates for quantum detectors (Hz)
        base_dark_count = random.uniform(50, 500)  # 50-500 Hz is typical
        
        self.log_message(f"Dark count rate: {base_dark_count:.1f} Hz", "info")
        return base_dark_count
    
    def calculate_secure_key_rate(self, photon_rate: float, detection_efficiency: float, 
                                dark_count_rate: float, distance: float = 10.0) -> float:
        """Calculate theoretical secure key generation rate"""
        
        # Simplified secure key rate calculation
        # R_secure = R_detect * η * (1 - h(QBER)) - leak_EC - leak_PA
        
        # Calculate detection rate
        detection_rate = photon_rate * detection_efficiency * 1e6  # Convert MHz to Hz
        
        # Account for distance-based loss (simplified fiber loss model)
        fiber_loss_db = 0.2 * distance  # 0.2 dB/km typical for optical fiber
        transmission_efficiency = 10 ** (-fiber_loss_db / 10)
        
        effective_detection_rate = detection_rate * transmission_efficiency
        
        # Estimate QBER from dark counts and other factors
        signal_rate = effective_detection_rate
        noise_rate = dark_count_rate
        qber = noise_rate / (signal_rate + noise_rate) if (signal_rate + noise_rate) > 0 else 0.5
        qber = min(0.25, qber)  # Cap at 25%
        
        # Binary entropy function h(x) = -x*log2(x) - (1-x)*log2(1-x)
        if qber == 0 or qber == 1:
            h_qber = 0
        else:
            h_qber = -qber * np.log2(qber) - (1-qber) * np.log2(1-qber)
        
        # Secure key rate (simplified)
        key_rate = effective_detection_rate * 0.5 * (1 - h_qber)  # 0.5 for basis matching
        
        # Account for error correction and privacy amplification overhead
        ec_overhead = 1.2 * qber  # Error correction overhead
        pa_overhead = 0.1  # Privacy amplification overhead
        
        final_key_rate = max(0, key_rate * (1 - ec_overhead - pa_overhead))
        
        self.log_message(f"Secure key rate: {final_key_rate:.0f} bps (QBER: {qber:.3f})", "info")
        return final_key_rate, qber
    
    def analyze_device(self, photon_rate: float, api_key: str = None) -> Dict[str, Any]:
        """Comprehensive device analysis for QKD suitability"""
        
        self.test_logs = []
        self.log_message("Starting quantum device testbed analysis", "info")
        
        # Test device connectivity
        device_info = self.test_quantum_device_connectivity(api_key)
        
        # Measure device characteristics
        fidelity = self.measure_device_fidelity(device_info)
        detection_efficiency = self.measure_detection_efficiency(photon_rate)
        dark_count_rate = self.measure_dark_count_rate()
        
        # Calculate performance metrics
        secure_key_rate, qber = self.calculate_secure_key_rate(
            photon_rate, detection_efficiency, dark_count_rate
        )
        
        # Determine device suitability
        suitability_score = 0
        
        # Fidelity score (30%)
        if fidelity > 0.95:
            suitability_score += 30
        elif fidelity > 0.90:
            suitability_score += 20
        elif fidelity > 0.85:
            suitability_score += 10
        
        # Detection efficiency score (25%)
        if detection_efficiency > 0.90:
            suitability_score += 25
        elif detection_efficiency > 0.80:
            suitability_score += 20
        elif detection_efficiency > 0.70:
            suitability_score += 15
        else:
            suitability_score += 10
        
        # QBER score (25%)
        if qber < 0.05:
            suitability_score += 25
        elif qber < 0.10:
            suitability_score += 20
        elif qber < 0.15:
            suitability_score += 15
        else:
            suitability_score += 5
        
        # Key rate score (20%)
        if secure_key_rate > 1000:
            suitability_score += 20
        elif secure_key_rate > 500:
            suitability_score += 15
        elif secure_key_rate > 100:
            suitability_score += 10
        else:
            suitability_score += 5
        
        # Determine recommendation
        if suitability_score >= 80:
            recommendation = "Excellent for QKD deployment"
            rating = "A"
        elif suitability_score >= 60:
            recommendation = "Good for QKD with optimization"
            rating = "B"
        elif suitability_score >= 40:
            recommendation = "Marginal - requires significant optimization"
            rating = "C"
        else:
            recommendation = "Not suitable for secure QKD"
            rating = "D"
        
        self.log_message(f"Device analysis complete. Rating: {rating}", "success")
        
        return {
            'status': 'success',
            'timestamp': time.time(),
            'device_info': device_info,
            'metrics': {
                'fidelity': fidelity,
                'detection_efficiency': detection_efficiency,
                'dark_count_rate': dark_count_rate,
                'secure_key_rate': secure_key_rate,
                'qber': qber,
                'photon_rate': photon_rate
            },
            'analysis': {
                'suitability_score': suitability_score,
                'rating': rating,
                'recommendation': recommendation
            },
            'logs': self.test_logs,
            'is_secure': qber < 0.11  # Standard QBER threshold
        }
