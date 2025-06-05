// QR Code Generator - Refactored Version
// Enhanced with better structure, error handling, and maintainability

class QRGenerator {
    constructor() {
        this.currentType = 'text';
        this.qrCanvas = null;
        this.logoImage = null;
        this.backgroundImage = null;
        this.regenerateTimeout = null;
        this.isGenerating = false;
        
        this.init();
    }

    // Initialize the application
    init() {
        this.setupEventListeners();
        this.setupDesignFeatures();
        this.loadTheme();
        this.setupKeyboardShortcuts();
        this.validateLibraries();
    }    // Validate that QR libraries are available
    validateLibraries() {
        const hasMainLibrary = typeof QRCode !== 'undefined' && QRCode.CorrectLevel;
        const hasFallback = typeof SimpleQRCode !== 'undefined';
        
        console.log('=== QR Library Validation ===');
        console.log('QRCode available:', typeof QRCode !== 'undefined');
        console.log('QRCode.CorrectLevel available:', typeof QRCode !== 'undefined' && !!QRCode.CorrectLevel);
        console.log('SimpleQRCode available:', typeof SimpleQRCode !== 'undefined');
        console.log('Has main library:', hasMainLibrary);
        console.log('Has fallback:', hasFallback);
        
        if (!hasMainLibrary && !hasFallback) {
            this.showError('QR Code libraries are not available. Please refresh the page.');
            console.error('❌ No QR Code library available');
        } else {
            console.log('✅ QR libraries available:', { main: hasMainLibrary, fallback: hasFallback });
            
            // Show success message in UI
            const placeholder = document.getElementById('qr-placeholder');
            if (placeholder && hasMainLibrary) {
                const libraryInfo = document.createElement('div');
                libraryInfo.style.fontSize = '12px';
                libraryInfo.style.color = '#666';
                libraryInfo.style.marginTop = '10px';
                libraryInfo.innerHTML = `<i class="fas fa-check-circle" style="color: green;"></i> QR libraries loaded successfully`;
                placeholder.appendChild(libraryInfo);
            }
        }
    }

    // Setup all event listeners
    setupEventListeners() {
        this.setupTypeSelectors();
        this.setupGenerateButton();
        this.setupActionButtons();
        this.setupThemeToggle();
        this.setupFullscreenControls();
        this.setupInputValidation();
    }

    // Setup QR type selector buttons
    setupTypeSelectors() {
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.closest('.type-btn').dataset.type;
                this.switchType(type);
            });
        });
    }

    // Setup generate button
    setupGenerateButton() {
        const generateBtn = document.getElementById('generate-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateQRCode());
        }
    }

    // Setup action buttons (download, fullscreen, etc.)
    setupActionButtons() {
        const actions = [
            { id: 'download-png', handler: () => this.downloadQRCode('png') },
            { id: 'fullscreen-qr', handler: () => this.showFullscreenQR() },
            { id: 'download-large', handler: () => this.downloadLargeQR() },
            { id: 'copy-image', handler: () => this.copyQRCode() },
            { id: 'print-qr', handler: () => this.printQRCode() }
        ];

        actions.forEach(({ id, handler }) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });
    }

    // Setup theme toggle
    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    // Setup fullscreen modal controls
    setupFullscreenControls() {
        const closeBtn = document.getElementById('close-fullscreen');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideFullscreenQR());
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideFullscreenQR();
            }
        });

        // Close on backdrop click
        const modal = document.getElementById('fullscreen-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideFullscreenQR();
                }
            });
        }
    }

    // Setup input validation
    setupInputValidation() {
        const inputs = [
            'text-input', 'url-input', 'email-to', 'phone-input', 
            'sms-number', 'wifi-ssid', 'wifi-password'
        ];

        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.validateInput());
                element.addEventListener('blur', () => this.validateInput());
            }
        });
    }

    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'Enter':
                        e.preventDefault();
                        this.generateQRCode();
                        break;
                    case 's':
                        e.preventDefault();
                        this.downloadQRCode();
                        break;
                    case 'f':
                        e.preventDefault();
                        this.showFullscreenQR();
                        break;
                }
            }
        });
    }

    // Switch QR type
    switchType(type) {
        this.currentType = type;
        
        // Update active button
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-type="${type}"]`).classList.add('active');
        
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
                firstInput.focus();
            }
        }
        
        this.validateInput();
    }

    // Validate current input
    validateInput() {
        const generateBtn = document.getElementById('generate-btn');
        if (!generateBtn) return;

        let isValid = false;
        
        try {
            switch (this.currentType) {
                case 'text':
                    isValid = this.validateText();
                    break;
                case 'url':
                    isValid = this.validateURL();
                    break;
                case 'email':
                    isValid = this.validateEmail();
                    break;
                case 'phone':
                    isValid = this.validatePhone();
                    break;
                case 'sms':
                    isValid = this.validateSMS();
                    break;
                case 'wifi':
                    isValid = this.validateWiFi();
                    break;
                default:
                    isValid = false;
            }
        } catch (error) {
            console.error('Validation error:', error);
            isValid = false;
        }
        
        generateBtn.disabled = !isValid;
        generateBtn.style.opacity = isValid ? '1' : '0.6';
    }

    // Individual validation methods
    validateText() {
        const input = document.getElementById('text-input');
        return input && input.value.trim().length > 0;
    }

    validateURL() {
        const input = document.getElementById('url-input');
        if (!input) return false;
        
        const url = input.value.trim();
        return url.length > 0 && this.isValidURL(url);
    }

    validateEmail() {
        const input = document.getElementById('email-to');
        if (!input) return false;
        
        const email = input.value.trim();
        return email.length > 0 && this.isValidEmail(email);
    }

    validatePhone() {
        const input = document.getElementById('phone-input');
        return input && input.value.trim().length > 0;
    }

    validateSMS() {
        const input = document.getElementById('sms-number');
        return input && input.value.trim().length > 0;
    }

    validateWiFi() {
        const input = document.getElementById('wifi-ssid');
        return input && input.value.trim().length > 0;
    }

    // URL validation helper
    isValidURL(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            // Try with http:// prefix
            try {
                new URL('http://' + string);
                return true;
            } catch (_) {
                return false;
            }
        }
    }

    // Email validation helper
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Get QR data based on current type
    getQRData() {
        try {
            switch (this.currentType) {
                case 'text':
                    return this.getTextData();
                case 'url':
                    return this.getURLData();
                case 'email':
                    return this.getEmailData();
                case 'phone':
                    return this.getPhoneData();
                case 'sms':
                    return this.getSMSData();
                case 'wifi':
                    return this.getWiFiData();
                default:
                    throw new Error(`Unknown QR type: ${this.currentType}`);
            }
        } catch (error) {
            console.error('Error getting QR data:', error);
            return null;
        }
    }

    // Individual data getter methods
    getTextData() {
        const input = document.getElementById('text-input');
        return input ? input.value.trim() : '';
    }

    getURLData() {
        const input = document.getElementById('url-input');
        if (!input) return '';
        
        let url = input.value.trim();
        if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        return url;
    }

    getEmailData() {
        const to = document.getElementById('email-to')?.value.trim() || '';
        const subject = document.getElementById('email-subject')?.value.trim() || '';
        const body = document.getElementById('email-body')?.value.trim() || '';
        
        let emailString = `mailto:${to}`;
        const params = [];
        
        if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
        if (body) params.push(`body=${encodeURIComponent(body)}`);
        
        if (params.length > 0) {
            emailString += '?' + params.join('&');
        }
        
        return emailString;
    }

    getPhoneData() {
        const input = document.getElementById('phone-input');
        const phone = input ? input.value.trim() : '';
        return phone ? `tel:${phone}` : '';
    }

    getSMSData() {
        const number = document.getElementById('sms-number')?.value.trim() || '';
        const message = document.getElementById('sms-message')?.value.trim() || '';
        
        let smsString = `sms:${number}`;
        if (message) {
            smsString += `?body=${encodeURIComponent(message)}`;
        }
        
        return smsString;
    }

    getWiFiData() {
        const ssid = document.getElementById('wifi-ssid')?.value.trim() || '';
        const password = document.getElementById('wifi-password')?.value.trim() || '';
        const security = document.getElementById('wifi-security')?.value || 'WPA';
        const hidden = document.getElementById('wifi-hidden')?.checked || false;
        
        if (!ssid) return '';
        
        return `WIFI:T:${security};S:${ssid};P:${password};H:${hidden ? 'true' : 'false'};;`;
    }

    // Main QR generation method
    async generateQRCode() {
        if (this.isGenerating) {
            console.log('QR generation already in progress');
            return;
        }

        const data = this.getQRData();
        console.log('QR Data:', data);
        
        if (!data) {
            this.showError('Please enter valid data to generate QR code.');
            return;
        }

        this.isGenerating = true;
        const generateBtn = document.getElementById('generate-btn');
        const originalText = generateBtn?.innerHTML || 'Generate QR Code';
        
        try {
            // Show loading state
            if (generateBtn) {
                generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
                generateBtn.disabled = true;
            }

            // Get settings
            const size = parseInt(document.getElementById('qr-size')?.value || '256');
            const errorCorrectionLevel = document.getElementById('error-correction')?.value || 'M';
            const foregroundColor = document.getElementById('foreground-color')?.value || '#000000';
            const backgroundColor = document.getElementById('background-color')?.value || '#ffffff';

            console.log('QR Settings:', { size, errorCorrectionLevel, foregroundColor, backgroundColor });

            // Get canvas
            const canvas = document.getElementById('qr-canvas');
            if (!canvas) {
                throw new Error('QR canvas element not found');
            }
            
            canvas.width = size;
            canvas.height = size;

            // Generate QR code
            await this.createQRCode(canvas, data, {
                width: size,
                height: size,
                errorCorrectionLevel: errorCorrectionLevel,
                margin: 2,
                color: {
                    dark: foregroundColor,
                    light: backgroundColor
                }
            });

            console.log('✅ QR code generated successfully');

            // Add background image if uploaded
            if (this.backgroundImage) {
                await this.addBackgroundToQR(canvas);
            }

            // Add logo if uploaded
            if (this.logoImage) {
                await this.addLogoToQR(canvas);
            }

            // Show result
            this.showQRResult();
            
        } catch (error) {
            console.error('❌ QR Generation Error:', error);
            this.showError(`Failed to generate QR code: ${error.message}`);
        } finally {
            this.isGenerating = false;
            if (generateBtn) {
                generateBtn.innerHTML = originalText;
                generateBtn.disabled = false;
            }
        }
    }    // Create QR code using available libraries
    async createQRCode(canvas, text, options) {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Canvas context not available');
        }

        // Clear canvas with white background
        ctx.fillStyle = options.color.light || '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        console.log('=== QR Generation Debug ===');
        console.log('Text to encode:', text);
        console.log('Canvas size:', `${canvas.width}x${canvas.height}`);
        console.log('Options:', options);
        console.log('QRCode library available:', typeof QRCode !== 'undefined');
        console.log('QRCode.CorrectLevel available:', typeof QRCode !== 'undefined' && !!QRCode.CorrectLevel);
        console.log('SimpleQRCode available:', typeof SimpleQRCode !== 'undefined');
        
        // Try main QRCode library first
        if (typeof QRCode !== 'undefined' && QRCode.CorrectLevel) {
            console.log('🎯 Attempting QR generation with main library (qrcodejs)');
            try {
                await this.generateWithMainLibrary(canvas, text, options, ctx);
                console.log('✅ Main library generation successful');
                return;
            } catch (error) {
                console.error('❌ Main library failed:', error.message);
                // Don't throw yet, try fallback
            }
        } else {
            console.log('⚠️ Main QRCode library not available');
        }
        
        // Fall back to SimpleQRCode
        if (typeof SimpleQRCode !== 'undefined') {
            console.log('🎯 Attempting QR generation with fallback library');
            try {
                await this.generateWithFallback(canvas, text, options);
                console.log('✅ Fallback library generation successful');
                return;
            } catch (error) {
                console.error('❌ Fallback library failed:', error.message);
                throw error;
            }
        } else {
            console.log('❌ SimpleQRCode fallback not available');
        }
        
        throw new Error('No QR code library available for generation');
    }// Generate QR using main qrcodejs library
    async generateWithMainLibrary(canvas, text, options, ctx) {
        console.log('Using qrcodejs library');
        
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '-9999px';
        document.body.appendChild(tempDiv);
        
        try {
            const qr = new QRCode(tempDiv, {
                text: text,
                width: options.width,
                height: options.height,
                colorDark: options.color.dark || '#000000',
                colorLight: options.color.light || '#ffffff',
                correctLevel: QRCode.CorrectLevel[options.errorCorrectionLevel] || QRCode.CorrectLevel.M
            });
            
            // Wait longer for generation and try multiple times
            let attempts = 0;
            const maxAttempts = 10;
            
            while (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
                
                console.log(`QR generation attempt ${attempts}/${maxAttempts}`);
                console.log(`TempDiv children: ${tempDiv.children.length}`);
                
                // Log all children for debugging
                for (let i = 0; i < tempDiv.children.length; i++) {
                    const child = tempDiv.children[i];
                    console.log(`  Child ${i}: ${child.tagName} (class: ${child.className || 'none'})`);
                }
                
                // Try to find canvas first
                const generatedCanvas = tempDiv.querySelector('canvas');
                if (generatedCanvas) {
                    console.log('✅ QR canvas found, copying to main canvas');
                    console.log(`Canvas size: ${generatedCanvas.width}x${generatedCanvas.height}`);
                    ctx.drawImage(generatedCanvas, 0, 0, options.width, options.height);
                    return;
                }
                
                // Try to find image
                const generatedImg = tempDiv.querySelector('img');
                if (generatedImg) {
                    console.log(`Found image. Complete: ${generatedImg.complete}, src length: ${generatedImg.src.length}`);
                    
                    if (generatedImg.complete && generatedImg.naturalWidth > 0) {
                        console.log('✅ QR image found and loaded, drawing to canvas');
                        ctx.drawImage(generatedImg, 0, 0, options.width, options.height);
                        return;
                    } else if (generatedImg.src && generatedImg.src.startsWith('data:')) {
                        // Image has data URL but might not be marked as complete yet
                        console.log('✅ QR image has data URL, attempting to draw');
                        try {
                            const img = new Image();
                            await new Promise((resolve, reject) => {
                                img.onload = () => {
                                    ctx.drawImage(img, 0, 0, options.width, options.height);
                                    resolve();
                                };
                                img.onerror = () => reject(new Error('Failed to load QR image'));
                                img.src = generatedImg.src;
                            });
                            return;
                        } catch (imgError) {
                            console.log('Failed to load image manually:', imgError.message);
                        }
                    }
                }
                
                // If we found something but it's not ready, wait a bit more
                if (generatedCanvas || generatedImg) {
                    continue;
                }
            }
            
            console.error('❌ QR code generation failed - no canvas or image created after', maxAttempts, 'attempts');
            throw new Error('QR code generation failed - no canvas or image created');
            
        } finally {
            if (document.body.contains(tempDiv)) {
                document.body.removeChild(tempDiv);
            }
        }
    }    // Generate QR using fallback library
    async generateWithFallback(canvas, text, options) {
        console.log('Using fallback QR implementation');
        
        try {
            await SimpleQRCode.toCanvas(canvas, text, {
                width: options.width,
                height: options.height,
                color: {
                    dark: options.color.dark || '#000000',
                    light: options.color.light || '#ffffff'
                }
            });
            console.log('✅ Fallback QR generated successfully');
        } catch (error) {
            console.error('❌ Fallback QR generation failed:', error);
            throw error;
        }
    }

    // Show QR result UI
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
            infoText.textContent = `QR Code generated successfully (${this.currentType.toUpperCase()})`;
        }

        // Add success animation
        if (canvas) {
            canvas.style.animation = 'fadeInScale 0.5s ease-out';
        }
    }

    // Download QR code
    downloadQRCode(format = 'png') {
        const canvas = document.getElementById('qr-canvas');
        if (!canvas) {
            this.showError('No QR code available to download');
            return;
        }

        try {
            const filename = `qrcode-${this.currentType}-${Date.now()}.${format}`;
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL(`image/${format}`);
            link.click();
            
            this.showSuccess('QR code downloaded successfully!');
        } catch (error) {
            console.error('Download error:', error);
            this.showError('Failed to download QR code');
        }
    }

    // Download large QR code
    downloadLargeQR() {
        this.downloadQRCode('png');
    }

    // Copy QR code to clipboard
    async copyQRCode() {
        const canvas = document.getElementById('qr-canvas');
        if (!canvas) {
            this.showError('No QR code available to copy');
            return;
        }

        try {
            canvas.toBlob(async (blob) => {
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    this.showSuccess('QR code copied to clipboard!');
                } catch (error) {
                    console.error('Copy failed:', error);
                    this.showError('Failed to copy QR code to clipboard');
                }
            });
        } catch (error) {
            console.error('Copy failed:', error);
            this.showError('Clipboard access not supported in this browser');
        }
    }

    // Print QR code
    printQRCode() {
        const canvas = document.getElementById('qr-canvas');
        if (!canvas) {
            this.showError('No QR code available to print');
            return;
        }

        try {
            const printWindow = window.open('', '_blank');
            const img = canvas.toDataURL('image/png');
            
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>QR Code - ${this.currentType}</title>
                        <style>
                            body { 
                                margin: 0; 
                                padding: 20px; 
                                display: flex; 
                                justify-content: center; 
                                align-items: center; 
                                min-height: 100vh; 
                                font-family: Arial, sans-serif;
                            }
                            .print-container {
                                text-align: center;
                            }
                            img { 
                                max-width: 100%; 
                                height: auto; 
                                border: 1px solid #ccc;
                                margin-bottom: 20px;
                            }
                            .info {
                                color: #666;
                                font-size: 14px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="print-container">
                            <img src="${img}" alt="QR Code">
                            <div class="info">
                                <p>Generated by Mini Tools QR Generator</p>
                                <p>Type: ${this.currentType.toUpperCase()}</p>
                                <p>Generated on: ${new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </body>
                </html>
            `);
            
            printWindow.document.close();
            printWindow.focus();
            
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
            
        } catch (error) {
            console.error('Print error:', error);
            this.showError('Failed to print QR code');
        }
    }

    // Show fullscreen QR
    showFullscreenQR() {
        const canvas = document.getElementById('qr-canvas');
        if (!canvas) {
            this.showError('No QR code to display. Please generate a QR code first.');
            return;
        }

        const modal = document.getElementById('fullscreen-modal');
        const fullscreenCanvas = document.getElementById('fullscreen-qr-canvas');
        const title = document.getElementById('fullscreen-title');
        const description = document.getElementById('fullscreen-description');

        if (!modal || !fullscreenCanvas) {
            this.showError('Full-screen display is not available.');
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

            if (title) title.textContent = `${this.currentType.toUpperCase()} QR Code`;
            if (description) description.textContent = 'Scan with your device camera to access the content';

            modal.classList.add('show');
            document.body.style.overflow = 'hidden';

            const closeBtn = document.getElementById('close-fullscreen');
            if (closeBtn) closeBtn.focus();
            
        } catch (error) {
            console.error('Fullscreen error:', error);
            this.showError('Failed to display QR code in fullscreen');
        }
    }

    // Hide fullscreen QR
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

    // Setup design features (logo, background, colors)
    setupDesignFeatures() {
        this.setupLogoUpload();
        this.setupBackgroundUpload();
        this.setupColorInputs();
        this.setupColorPresets();
    }

    // Setup logo upload functionality
    setupLogoUpload() {
        const uploadArea = document.getElementById('upload-area');
        const logoUpload = document.getElementById('logo-upload');
        const removeLogo = document.getElementById('remove-logo');

        if (!uploadArea || !logoUpload) return;

        // Click to upload
        uploadArea.addEventListener('click', () => logoUpload.click());

        // Drag and drop
        this.setupDragAndDrop(uploadArea, (file) => this.handleLogoUpload(file));

        // File input change
        logoUpload.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleLogoUpload(e.target.files[0]);
            }
        });

        // Remove logo
        if (removeLogo) {
            removeLogo.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeLogo();
            });
        }
    }

    // Setup background upload functionality
    setupBackgroundUpload() {
        const uploadArea = document.getElementById('background-upload-area');
        const backgroundUpload = document.getElementById('background-upload');
        const removeBackground = document.getElementById('remove-background');

        if (!uploadArea || !backgroundUpload) return;

        // Click to upload
        uploadArea.addEventListener('click', () => backgroundUpload.click());

        // Drag and drop
        this.setupDragAndDrop(uploadArea, (file) => this.handleBackgroundUpload(file));

        // File input change
        backgroundUpload.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleBackgroundUpload(e.target.files[0]);
            }
        });

        // Remove background
        if (removeBackground) {
            removeBackground.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeBackground();
            });
        }
    }

    // Setup drag and drop for file uploads
    setupDragAndDrop(element, onDrop) {
        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            element.classList.add('dragover');
        });

        element.addEventListener('dragleave', (e) => {
            e.preventDefault();
            element.classList.remove('dragover');
        });

        element.addEventListener('drop', (e) => {
            e.preventDefault();
            element.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                onDrop(files[0]);
            }
        });
    }

    // Handle logo upload
    handleLogoUpload(file) {
        if (!this.validateImageFile(file)) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.logoImage = img;
                this.showLogoPreview(e.target.result);
                this.showSuccess('Logo uploaded successfully!');
                this.regenerateIfExists();
            };
            img.onerror = () => {
                this.showError('Failed to load logo image');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Show logo preview
    showLogoPreview(src) {
        const preview = document.getElementById('logo-preview');
        const uploadContent = document.querySelector('#upload-area .upload-content');
        const uploadedLogo = document.getElementById('uploaded-logo');
        const logoOptions = document.getElementById('logo-options');

        if (preview) preview.src = src;
        if (uploadContent) uploadContent.style.display = 'none';
        if (uploadedLogo) uploadedLogo.style.display = 'block';
        if (logoOptions) logoOptions.style.display = 'block';
    }

    // Remove logo
    removeLogo() {
        this.logoImage = null;
        
        const uploadContent = document.querySelector('#upload-area .upload-content');
        const uploadedLogo = document.getElementById('uploaded-logo');
        const logoOptions = document.getElementById('logo-options');
        const logoUpload = document.getElementById('logo-upload');

        if (uploadContent) uploadContent.style.display = 'flex';
        if (uploadedLogo) uploadedLogo.style.display = 'none';
        if (logoOptions) logoOptions.style.display = 'none';
        if (logoUpload) logoUpload.value = '';

        this.regenerateIfExists();
    }

    // Handle background upload
    handleBackgroundUpload(file) {
        if (!this.validateImageFile(file)) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.backgroundImage = img;
                this.showBackgroundPreview(e.target.result);
                this.showSuccess('Background image uploaded successfully!');
                this.regenerateIfExists();
            };
            img.onerror = () => {
                this.showError('Failed to load background image');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Show background preview
    showBackgroundPreview(src) {
        const preview = document.getElementById('background-preview');
        const uploadContent = document.querySelector('#background-upload-area .upload-content');
        const uploadedBackground = document.getElementById('uploaded-background');
        const backgroundOptions = document.getElementById('background-options');

        if (preview) preview.src = src;
        if (uploadContent) uploadContent.style.display = 'none';
        if (uploadedBackground) uploadedBackground.style.display = 'block';
        if (backgroundOptions) backgroundOptions.style.display = 'grid';
    }

    // Remove background
    removeBackground() {
        this.backgroundImage = null;
        
        const uploadContent = document.querySelector('#background-upload-area .upload-content');
        const uploadedBackground = document.getElementById('uploaded-background');
        const backgroundOptions = document.getElementById('background-options');
        const backgroundUpload = document.getElementById('background-upload');

        if (uploadContent) uploadContent.style.display = 'flex';
        if (uploadedBackground) uploadedBackground.style.display = 'none';
        if (backgroundOptions) backgroundOptions.style.display = 'none';
        if (backgroundUpload) backgroundUpload.value = '';

        this.regenerateIfExists();
    }

    // Validate image file
    validateImageFile(file) {
        if (!file.type.startsWith('image/')) {
            this.showError('Please upload a valid image file.');
            return false;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            this.showError('Image file size must be less than 5MB.');
            return false;
        }

        return true;
    }

    // Setup color inputs
    setupColorInputs() {
        const colorInputs = [
            { color: 'foreground-color', hex: 'foreground-hex' },
            { color: 'background-color', hex: 'background-hex' }
        ];

        colorInputs.forEach(({ color, hex }) => {
            const colorInput = document.getElementById(color);
            const hexInput = document.getElementById(hex);

            if (colorInput && hexInput) {
                colorInput.addEventListener('input', (e) => {
                    hexInput.value = e.target.value;
                    this.regenerateIfExists();
                });

                hexInput.addEventListener('input', (e) => {
                    if (this.isValidHexColor(e.target.value)) {
                        colorInput.value = e.target.value;
                        this.regenerateIfExists();
                    }
                });
            }
        });

        // Setup option change listeners
        const options = [
            'logo-size', 'logo-background', 
            'background-opacity', 'background-fit'
        ];

        options.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.regenerateIfExists());
            }
        });
    }

    // Setup color presets
    setupColorPresets() {
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const fg = btn.dataset.fg;
                const bg = btn.dataset.bg;
                
                if (fg && bg) {
                    this.applyColorPreset(fg, bg);
                    
                    // Update active preset
                    document.querySelectorAll('.preset-btn').forEach(b => {
                        b.classList.remove('active');
                    });
                    btn.classList.add('active');
                }
            });
        });
    }

    // Apply color preset
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

        this.regenerateIfExists();
    }

    // Hex color validation
    isValidHexColor(hex) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    }

    // Regenerate QR if one exists
    regenerateIfExists() {
        const result = document.getElementById('qr-result');
        if (result && result.style.display !== 'none') {
            clearTimeout(this.regenerateTimeout);
            this.regenerateTimeout = setTimeout(() => this.generateQRCode(), 300);
        }
    }

    // Add logo to QR code
    async addLogoToQR(canvas) {
        if (!this.logoImage) return;
        
        const ctx = canvas.getContext('2d');
        const canvasSize = canvas.width;
        const logoSizePercent = parseInt(document.getElementById('logo-size')?.value || '20');
        const logoBackground = document.getElementById('logo-background')?.value || 'none';
        
        const logoSize = (canvasSize * logoSizePercent) / 100;
        const logoX = (canvasSize - logoSize) / 2;
        const logoY = (canvasSize - logoSize) / 2;
        
        ctx.save();
        
        // Add background for logo if specified
        if (logoBackground !== 'none') {
            this.drawLogoBackground(ctx, logoX, logoY, logoSize, logoBackground);
        }
        
        // Clip logo to rounded rectangle
        const clipRadius = logoBackground === 'white' ? logoSize / 2 : logoSize * 0.1;
        this.roundRect(ctx, logoX, logoY, logoSize, logoSize, clipRadius);
        ctx.clip();
        
        // Draw logo
        ctx.drawImage(this.logoImage, logoX, logoY, logoSize, logoSize);
        ctx.restore();
    }

    // Draw logo background
    drawLogoBackground(ctx, x, y, size, background) {
        const bgPadding = size * 0.1;
        const bgSize = size + (bgPadding * 2);
        const bgX = x - bgPadding;
        const bgY = y - bgPadding;
        
        ctx.fillStyle = background === 'white' ? '#ffffff' : 
                       document.getElementById('background-color')?.value || '#ffffff';
        
        if (background === 'white' || background === 'rounded') {
            const radius = background === 'white' ? bgSize / 2 : bgSize * 0.15;
            this.roundRect(ctx, bgX, bgY, bgSize, bgSize, radius);
            ctx.fill();
            
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    // Add background image to QR
    async addBackgroundToQR(canvas) {
        if (!this.backgroundImage) return;

        const ctx = canvas.getContext('2d');
        const canvasSize = canvas.width;
        const opacity = parseFloat(document.getElementById('background-opacity')?.value || '0.5');
        const fit = document.getElementById('background-fit')?.value || 'cover';

        // Save current canvas content
        const qrImageData = ctx.getImageData(0, 0, canvasSize, canvasSize);

        // Calculate background dimensions
        const bgDimensions = this.calculateBackgroundDimensions(
            this.backgroundImage.width, 
            this.backgroundImage.height, 
            canvasSize, 
            fit
        );

        // Draw background
        ctx.globalAlpha = 1;
        ctx.drawImage(
            this.backgroundImage, 
            bgDimensions.x, 
            bgDimensions.y, 
            bgDimensions.width, 
            bgDimensions.height
        );

        // Overlay QR code with transparency
        ctx.globalAlpha = opacity;
        ctx.putImageData(qrImageData, 0, 0);
        ctx.globalAlpha = 1;
    }

    // Calculate background image dimensions
    calculateBackgroundDimensions(imgWidth, imgHeight, canvasSize, fit) {
        const imgAspect = imgWidth / imgHeight;
        const canvasAspect = 1; // Square canvas
        
        let width, height, x, y;

        switch (fit) {
            case 'contain':
                if (imgAspect > canvasAspect) {
                    width = canvasSize;
                    height = canvasSize / imgAspect;
                } else {
                    width = canvasSize * imgAspect;
                    height = canvasSize;
                }
                x = (canvasSize - width) / 2;
                y = (canvasSize - height) / 2;
                break;
                
            case 'fill':
                width = canvasSize;
                height = canvasSize;
                x = 0;
                y = 0;
                break;
                
            case 'cover':
            default:
                if (imgAspect > canvasAspect) {
                    width = canvasSize * imgAspect;
                    height = canvasSize;
                } else {
                    width = canvasSize;
                    height = canvasSize / imgAspect;
                }
                x = (canvasSize - width) / 2;
                y = (canvasSize - height) / 2;
                break;
        }

        return { x, y, width, height };
    }

    // Draw rounded rectangle
    roundRect(ctx, x, y, width, height, radius) {
        if (radius === 0) {
            ctx.rect(x, y, width, height);
            return;
        }
        
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
    }

    // Theme management
    toggleTheme() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update theme icon
        const themeIcon = document.querySelector('#theme-toggle i');
        if (themeIcon) {
            themeIcon.className = `fas fa-${newTheme === 'light' ? 'moon' : 'sun'}`;
        }
        
        this.regenerateIfExists();
    }

    // Load saved theme
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const themeIcon = document.querySelector('#theme-toggle i');
        if (themeIcon) {
            themeIcon.className = `fas fa-${savedTheme === 'light' ? 'moon' : 'sun'}`;
        }
    }

    // Notification system
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 
                    type === 'error' ? 'exclamation-circle' : 'info-circle';
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        const bgColor = type === 'success' ? 'var(--accent-green)' : 
                       type === 'error' ? 'var(--accent-red)' : 'var(--accent-blue)';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInScale {
        from {
            opacity: 0;
            transform: scale(0.8);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new QRGenerator();
        console.log('✅ QR Generator initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize QR Generator:', error);
    }
});
