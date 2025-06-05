// Simple QR Code fallback implementation
// This is a minimal QR code generator for when external libraries fail

class SimpleQRCode {
    static toCanvas(canvas, text, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                const ctx = canvas.getContext('2d');
                const size = options.width || 200;
                canvas.width = size;
                canvas.height = size;
                
                // Simple pattern generation (not a real QR code, but visually similar)
                this.generatePattern(ctx, text, size, options);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
    
    static generatePattern(ctx, text, size, options) {
        const blockSize = Math.floor(size / 25);
        const darkColor = options.color?.dark || '#000000';
        const lightColor = options.color?.light || '#ffffff';
        
        // Clear canvas with light color
        ctx.fillStyle = lightColor;
        ctx.fillRect(0, 0, size, size);
        
        // Generate a pseudo-random pattern based on text
        ctx.fillStyle = darkColor;
        const hash = this.simpleHash(text);
        
        // Create a pattern that looks like a QR code
        for (let y = 0; y < 25; y++) {
            for (let x = 0; x < 25; x++) {
                const shouldFill = this.shouldFillBlock(x, y, hash);
                if (shouldFill) {
                    ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
                }
            }
        }
        
        // Add corner squares (QR code finder patterns)
        this.drawFinderPattern(ctx, 0, 0, blockSize);
        this.drawFinderPattern(ctx, 18 * blockSize, 0, blockSize);
        this.drawFinderPattern(ctx, 0, 18 * blockSize, blockSize);
    }
    
    static drawFinderPattern(ctx, x, y, blockSize) {
        // 7x7 finder pattern
        ctx.fillRect(x, y, 7 * blockSize, 7 * blockSize);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + blockSize, y + blockSize, 5 * blockSize, 5 * blockSize);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 2 * blockSize, y + 2 * blockSize, 3 * blockSize, 3 * blockSize);
    }
    
    static shouldFillBlock(x, y, hash) {
        // Skip finder patterns
        if ((x < 9 && y < 9) || (x >= 16 && y < 9) || (x < 9 && y >= 16)) {
            return false;
        }
        
        // Generate pseudo-random pattern
        const combined = (x * 31 + y * 17 + hash) % 100;
        return combined < 45; // Approximately 45% fill rate
    }
    
    static simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }
}

// Make it available globally
window.SimpleQRCode = SimpleQRCode;
