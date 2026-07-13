"""
파일명: backend/lib/PasswordResetMail.py
설명: 비밀번호 재설정 링크 생성과 SMTP 발송 어댑터
"""

from __future__ import annotations

from dataclasses import dataclass
from email.message import EmailMessage
import smtplib
import ssl
from typing import Protocol
from urllib.parse import urlencode, urlparse


class PasswordResetSender(Protocol):
    def send(self, recipient: str, resetLink: str) -> None: ...


@dataclass(frozen=True)
class PasswordResetMailConfig:
    enabled: bool = False
    publicOrigin: str = ""
    smtpHost: str = ""
    smtpPort: int = 587
    smtpUsername: str = ""
    smtpPassword: str = ""
    fromAddress: str = ""
    useTls: bool = True
    useSsl: bool = False


class SmtpPasswordResetSender:
    def __init__(self, config: PasswordResetMailConfig):
        self.config = config

    def send(self, recipient: str, resetLink: str) -> None:
        message = EmailMessage()
        message["Subject"] = "비밀번호 재설정 안내"
        message["From"] = self.config.fromAddress
        message["To"] = recipient
        message.set_content(
            "아래 링크에서 30분 이내에 비밀번호를 재설정해 주세요.\n\n"
            f"{resetLink}\n\n"
            "본인이 요청하지 않았다면 이 메일을 무시하세요."
        )

        tlsContext = ssl.create_default_context()
        smtpClass = smtplib.SMTP_SSL if self.config.useSsl else smtplib.SMTP
        smtpOptions = {
            "host": self.config.smtpHost,
            "port": self.config.smtpPort,
            "timeout": 10,
        }
        if self.config.useSsl:
            smtpOptions["context"] = tlsContext
        with smtpClass(**smtpOptions) as smtp:
            if self.config.useTls and not self.config.useSsl:
                smtp.starttls(context=tlsContext)
            if self.config.smtpUsername:
                smtp.login(self.config.smtpUsername, self.config.smtpPassword)
            smtp.send_message(message)


mailConfig = PasswordResetMailConfig()
mailSender: PasswordResetSender | None = None


def _readBoolean(section, key: str, fallback: bool) -> bool:
    try:
        return bool(section.getboolean(key, fallback=fallback))
    except Exception:
        raw = str(section.get(key, str(fallback)) if section else fallback).strip().lower()
        return raw in {"1", "true", "yes", "on"}


def _normalizePublicOrigin(value: str, *, requireHttps: bool) -> str:
    raw = str(value or "").strip().rstrip("/")
    parsed = urlparse(raw)
    if (
        parsed.scheme not in {"http", "https"}
        or not parsed.hostname
        or parsed.username
        or parsed.password
        or parsed.path not in {"", "/"}
        or parsed.params
        or parsed.query
        or parsed.fragment
    ):
        raise ValueError("PASSWORD_RESET public_origin must be one explicit HTTP(S) origin")
    if requireHttps and parsed.scheme != "https":
        raise ValueError("PASSWORD_RESET public_origin must use HTTPS in production")
    return raw


def configurePasswordResetMail(config, *, runtime: str) -> PasswordResetMailConfig:
    global mailConfig, mailSender
    section = config["PASSWORD_RESET"] if "PASSWORD_RESET" in config else None
    enabled = _readBoolean(section, "enabled", False) if section is not None else False
    if not enabled:
        mailConfig = PasswordResetMailConfig()
        mailSender = None
        return mailConfig

    publicOrigin = str(section.get("public_origin", "") or "").strip()
    smtpHost = str(section.get("smtp_host", "") or "").strip()
    fromAddress = str(section.get("from_address", "") or "").strip()
    if not publicOrigin or not smtpHost or not fromAddress:
        raise ValueError(
            "PASSWORD_RESET enabled requires public_origin, smtp_host, and from_address"
        )
    normalizedRuntime = str(runtime or "").strip().upper()
    publicOrigin = _normalizePublicOrigin(
        publicOrigin,
        requireHttps=normalizedRuntime in {"PROD", "PRODUCTION"},
    )
    try:
        smtpPort = int(section.get("smtp_port", "587"))
    except (TypeError, ValueError) as error:
        raise ValueError("PASSWORD_RESET smtp_port must be an integer") from error
    if smtpPort <= 0 or smtpPort > 65535:
        raise ValueError("PASSWORD_RESET smtp_port is out of range")

    mailConfig = PasswordResetMailConfig(
        enabled=True,
        publicOrigin=publicOrigin,
        smtpHost=smtpHost,
        smtpPort=smtpPort,
        smtpUsername=str(section.get("smtp_username", "") or "").strip(),
        smtpPassword=str(section.get("smtp_password", "") or ""),
        fromAddress=fromAddress,
        useTls=_readBoolean(section, "use_tls", True),
        useSsl=_readBoolean(section, "use_ssl", False),
    )
    if mailConfig.useTls and mailConfig.useSsl:
        raise ValueError("PASSWORD_RESET use_tls and use_ssl cannot both be true")
    if normalizedRuntime in {"PROD", "PRODUCTION"} and not (
        mailConfig.useTls or mailConfig.useSsl
    ):
        raise ValueError("PASSWORD_RESET production SMTP requires TLS or SSL")
    mailSender = SmtpPasswordResetSender(mailConfig)
    return mailConfig


def setPasswordResetSender(sender: PasswordResetSender | None) -> None:
    global mailSender
    mailSender = sender


def buildPasswordResetLink(rawToken: str) -> str:
    if not mailConfig.enabled or not mailConfig.publicOrigin:
        raise RuntimeError("password reset mail is not configured")
    return f"{mailConfig.publicOrigin}/reset-password?{urlencode({'token': rawToken})}"


def sendPasswordReset(recipient: str, rawToken: str) -> bool:
    if not mailConfig.enabled or mailSender is None:
        return False
    mailSender.send(recipient, buildPasswordResetLink(rawToken))
    return True
