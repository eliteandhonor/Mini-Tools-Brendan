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
    }

    /**
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
