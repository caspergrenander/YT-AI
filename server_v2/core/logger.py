# JSON logger for Casper_AutoPilot v2
# Writes newline-delimited JSON log entries to a file in /data/logs/
# Thread-safe and minimal dependency (built-in modules only).
# Usage:
#   from server_v2.core.logger import JSONLogger
#   logger = JSONLogger(app_name="casper_ai")
#   logger.info("starting", extra={"port": 5000})
import os
import json
import threading
from datetime import datetime
from typing import Any, Dict, Optional


class JSONLogger:
    """
    Simple JSON logger that appends newline-delimited JSON objects to a log file.
    Log directory defaults to /data/logs/ to match project requirement.
    """

    def __init__(
        self,
        app_name: str = "casper_autopilot",
        log_dir: str = "/data/logs",
        filename: Optional[str] = None,
        level: str = "INFO",
    ) -> None:
        self.app_name = app_name
        self.log_dir = os.path.abspath(log_dir)
        os.makedirs(self.log_dir, exist_ok=True)
        if filename is None:
            filename = f"{self.app_name}.log"
        self.log_path = os.path.join(self.log_dir, filename)
        self._lock = threading.Lock()
        self.level = level.upper()

    def _timestamp(self) -> str:
        # ISO8601 UTC timestamp
        return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"

    def _write(self, record: Dict[str, Any]) -> None:
        serialized = json.dumps(record, ensure_ascii=False)
        with self._lock:
            with open(self.log_path, "a", encoding="utf-8") as fh:
                fh.write(serialized + "\n")

    def _log(self, level: str, message: str, extra: Optional[Dict[str, Any]] = None) -> None:
        record = {
            "timestamp": self._timestamp(),
            "app": self.app_name,
            "level": level,
            "message": message,
        }
        if extra:
            record["extra"] = extra
        self._write(record)

    def info(self, message: str, extra: Optional[Dict[str, Any]] = None) -> None:
        if self.level in ("INFO", "DEBUG"):
            self._log("INFO", message, extra)

    def debug(self, message: str, extra: Optional[Dict[str, Any]] = None) -> None:
        if self.level == "DEBUG":
            self._log("DEBUG", message, extra)

    def error(self, message: str, extra: Optional[Dict[str, Any]] = None) -> None:
        self._log("ERROR", message, extra)

    def exception(self, exc: Exception, message: str = "Unhandled exception") -> None:
        extra = {"exception_type": type(exc).__name__, "exception_str": str(exc)}
        self._log("ERROR", message, extra)
