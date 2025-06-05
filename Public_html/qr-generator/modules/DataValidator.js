/**
 * Data Validation Module
 * Handles input validation and data processing for different QR types
 */
export class DataValidator {
    constructor() {
        this.currentType = 'text';
    }

    /**
     * Set current QR type for validation
     */
    setCurrentType(type) {
        this.currentType = type;
    }

    /**
     * Validate current input based on selected type
     */
    validateInput() {
        const type = this.currentType;
        
        switch (type) {
            case 'text':
                return this.validateText();
            case 'url':
                return this.validateURL();
            case 'email':
                return this.validateEmail();
            case 'phone':
                return this.validatePhone();
            case 'sms':
                return this.validateSMS();
            case 'wifi':
                return this.validateWiFi();
            default:
                return false;
        }
    }

    /**
     * Validate text input
     */
    validateText() {
        const input = document.getElementById('text-input');
        const isValid = input && input.value.trim().length > 0;
        this.updateInputState(input, isValid);
        return isValid;
    }

    /**
     * Validate URL input
     */
    validateURL() {
        const input = document.getElementById('url-input');
        const value = input?.value.trim();
        const isValid = value && this.isValidURL(value);
        this.updateInputState(input, isValid);
        return isValid;
    }

    /**
     * Validate email input
     */
    validateEmail() {
        const emailInput = document.getElementById('email-to');
        const value = emailInput?.value.trim();
        const isValid = value && this.isValidEmail(value);
        this.updateInputState(emailInput, isValid);
        return isValid;
    }

    /**
     * Validate phone input
     */
    validatePhone() {
        const input = document.getElementById('phone-input');
        const value = input?.value.trim();
        const isValid = value && value.length >= 10;
        this.updateInputState(input, isValid);
        return isValid;
    }

    /**
     * Validate SMS input
     */
    validateSMS() {
        const numberInput = document.getElementById('sms-number');
        const value = numberInput?.value.trim();
        const isValid = value && value.length >= 10;
        this.updateInputState(numberInput, isValid);
        return isValid;
    }

    /**
     * Validate WiFi input
     */
    validateWiFi() {
        const ssidInput = document.getElementById('wifi-ssid');
        const value = ssidInput?.value.trim();
        const isValid = value && value.length > 0;
        this.updateInputState(ssidInput, isValid);
        return isValid;
    }

    /**
     * Update input visual state based on validation
     */
    updateInputState(input, isValid) {
        if (!input) return;

        input.classList.remove('valid', 'invalid');
        if (input.value.trim()) {
            input.classList.add(isValid ? 'valid' : 'invalid');
        }
    }

    /**
     * URL validation helper
     */
    isValidURL(string) {
        try {
            const url = new URL(string.startsWith('http') ? string : `https://${string}`);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
            return false;
        }
    }

    /**
     * Email validation helper
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Get QR data based on current type
     */
    getQRData() {
        try {
            switch (this.qrGenerator.currentType) {
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
                    throw new Error(`Unknown QR type: ${this.qrGenerator.currentType}`);
            }
        } catch (error) {
            console.error('Error getting QR data:', error);
            return null;
        }
    }

    /**
     * Get text data
     */
    getTextData() {
        const input = document.getElementById('text-input');
        return input ? input.value.trim() : '';
    }

    /**
     * Get URL data
     */
    getURLData() {
        const input = document.getElementById('url-input');
        const url = input ? input.value.trim() : '';
        return url.startsWith('http') ? url : `https://${url}`;
    }

    /**
     * Get email data
     */
    getEmailData() {
        const to = document.getElementById('email-to')?.value.trim() || '';
        const subject = document.getElementById('email-subject')?.value.trim() || '';
        const body = document.getElementById('email-body')?.value.trim() || '';
        
        let emailData = `mailto:${to}`;
        const params = [];
        
        if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
        if (body) params.push(`body=${encodeURIComponent(body)}`);
        
        if (params.length > 0) {
            emailData += '?' + params.join('&');
        }
        
        return emailData;
    }

    /**
     * Get phone data
     */
    getPhoneData() {
        const input = document.getElementById('phone-input');
        return input ? `tel:${input.value.trim()}` : '';
    }

    /**
     * Get SMS data
     */
    getSMSData() {
        const number = document.getElementById('sms-number')?.value.trim() || '';
        const message = document.getElementById('sms-message')?.value.trim() || '';
        
        let smsData = `sms:${number}`;
        if (message) {
            smsData += `?body=${encodeURIComponent(message)}`;
        }
        
        return smsData;
    }

    /**
     * Get WiFi data
     */
    getWiFiData() {
        const ssid = document.getElementById('wifi-ssid')?.value.trim() || '';
        const password = document.getElementById('wifi-password')?.value.trim() || '';
        const security = document.getElementById('wifi-security')?.value || 'WPA';
        const hidden = document.getElementById('wifi-hidden')?.checked || false;
        
        return `WIFI:T:${security};S:${ssid};P:${password};H:${hidden ? 'true' : 'false'};;`;
    }

    /**
     * Get validated data for QR code generation
     */
    getValidatedData(type) {
        this.setCurrentType(type);
        
        if (!this.validateInput()) {
            return null;
        }
        
        switch (type) {
            case 'text':
                return document.getElementById('text-input')?.value.trim();
            case 'url':
                return document.getElementById('url-input')?.value.trim();
            case 'email':
                return this.generateEmailData();
            case 'phone':
                return `tel:${document.getElementById('phone-input')?.value.trim()}`;
            case 'sms':
                return this.generateSMSData();
            case 'wifi':
                return this.generateWiFiData();
            default:
                return null;
        }
    }
}
