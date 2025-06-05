/**
 * Action Manager Module
 * Handles QR code actions like download, copy, print, etc.
 */
export class ActionManager {
    constructor(qrGenerator) {
        this.qrGenerator = qrGenerator;
    }

    /**
     * Download QR code in specified format
     */
    downloadQRCode(format = 'png') {
        const canvas = document.getElementById('qr-canvas');
        if (!canvas) {
            this.qrGenerator.notificationManager.showError('No QR code available to download');
            return;
        }

        try {
            const filename = `qrcode-${this.qrGenerator.currentType}-${Date.now()}.${format}`;
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL(`image/${format}`);
            link.click();
            
            this.qrGenerator.notificationManager.showSuccess('QR code downloaded successfully!');
        } catch (error) {
            console.error('Download error:', error);
            this.qrGenerator.notificationManager.showError('Failed to download QR code');
        }
    }

    /**
     * Download large QR code (high resolution)
     */
    downloadLargeQR() {
        const canvas = document.getElementById('qr-canvas');
        if (!canvas) {
            this.qrGenerator.notificationManager.showError('No QR code available to download');
            return;
        }

        try {
            // Create high resolution canvas
            const largeCanvas = document.createElement('canvas');
            const scale = 4; // 4x larger
            largeCanvas.width = canvas.width * scale;
            largeCanvas.height = canvas.height * scale;
            
            const ctx = largeCanvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.scale(scale, scale);
            ctx.drawImage(canvas, 0, 0);

            const filename = `qrcode-${this.qrGenerator.currentType}-large-${Date.now()}.png`;
            const link = document.createElement('a');
            link.download = filename;
            link.href = largeCanvas.toDataURL('image/png');
            link.click();
            
            this.qrGenerator.notificationManager.showSuccess('Large QR code downloaded successfully!');
        } catch (error) {
            console.error('Large download error:', error);
            this.qrGenerator.notificationManager.showError('Failed to download large QR code');
        }
    }

    /**
     * Copy QR code to clipboard
     */
    async copyQRCode() {
        const canvas = document.getElementById('qr-canvas');
        if (!canvas) {
            this.qrGenerator.notificationManager.showError('No QR code available to copy');
            return;
        }

        try {
            // Convert canvas to blob
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/png');
            });

            // Copy to clipboard
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            
            this.qrGenerator.notificationManager.showSuccess('QR code copied to clipboard!');
        } catch (error) {
            console.error('Copy error:', error);
            
            // Fallback: copy as data URL
            try {
                await navigator.clipboard.writeText(canvas.toDataURL('image/png'));
                this.qrGenerator.notificationManager.showSuccess('QR code data copied to clipboard!');
            } catch (fallbackError) {
                this.qrGenerator.notificationManager.showError('Failed to copy QR code to clipboard');
            }
        }
    }

    /**
     * Print QR code
     */
    printQRCode() {
        const canvas = document.getElementById('qr-canvas');
        if (!canvas) {
            this.qrGenerator.notificationManager.showError('No QR code available to print');
            return;
        }

        try {
            const printWindow = window.open('', '_blank');
            const img = canvas.toDataURL('image/png');
            
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>QR Code - ${this.qrGenerator.currentType}</title>
                        <style>
                            body { 
                                margin: 0; 
                                padding: 20px; 
                                display: flex; 
                                flex-direction: column;
                                justify-content: center; 
                                align-items: center; 
                                min-height: 100vh; 
                                font-family: Arial, sans-serif;
                            }
                            .print-container {
                                text-align: center;
                            }
                            img { 
                                max-width: 400px; 
                                height: auto; 
                                border: 1px solid #ccc;
                                margin: 20px 0;
                            }
                            h1 {
                                color: #333;
                                margin-bottom: 10px;
                            }
                            p {
                                color: #666;
                                margin: 5px 0;
                            }
                            @media print {
                                body { margin: 0; }
                                .no-print { display: none; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="print-container">
                            <h1>QR Code - ${this.qrGenerator.currentType.toUpperCase()}</h1>
                            <p>Generated on ${new Date().toLocaleDateString()}</p>
                            <img src="${img}" alt="QR Code">
                            <p class="no-print">Close this window after printing</p>
                        </div>
                        <script>
                            window.onload = function() {
                                window.print();
                                window.onafterprint = function() {
                                    window.close();
                                };
                            };
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
            
        } catch (error) {
            console.error('Print error:', error);
            this.qrGenerator.notificationManager.showError('Failed to print QR code');
        }
    }

    /**
     * Share QR code (if Web Share API is available)
     */
    async shareQRCode() {
        if (!navigator.share) {
            this.qrGenerator.notificationManager.showError('Sharing is not supported in this browser');
            return;
        }

        const canvas = document.getElementById('qr-canvas');
        if (!canvas) {
            this.qrGenerator.notificationManager.showError('No QR code available to share');
            return;
        }

        try {
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/png');
            });

            const file = new File([blob], `qrcode-${this.qrGenerator.currentType}.png`, {
                type: 'image/png'
            });

            await navigator.share({
                title: `QR Code - ${this.qrGenerator.currentType.toUpperCase()}`,
                text: 'Check out this QR code!',
                files: [file]
            });

            this.qrGenerator.notificationManager.showSuccess('QR code shared successfully!');
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Share error:', error);
                this.qrGenerator.notificationManager.showError('Failed to share QR code');
            }
        }
    }

    /**
     * Export QR code as SVG (if possible)
     */
    exportAsSVG() {
        // This would require implementing SVG QR generation
        // For now, show a notification that it's not implemented
        this.qrGenerator.notificationManager.showError('SVG export is not yet implemented');
    }

    /**
     * Save QR code settings as preset
     */
    saveAsPreset() {
        const settings = {
            type: this.qrGenerator.currentType,
            size: document.getElementById('qr-size')?.value,
            errorCorrection: document.getElementById('error-correction')?.value,
            foregroundColor: document.getElementById('foreground-color')?.value,
            backgroundColor: document.getElementById('background-color')?.value,
            logoSize: document.getElementById('logo-size')?.value,
            logoBackground: document.getElementById('logo-background')?.value,
            backgroundOpacity: document.getElementById('background-opacity')?.value,
            backgroundFit: document.getElementById('background-fit')?.value
        };

        const presetName = prompt('Enter a name for this preset:');
        if (presetName) {
            const presets = JSON.parse(localStorage.getItem('qr-presets') || '{}');
            presets[presetName] = settings;
            localStorage.setItem('qr-presets', JSON.stringify(presets));
            
            this.qrGenerator.notificationManager.showSuccess(`Preset "${presetName}" saved successfully!`);
        }
    }

    /**
     * Load QR code preset
     */
    loadPreset(presetName) {
        const presets = JSON.parse(localStorage.getItem('qr-presets') || '{}');
        const preset = presets[presetName];
        
        if (!preset) {
            this.qrGenerator.notificationManager.showError('Preset not found');
            return;
        }

        // Apply preset settings
        Object.entries(preset).forEach(([key, value]) => {
            const elementId = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            const element = document.getElementById(elementId);
            if (element) {
                element.value = value;
            }
        });

        this.qrGenerator.notificationManager.showSuccess(`Preset "${presetName}" loaded successfully!`);
        this.qrGenerator.regenerateIfExists();
    }
}
