"""
Validate OpenAPI schema exported by FastAPI app using openapi-spec-validator.
Runs in CI without launching a server by importing the app and building schema.
"""

import json

from openapi_spec_validator import validate_spec
from openapi_spec_validator.readers import read_from_filename


def main():
    # Import app and build schema
    from backend.server import app  # type: ignore

    schema = app.openapi()
    # openapi-spec-validator v0.x expects dict-like; validate directly
    validate_spec(schema)
    print("OpenAPI schema validation OK. version=", schema.get("openapi"))


if __name__ == "__main__":
    main()

