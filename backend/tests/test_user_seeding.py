import os
import sys
import tempfile
import importlib.util


baseDir = os.path.dirname(os.path.dirname(__file__))
if baseDir not in sys.path:
    sys.path.insert(0, baseDir)


def loadSeedModule():
    path = os.path.join(baseDir, "scripts", "users_seed.py")
    spec = importlib.util.spec_from_file_location("users_seed", path)
    mod = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(mod)  # type: ignore
    return mod


def testUserSeedInitAndDemo():
    mod = loadSeedModule()
    with tempfile.TemporaryDirectory() as td:
        dbPath = os.path.join(td, "users.db")
        con = mod.connect(dbPath)
        try:
            mod.ensureTable(con)
            # initially empty
            cnt = con.execute("SELECT COUNT(*) FROM user_template").fetchone()[0]
            assert cnt == 0
            # seed demo
            mod.seedDemo(con)
            cnt2 = con.execute("SELECT COUNT(*) FROM user_template").fetchone()[0]
            assert cnt2 == 1
        finally:
            con.close()
