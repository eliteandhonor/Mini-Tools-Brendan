/**
 * Image Management Module
 * Handles logo and background image uploads, processing, and rendering
 */
export class ImageManager {
    constructor(qrGenerator) {
        this.qrGenerator = qrGenerator;
        this.logoImage = null;
        this.backgroundImage = null;
    }

    /**
     * Handle logo upload
     */
    handleLogoUpload(file) {
        if (!this.validateImageFile(file)) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.logoImage = img;
                this.showLogoPreview(e.target.result);
                this.qrGenerator.notificationManager.showSuccess('Logo uploaded successfully!');
                this.qrGenerator.regenerateIfExists();
            };
            img.onerror = () => {
                this.qrGenerator.notificationManager.showError('Failed to load logo image');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    /**
     * Handle background upload
     */
    handleBackgroundUpload(file) {
        if (!this.validateImageFile(file)) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.backgroundImage = img;
                this.showBackgroundPreview(e.target.result);
                this.qrGenerator.notificationManager.showSuccess('Background uploaded successfully!');
                this.qrGenerator.regenerateIfExists();
            };
            img.onerror = () => {
                this.qrGenerator.notificationManager.showError('Failed to load background image');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }    /**
     * Show logo preview
     */
    showLogoPreview(src) {
        const uploadContent = document.querySelector('#upload-area .upload-content');
        const uploadedLogo = document.getElementById('uploaded-logo');
        const logoOptions = document.getElementById('logo-options');

        if (uploadContent) uploadContent.classList.add('hide');
        
        if (uploadedLogo) {
            uploadedLogo.classList.add('show');
            const img = uploadedLogo.querySelector('img');
            if (img) img.src = src;
        }
        
        if (logoOptions) logoOptions.classList.add('show');
    }    /**
     * Show background preview
     */
    showBackgroundPreview(src) {
        const uploadContent = document.querySelector('#background-upload-area .upload-content');
        const uploadedBackground = document.getElementById('uploaded-background');
        const backgroundOptions = document.getElementById('background-options');

        if (uploadContent) uploadContent.classList.add('hide');
        
        if (uploadedBackground) {
            uploadedBackground.classList.add('show');
            const img = uploadedBackground.querySelector('img');
            if (img) img.src = src;
        }
        
        if (backgroundOptions) backgroundOptions.classList.add('show');
    }    /**
     * Remove logo
     */
    removeLogo() {
        this.logoImage = null;
        
        const uploadContent = document.querySelector('#upload-area .upload-content');
        const uploadedLogo = document.getElementById('uploaded-logo');
        const logoOptions = document.getElementById('logo-options');
        const logoUpload = document.getElementById('logo-upload');

        if (uploadContent) uploadContent.classList.remove('hide');
        if (uploadedLogo) uploadedLogo.classList.remove('show');
        if (logoOptions) logoOptions.classList.remove('show');
        if (logoUpload) logoUpload.value = '';

        this.qrGenerator.regenerateIfExists();
    }

    /**
     * Remove background
     */    removeBackground() {
        this.backgroundImage = null;
        
        const uploadContent = document.querySelector('#background-upload-area .upload-content');
        const uploadedBackground = document.getElementById('uploaded-background');
        const backgroundOptions = document.getElementById('background-options');
        const backgroundUpload = document.getElementById('background-upload');

        if (uploadContent) uploadContent.classList.remove('hide');
        if (uploadedBackground) uploadedBackground.classList.remove('show');
        if (backgroundOptions) backgroundOptions.classList.remove('show');
        if (backgroundUpload) backgroundUpload.value = '';

        this.qrGenerator.regenerateIfExists();
    }

    /**
     * Validate image file
     */
    validateImageFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            this.qrGenerator.notificationManager.showError('Please upload a valid image file (JPEG, PNG, GIF, WebP)');
            return false;
        }

        if (file.size > maxSize) {
            this.qrGenerator.notificationManager.showError('Image file too large. Please choose a file under 5MB.');
            return false;
        }

        return true;
    }

    /**
     * Add logo to QR code
     */
    async addLogoToQR(canvas) {
        if (!this.logoImage) return;

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

        // Draw logo
        ctx.drawImage(this.logoImage, logoX, logoY, logoSize, logoSize);
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
     * Add background image to QR
     */
    async addBackgroundToQR(canvas) {
        if (!this.backgroundImage) return;

        const ctx = canvas.getContext('2d');
        const opacity = parseFloat(document.getElementById('background-opacity')?.value || '0.3');
        const fit = document.getElementById('background-fit')?.value || 'cover';
        
        const { width, height, x, y } = this.calculateBackgroundDimensions(
            this.backgroundImage.width, 
            this.backgroundImage.height, 
            canvas.width, 
            fit
        );

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.drawImage(this.backgroundImage, x, y, width, height);
        ctx.restore();
    }

    /**
     * Calculate background image dimensions
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
     * Check if logo is uploaded
     */
    hasLogo() {
        return this.logoImage !== null;
    }    /**
     * Check if background is uploaded
     */
    hasBackground() {
        return this.backgroundImage !== null;
    }
}

export default ImageManager;
