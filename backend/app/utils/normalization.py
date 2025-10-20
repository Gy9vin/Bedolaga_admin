import re
from typing import Any, Dict, Iterable, Union


_CAMEL_PATTERN = re.compile(r"(?<!^)(?=[A-Z])")


def to_snake_case(value: str) -> str:
    value = value.replace("-", "_")
    return _CAMEL_PATTERN.sub("_", value).lower()


def normalize_payload(payload: Any) -> Any:
    if isinstance(payload, dict):
        return {to_snake_case(str(key)): normalize_payload(value) for key, value in payload.items()}
    if isinstance(payload, list):
        return [normalize_payload(item) for item in payload]
    if isinstance(payload, tuple):
        return tuple(normalize_payload(item) for item in payload)
    return payload
