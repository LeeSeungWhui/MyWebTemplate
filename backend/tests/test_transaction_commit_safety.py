from __future__ import annotations

import asyncio

import pytest

from lib import Transaction as transactionModule


class CommitFailure(RuntimeError):
    pass


class FakeTransactionContext:
    def __init__(self, events: list[object], *, failCommit: bool = False):
        self.events = events
        self.failCommit = failCommit

    async def __aenter__(self):
        self.events.append("tx.enter")
        return self

    async def __aexit__(self, excType, exc, traceback):
        self.events.append(("tx.exit", excType))
        if excType is None and self.failCommit:
            raise CommitFailure("commit failed")
        return False


class FakeDatabase:
    def __init__(self, transactionContext: FakeTransactionContext):
        self.transactionContext = transactionContext

    def transaction(self, **options):
        return self.transactionContext


class SequencedFakeDatabase:
    def __init__(self, transactionContexts: list[FakeTransactionContext]):
        self.transactionContexts = transactionContexts
        self.transactionCalls = 0

    def transaction(self, **options):
        transactionContext = self.transactionContexts[self.transactionCalls]
        self.transactionCalls += 1
        return transactionContext


class FakeManager:
    def __init__(self, transactionContext: FakeTransactionContext):
        self.database = FakeDatabase(transactionContext)


class RecordingLogger:
    def __init__(self, events: list[object]):
        self.events = events
        self.messages: list[tuple[str, str]] = []

    def info(self, message: str) -> None:
        self.messages.append(("info", message))
        if "tx.commit" in message:
            self.events.append("tx.commit.log")
        elif "tx.end" in message:
            self.events.append("tx.end.log")

    def error(self, message: str) -> None:
        self.messages.append(("error", message))


def installFakeTransaction(
    monkeypatch,
    events: list[object],
    *,
    failCommit: bool = False,
) -> RecordingLogger:
    transactionContext = FakeTransactionContext(events, failCommit=failCommit)
    monkeypatch.setitem(
        transactionModule.dbManagers,
        "commit_safety_db",
        FakeManager(transactionContext),
    )
    logger = RecordingLogger(events)
    monkeypatch.setattr(transactionModule, "logger", logger)
    monkeypatch.setattr(transactionModule, "getRequestId", lambda: "test-request")
    monkeypatch.setattr(transactionModule.DB, "getSqlCount", lambda: 0)
    return logger


def testTransactionCompletesCommitBeforeLoggingAndReturning(monkeypatch):
    events: list[object] = []
    installFakeTransaction(monkeypatch, events)

    @transactionModule.transaction("commit_safety_db")
    async def operation():
        events.append("operation")
        return "success"

    result = asyncio.run(operation())
    events.append("returned")

    assert result == "success"
    assert events.index(("tx.exit", None)) < events.index("tx.commit.log")
    assert events.index("tx.commit.log") < events.index("returned")


def testTransactionPropagatesCommitFailureInsteadOfReturningSuccess(monkeypatch):
    events: list[object] = []
    logger = installFakeTransaction(monkeypatch, events, failCommit=True)

    @transactionModule.transaction("commit_safety_db")
    async def operation():
        events.append("operation")
        return "must-not-return"

    with pytest.raises(CommitFailure, match="commit failed"):
        asyncio.run(operation())

    assert events.count(("tx.exit", None)) == 1
    assert not any("tx.commit" in message for level, message in logger.messages)
    assert any("tx.rollback" in message for level, message in logger.messages)
    assert "tx.end.log" in events


def testTransactionRetriesCommitFailureAndReturnsOnlySuccessfulAttempt(monkeypatch):
    events: list[object] = []
    transactionContexts = [
        FakeTransactionContext(events, failCommit=True),
        FakeTransactionContext(events),
    ]
    database = SequencedFakeDatabase(transactionContexts)
    manager = FakeManager(transactionContexts[0])
    manager.database = database
    monkeypatch.setitem(transactionModule.dbManagers, "commit_safety_db", manager)

    logger = RecordingLogger(events)
    monkeypatch.setattr(transactionModule, "logger", logger)
    monkeypatch.setattr(transactionModule, "getRequestId", lambda: "test-request")
    monkeypatch.setattr(transactionModule.DB, "getSqlCount", lambda: 0)
    backoffAttempts: list[int] = []

    async def noOpSleepBackoff(attempt: int) -> None:
        backoffAttempts.append(attempt)

    monkeypatch.setattr(transactionModule, "sleepBackoff", noOpSleepBackoff)
    operationCalls = 0

    @transactionModule.transaction(
        "commit_safety_db",
        retries=1,
        retryOn=(CommitFailure,),
    )
    async def operation():
        nonlocal operationCalls
        operationCalls += 1
        return f"attempt-{operationCalls}-result"

    result = asyncio.run(operation())

    assert result == "attempt-2-result"
    assert result != "attempt-1-result"
    assert operationCalls == 2
    assert database.transactionCalls == 2
    assert backoffAttempts == [1]
    assert events.count(("tx.exit", None)) == 2
    assert sum("tx.commit" in message for level, message in logger.messages) == 1
