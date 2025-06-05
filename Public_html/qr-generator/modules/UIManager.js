/**
 * UI Manager Module
 * Handles UI updates, type switching, and display management
 */
export class UIManager {
    constructor(qrGenerator) {
        this.qrGenerator = qrGenerator;
    }

    /**
     * Switch QR type and update UI
     */
    switchType(type) {
        this.qrGenerator.currentType = type;
        
        // Update active button
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-type="${type}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Show corresponding form
        document.querySelectorAll('.input-form').forEach(form => {
            form.classList.remove('active');
        });
        
        const targetForm = document.getElementById(`${type}-form`);
        if (targetForm) {
            targetForm.classList.add('active');
            
            // Focus first input
            const firstInput = targetForm.querySelector('input, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
        
        this.qrGenerator.dataValidator.validateInput();
    }

    /**
     * Show QR result UI
     */
    showQRResult() {
        const placeholder = document.getElementById('qr-placeholder');
        const result = document.getElementById('qr-result');
        const downloadBtn = document.getElementById('download-btn');
        const infoText = document.getElementById('qr-info-text');
        const canvas = document.getElementById('qr-canvas');

        if (placeholder) placeholder.style.display = 'none';
        if (result) result.style.display = 'block';
        if (downloadBtn) downloadBtn.disabled = false;
        
        if (infoText) {
            infoText.textContent = `QR Code generated successfully (${this.qrGenerator.currentType.toUpperCase()})`;
        }

        // Add success animation
        if (canvas) {
            canvas.style.animation = 'fadeInScale 0.5s ease-out';
            setTimeout(() => {
                canvas.style.animation = '';
            }, 500);
        }
    }

    /**
     * Show fullscreen QR
     */
    showFullscreenQR() {
        const canvas = document.getElementById('qr-canvas');
        if (!canvas) {
            this.qrGenerator.notificationManager.showError('No QR code to display. Please generate a QR code first.');
            return;
        }

        const modal = document.getElementById('fullscreen-modal');
        const fullscreenCanvas = document.getElementById('fullscreen-qr-canvas');
        const title = document.getElementById('fullscreen-title');
        const description = document.getElementById('fullscreen-description');

        if (!modal || !fullscreenCanvas) {
            this.qrGenerator.notificationManager.showError('Full-screen display is not available.');
            return;
        }

        try {
            const ctx = fullscreenCanvas.getContext('2d');
            const originalSize = canvas.width;
            const maxSize = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.6, 600);
            
            fullscreenCanvas.width = maxSize;
            fullscreenCanvas.height = maxSize;
            
            ctx.clearRect(0, 0, fullscreenCanvas.width, fullscreenCanvas.height);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(canvas, 0, 0, originalSize, originalSize, 0, 0, maxSize, maxSize);

            if (title) title.textContent = `${this.qrGenerator.currentType.toUpperCase()} QR Code`;
            if (description) description.textContent = 'Scan with your device camera to access the content';

            modal.classList.add('show');
            document.body.style.overflow = 'hidden';

            const closeBtn = document.getElementById('close-fullscreen');
            if (closeBtn) closeBtn.focus();
            
        } catch (error) {
            console.error('Fullscreen error:', error);
            this.qrGenerator.notificationManager.showError('Failed to display QR code in fullscreen');
        }
    }

    /**
     * Hide fullscreen QR
     */
    hideFullscreenQR() {
        const modal = document.getElementById('fullscreen-modal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
            
            const fullscreenBtn = document.getElementById('fullscreen-qr');
            if (fullscreenBtn) {
                fullscreenBtn.focus();
            }
        }
    }

    /**
     * Apply color preset
     */
    applyColorPreset(fg, bg) {
        const elements = [
            { id: 'foreground-color', value: fg },
            { id: 'foreground-hex', value: fg },
            { id: 'background-color', value: bg },
            { id: 'background-hex', value: bg }
        ];

        elements.forEach(({ id, value }) => {
            const element = document.getElementById(id);
            if (element) element.value = value;
        });

        this.qrGenerator.regenerateIfExists();
    }

    /**
     * Update button loading state
     */
    setButtonLoading(buttonId, loading) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        if (loading) {
            button.disabled = true;
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        } else {
            button.disabled = false;
            button.innerHTML = button.dataset.originalText || 'Generate QR Code';
        }
    }

    /**
     * Show/hide placeholder
     */
    showPlaceholder(show = true) {
        const placeholder = document.getElementById('qr-placeholder');
        const result = document.getElementById('qr-result');
        
        if (placeholder) {
            placeholder.style.display = show ? 'flex' : 'none';
        }
        
        if (result) {
            result.style.display = show ? 'none' : 'block';
        }
    }

    /**
     * Update generate button state based on input validation
     */
    updateGenerateButton() {
        const generateBtn = document.getElementById('generate-btn');
        const isValid = this.qrGenerator.dataValidator.validateInput();
        
        if (generateBtn) {
            generateBtn.disabled = !isValid;
            generateBtn.classList.toggle('disabled', !isValid);
        }
    }

    /**
     * Reset UI to initial state
     */
    reset() {
        this.showPlaceholder(true);
        this.setButtonLoading('generate-btn', false);
        
        // Reset file uploads
        this.qrGenerator.imageManager.removeLogo();
        this.qrGenerator.imageManager.removeBackground();
        
        // Reset color inputs to defaults
        this.applyColorPreset('#000000', '#ffffff');
    }
}
