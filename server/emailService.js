const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        this.defaultFrom = process.env.EMAIL_FROM || 'alerts@fitnessapp.com';
        this.adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    }

    async sendAlertEmail(alert) {
        const emailContent = this.generateAlertEmailContent(alert);
        
        try {
            await this.transporter.sendMail({
                from: this.defaultFrom,
                to: this.adminEmails.join(','),
                subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
                html: emailContent
            });
            console.log('Alert email sent successfully');
        } catch (error) {
            console.error('Error sending alert email:', error);
        }
    }

    generateAlertEmailContent(alert) {
        const severityColor = {
            warning: '#FFA500',
            critical: '#FF0000'
        };

        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: ${severityColor[alert.severity]}; color: white; padding: 20px; text-align: center;">
                    <h2 style="margin: 0;">${alert.title}</h2>
                </div>
                
                <div style="padding: 20px; background-color: #f8f9fa;">
                    <p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
                    <p><strong>Time:</strong> ${new Date(alert.timestamp).toLocaleString()}</p>
                    <p><strong>Message:</strong> ${alert.message}</p>
                    
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                        <p><strong>Server Details:</strong></p>
                        <ul>
                            <li>Memory Usage: ${alert.details?.memory || 'N/A'}</li>
                            <li>CPU Usage: ${alert.details?.cpu || 'N/A'}</li>
                            <li>Error Rate: ${alert.details?.errorRate || 'N/A'}</li>
                        </ul>
                    </div>
                </div>
                
                <div style="text-align: center; padding: 20px; background-color: #eee;">
                    <p style="margin: 0; color: #666;">
                        This is an automated alert from your Fitness App monitoring system.
                    </p>
                </div>
            </div>
        `;
    }

    async sendTestEmail() {
        try {
            await this.transporter.sendMail({
                from: this.defaultFrom,
                to: this.adminEmails[0],
                subject: 'Email Service Test',
                text: 'This is a test email from your Fitness App monitoring system.'
            });
            return true;
        } catch (error) {
            console.error('Test email failed:', error);
            return false;
        }
    }

    async verifyConnection() {
        try {
            await this.transporter.verify();
            return true;
        } catch (error) {
            console.error('Email service verification failed:', error);
            return false;
        }
    }
}

// Initialize email service
const emailService = new EmailService();

// Export for use in other files
module.exports = EmailService; 