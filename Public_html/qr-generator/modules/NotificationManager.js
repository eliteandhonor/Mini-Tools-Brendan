/**
 * Notification Manager Module
 * Handles success/error messages and user feedback
 */
export class NotificationManager {
    constructor() {
        this.addNotificationStyles();
    }

    /**
     * Show success notification
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    /**
     * Show error notification
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Show info notification
     */
    showInfo(message) {
        this.showNotification(message, 'info');
    }

    /**
     * Show warning notification
     */
    showWarning(message) {
        this.showNotification(message, 'warning');
    }

    /**
     * Show notification with specified type
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = this.getIcon(type);
        notification.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });
        
        // Position notification
        this.positionNotification(notification);
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Auto-remove after delay
        setTimeout(() => {
            this.removeNotification(notification);
        }, type === 'error' ? 5000 : 3000);
        
        // Add entrance animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
    }

    /**
     * Remove notification with animation
     */
    removeNotification(notification) {
        if (!notification || !notification.parentNode) return;
        
        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    /**
     * Position notification in container
     */
    positionNotification(notification) {
        const existingNotifications = document.querySelectorAll('.notification');
        let topOffset = 20;
        
        existingNotifications.forEach(existing => {
            if (existing !== notification) {
                topOffset += existing.offsetHeight + 10;
            }
        });
        
        notification.style.top = `${topOffset}px`;
    }

    /**
     * Get icon for notification type
     */
    getIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        return icons[type] || icons.info;
    }

    /**
     * Add notification styles to document
     */
    addNotificationStyles() {
        if (document.getElementById('notification-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                padding: 16px;
                min-width: 300px;
                max-width: 400px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 10000;
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.3s ease;
                border-left: 4px solid;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .notification.hide {
                transform: translateX(100%);
                opacity: 0;
            }
            
            .notification-success {
                border-left-color: #22c55e;
                color: #15803d;
            }
            
            .notification-success i:first-child {
                color: #22c55e;
            }
            
            .notification-error {
                border-left-color: #ef4444;
                color: #dc2626;
            }
            
            .notification-error i:first-child {
                color: #ef4444;
            }
            
            .notification-warning {
                border-left-color: #f59e0b;
                color: #d97706;
            }
            
            .notification-warning i:first-child {
                color: #f59e0b;
            }
            
            .notification-info {
                border-left-color: #3b82f6;
                color: #2563eb;
            }
            
            .notification-info i:first-child {
                color: #3b82f6;
            }
            
            .notification span {
                flex: 1;
                word-wrap: break-word;
            }
            
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                color: #6b7280;
                transition: background-color 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                min-width: 24px;
                height: 24px;
            }
            
            .notification-close:hover {
                background-color: #f3f4f6;
                color: #374151;
            }
            
            .notification-close i {
                font-size: 12px;
            }
            
            /* Dark theme support */
            [data-theme="dark"] .notification {
                background: #1f2937;
                color: #f3f4f6;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
            }
            
            [data-theme="dark"] .notification-close {
                color: #9ca3af;
            }
            
            [data-theme="dark"] .notification-close:hover {
                background-color: #374151;
                color: #f3f4f6;
            }
            
            /* Mobile responsive */
            @media (max-width: 480px) {
                .notification {
                    right: 10px;
                    left: 10px;
                    min-width: auto;
                    max-width: none;
                    transform: translateY(-100%);
                }
                
                .notification.show {
                    transform: translateY(0);
                }
                
                .notification.hide {
                    transform: translateY(-100%);
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Clear all notifications
     */
    clearAll() {
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => {
            this.removeNotification(notification);
        });
    }
}
