"""
services/email.py — AWS SES email delivery via SMTP.

Uses Python's built-in smtplib so no extra dependencies are needed.
All configuration is read from environment variables — swap credentials
or switch regions without touching code.

Environment variables required:
    AWS_SES_FROM_EMAIL   Verified sender address (e.g. no-reply@zygotrix.com)
    AWS_SES_USERNAME     SES SMTP username  (IAM access key ID)
    AWS_SES_PASSWORD     SES SMTP password  (derived SES SMTP secret)
    AWS_SES_REGION       SES region (default: us-east-1)
"""

import logging
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger(__name__)

# ── Configuration ──────────────────────────────────────────────────────────────

_SMTP_PORT = 587   # STARTTLS


def _smtp_host() -> str:
    region = os.getenv("AWS_SES_REGION", "us-east-1")
    return f"email-smtp.{region}.amazonaws.com"


def _credentials() -> tuple[str, str]:
    username = os.getenv("AWS_SES_USERNAME", "")
    password = os.getenv("AWS_SES_PASSWORD", "")
    if not username or not password:
        raise EnvironmentError(
            "AWS_SES_USERNAME and AWS_SES_PASSWORD must be set in .env"
        )
    return username, password


def _from_address() -> str:
    addr = os.getenv("AWS_SES_FROM_EMAIL", "")
    if not addr:
        raise EnvironmentError("AWS_SES_FROM_EMAIL must be set in .env")
    return addr


# ── Core sender ────────────────────────────────────────────────────────────────


def send_email(*, to: str, subject: str, html: str, text: str) -> None:
    """
    Send a transactional email via AWS SES SMTP.

    Args:
        to:      Recipient email address.
        subject: Email subject line.
        html:    HTML body (shown in modern email clients).
        text:    Plain-text fallback (shown in text-only clients).

    Raises:
        EnvironmentError: If SES credentials are not configured.
        smtplib.SMTPException: On delivery failure.
    """
    from_addr         = _from_address()
    username, password = _credentials()
    host              = _smtp_host()

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = f"TradeMate <{from_addr}>"
    msg["To"]      = to

    msg.attach(MIMEText(text, "plain"))
    msg.attach(MIMEText(html, "html"))

    logger.info("[EMAIL] Sending %r to %s via %s", subject, to, host)

    with smtplib.SMTP(host, _SMTP_PORT) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(username, password)
        server.sendmail(from_addr, to, msg.as_string())

    logger.info("[EMAIL] Delivered to %s", to)


# ── Templated senders ──────────────────────────────────────────────────────────


def send_otp_email(
    *, to: str, otp: str, expires_minutes: int = 10, purpose: str = "reset"
) -> None:
    """
    Send an OTP email.

    Args:
        purpose: "reset" for password-reset flow, "registration" for email verification.
    """
    if purpose == "registration":
        subject    = "Verify your TradeMate account"
        heading    = "Verify your email"
        body_line  = "Use the code below to verify your email address and activate your TradeMate account."
        footer_tip = "If you did not create a TradeMate account, you can safely ignore this email."
        text_intro = f"Your TradeMate verification code is: {otp}"
    else:
        subject    = "Your TradeMate password reset code"
        heading    = "Password Reset"
        body_line  = "Use the code below to reset your TradeMate password."
        footer_tip = "If you did not request a password reset, you can safely ignore this email."
        text_intro = f"Your TradeMate password reset code is: {otp}"

    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:40px;">
      <div style="max-width:480px; margin:auto; background:#fff; border-radius:8px;
                  padding:40px; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <h2 style="color:#18181b; margin-top:0;">{heading}</h2>
        <p style="color:#52525b;">
          {body_line}
          This code expires in <strong>{expires_minutes} minutes</strong>.
        </p>
        <div style="text-align:center; margin:32px 0;">
          <span style="display:inline-block; letter-spacing:10px; font-size:36px;
                       font-weight:700; color:#6d28d9; background:#f5f3ff;
                       padding:16px 28px; border-radius:8px;">
            {otp}
          </span>
        </div>
        <p style="color:#71717a; font-size:13px;">
          {footer_tip}
          Do not share this code with anyone.
        </p>
        <hr style="border:none; border-top:1px solid #e4e4e7; margin:24px 0;" />
        <p style="color:#a1a1aa; font-size:11px; margin:0;">
          TradeMate &mdash; International Trade Intelligence
        </p>
      </div>
    </body>
    </html>
    """

    text = (
        f"{text_intro}\n\n"
        f"This code expires in {expires_minutes} minutes.\n"
        "If you did not request this, ignore this email."
    )

    send_email(to=to, subject=subject, html=html, text=text)
