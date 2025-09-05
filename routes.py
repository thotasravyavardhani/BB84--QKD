import logging
import json
from flask import render_template, request, jsonify
from app import app
from bb84_simulator import BB84Simulator
from quantum_device import QuantumDeviceTestbed
from firebase_config import save_testbed_result, get_testbed_results

logger = logging.getLogger(__name__)

@app.route('/')
def index():
    """Main application route"""
    return render_template('index.html')

@app.route('/api/run_simulation', methods=['POST'])
def run_simulation():
    """Run BB84 simulation with given parameters"""
    try:
        data = request.get_json()
        logger.info(f"Received simulation request: {data}")
        
        # Extract parameters
        scenario = data.get('scenario', 'manual')
        bits = data.get('bits', '0110')
        bases = data.get('bases', '+x+x')
        num_qubits = data.get('num_qubits', 4)
        rng_type = data.get('rng_type', 'classical')
        photon_rate = data.get('photon_rate', 100)
        photon_count = data.get('photon_count', 50)
        generation_method = data.get('generation_method', 'standard')
        distance = data.get('distance', 10)
        noise = data.get('noise', 0.1)
        eve_attack = data.get('eve_attack', 'none')
        error_correction = data.get('error_correction', 'cascade')
        privacy_amplification = data.get('privacy_amplification', 'standard')
        backend_type = data.get('backend_type', 'classical')
        api_key = data.get('api_key', None)
        
        # Initialize simulator
        simulator = BB84Simulator()
        
        # Run simulation based on scenario
        if scenario == 'manual':
            result = simulator.run_manual_simulation(
                bits, bases, photon_rate, distance, noise, 
                eve_attack, error_correction, privacy_amplification, backend_type
            )
        elif scenario == 'auto':
            result = simulator.run_auto_simulation(
                num_qubits, rng_type, photon_rate, distance, noise,
                eve_attack, error_correction, privacy_amplification, backend_type, api_key
            )
        elif scenario == 'photon':
            result = simulator.run_auto_simulation(
                num_qubits, 'classical', photon_rate, distance, noise,
                eve_attack, error_correction, privacy_amplification, backend_type, api_key,
                generation_method=generation_method, photon_count=photon_count
            )
        else:
            # Default to auto for backward compatibility
            result = simulator.run_auto_simulation(
                num_qubits, rng_type, photon_rate, distance, noise,
                eve_attack, error_correction, privacy_amplification, backend_type, api_key
            )
        
        logger.info("Simulation completed successfully")
        return jsonify(result)

    except ValueError as e:
        logger.error(f"Validation error: {str(e)}", exc_info=True)
        return jsonify({
            'error': str(e),
            'status': 'error',
            'message': str(e)
        }), 400  # Return a 400 Bad Request status code
     
    except Exception as e:
        logger.error(f"Simulation error: {str(e)}", exc_info=True)
        return jsonify({
            'error': str(e),
            'status': 'error',
            'message': 'Simulation failed. Please check your parameters and try again.'
        }), 500

@app.route('/api/run_testbed', methods=['POST'])
def run_testbed():
    """Run quantum device testbed analysis"""
    try:
        data = request.get_json()
        logger.info(f"Received testbed request: {data}")
        
        photon_rate = data.get('photon_rate', 150)
        api_key = data.get('api_key', None)
        
        # Initialize testbed
        testbed = QuantumDeviceTestbed()
        
        # Run testbed analysis
        result = testbed.analyze_device(photon_rate, api_key)
        
        # Save result to Firebase
        try:
            save_testbed_result(result)
            logger.info("Testbed result saved to Firebase")
        except Exception as e:
            logger.warning(f"Failed to save to Firebase: {str(e)}")
        
        logger.info("Testbed analysis completed successfully")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Testbed error: {str(e)}", exc_info=True)
        return jsonify({
            'error': str(e),
            'status': 'error',
            'message': 'Testbed analysis failed. Please check your API key and try again.'
        }), 500

@app.route('/api/testbed_history', methods=['GET'])
def get_testbed_history():
    """Get testbed experiment history"""
    try:
        results = get_testbed_results()
        return jsonify({'status': 'success', 'results': results})
    except Exception as e:
        logger.error(f"Failed to retrieve testbed history: {str(e)}")
        return jsonify({
            'error': str(e),
            'status': 'error',
            'message': 'Failed to retrieve experiment history'
        }), 500

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'BB84 QKD Simulator is running',
        'version': '1.0.0'
    })
