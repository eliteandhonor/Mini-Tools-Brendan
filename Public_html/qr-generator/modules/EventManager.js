/**
 * Event Management Module
 * Handles all event listeners and user interactions
 */
export class EventManager {
    constructor(dependencies) {
        // Extract dependencies
        this.qrLibraryManager = dependencies.qrLibraryManager;
        this.dataValidator = dependencies.dataValidator;
        this.imageManager = dependencies.imageManager;
        this.uiManager = dependencies.uiManager;
        this.actionManager = dependencies.actionManager;
        this.themeManager = dependencies.themeManager;
        this.notificationManager = dependencies.notificationManager;
        this.app = dependencies.app;
        
        // Legacy compatibility
        this.qrGenerator = dependencies.app || dependencies.qrGenerator;
    }    /**
     * Setup all event listeners - called after DOM is ready
     */
    setupAllEventListeners() {
        this.setupTypeSelectors();
        this.setupGenerateButton();
        this.setupActionButtons();
        this.setupThemeToggle();
        this.setupFullscreenControls();
        this.setupInputValidation();
        this.setupKeyboardShortcuts();
        this.setupFileUploads();
        this.setupColorControls();
        this.setupOptionControls();
    }

    /**
     * Setup QR type selector buttons
     */
    setupTypeSelectors() {
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.closest('.type-btn').dataset.type;
                this.app.switchType(type);
            });
        });
    }/**    /**
     * Setup generate button
     */
    setupGenerateButton() {
        const generateBtn = document.getElementById('generate-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.app.generateQR();
            });
        }
    }

    /**
     * Setup action buttons (download, fullscreen, etc.)
     */
    setupActionButtons() {
        const actions = [
            { id: 'download-png', handler: () => this.actionManager.downloadQR('png') },
            { id: 'fullscreen-qr', handler: () => this.actionManager.showFullscreenQR() },
            { id: 'download-large', handler: () => this.actionManager.downloadLargeQR() },
            { id: 'copy-image', handler: () => this.actionManager.copyQRCode() },
            { id: 'print-qr', handler: () => this.actionManager.printQRCode() }
        ];        actions.forEach(({ id, handler }) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });
    }

    /**
     * Setup theme toggle
     */    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.themeManager.toggleTheme();
            });
        }
    }

    /**
     * Setup fullscreen modal controls
     */
    setupFullscreenControls() {
        const closeBtn = document.getElementById('close-fullscreen');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.actionManager.hideFullscreenQR());
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.actionManager.hideFullscreenQR();
            }
        });

        // Close on backdrop click
        const modal = document.getElementById('fullscreen-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.qrGenerator.hideFullscreenQR();
                }
            });
        }
    }

    /**
     * Setup input validation
     */
    setupInputValidation() {
        const inputs = [
            'text-input', 'url-input', 'email-to', 'phone-input', 
            'sms-number', 'wifi-ssid', 'wifi-password'
        ];

        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.qrGenerator.dataValidator.validateInput());
                element.addEventListener('blur', () => this.qrGenerator.dataValidator.validateInput());
            }
        });
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'Enter':
                        e.preventDefault();
                        this.app.generateQR();
                        break;                    case 's':
                        e.preventDefault();
                        this.actionManager.downloadQR();
                        break;
                    case 'f':
                        e.preventDefault();
                        this.actionManager.showFullscreenQR();
                        break;
                }
            }
        });
    }

    /**
     * Setup file upload functionality
     */
    setupFileUploads() {
        this.setupLogoUpload();
        this.setupBackgroundUpload();
    }

    /**
     * Setup logo upload functionality
     */
    setupLogoUpload() {
        const uploadArea = document.getElementById('upload-area');
        const logoUpload = document.getElementById('logo-upload');
        const removeLogo = document.getElementById('remove-logo');

        if (!uploadArea || !logoUpload) return;        // Click to upload
        uploadArea.addEventListener('click', () => logoUpload.click());
        
        // File input change
        logoUpload.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.imageManager.handleLogoUpload(e.target.files[0]);
            }
        });

        // Drag and drop
        this.setupDragAndDrop(uploadArea, (file) => {
            this.imageManager.handleLogoUpload(file);
        });

        // Remove logo
        if (removeLogo) {
            removeLogo.addEventListener('click', (e) => {
                e.stopPropagation();
                this.imageManager.removeLogo();
            });
        }
    }

    /**
     * Setup background upload functionality
     */
    setupBackgroundUpload() {
        const uploadArea = document.getElementById('background-upload-area');
        const backgroundUpload = document.getElementById('background-upload');
        const removeBackground = document.getElementById('remove-background');

        if (!uploadArea || !backgroundUpload) return;        // Click to upload
        uploadArea.addEventListener('click', () => backgroundUpload.click());
        
        // File input change
        backgroundUpload.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.imageManager.handleBackgroundUpload(e.target.files[0]);
            }
        });

        // Drag and drop
        this.setupDragAndDrop(uploadArea, (file) => {
            this.imageManager.handleBackgroundUpload(file);
        });

        // Remove background
        if (removeBackground) {
            removeBackground.addEventListener('click', (e) => {
                e.stopPropagation();
                this.imageManager.removeBackground();
            });
        }
    }

    /**
     * Setup drag and drop for file uploads
     */
    setupDragAndDrop(element, onDrop) {
        if (!element) return;

        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            element.classList.add('drag-over');
        });

        element.addEventListener('dragleave', (e) => {
            e.preventDefault();
            element.classList.remove('drag-over');
        });

        element.addEventListener('drop', (e) => {
            e.preventDefault();
            element.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                onDrop(files[0]);
            }
        });
    }

    /**
     * Setup color controls
     */
    setupColorControls() {
        // Color inputs
        const colorInputs = [
            { color: 'foreground-color', hex: 'foreground-hex' },
            { color: 'background-color', hex: 'background-hex' }
        ];

        colorInputs.forEach(({ color, hex }) => {
            const colorInput = document.getElementById(color);
            const hexInput = document.getElementById(hex);

            if (colorInput && hexInput) {                colorInput.addEventListener('input', (e) => {
                    hexInput.value = e.target.value;
                    this.app.regenerateQRDelayed();
                });                hexInput.addEventListener('input', (e) => {
                    if (this.isValidHexColor(e.target.value)) {
                        colorInput.value = e.target.value;
                        this.app.regenerateQRDelayed();
                    }
                });
            }
        });

        // Color presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const fg = btn.dataset.fg;
                const bg = btn.dataset.bg;
                
                if (fg && bg) {
                    this.qrGenerator.applyColorPreset(fg, bg);
                    
                    // Update active preset
                    document.querySelectorAll('.preset-btn').forEach(b => {
                        b.classList.remove('active');
                    });
                    btn.classList.add('active');
                }
            });
        });
    }

    /**
     * Setup option controls (size, error correction, etc.)
     */
    setupOptionControls() {
        const options = [
            'qr-size', 'error-correction', 'logo-size', 'logo-background', 
            'background-opacity', 'background-fit'
        ];

        options.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.qrGenerator.regenerateIfExists();
                });
            }
        });
    }

    /**
     * Hex color validation helper
     */
    isValidHexColor(hex) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    }
}
