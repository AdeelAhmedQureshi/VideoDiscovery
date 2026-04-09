# app/services/email_service.py

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from ..config import settings


class EmailService:
    """Email service for sending emails"""

    @staticmethod
    def _from_header() -> str:
        """Build a valid RFC-like From header for SMTP providers."""
        smtp_user = (settings.SMTP_USER or "").strip()
        configured = (settings.EMAIL_FROM or "").strip()

        # If EMAIL_FROM is an email address, use it directly.
        if "@" in configured:
            return configured

        # If EMAIL_FROM is only a display name, combine it with SMTP user.
        if configured and smtp_user:
            return f"{configured} <{smtp_user}>"

        # Safe fallback so SMTP sender is always a real email address.
        return smtp_user or configured

    @staticmethod
    def send_password_reset_otp_email(to_email: str, otp: str) -> bool:
        """
        Send password reset OTP to user

        Args:
            to_email: Recipient email address
            otp: 6-digit OTP code

        Returns:
            True if email sent successfully, False otherwise
        """
        try:
            subject = "Password Reset OTP - VideoDiscovery"
            html_content = f"""
            <html>
                <body>
                    <h2>Password Reset Verification</h2>
                    <p>Use the OTP below to continue resetting your password:</p>
                    <p style=\"font-size: 22px; font-weight: bold; letter-spacing: 3px;\">{otp}</p>
                    <p>This OTP will expire in 10 minutes.</p>
                    <p>If you did not request this, please ignore this email.</p>
                    <br>
                    <p>Best regards,<br>VideoDiscovery Team</p>
                </body>
            </html>
            """

            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = EmailService._from_header()
            message["To"] = to_email

            html_part = MIMEText(html_content, "html")
            message.attach(html_part)

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(message)

            return True

        except Exception as e:
            print(f"Error sending password reset OTP email: {e}")
            return False

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
            message["From"] = EmailService._from_header()
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

    @staticmethod
    def send_reactivation_code_email(to_email: str, code: str) -> bool:
        """
        Send account reactivation verification code

        Args:
            to_email: Recipient email address
            code: 6-digit verification code

        Returns:
            True if email sent successfully, False otherwise
        """
        try:
            subject = "Reactivate Your Account - VideoDiscovery"
            html_content = f"""
            <html>
                <body>
                    <h2>Account Reactivation</h2>
                    <p>We received a request to reactivate your account.</p>
                    <p>Your verification code is:</p>
                    <p style=\"font-size: 20px; font-weight: bold;\">{code}</p>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you did not request this, you can ignore this email.</p>
                    <br>
                    <p>Best regards,<br>VideoDiscovery Team</p>
                </body>
            </html>
            """

            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = EmailService._from_header()
            message["To"] = to_email

            html_part = MIMEText(html_content, "html")
            message.attach(html_part)

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(message)

            return True

        except Exception as e:
            print(f"Error sending reactivation email: {e}")
            return False
