import os
import sys
import tempfile
import importlib.util


BASE_DIR = os.path.dirname(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)


def _load_seed_module():
    path = os.path.join(BASE_DIR, 'scripts', 'users_seed.py')
    spec = importlib.util.spec_from_file_location('users_seed', path)
    mod = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(mod)  # type: ignore
    return mod


def test_user_seed_init_and_demo():
    mod = _load_seed_module()
    with tempfile.TemporaryDirectory() as td:
        db_path = os.path.join(td, 'users.db')
        con = mod.connect(db_path)
        try:
            mod.ensure_table(con)
            # initially empty
            cnt = con.execute('SELECT COUNT(*) FROM T_USER').fetchone()[0]
            assert cnt == 0
            # seed demo
            mod.seed_demo(con)
            cnt2 = con.execute('SELECT COUNT(*) FROM T_USER').fetchone()[0]
            assert cnt2 == 1
        finally:
            con.close()

