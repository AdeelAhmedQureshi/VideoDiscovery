# app/services/email_service.py

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from ..config import settings


class EmailService:
    """Email service for sending emails"""

    @staticmethod
    def send_reset_password_email(to_email: str, reset_token: str) -> bool:
        """
        Send password reset email to user

        Args:
            to_email: Recipient email address
            reset_token: Password reset token

        Returns:
            True if email sent successfully, False otherwise
        """
        try:
            # Construct reset link (adjust based on your frontend URL)
            reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"

            # Email content
            subject = "Password Reset Request - VideoDiscovery"
            html_content = f"""
            <html>
                <body>
                    <h2>Password Reset Request</h2>
                    <p>You have requested to reset your password.</p>
                    <p>Click the link below to reset your password:</p>
                    <p><a href="{reset_link}">Reset Password</a></p>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <br>
                    <p>Best regards,<br>VideoDiscovery Team</p>
                </body>
            </html>
            """

            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = settings.EMAIL_FROM
            message["To"] = to_email

            # Attach HTML content
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)

            # Send email via SMTP
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(message)

            return True

        except Exception as e:
            print(f"Error sending email: {e}")
            return False
