from pathlib import Path

from db_support import TEST_DB_MUTATION_APPROVAL_ENV, resolvePgTestSettings


def writeConfig(
    root: Path,
    *,
    database: str = "sample_test",
    host: str = "127.0.0.1",
    runtime: str = "TEST",
) -> None:
    (root / "config.test.ini").write_text(
        "\n".join(
            [
                "[DATABASE]",
                "type = postgresql",
                f"host = {host}",
                "port = 5432",
                f"database = {database}",
                "user = tester",
                "password = test-only",
                "",
                "[SERVER]",
                f"runtime = {runtime}",
            ]
        ),
        encoding="utf-8",
    )


def testPgSettingsRequireExplicitMutationApproval(tmp_path, monkeypatch):
    writeConfig(tmp_path)
    monkeypatch.delenv(TEST_DB_MUTATION_APPROVAL_ENV, raising=False)

    settings, reason = resolvePgTestSettings(str(tmp_path))

    assert settings is None
    assert TEST_DB_MUTATION_APPROVAL_ENV in str(reason)


def testPgSettingsAllowApprovedLoopbackTestDatabase(tmp_path, monkeypatch):
    writeConfig(tmp_path)
    monkeypatch.setenv(TEST_DB_MUTATION_APPROVAL_ENV, "1")

    settings, reason = resolvePgTestSettings(str(tmp_path))

    assert reason is None
    assert settings is not None
    assert settings["database"] == "sample_test"


def testPgSettingsRejectNonTestDatabase(tmp_path, monkeypatch):
    writeConfig(tmp_path, database="sample")
    monkeypatch.setenv(TEST_DB_MUTATION_APPROVAL_ENV, "1")

    settings, reason = resolvePgTestSettings(str(tmp_path))

    assert settings is None
    assert "must end with '_test'" in str(reason)


def testPgSettingsRejectRemoteHost(tmp_path, monkeypatch):
    writeConfig(tmp_path, host="db.example.test")
    monkeypatch.setenv(TEST_DB_MUTATION_APPROVAL_ENV, "1")

    settings, reason = resolvePgTestSettings(str(tmp_path))

    assert settings is None
    assert "must be loopback" in str(reason)


def testPgSettingsRejectNonTestRuntime(tmp_path, monkeypatch):
    writeConfig(tmp_path, runtime="PROD")
    monkeypatch.setenv(TEST_DB_MUTATION_APPROVAL_ENV, "1")

    settings, reason = resolvePgTestSettings(str(tmp_path))

    assert settings is None
    assert "SERVER.runtime must be TEST" in str(reason)
