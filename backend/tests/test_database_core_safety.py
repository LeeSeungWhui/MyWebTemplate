import asyncio

import pytest


DATABASE_URL = "postgresql://ignored:ignored@127.0.0.1:5432/ignored"


def test_raw_sql_rejects_mixed_bind_and_inline_literal_before_driver_call():
    from lib.Database import DatabaseManager

    manager = DatabaseManager(DATABASE_URL)
    driverCalls: list[str] = []

    async def unexpectedExecute(**kwargs):
        driverCalls.append(str(kwargs["query"]))
        return 1

    manager.database.execute = unexpectedExecute
    query = "SELECT * FROM account WHERE tenant_id = :tenant_id AND status = 'active'"

    with pytest.raises(ValueError, match="DB_400_INLINE_LITERAL_UNSAFE"):
        asyncio.run(manager.execute(query, {"tenant_id": 7}))

    assert driverCalls == []


def test_named_query_preserves_static_literal_execution_with_bind_values():
    from lib.Database import DatabaseManager

    manager = DatabaseManager(DATABASE_URL)
    query = "SELECT * FROM account WHERE tenant_id = :tenant_id AND status = 'active'"
    manager.queryManager.setAll({"account.active": query}, {}, {})
    driverCalls: list[tuple[str, dict[str, object]]] = []

    async def fakeExecute(*, query: str, values: dict[str, object]):
        driverCalls.append((query, values))
        return 1

    manager.database.execute = fakeExecute

    assert asyncio.run(manager.executeQuery("account.active", {"tenant_id": 7})) == 1
    assert driverCalls == [(query, {"tenant_id": 7})]


def test_placeholder_extraction_ignores_quoted_text_and_sql_comments():
    from lib.Database import DatabaseManager

    manager = DatabaseManager(DATABASE_URL)
    query = """
        SELECT ':single', ':escaped '' :still_fake', "column:identifier"
        FROM account
        -- :line_comment
        WHERE tenant_id = :tenant_id
        /* :block_comment */
    """

    assert manager.extractPlaceholders(query) == {"tenant_id"}
    manager.validateBindParameters(query, {"tenant_id": 7})


def test_placeholder_extraction_ignores_dollar_and_escape_string_lookalikes():
    from lib.Database import DatabaseManager

    manager = DatabaseManager(DATABASE_URL)
    query = r"""
        SELECT $$:dollar_fake$$, $tag$:tagged_fake$tag$,
               E'escaped quote \':escape_fake', :actual
    """

    assert manager.extractPlaceholders(query) == {"actual"}
    manager.validateBindParameters(query, {"actual": 1})


def test_nested_block_comments_hide_placeholder_and_predicate_lookalikes():
    from lib.Database import DatabaseManager

    manager = DatabaseManager(DATABASE_URL)
    query = """
        SELECT * FROM account
        /* outer :outer_fake WHERE status = 'blocked'
           /* inner :inner_fake HAVING COUNT(*) > 99 */
           JOIN tenant t ON t.kind = 'commented'
        */
        WHERE tenant_id = :tenant_id
    """

    assert manager.extractPlaceholders(query) == {"tenant_id"}
    manager.validateBindParameters(query, {"tenant_id": 1})


def test_placeholder_extraction_does_not_concatenate_across_removed_segments():
    from lib.Database import DatabaseManager

    manager = DatabaseManager(DATABASE_URL)
    query = "SELECT :value/* separator */value_alias"

    assert manager.extractPlaceholders(query) == {"value"}
    manager.validateBindParameters(query, {"value": 1})


@pytest.mark.parametrize(
    "query",
    (
        "SELECT * FROM account a JOIN tenant t ON t.kind = 'primary'",
        "SELECT * FROM account WHERE 'active' = status",
        "SELECT role, COUNT(*) FROM account GROUP BY role HAVING COUNT(*) > 3",
        "SELECT * FROM account WHERE display_name LIKE 'demo%'",
        "SELECT * FROM account WHERE tenant_id IN (:tenant_id, 7)",
        "SELECT * FROM account WHERE created_at BETWEEN '2026-01-01' AND :end_at",
        "SELECT * FROM account WHERE created_at BETWEEN :start_at AND '2026-12-31'",
        "SELECT * FROM account WHERE created_at = DATE '2026-07-11'",
        "SELECT * FROM account WHERE TIMESTAMP '2026-07-11 12:00:00' < created_at",
        "SELECT role FROM account GROUP BY role HAVING MAX(age) > INTERVAL '1 year'",
        "SELECT * FROM account WHERE created_at BETWEEN SYMMETRIC DATE '2026-01-01' AND :end_at",
        "SELECT * FROM account WHERE created_at BETWEEN ASYMMETRIC :start_at AND TIMESTAMP '2026-12-31 23:59:59'",
        "SELECT * FROM account WHERE tenant_id = :limit AND status = 'active'",
        "SELECT * FROM account WHERE status = ('active')",
        "SELECT * FROM account WHERE status = ((('active'))) ",
        "SELECT * FROM account WHERE status = CAST('active' AS text)",
        "SELECT * FROM account WHERE CAST('active' AS text) = status",
        "SELECT * FROM account WHERE created_at >= TIMESTAMP(3) '2026-07-11 12:00:00.123'",
        "SELECT * FROM account WHERE created_at BETWEEN (DATE '2026-01-01') AND :end_at",
        "SELECT * FROM account WHERE status IN (:status, CAST('active' AS text))",
        "SELECT * FROM account WHERE status LIKE (('active%'))",
        "SELECT * FROM account WHERE status = CAST('active' AS text[])",
        "SELECT * FROM account WHERE CAST('active' AS pg_catalog.text) = status",
        "SELECT * FROM account WHERE status = CAST('active' AS double precision)",
        'SELECT * FROM account WHERE CAST(\'active\' AS "CustomType") = status',
    ),
)
def test_inline_literal_guard_covers_predicate_comparisons_in_like_and_between(query):
    from lib.Database import DatabaseManager

    manager = DatabaseManager(DATABASE_URL)
    placeholders = manager.extractPlaceholders(query)
    values = {placeholder: 1 for placeholder in placeholders} or None

    with pytest.raises(ValueError, match="DB_400_INLINE_LITERAL_UNSAFE"):
        manager.validateBindParameters(query, values)


@pytest.mark.parametrize(
    "query",
    (
        "SELECT * FROM account WHERE tenant_id = :tenant_id LIMIT 10",
        "SELECT * FROM account WHERE tenant_id = :tenant_id LIMIT 10 OFFSET 5",
        "SELECT * FROM account WHERE tenant_id = :tenant_id ORDER BY created_at LIMIT 10 OFFSET 5",
    ),
)
def test_bind_only_predicate_accepts_static_pagination_clause_literals(query):
    from lib.Database import DatabaseManager

    manager = DatabaseManager(DATABASE_URL)

    manager.validateBindParameters(query, {"tenant_id": 1})


def test_on_conflict_is_not_treated_as_join_predicate_region():
    from lib.Database import DatabaseManager

    manager = DatabaseManager(DATABASE_URL)
    query = """
        INSERT INTO account(id, status)
        VALUES(:id, :status)
        ON CONFLICT (id) DO UPDATE SET audit_label = 'upserted'
        WHERE account.id = :id
    """

    manager.validateBindParameters(query, {"id": 1, "status": "active"})


def test_bound_cast_with_nontrivial_target_remains_accepted():
    from lib.Database import DatabaseManager

    manager = DatabaseManager(DATABASE_URL)
    query = "SELECT * FROM account WHERE status = CAST(:status AS pg_catalog.text[])"

    manager.validateBindParameters(query, {"status": "active"})


def test_inline_literal_guard_ignores_comment_and_quoted_region_false_positives():
    from lib.Database import DatabaseManager

    manager = DatabaseManager(DATABASE_URL)
    query = """
        SELECT "WHERE hidden = 'quoted'" FROM account
        WHERE tenant_id = :tenant_id
        -- JOIN tenant t ON t.kind = 'commented'
        /* HAVING COUNT(*) > 99 */
    """

    manager.validateBindParameters(query, {"tenant_id": 1})


@pytest.mark.parametrize(
    ("managerMethod", "driverMethod"),
    (
        ("execute", "execute"),
        ("fetchOne", "fetch_one"),
        ("fetchAll", "fetch_all"),
    ),
)
def test_sql_count_increments_once_before_failed_driver_call(managerMethod, driverMethod):
    from lib.Database import DatabaseManager, getSqlCount, resetSqlCount

    manager = DatabaseManager(DATABASE_URL)
    countAtDriverCall: list[int] = []

    async def failingDriverCall(**kwargs):
        countAtDriverCall.append(getSqlCount())
        raise RuntimeError("driver failed")

    setattr(manager.database, driverMethod, failingDriverCall)
    resetSqlCount()

    with pytest.raises(RuntimeError, match="driver failed"):
        asyncio.run(getattr(manager, managerMethod)("SELECT :value", {"value": 1}))

    assert countAtDriverCall == [1]
    assert getSqlCount() == 1


def test_sql_count_is_shared_across_asyncio_gather_children():
    from lib.Database import DatabaseManager, getSqlCount, resetSqlCount

    manager = DatabaseManager(DATABASE_URL)

    async def fakeExecute(**kwargs):
        await asyncio.sleep(0)
        return 1

    manager.database.execute = fakeExecute

    async def runGather():
        resetSqlCount()
        await asyncio.gather(
            manager.execute("SELECT :value", {"value": 1}),
            manager.execute("SELECT :value", {"value": 2}),
        )
        return getSqlCount()

    assert asyncio.run(runGather()) == 2


def test_first_sql_count_read_initializes_counter_shared_by_gather_children():
    from lib.Database import DatabaseManager, getSqlCount, sqlCountVar

    manager = DatabaseManager(DATABASE_URL)

    async def fakeExecute(**kwargs):
        await asyncio.sleep(0)
        return 1

    manager.database.execute = fakeExecute

    async def runFromUninitializedContext():
        sqlCountVar.set(None)
        assert getSqlCount() == 0
        await asyncio.gather(
            manager.execute("SELECT :value", {"value": 1}),
            manager.execute("SELECT :value", {"value": 2}),
        )
        return getSqlCount()

    assert asyncio.run(runFromUninitializedContext()) == 2


def test_reset_sql_count_isolates_parent_from_already_created_child_context():
    from lib.Database import DatabaseManager, getSqlCount, resetSqlCount

    manager = DatabaseManager(DATABASE_URL)

    async def fakeExecute(**kwargs):
        return 1

    manager.database.execute = fakeExecute

    async def runResetIsolation():
        childStarted = asyncio.Event()
        releaseChild = asyncio.Event()
        resetSqlCount()

        async def child():
            childStarted.set()
            await releaseChild.wait()
            await manager.execute("SELECT :value", {"value": 1})
            return getSqlCount()

        childTask = asyncio.create_task(child())
        await childStarted.wait()
        resetSqlCount()
        releaseChild.set()
        childCount = await childTask
        return childCount, getSqlCount()

    assert asyncio.run(runResetIsolation()) == (1, 0)


def test_static_sql_literals_follow_default_and_reveal_masking_policy():
    from lib.Database import DatabaseManager

    manager = DatabaseManager(DATABASE_URL)
    jwtValue = "header.payload.signature0123456789"
    query = (
        "SELECT 'ordinary text', 'owner@example.com', "
        f"'{jwtValue}', 'Bearer secret-token', :title"
    )

    masked = manager.renderQueryForLog(query, {"title": "bound ordinary"}, False)
    assert "ordinary text" not in masked
    assert "owner@example.com" not in masked
    assert jwtValue not in masked
    assert "Bearer secret-token" not in masked
    assert "bound ordinary" not in masked
    assert masked.count("'***'") == 5

    revealed = manager.renderQueryForLog(query, {"title": "bound ordinary"}, True)
    assert "'ordinary text'" in revealed
    assert "'bound ordinary'" in revealed
    assert "owner@example.com" not in revealed
    assert jwtValue not in revealed
    assert "Bearer secret-token" not in revealed
    assert revealed.count("'***'") == 3


def test_default_log_rendering_masks_static_numeric_literals_but_not_bound_rendering():
    from lib.Database import DatabaseManager

    manager = DatabaseManager(DATABASE_URL)
    query = "SELECT 42 AS positive, -7.5 AS negative, 6.02e+23 AS exponent, :bound AS bound"

    masked = manager.renderQueryForLog(query, {"bound": 9}, False)
    assert "42" not in masked
    assert "7.5" not in masked
    assert "6.02e+23" not in masked
    assert "9" not in masked
    assert masked.count("?") == 4

    revealed = manager.renderQueryForLog(query, {"bound": 9}, True)
    assert "42" in revealed
    assert "-7.5" in revealed
    assert "6.02e+23" in revealed
    assert "9 AS bound" in revealed


def test_default_log_rendering_masks_prefixed_and_underscored_numeric_tokens_only():
    from lib.Database import DatabaseManager

    manager = DatabaseManager(DATABASE_URL)
    query = "SELECT 0xCA_FE, 0b1010_0101, 0o7_55, 1_000_000, column0, :value_1"

    masked = manager.renderQueryForLog(query, {"value_1": 9}, False)
    assert "0xCA_FE" not in masked
    assert "0b1010_0101" not in masked
    assert "0o7_55" not in masked
    assert "1_000_000" not in masked
    assert "column0" in masked
    assert ":value_1" not in masked
    assert masked.count("?") == 5

    revealed = manager.renderQueryForLog(query, {"value_1": 9}, True)
    assert "0xCA_FE" in revealed
    assert "0b1010_0101" in revealed
    assert "0o7_55" in revealed
    assert "1_000_000" in revealed
    assert "column0" in revealed
    assert "9" in revealed


def test_dollar_and_escape_static_literals_follow_default_and_reveal_masking():
    from lib.Database import DatabaseManager

    manager = DatabaseManager(DATABASE_URL)
    jwtValue = "header.payload.signature0123456789"
    query = (
        "SELECT $$ordinary dollar$$, E'ordinary escape', "
        "$mail$owner@example.com$mail$, "
        f"$jwt${jwtValue}$jwt$, E'Bearer secret-token'"
    )

    masked = manager.renderQueryForLog(query, None, False)
    assert "ordinary dollar" not in masked
    assert "ordinary escape" not in masked
    assert "owner@example.com" not in masked
    assert jwtValue not in masked
    assert "Bearer secret-token" not in masked
    assert masked.count("'***'") == 5

    revealed = manager.renderQueryForLog(query, None, True)
    assert "$$ordinary dollar$$" in revealed
    assert "E'ordinary escape'" in revealed
    assert "owner@example.com" not in revealed
    assert jwtValue not in revealed
    assert "Bearer secret-token" not in revealed
    assert revealed.count("'***'") == 3
