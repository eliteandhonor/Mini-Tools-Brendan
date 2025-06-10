/**
 * QR Library Management Module
 * Handles QR code generation library validation and fallback mechanisms
 */
export class QRLibraryManager {
    constructor() {
        this.hasMainLibrary = false;
        this.hasFallbackLibrary = false;
        this.validateLibraries();
    }

    /**
     * Validate available QR libraries
     */
    validateLibraries() {
        this.hasMainLibrary = typeof QRCode !== 'undefined' && QRCode.CorrectLevel;
        this.hasFallbackLibrary = typeof SimpleQRCode !== 'undefined';
        
        console.log('=== QR Library Validation ===');
        console.log('QRCode available:', typeof QRCode !== 'undefined');
        console.log('QRCode.CorrectLevel available:', this.hasMainLibrary);
        console.log('SimpleQRCode available:', this.hasFallbackLibrary);
        
        return this.hasMainLibrary || this.hasFallbackLibrary;
    }    /**
     * Generate QR code using available libraries with enhanced error handling
     */
    async generateQRCode(canvas, text, options) {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Canvas context not available');
        }

        // Clear canvas with proper background
        ctx.fillStyle = options.color.light || '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        console.log('=== QR Generation Started ===');
        console.log('Text:', text);
        console.log('Canvas size:', `${canvas.width}x${canvas.height}`);
        console.log('Options:', options);

        // Try main library first
        if (this.hasMainLibrary) {
            try {
                await this.generateWithMainLibrary(canvas, text, options, ctx);
                console.log('✅ QR generated with main library');
                
                // Apply background and logo images after basic QR generation
                await this.applyImageEnhancements(canvas, options);
                return;
            } catch (error) {
                console.error('❌ Main library failed:', error.message);
            }
        }

        // Try fallback library
        if (this.hasFallbackLibrary) {
            try {
                await this.generateWithFallback(canvas, text, options);
                console.log('✅ QR generated with fallback library');
                
                // Apply background and logo images after basic QR generation
                await this.applyImageEnhancements(canvas, options);
                return;
            } catch (error) {
                console.error('❌ Fallback library failed:', error.message);
            }
        }

        throw new Error('No QR code library available or all libraries failed');
    }

    /**
     * Generate using main qrcodejs library with improved timing
     */
    async generateWithMainLibrary(canvas, text, options, ctx) {
        console.log('🎯 Using main qrcodejs library');
        
        // Create temporary container for QR generation
        const tempDiv = document.createElement('div');
        tempDiv.style.cssText = 'position: absolute; left: -9999px; top: -9999px; width: 256px; height: 256px;';
        document.body.appendChild(tempDiv);
        
        try {
            // Create QR code instance
            const qr = new QRCode(tempDiv, {
                text: text,
                width: options.width,
                height: options.height,
                colorDark: options.color.dark || '#000000',
                colorLight: options.color.light || '#ffffff',
                correctLevel: QRCode.CorrectLevel[options.errorCorrectionLevel] || QRCode.CorrectLevel.M
            });

            // Enhanced waiting mechanism with multiple checks
            const maxAttempts = 20;
            const attemptDelay = 50;
            
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                await new Promise(resolve => setTimeout(resolve, attemptDelay));
                
                console.log(`Attempt ${attempt}/${maxAttempts}`);
                
                // Look for generated canvas
                const generatedCanvas = tempDiv.querySelector('canvas');
                if (generatedCanvas && generatedCanvas.width > 0 && generatedCanvas.height > 0) {
                    console.log('✅ Found generated canvas');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = options.color.light || '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(generatedCanvas, 0, 0, canvas.width, canvas.height);
                    return;
                }
                
                // Look for generated image
                const generatedImg = tempDiv.querySelector('img');
                if (generatedImg && generatedImg.complete && generatedImg.naturalWidth > 0) {
                    console.log('✅ Found generated image');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = options.color.light || '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(generatedImg, 0, 0, canvas.width, canvas.height);
                    return;
                }
            }
            
            throw new Error('QR generation timed out - no valid output found');
            
        } finally {
            // Clean up temporary element
            if (document.body.contains(tempDiv)) {
                document.body.removeChild(tempDiv);
            }
        }
    }

    /**
     * Generate using fallback SimpleQRCode library
     */
    async generateWithFallback(canvas, text, options) {
        console.log('🎯 Using fallback SimpleQRCode library');
        
        try {
            await SimpleQRCode.toCanvas(canvas, text, {
                width: options.width,
                height: options.height,
                color: {
                    dark: options.color.dark || '#000000',
                    light: options.color.light || '#ffffff'
                }
            });
        } catch (error) {
            console.error('❌ Fallback generation failed:', error);
            throw error;
        }
    }

    /**
     * Apply background and logo images to the generated QR code
     */
    async applyImageEnhancements(canvas, options) {
        console.log('🎨 Applying image enhancements...');
        
        // Apply background image first (behind the QR code)
        if (options.backgroundImage) {
            console.log('📷 Adding background image');
            await this.addBackgroundImage(canvas, options.backgroundImage, options);
        }
        
        // Apply logo image on top
        if (options.logoImage) {
            console.log('🏷️ Adding logo image');
            await this.addLogoImage(canvas, options.logoImage, options);
        }
        
        console.log('✅ Image enhancements applied');
    }

    /**
     * Add background image to QR code
     */
    async addBackgroundImage(canvas, backgroundImage, options) {
        const ctx = canvas.getContext('2d');
        const opacity = parseFloat(document.getElementById('background-opacity')?.value || '0.3');
        const fit = document.getElementById('background-fit')?.value || 'cover';
        
        const { width, height, x, y } = this.calculateBackgroundDimensions(
            backgroundImage.width, 
            backgroundImage.height, 
            canvas.width, 
            fit
        );

        // Draw background with opacity behind the QR code
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over'; // Draw behind existing content
        ctx.globalAlpha = opacity;
        ctx.drawImage(backgroundImage, x, y, width, height);
        ctx.restore();
    }

    /**
     * Add logo image to QR code
     */
    async addLogoImage(canvas, logoImage, options) {
        const ctx = canvas.getContext('2d');
        const size = parseInt(document.getElementById('logo-size')?.value || '20');
        const background = document.getElementById('logo-background')?.value || 'none';
        
        const logoSize = (canvas.width * size) / 100;
        const logoX = (canvas.width - logoSize) / 2;
        const logoY = (canvas.height - logoSize) / 2;

        // Draw logo background if specified
        if (background !== 'none') {
            this.drawLogoBackground(ctx, logoX, logoY, logoSize, background);
        }

        // Draw logo on top
        ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
    }

    /**
     * Calculate background image dimensions based on fit setting
     */
    calculateBackgroundDimensions(imgWidth, imgHeight, canvasSize, fit) {
        let width, height, x = 0, y = 0;

        switch (fit) {
            case 'cover':
                const scale = Math.max(canvasSize / imgWidth, canvasSize / imgHeight);
                width = imgWidth * scale;
                height = imgHeight * scale;
                x = (canvasSize - width) / 2;
                y = (canvasSize - height) / 2;
                break;
                
            case 'contain':
                const scaleContain = Math.min(canvasSize / imgWidth, canvasSize / imgHeight);
                width = imgWidth * scaleContain;
                height = imgHeight * scaleContain;
                x = (canvasSize - width) / 2;
                y = (canvasSize - height) / 2;
                break;
                
            case 'stretch':
                width = canvasSize;
                height = canvasSize;
                break;
                
            default:
                width = canvasSize;
                height = canvasSize;
        }

        return { width, height, x, y };
    }

    /**
     * Draw logo background
     */
    drawLogoBackground(ctx, x, y, size, background) {
        const padding = size * 0.1;
        const bgSize = size + padding * 2;
        const bgX = x - padding;
        const bgY = y - padding;

        ctx.save();
        
        switch (background) {
            case 'white':
                ctx.fillStyle = '#ffffff';
                break;
            case 'black':
                ctx.fillStyle = '#000000';
                break;
            case 'rounded':
                ctx.fillStyle = '#ffffff';
                this.roundRect(ctx, bgX, bgY, bgSize, bgSize, size * 0.1);
                ctx.fill();
                ctx.restore();
                return;
            default:
                ctx.restore();
                return;
        }

        ctx.fillRect(bgX, bgY, bgSize, bgSize);
        ctx.restore();
    }

    /**
     * Draw rounded rectangle
     */
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    /**
     * Check if any QR library is available
     */
    isAvailable() {
        return this.hasMainLibrary || this.hasFallbackLibrary;
    }

    /**
     * Get library status information
     */
    getStatus() {
        return {
            mainLibrary: this.hasMainLibrary,
            fallbackLibrary: this.hasFallbackLibrary,
            available: this.isAvailable()
        };
    }
}
