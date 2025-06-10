// QR Generator - Main Coordinator Script
// Imports and orchestrates all modular components

import { QRLibraryManager } from './modules/QRLibraryManager.js';
import { EventManager } from './modules/EventManager.js';
import { DataValidator } from './modules/DataValidator.js';
import ImageManager from './modules/ImageManager.js';
import { UIManager } from './modules/UIManager.js';
import { ActionManager } from './modules/ActionManager.js';
import { ThemeManager } from './modules/ThemeManager.js';
import { NotificationManager } from './modules/NotificationManager.js';

/**
 * Main QR Generator Application Coordinator
 * Orchestrates all modules and manages the application lifecycle
 */
class QRGeneratorApp {
    constructor() {
        this.currentType = 'text';
        this.qrCanvas = null;
        this.logoImage = null;
        this.backgroundImage = null;
        this.regenerateTimeout = null;
        this.isGenerating = false;
        
        // Initialize modules
        this.initializeModules();
        this.init();
    }

    /**
     * Initialize all modules and set up module dependencies
     */
    initializeModules() {
        console.log('🚀 Initializing QR Generator modules...');
        
        try {
            // Initialize core modules            this.notificationManager = new NotificationManager();
            this.themeManager = new ThemeManager();
            this.dataValidator = new DataValidator();
            this.qrLibraryManager = new QRLibraryManager();
            this.imageManager = new ImageManager(this);
            this.uiManager = new UIManager(this);
            this.actionManager = new ActionManager(this);
            
            // Initialize event manager with all dependencies
            this.eventManager = new EventManager({
                qrLibraryManager: this.qrLibraryManager,
                dataValidator: this.dataValidator,
                imageManager: this.imageManager,
                uiManager: this.uiManager,
                actionManager: this.actionManager,
                themeManager: this.themeManager,
                notificationManager: this.notificationManager,
                app: this
            });

            console.log('✅ All modules initialized successfully');
            this.notificationManager.showSuccess('QR Generator loaded successfully');
            
        } catch (error) {
            console.error('❌ Error initializing modules:', error);
            if (this.notificationManager) {
                this.notificationManager.showError('Failed to initialize application modules');
            }
        }
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('🎯 Starting QR Generator initialization...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // Initialize core functionality
            await this.setupApplication();
            
            console.log('✅ QR Generator initialization complete');
            
        } catch (error) {
            console.error('❌ Initialization error:', error);
            this.notificationManager.showError('Failed to initialize QR Generator');
        }
    }

    /**
     * Set up core application functionality
     */    async setupApplication() {
        // Validate QR libraries
        this.validateLibraries();
        
        // Set up event listeners
        this.eventManager.setupAllEventListeners();
          // Initialize UI state
        this.uiManager.showPlaceholder(true);
        
        // Load saved theme
        this.themeManager.loadTheme();
        
        // Set up keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Initialize design features
        this.setupDesignFeatures();
        
        // Generate initial QR code
        this.generateInitialQR();
    }    /**
     * Validate that QR libraries are available
     */
    validateLibraries() {
        const isValid = this.qrLibraryManager.validateLibraries();
        
        if (!isValid) {
            this.notificationManager.showError('QR Code libraries are not available. Please refresh the page.');
            console.error('❌ No QR Code library available');
            return false;
        }
        
        console.log('✅ QR libraries validated successfully');
        return true;
    }

    /**
     * Set up keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + G - Generate QR code
            if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
                e.preventDefault();
                this.generateQR();
            }
            
            // Ctrl/Cmd + D - Download QR code
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.actionManager.downloadQR();
            }
            
            // Ctrl/Cmd + S - Save QR code
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.actionManager.downloadQR();
            }
            
            // Escape - Clear inputs
            if (e.key === 'Escape') {
                this.clearInputs();
            }
        });
        
        console.log('⌨️ Keyboard shortcuts enabled');
    }

    /**
     * Set up design features and advanced options
     */
    setupDesignFeatures() {
        // Set up color pickers
        const colorInputs = document.querySelectorAll('input[type="color"]');
        colorInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.regenerateQRDelayed();
            });
        });

        // Set up range sliders with live preview
        const rangeInputs = document.querySelectorAll('input[type="range"]');
        rangeInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                // Update display value
                const valueDisplay = input.parentElement.querySelector('.value-display');
                if (valueDisplay) {
                    valueDisplay.textContent = e.target.value;
                }
                
                // Regenerate QR code
                this.regenerateQRDelayed();
            });
        });

        console.log('🎨 Design features initialized');
    }

    /**
     * Generate initial QR code on page load
     */
    generateInitialQR() {
        // Set default text
        const textInput = document.getElementById('text-input');
        if (textInput && !textInput.value.trim()) {
            textInput.value = 'Hello, World!';
        }
        
        // Generate QR code
        setTimeout(() => {
            this.generateQR();
        }, 100);
    }

    /**
     * Generate QR code with current settings
     */
    async generateQR() {
        if (this.isGenerating) {
            console.log('⏳ QR generation already in progress...');
            return;
        }

        try {
            this.isGenerating = true;
            this.uiManager.setButtonLoading('generate-btn', true);
            
            // Get and validate data
            const qrData = this.dataValidator.getValidatedData(this.currentType);
            if (!qrData) {
                this.notificationManager.showError('Please enter valid data for the QR code');
                return;
            }

            // Get design options
            const designOptions = this.getDesignOptions();            // Generate QR code
            await this.qrLibraryManager.generateQRCode(
                document.getElementById('qr-canvas'),
                qrData,
                designOptions
            );
            
            // If we get here, generation was successful
            this.uiManager.showQRResult();
            this.notificationManager.showSuccess('QR code generated successfully!');
            
        } catch (error) {
            console.error('❌ Error generating QR code:', error);
            this.notificationManager.showError('An error occurred while generating the QR code');        } finally {
            this.isGenerating = false;
            this.uiManager.setButtonLoading('generate-btn', false);
        }
    }

    /**
     * Regenerate QR code with delay (for real-time updates)
     */
    regenerateQRDelayed() {
        if (this.regenerateTimeout) {
            clearTimeout(this.regenerateTimeout);
        }
        
        this.regenerateTimeout = setTimeout(() => {
            this.generateQR();
        }, 300);
    }    /**
     * Get current design options from UI
     */
    getDesignOptions() {
        const size = parseInt(document.getElementById('qr-size')?.value || '300');
        return {
            width: size,
            height: size,
            errorCorrectionLevel: document.getElementById('error-correction')?.value || 'M',
            color: {
                dark: document.getElementById('foreground-color')?.value || '#000000',
                light: document.getElementById('background-color')?.value || '#ffffff'
            },
            logoImage: this.imageManager.logoImage,
            backgroundImage: this.imageManager.backgroundImage
        };
    }

    /**
     * Switch QR code type
     */
    switchType(newType) {
        if (this.currentType === newType) return;
          console.log(`🔄 Switching QR type from ${this.currentType} to ${newType}`);
        
        this.currentType = newType;
        this.dataValidator.setCurrentType(newType);
        this.uiManager.switchType(newType);
        
        // Regenerate QR code with new type
        setTimeout(() => {
            this.generateQR();
        }, 100);
    }

    /**
     * Regenerate QR code if one already exists
     */
    regenerateIfExists() {
        const qrResult = document.getElementById('qr-result');
        if (qrResult && qrResult.style.display !== 'none') {
            this.regenerateQRDelayed();
        }
    }

    /**
     * Clear all inputs
     */
    clearInputs() {
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="url"], textarea');
        inputs.forEach(input => {
            input.value = '';
        });
        
        // Clear images
        this.logoImage = null;
        this.backgroundImage = null;
        this.imageManager.clearImages();
        
        // Regenerate QR code
        this.generateQR();
        
        this.notificationManager.showInfo('Inputs cleared');
    }

    /**
     * Get current QR canvas for actions
     */
    getCurrentQRCanvas() {
        return this.qrCanvas;
    }

    /**
     * Set current QR canvas
     */
    setCurrentQRCanvas(canvas) {
        this.qrCanvas = canvas;
    }

    /**
     * Set logo image
     */
    setLogoImage(image) {
        this.logoImage = image;
        this.regenerateQRDelayed();
    }

    /**
     * Set background image
     */
    setBackgroundImage(image) {
        this.backgroundImage = image;
        this.regenerateQRDelayed();
    }
}

// Initialize the application when DOM is ready
let qrApp = null;

function initializeApp() {
    if (qrApp) {
        console.log('⚠️ App already initialized');
        return;
    }
      try {
        qrApp = new QRGeneratorApp();
        
        // Make app globally accessible for debugging and testing
        window.qrApp = qrApp;
        window.qrGenerator = qrApp; // Legacy compatibility
        
        console.log('🎉 QR Generator App initialized successfully');
        
    } catch (error) {
        console.error('❌ Failed to initialize QR Generator App:', error);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Export for potential external use
export { QRGeneratorApp };
