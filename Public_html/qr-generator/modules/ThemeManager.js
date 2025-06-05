/**
 * Theme Manager Module
 * Handles theme switching and persistence
 */
export class ThemeManager {
    constructor() {
        this.loadTheme();
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        this.applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    }

    /**
     * Load saved theme from localStorage
     */
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.applyTheme(savedTheme);
    }

    /**
     * Apply theme to document
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        const themeIcon = document.querySelector('#theme-toggle i');
        if (themeIcon) {
            themeIcon.className = `fas fa-${theme === 'light' ? 'moon' : 'sun'}`;
        }
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        return localStorage.getItem('theme') || 'light';
    }

    /**
     * Set specific theme
     */
    setTheme(theme) {
        if (!['light', 'dark'].includes(theme)) {
            console.error('Invalid theme:', theme);
            return;
        }
        
        this.applyTheme(theme);
        localStorage.setItem('theme', theme);
    }
}
