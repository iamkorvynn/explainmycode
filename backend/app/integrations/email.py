import logging
import smtplib
import ssl
from email.message import EmailMessage
from urllib.parse import quote_plus

from app.core.config import settings


logger = logging.getLogger(__name__)


class EmailClient:
    def send_password_reset(self, recipient: str, reset_token: str) -> None:
        reset_link = f"{settings.frontend_base_url.rstrip('/')}/reset-password?token={quote_plus(reset_token)}"

        if not settings.smtp_host:
            logger.info("SMTP not configured. Password reset link for %s: %s", recipient, reset_link)
            return

        message = EmailMessage()
        message["Subject"] = "Reset your ExplainMyCode password"
        message["From"] = settings.email_from
        message["To"] = recipient
        message.set_content(
            "We received a request to reset your ExplainMyCode password.\n\n"
            f"Open this link to choose a new password:\n{reset_link}\n\n"
            "If you did not request this, you can ignore this email."
        )

        context = ssl.create_default_context()
        if settings.smtp_use_ssl:
            with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, context=context, timeout=20) as server:
                self._deliver(server, message)
            return

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as server:
            server.ehlo()
            if settings.smtp_use_tls:
                server.starttls(context=context)
                server.ehlo()
            self._deliver(server, message)

    def _deliver(self, server: smtplib.SMTP, message: EmailMessage) -> None:
        if settings.smtp_user and settings.smtp_password:
            server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(message)
