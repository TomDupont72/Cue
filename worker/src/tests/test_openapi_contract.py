import json
import unittest
from pathlib import Path
from typing import Any

from pydantic import BaseModel

from orchestrator.contracts.cue_api import (
    SeriesChangeResponse,
    SeriesChangesResponse,
    SeriesImportResponse,
    SeriesResponse,
    UserSeriesResponse,
    UserSeriesStatus,
    UserStatusRecalculateResponse,
)


OPENAPI_PATH = Path(__file__).resolve().parents[3] / "contracts" / "openapi.json"


def resolve_schema(document: dict[str, Any], schema: dict[str, Any]) -> dict[str, Any]:
    while "$ref" in schema:
        reference = schema["$ref"]
        if not isinstance(reference, str) or not reference.startswith("#/"):
            raise AssertionError(f"Unsupported OpenAPI reference: {reference!r}")

        resolved: Any = document
        for segment in reference[2:].split("/"):
            resolved = resolved[segment.replace("~1", "/").replace("~0", "~")]

        if not isinstance(resolved, dict):
            raise AssertionError(f"OpenAPI reference is not a schema: {reference}")
        schema = resolved

    return schema


def unwrap_nullable_object(
    document: dict[str, Any],
    schema: dict[str, Any],
) -> dict[str, Any]:
    schema = resolve_schema(document, schema)
    if "allOf" in schema:
        candidates = schema["allOf"]
        if len(candidates) != 1:
            raise AssertionError("Expected exactly one composed OpenAPI schema")
        return unwrap_nullable_object(document, candidates[0])

    if "anyOf" not in schema:
        return schema

    candidates = [
        resolve_schema(document, candidate)
        for candidate in schema["anyOf"]
        if candidate.get("type") != "null"
    ]
    if len(candidates) != 1:
        raise AssertionError("Expected exactly one non-null OpenAPI schema")
    return candidates[0]


def response_schema(
    document: dict[str, Any],
    path: str,
    method: str,
) -> dict[str, Any]:
    return resolve_schema(
        document,
        document["paths"][path][method]["responses"]["200"]["content"][
            "application/json"
        ]["schema"],
    )


def model_aliases(model: type[BaseModel]) -> set[str]:
    return {field.alias or name for name, field in model.model_fields.items()}


def schema_signature(
    document: dict[str, Any],
    schema: dict[str, Any],
) -> tuple[Any, ...]:
    schema = resolve_schema(document, schema)

    if schema.get("nullable") is True:
        non_nullable_schema = {key: value for key, value in schema.items() if key != "nullable"}
        signatures = [
            ("null", None, None),
            schema_signature(document, non_nullable_schema),
        ]
        return ("union", *sorted(signatures, key=repr))

    if "allOf" in schema:
        candidates = schema["allOf"]
        if len(candidates) != 1:
            raise AssertionError("Expected exactly one composed schema")
        return schema_signature(document, candidates[0])

    if "anyOf" in schema:
        signatures = [schema_signature(document, candidate) for candidate in schema["anyOf"]]
        return ("union", *sorted(signatures, key=repr))

    schema_type = schema.get("type")

    if schema_type == "object":
        properties = tuple(
            sorted(
                (
                    name,
                    schema_signature(document, property_schema),
                )
                for name, property_schema in schema.get("properties", {}).items()
            )
        )
        return (
            "object",
            properties,
            tuple(sorted(schema.get("required", []))),
            schema.get("additionalProperties", True),
        )

    if schema_type == "array":
        return ("array", schema_signature(document, schema["items"]))

    return (
        schema_type,
        schema.get("format"),
        tuple(schema["enum"]) if "enum" in schema else None,
    )


class OpenApiWorkerContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.document = json.loads(OPENAPI_PATH.read_text(encoding="utf-8"))

    def assert_model_fields_match(
        self,
        model: type[BaseModel],
        schema: dict[str, Any],
    ) -> None:
        schema = unwrap_nullable_object(self.document, schema)
        aliases = model_aliases(model)

        self.assertEqual(set(schema["properties"]), aliases)
        self.assertEqual(set(schema["required"]), aliases)
        self.assertFalse(schema.get("additionalProperties", True))

        pydantic_schema = model.model_json_schema(by_alias=True, mode="validation")
        self.assertEqual(
            schema_signature(self.document, schema),
            schema_signature(pydantic_schema, pydantic_schema),
        )

    def test_worker_response_models_match_openapi(self) -> None:
        import_schema = response_schema(
            self.document,
            "/api/series/import",
            "post",
        )
        changes_schema = response_schema(
            self.document,
            "/api/metadata/series/changes",
            "get",
        )
        status_schema = response_schema(
            self.document,
            "/api/user/status/{userId}/recalculate",
            "post",
        )

        self.assert_model_fields_match(SeriesImportResponse, import_schema)
        self.assert_model_fields_match(SeriesChangesResponse, changes_schema)
        self.assert_model_fields_match(UserStatusRecalculateResponse, status_schema)

        import_properties = import_schema["properties"]
        self.assert_model_fields_match(SeriesResponse, import_properties["series"])
        self.assert_model_fields_match(
            UserSeriesResponse,
            import_properties["userSeries"],
        )

        changes_properties = changes_schema["properties"]
        results_schema = resolve_schema(
            self.document,
            changes_properties["results"],
        )
        self.assert_model_fields_match(
            SeriesChangeResponse,
            results_schema["items"],
        )

        user_series_schema = unwrap_nullable_object(
            self.document,
            import_properties["userSeries"],
        )
        status_schema = resolve_schema(
            self.document,
            user_series_schema["properties"]["status"],
        )
        status_values = set(status_schema["enum"])
        self.assertEqual(status_values, {status.value for status in UserSeriesStatus})

    def test_worker_request_shapes_match_openapi(self) -> None:
        import_operation = self.document["paths"]["/api/series/import"]["post"]
        self.assertEqual(
            import_operation["security"],
            [{"sessionCookie": []}, {"workerBearer": []}],
        )
        import_schema = resolve_schema(
            self.document,
            import_operation["requestBody"]["content"]["application/json"]["schema"],
        )
        self.assertEqual(set(import_schema["properties"]), {"tmdbId"})
        self.assertEqual(set(import_schema["required"]), {"tmdbId"})

        changes_parameters = self.document["paths"][
            "/api/metadata/series/changes"
        ]["get"]["parameters"]
        changes_security = self.document["paths"][
            "/api/metadata/series/changes"
        ]["get"]["security"]
        self.assertEqual(changes_security, [{"workerBearer": []}])
        self.assertEqual(
            {(parameter["in"], parameter["name"]) for parameter in changes_parameters},
            {
                ("query", "startDate"),
                ("query", "endDate"),
                ("query", "page"),
            },
        )
        self.assertTrue(all(parameter["required"] for parameter in changes_parameters))
        self.assertEqual(
            {
                parameter["name"]: parameter["schema"].get("format")
                for parameter in changes_parameters
            },
            {
                "startDate": "date",
                "endDate": "date",
                "page": None,
            },
        )

        status_parameters = self.document["paths"][
            "/api/user/status/{userId}/recalculate"
        ]["post"]["parameters"]
        status_security = self.document["paths"][
            "/api/user/status/{userId}/recalculate"
        ]["post"]["security"]
        self.assertEqual(status_security, [{"workerBearer": []}])
        self.assertEqual(
            {(parameter["in"], parameter["name"]) for parameter in status_parameters},
            {("path", "userId")},
        )
        self.assertTrue(all(parameter["required"] for parameter in status_parameters))


if __name__ == "__main__":
    unittest.main()
