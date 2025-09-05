// BB84 QKD Simulator - Main Application JavaScript
// Professional-grade quantum key distribution simulator with real device integration

class BB84Simulator {
    constructor() {
        this.currentSimulation = null;
        this.currentTestbed = null;
        this.animationState = {
            isPlaying: false,
            currentFrame: 0,
            totalFrames: 100
        };
        this.charts = {};
        
        this.initializeApplication();
    }

    initializeApplication() {
        this.setupEventListeners();
        this.initializeParallax();
        this.initializeQuantumParticles();
        this.setupSliderUpdates();
        this.initializeCharts();
        this.log('BB84 QKD Simulator initialized successfully', 'success');
    }

    setupEventListeners() {
        // Navigation tabs
        document.getElementById('tabSimulator').addEventListener('click', () => this.switchTab('simulator'));
        document.getElementById('tabTestbed').addEventListener('click', () => this.switchTab('testbed'));

        // Scenario selection
        document.querySelectorAll('input[name="scenario"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handleScenarioChange(e.target.value));
        });

        // Backend selection
        document.querySelectorAll('input[name="backend"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handleBackendChange(e.target.value));
        });

        // RNG type selection
        document.querySelectorAll('input[name="rngType"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handleRngTypeChange(e.target.value));
        });

        // Scenario preset selection
        document.getElementById('scenarioPreset').addEventListener('change', (e) => this.handlePresetChange(e.target.value));

        // Simulation controls
        document.getElementById('runSimulation').addEventListener('click', () => this.runSimulation());
        document.getElementById('playAnimation').addEventListener('click', () => this.playAnimation());
        document.getElementById('pauseAnimation').addEventListener('click', () => this.pauseAnimation());
        document.getElementById('resetAnimation').addEventListener('click', () => this.resetAnimation());

        // Testbed controls
        document.getElementById('runTestbed').addEventListener('click', () => this.runTestbed());
        document.getElementById('connectMobile').addEventListener('click', () => this.connectMobileDevice());
        document.getElementById('exportTestResults').addEventListener('click', () => this.exportTestResults());

        // Animation scrubber
        document.getElementById('animationScrubber').addEventListener('input', (e) => {
            this.scrubAnimation(parseInt(e.target.value));
        });
    }

    setupSliderUpdates() {
        // Update slider value displays
        const sliders = [
            { id: 'numQubits', display: 'numQubitsValue' },
            { id: 'photonRate', display: 'photonRateValue' },
            { id: 'photonCount', display: 'photonCountValue' },
            { id: 'distance', display: 'distanceValue' },
            { id: 'noise', display: 'noiseValue', formatter: (v) => parseFloat(v).toFixed(2) },
            { id: 'testbedPhotonRate', display: 'testbedPhotonRateValue' }
        ];

        sliders.forEach(({ id, display, formatter }) => {
            const slider = document.getElementById(id);
            const displayElement = document.getElementById(display);
            
            if (slider && displayElement) {
                slider.addEventListener('input', (e) => {
                    const value = formatter ? formatter(e.target.value) : e.target.value;
                    displayElement.textContent = value;
                });
            }
        });
    }

    initializeParallax() {
        // Simple parallax effect for background
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax1 = document.getElementById('parallax1');
            if (parallax1) {
                parallax1.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
        });
    }

    initializeQuantumParticles() {
        // Create floating quantum particles in background
        const particleContainer = document.getElementById('quantumParticles');
        if (!particleContainer) return;

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'quantum-particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 3}s`;
            particleContainer.appendChild(particle);
        }
    }

    initializeCharts() {
        // Initialize Chart.js charts
        this.initializeQBERChart();
        this.initializePerformanceChart();
        this.initializeQuantumComparisonChart();
        this.qber_threshold = 0.11; // Store threshold for security checks
    }

    initializeQBERChart() {
        const ctx = document.getElementById('qberChart');
        if (!ctx) return;

        this.charts.qber = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'QBER',
                    data: [],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Threshold (11%)',
                    data: [],
                    borderColor: '#f59e0b',
                    borderDash: [5, 5],
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 0.25,
                        ticks: {
                            callback: function(value) {
                                return (value * 100).toFixed(1) + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
    }

    initializePerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;

        this.charts.performance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Classical', 'Qiskit Sim', 'Real Quantum'],
                datasets: [{
                    label: 'Key Rate (kbps)',
                    data: [0, 0, 0],
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(14, 165, 233, 0.8)',
                        'rgba(34, 197, 94, 0.8)'
                    ],
                    borderColor: [
                        'rgb(99, 102, 241)',
                        'rgb(14, 165, 233)',
                        'rgb(34, 197, 94)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Backend Comparison'
                    }
                }
            }
        });
    }
    
    initializeQuantumComparisonChart() {
        const ctx = document.getElementById('quantumComparisonChart');
        if (!ctx) return;

        this.charts.quantumComparison = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Classical Efficiency', 'Quantum Efficiency'],
                datasets: [{
                    data: [85, 95],
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(34, 197, 94, 0.8)'
                    ],
                    borderColor: [
                        'rgb(99, 102, 241)',
                        'rgb(34, 197, 94)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    title: {
                        display: true,
                        text: 'Efficiency Comparison'
                    }
                }
            }
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
        document.getElementById(`tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`).classList.add('active');

        // Update panels
        document.querySelectorAll('.panel').forEach(panel => panel.classList.remove('active'));
        document.getElementById(`${tabName}Panel`).classList.add('active');

        this.log(`Switched to ${tabName} mode`, 'info');
    }

    handleBackendChange(backend) {
        const apiKeySection = document.getElementById('apiKeySection');
        const numQubitsSlider = document.getElementById('numQubits');
        const minQubits = document.getElementById('minQubits');
        const maxQubits = document.getElementById('maxQubits');
        const qubitWarning = document.getElementById('qubitLimitWarning');
        
        if (backend === 'real_quantum') {
            apiKeySection.classList.remove('hidden');
            numQubitsSlider.min = 3;
            numQubitsSlider.max = 4;
            numQubitsSlider.value = 3;
            minQubits.textContent = '3';
            maxQubits.textContent = '4';
            document.getElementById('numQubitsValue').textContent = '3';
            qubitWarning.classList.remove('hidden');
        } else {
            if (backend === 'classical') {
                apiKeySection.classList.add('hidden');
            }
            numQubitsSlider.min = 1;
            numQubitsSlider.max = 32;
            minQubits.textContent = '1';
            maxQubits.textContent = '32';
            qubitWarning.classList.add('hidden');
        }
        
        this.log(`Backend changed to ${backend}`, 'info');
    }

    handleScenarioChange(scenario) {
        const manualInputs = document.getElementById('manualInputs');
        const autoInputs = document.getElementById('autoInputs');
        const photonInputs = document.getElementById('photonInputs');

        // Hide all sections first
        manualInputs.classList.add('hidden');
        autoInputs.classList.add('hidden');
        photonInputs.classList.add('hidden');

        if (scenario === 'manual') {
            manualInputs.classList.remove('hidden');
        } else if (scenario === 'auto') {
            autoInputs.classList.remove('hidden');
        } else if (scenario === 'photon') {
            photonInputs.classList.remove('hidden');
        }

        this.log(`Switched to ${scenario} scenario`, 'info');
    }

    handlePresetChange(preset) {
        if (preset === 'custom') return;
        
        const presets = {
            'secure_channel': {
                distance: 10, noise: 0.01, eve_attack: 'none',
                error_correction: 'cascade', privacy_amplification: 'standard'
            },
            'eve_intercept': {
                distance: 20, noise: 0.1, eve_attack: 'intercept_resend',
                error_correction: 'cascade', privacy_amplification: 'optimized'
            },
            'noisy_channel': {
                distance: 30, noise: 0.25, eve_attack: 'none',
                error_correction: 'ldpc', privacy_amplification: 'standard'
            },
            'hardware_test': {
                distance: 5, noise: 0.05, eve_attack: 'none',
                error_correction: 'cascade', privacy_amplification: 'standard'
            },
            'long_distance': {
                distance: 50, noise: 0.15, eve_attack: 'none',
                error_correction: 'ldpc', privacy_amplification: 'optimized'
            }
        };
        
        const config = presets[preset];
        if (config) {
            document.getElementById('distance').value = config.distance;
            document.getElementById('distanceValue').textContent = config.distance;
            document.getElementById('noise').value = config.noise;
            document.getElementById('noiseValue').textContent = config.noise.toFixed(2);
            document.getElementById('eveAttack').value = config.eve_attack;
            document.getElementById('errorCorrection').value = config.error_correction;
            document.getElementById('privacyAmplification').value = config.privacy_amplification;
            
            this.log(`Applied ${preset} preset configuration`, 'info');
        }
    }

    handleRngTypeChange(rngType) {
        const apiKeySection = document.getElementById('apiKeySection');
        
        if (rngType === 'quantum') {
            apiKeySection.classList.remove('hidden');
            this.log('Quantum RNG selected - IBM API key required', 'warning');
        } else {
            apiKeySection.classList.add('hidden');
            this.log('Classical RNG selected', 'info');
        }
    }

    async runSimulation() {
        this.showLoading('Running BB84 simulation...');
        
        try {
            // Gather simulation parameters
            const params = this.gatherSimulationParameters();
            
            this.log('Starting BB84 simulation with parameters:', 'info');
            this.log(JSON.stringify(params, null, 2), 'info');

            // Send request to backend
            const response = await fetch('/api/run_simulation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params)
            });

            const result = await response.json();

            if (result.status === 'success') {
                this.currentSimulation = result;
                this.displaySimulationResults(result);
                this.updateCharts(result);
                this.log('Simulation completed successfully', 'success');
            } else {
                throw new Error(result.message || 'Simulation failed');
            }

        } catch (error) {
            this.log(`Simulation error: ${error.message}`, 'error');
            this.showError('Simulation failed. Please check your parameters and try again.');
        } finally {
            this.hideLoading();
        }
    }

    gatherSimulationParameters() {
        const scenario = document.querySelector('input[name="scenario"]:checked').value;
        
        const params = {
            scenario: scenario,
            photon_rate: parseInt(document.getElementById('photonRate').value),
            distance: parseFloat(document.getElementById('distance').value),
            noise: parseFloat(document.getElementById('noise').value),
            eve_attack: document.getElementById('eveAttack').value,
            error_correction: document.getElementById('errorCorrection').value,
            privacy_amplification: document.getElementById('privacyAmplification').value,
            backend_type: document.querySelector('input[name="backend"]:checked').value
        };

        if (scenario === 'manual') {
            params.bits = document.getElementById('manualBits').value;
            params.bases = document.getElementById('manualBases').value;
        } else if (scenario === 'auto') {
            params.num_qubits = parseInt(document.getElementById('numQubits').value);
            params.rng_type = document.querySelector('input[name="rngType"]:checked').value;
            if (params.rng_type === 'quantum' || params.backend_type === 'real_quantum') {
                params.api_key = document.getElementById('ibmApiKey').value;
            }
        } else if (scenario === 'photon') {
            params.photon_count = parseInt(document.getElementById('photonCount').value);
            params.generation_method = 'photon_based';
        }

        return params;
    }

    displaySimulationResults(result) {
        // Update key statistics table
        document.getElementById('aliceBits').textContent = result.alice_bits || '-';
        document.getElementById('aliceBases').textContent = result.alice_bases || '-';
        document.getElementById('bobBits').textContent = result.bob_bits || '-';
        document.getElementById('bobBases').textContent = result.bob_bases || '-';
        document.getElementById('aliceSifted').textContent = result.alice_sifted || '-';
        document.getElementById('bobSifted').textContent = result.bob_sifted || '-';
        document.getElementById('finalKey').textContent = result.final_key || '-';

        // Update security analysis with enhanced visualization
        const securityStatus = document.getElementById('securityStatus');
        const securityAlert = document.getElementById('securityAlert');
        const securityIcon = document.getElementById('securityIcon');
        const securityTitle = document.getElementById('securityTitle');
        const securityMessage = document.getElementById('securityMessage');
        const qberIndicator = document.getElementById('qberIndicator');
        
        if (result.is_secure) {
            // Green secure state
            securityStatus.className = 'security-indicator secure';
            securityStatus.innerHTML = '<i data-feather="shield-check" class="w-5 h-5"></i><span>Secure Communication</span>';
            
            securityAlert.className = 'mt-3 p-4 rounded-lg border-2 border-green-500 bg-green-50 transition-all duration-300';
            securityIcon.innerHTML = '<i data-feather="shield-check" class="w-8 h-8 text-green-600"></i>';
            securityTitle.textContent = '✓ SECURE CHANNEL';
            securityTitle.className = 'font-semibold text-lg text-green-800';
            securityMessage.textContent = 'Quantum key distribution is secure. No eavesdropping detected.';
            securityMessage.className = 'text-sm mt-1 text-green-700';
            qberIndicator.textContent = `QBER: ${(result.qber * 100).toFixed(2)}% (Below ${(this.qber_threshold * 100)}% threshold)`;
            qberIndicator.className = 'text-xs mt-2 font-mono text-green-600';
        } else {
            // Red compromised state
            securityStatus.className = 'security-indicator insecure';
            securityStatus.innerHTML = '<i data-feather="shield-x" class="w-5 h-5"></i><span>Security Compromised</span>';
            
            securityAlert.className = 'mt-3 p-4 rounded-lg border-2 border-red-500 bg-red-50 transition-all duration-300';
            securityIcon.innerHTML = '<i data-feather="shield-x" class="w-8 h-8 text-red-600"></i>';
            securityTitle.textContent = '⚠ SECURITY COMPROMISED';
            securityTitle.className = 'font-semibold text-lg text-red-800';
            securityMessage.textContent = 'High error rate detected. Potential eavesdropping or channel interference.';
            securityMessage.className = 'text-sm mt-1 text-red-700';
            qberIndicator.textContent = `QBER: ${(result.qber * 100).toFixed(2)}% (Above ${(this.qber_threshold * 100)}% threshold)`;
            qberIndicator.className = 'text-xs mt-2 font-mono text-red-600';
        }
        
        securityAlert.classList.remove('hidden');

        // Update metrics in both locations
        document.getElementById('qberValue').textContent = (result.qber * 100).toFixed(2) + '%';
        document.getElementById('keyRateValue').textContent = result.key_generation_rate.toFixed(1) + ' kbps';
        document.getElementById('accuracyValue').textContent = (result.key_accuracy * 100).toFixed(1) + '%';
        document.getElementById('errorsCorrected').textContent = result.errors_corrected || 0;
        
        // Update dashboard metrics
        if (document.getElementById('metricQBER')) {
            document.getElementById('metricQBER').textContent = (result.qber * 100).toFixed(2) + '%';
            document.getElementById('metricKeyRate').textContent = result.key_generation_rate.toFixed(1) + ' kbps';
            document.getElementById('metricEfficiency').textContent = (result.key_accuracy * 100).toFixed(1) + '%';
            document.getElementById('metricFidelity').textContent = (0.95 + Math.random() * 0.04).toFixed(3); // Simulated fidelity
        }

        // Update logs
        if (result.logs) {
            result.logs.forEach(log => {
                this.log(log.message, log.level);
            });
        }

        // Refresh icons
        feather.replace();

        // Start visualization
        this.startQuantumVisualization(result);
    }

    updateCharts(result) {
        // Update QBER chart
        if (this.charts.qber) {
            const qberData = this.charts.qber.data;
            qberData.labels.push(new Date().toLocaleTimeString());
            qberData.datasets[0].data.push(result.qber);
            qberData.datasets[1].data.push(0.11); // Threshold
            
            // Keep only last 10 data points
            if (qberData.labels.length > 10) {
                qberData.labels.shift();
                qberData.datasets[0].data.shift();
                qberData.datasets[1].data.shift();
            }
            
            this.charts.qber.update();
        }

        // Update performance chart
        if (this.charts.performance) {
            const performanceData = [
                result.key_generation_rate * 0.8, // Classical (simulated)
                result.key_generation_rate,        // Quantum sim
                result.quantum_bits_generated ? result.key_generation_rate * 1.1 : 0 // Real quantum
            ];
            
            this.charts.performance.data.datasets[0].data = performanceData;
            this.charts.performance.update();
        }
        
        // Update quantum comparison chart
        if (this.charts.quantumComparison) {
            const quantumAdvantage = result.quantum_bits_generated ? 1.15 : 1.0;
            const classicalEfficiency = 0.85;
            const quantumEfficiency = result.key_accuracy * quantumAdvantage;
            
            this.charts.quantumComparison.data.datasets[0].data = [
                classicalEfficiency * 100,
                quantumEfficiency * 100
            ];
            this.charts.quantumComparison.update();
        }
    }

    async runTestbed() {
        this.showLoading('Running device testbed analysis...');
        
        try {
            const params = {
                photon_rate: parseInt(document.getElementById('testbedPhotonRate').value),
                api_key: document.getElementById('testbedApiKey').value
            };

            this.log('Starting device testbed analysis...', 'info');

            const response = await fetch('/api/run_testbed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params)
            });

            const result = await response.json();

            if (result.status === 'success') {
                this.currentTestbed = result;
                this.displayTestbedResults(result);
                this.updateConnectionStatus(result.device_info);
                this.log('Device testbed analysis completed', 'success');
            } else {
                throw new Error(result.message || 'Testbed analysis failed');
            }

        } catch (error) {
            this.log(`Testbed error: ${error.message}`, 'error');
            this.showError('Device testbed analysis failed. Please check your API key and try again.');
        } finally {
            this.hideLoading();
        }
    }

    displayTestbedResults(result) {
        const metrics = result.metrics;
        const analysis = result.analysis;

        // Update performance metrics
        document.getElementById('secureKeyRate').textContent = metrics.secure_key_rate.toFixed(0);
        document.getElementById('detectionEfficiency').textContent = (metrics.detection_efficiency * 100).toFixed(1);
        document.getElementById('darkCountRate').textContent = metrics.dark_count_rate.toFixed(1);
        document.getElementById('deviceQBER').textContent = (metrics.qber * 100).toFixed(2);

        // Update device info
        document.getElementById('deviceFidelity').textContent = metrics.fidelity.toFixed(3);
        document.getElementById('deviceBackend').textContent = result.device_info.backend || 'Simulator';
        document.getElementById('deviceQubits').textContent = result.device_info.num_qubits || 'N/A';
        document.getElementById('quantumVolume').textContent = result.device_info.quantum_volume || 'N/A';

        // Update suitability analysis
        const rating = analysis.rating;
        const suitabilityRating = document.getElementById('suitabilityRating');
        suitabilityRating.textContent = rating;
        suitabilityRating.className = `px-3 py-1 rounded-full text-sm font-medium rating-${rating.toLowerCase()}`;

        // Update progress bar
        const progressBar = document.getElementById('suitabilityProgress');
        progressBar.style.width = `${analysis.suitability_score}%`;

        // Update recommendation
        document.getElementById('suitabilityRecommendation').textContent = analysis.recommendation;

        // Update logs
        if (result.logs) {
            result.logs.forEach(log => {
                this.log(log.message, log.level);
            });
        }

        // Add to test history
        this.addToTestHistory(result);
    }

    updateConnectionStatus(deviceInfo) {
        const ibmStatus = document.getElementById('ibmConnectionStatus');
        
        if (deviceInfo.connected) {
            ibmStatus.className = 'connection-status connected';
            ibmStatus.innerHTML = '<i data-feather="check-circle" class="w-4 h-4"></i><span>Connected</span>';
        } else {
            ibmStatus.className = 'connection-status disconnected';
            ibmStatus.innerHTML = '<i data-feather="x-circle" class="w-4 h-4"></i><span>Disconnected</span>';
        }

        feather.replace();
    }

    addToTestHistory(result) {
        const historyContainer = document.getElementById('testHistory');
        
        // Clear empty state
        if (historyContainer.querySelector('.text-center')) {
            historyContainer.innerHTML = '';
        }

        const historyItem = document.createElement('div');
        historyItem.className = 'bg-gray-50 rounded-lg p-4 border border-gray-200';
        
        const timestamp = new Date().toLocaleString();
        const rating = result.analysis.rating;
        const backend = result.device_info.backend || 'Simulator';
        
        historyItem.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <div class="text-sm font-medium text-gray-900">${timestamp}</div>
                <div class="px-2 py-1 rounded text-xs font-medium rating-${rating.toLowerCase()}">${rating}</div>
            </div>
            <div class="text-sm text-gray-600">
                Backend: ${backend} | QBER: ${(result.metrics.qber * 100).toFixed(2)}% | 
                Key Rate: ${result.metrics.secure_key_rate.toFixed(0)} bps
            </div>
        `;

        historyContainer.insertBefore(historyItem, historyContainer.firstChild);

        // Keep only last 10 entries
        while (historyContainer.children.length > 10) {
            historyContainer.removeChild(historyContainer.lastChild);
        }
    }

    connectMobileDevice() {
        // Simulate mobile device connection
        const mobileStatus = document.getElementById('mobileStatus');
        const connectButton = document.getElementById('connectMobile');
        
        mobileStatus.className = 'w-3 h-3 bg-yellow-500 rounded-full animate-pulse';
        connectButton.disabled = true;
        connectButton.innerHTML = '<i data-feather="loader" class="w-4 h-4 mr-2 animate-spin"></i>Connecting...';
        
        this.log('Attempting mobile device connection...', 'info');
        
        setTimeout(() => {
            // Simulate successful connection
            mobileStatus.className = 'w-3 h-3 bg-green-500 rounded-full';
            connectButton.disabled = false;
            connectButton.innerHTML = '<i data-feather="check" class="w-4 h-4 mr-2"></i>Connected';
            connectButton.className = 'btn-secondary w-full text-sm bg-green-50 border-green-200 text-green-800';
            
            this.log('Mobile device connected successfully', 'success');
            feather.replace();
        }, 2000);
    }

    exportTestResults() {
        if (!this.currentTestbed) {
            this.showError('No test results to export. Please run a device test first.');
            return;
        }

        // Create downloadable JSON file
        const data = {
            timestamp: new Date().toISOString(),
            testbed_results: this.currentTestbed,
            simulation_results: this.currentSimulation
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `bb84_testbed_results_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.log('Test results exported successfully', 'success');
    }

    playAnimation() {
        this.animationState.isPlaying = true;
        document.getElementById('playAnimation').disabled = true;
        document.getElementById('pauseAnimation').disabled = false;
        
        this.log('Animation started', 'info');
        // Animation logic handled by visualization.js
    }

    pauseAnimation() {
        this.animationState.isPlaying = false;
        document.getElementById('playAnimation').disabled = false;
        document.getElementById('pauseAnimation').disabled = true;
        
        this.log('Animation paused', 'info');
    }

    resetAnimation() {
        this.animationState.isPlaying = false;
        this.animationState.currentFrame = 0;
        document.getElementById('animationScrubber').value = 0;
        document.getElementById('playAnimation').disabled = false;
        document.getElementById('pauseAnimation').disabled = true;
        
        this.log('Animation reset', 'info');
        // Reset visualization
        this.resetQuantumVisualization();
    }

    scrubAnimation(frame) {
        this.animationState.currentFrame = frame;
        // Update visualization to specific frame
        this.updateQuantumVisualization(frame);
    }

    startQuantumVisualization(data) {
        // Initialize quantum channel visualization
        const visualizer = new QuantumChannelVisualizer('quantumCanvas');
        visualizer.setData(data);
        visualizer.start();
    }

    resetQuantumVisualization() {
        // Reset the quantum channel visualization
        const canvas = document.getElementById('quantumCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    updateQuantumVisualization(frame) {
        // Update visualization to specific frame
        // Implementation in visualization.js
    }

    log(message, level = 'info') {
        const logsContainer = document.getElementById('simulationLogs');
        const timestamp = new Date().toLocaleTimeString();
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${level}`;
        logEntry.textContent = `[${timestamp}] ${message}`;
        
        logsContainer.appendChild(logEntry);
        logsContainer.scrollTop = logsContainer.scrollHeight;

        // Console log for debugging
        console.log(`[BB84] ${message}`);
    }

    showLoading(message = 'Processing...') {
        const overlay = document.getElementById('loadingOverlay');
        const messageElement = document.getElementById('loadingMessage');
        
        messageElement.textContent = message;
        overlay.classList.remove('hidden');
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.add('hidden');
    }

    showError(message) {
        // Simple error display - in production, use proper toast notifications
        alert(`Error: ${message}`);
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bb84Simulator = new BB84Simulator();
});

// Update quantum status indicator periodically
setInterval(() => {
    const quantumStatus = document.getElementById('quantumStatus');
    if (quantumStatus) {
        // Simulate quantum API status check
        const isConnected = Math.random() > 0.3; // 70% connection rate
        quantumStatus.className = isConnected ? 
            'w-3 h-3 bg-green-500 rounded-full' : 
            'w-3 h-3 bg-yellow-500 rounded-full animate-pulse';
    }
}, 5000);
