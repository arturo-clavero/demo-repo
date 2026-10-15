import os
from pathlib import Path


def load_settings() -> dict:
    """Settings from the environment; the compose file provides them."""
    return {
        "API_KEY": os.environ.get("WORKER_API_KEY", ""),
        "EXPORT_DIR": Path(os.environ.get("EXPORT_DIR", "/var/lib/shopfloor/exports")),
        "MAX_CONTENT_LENGTH": 5 * 1024 * 1024,
        "DB": {
            "host": os.environ.get("MYSQL_HOST", "mysql-db"),
            "port": int(os.environ.get("MYSQL_PORT", "3306")),
            "user": os.environ.get("MYSQL_USER", ""),
            "password": os.environ.get("MYSQL_PASSWORD", ""),
            "database": os.environ.get("MYSQL_DATABASE", ""),
        },
    }
