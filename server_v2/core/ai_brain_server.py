# Flask-based AI brain server for Casper_AutoPilot v2
# Endpoints:
#   GET  /ai/health -> {"status": "ok"}
#   POST /ai/webhook/analytics -> accepts JSON from Google Apps Script and returns AI-generated analysis
#
# Integrates with local modules in server_v2/modules:
#   - analyzer
#   - clipper
#   - translator
#   - drive_sync
#
# The server works offline. All analysis is produced by the local analyzer module.
from __future__ import annotations

import json
import traceback
from typing import Any, Dict, Optional

from flask import Flask, request, jsonify

# Local core modules
from .logger import JSONLogger
from .ai_scheduler import Scheduler

# Try to import the modules from server_v2.modules. If running in a different import context
# the user should ensure server_v2 is on PYTHONPATH.
try:
    from server_v2.modules import analyzer, clipper, translator, drive_sync  # type: ignore
except Exception:
    # Fallback imports (attempt local relative import)
    try:
        from ..modules import analyzer, clipper, translator, drive_sync  # type: ignore
    except Exception:
        # Create simple stubs that raise informative errors when used. This keeps the server importable
        # even if modules are missing and provides clearer runtime errors.
        class _MissingModule:
            def __init__(self, name: str):
                self._name = name

            def __getattr__(self, item):
                raise ImportError(f"Local module server_v2.modules.{self._name} missing or failed to import; attempted to access '{item}'")

        analyzer = _MissingModule("analyzer")
        clipper = _MissingModule("clipper")
        translator = _MissingModule("translator")
        drive_sync = _MissingModule("drive_sync")

app = Flask(__name__)
logger = JSONLogger(app_name="ai_brain_server")
scheduler = Scheduler(logger=logger)


def _choose_analyzer_callable(mod) -> Optional[Any]:
    """
    Try to find a callable in analyzer module with a likely name.
    This makes the integration resilient to small API differences between local modules.
    """
    candidates = ["analyze", "generate_analysis", "analyze_data", "run", "process"]
    for name in candidates:
        fn = getattr(mod, name, None)
        if callable(fn):
            return fn
    # If there's an Analyzer class, try to instantiate and use its analyze method
    cls = getattr(mod, "Analyzer", None)
    if cls and callable(cls):
        try:
            instance = cls()
            if hasattr(instance, "analyze") and callable(getattr(instance, "analyze")):
                return instance.analyze
        except Exception:
            # fallthrough -> no usable analyzer
            pass
    return None


_analyzer_fn = _choose_analyzer_callable(analyzer)


def perform_analysis(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Produce analysis based on payload using the local analyzer module.
    If translator or drive_sync are available, include optional translation context or recent files.
    Returns a dict with 'analysis' and optional metadata.
    """
    logger.debug("perform_analysis called", extra={"payload_keys": list(payload.keys())})
    try:
        analysis_text = ""
        meta: Dict[str, Any] = {}

        if _analyzer_fn:
            # The analyzer function signature may vary; prefer passing the whole payload.
            try:
                result = _analyzer_fn(payload)
            except TypeError:
                # try passing only the text field or raw
                if isinstance(payload, dict) and "text" in payload:
                    result = _analyzer_fn(payload["text"])
                else:
                    result = _analyzer_fn(json.dumps(payload))
            # Normalize result to text
            if isinstance(result, dict):
                analysis_text = result.get("analysis") or result.get("text") or json.dumps(result)
                meta.update({k: v for k, v in result.items() if k != "analysis" and k != "text"})
            else:
                analysis_text = str(result)
        else:
            # Fallback: no analyzer available, build a simple heuristic analysis
            analysis_text = "No local analyzer available. Payload keys: " + ", ".join(payload.keys())
            logger.error("No analyzer callable found", extra={"payload_keys": list(payload.keys())})

        # Optionally gather recent files from drive_sync to enrich analysis context
        try:
            if hasattr(drive_sync, "get_recent_files") and callable(getattr(drive_sync, "get_recent_files")):
                recent = drive_sync.get_recent_files(limit=3)
                meta["recent_files"] = recent
        except Exception as exc:
            logger.debug("drive_sync.get_recent_files failed", extra={"error": str(exc)})

        # Optional translation
        target_lang = payload.get("target_language") or payload.get("lang")
        if target_lang and hasattr(translator, "translate"):
            try:
                trans_fn = getattr(translator, "translate")
                translated = trans_fn(analysis_text, target=target_lang)
                meta["translated"] = translated
                analysis_text = translated
            except Exception as exc:
                logger.debug("translator.translate failed", extra={"error": str(exc)})

        return {"analysis": analysis_text, "meta": meta}
    except Exception as exc:
        logger.exception(exc, message="perform_analysis failed")
        return {"analysis": "Error during analysis", "meta": {"error": str(exc), "trace": traceback.format_exc()}}


@app.route("/ai/health", methods=["GET"])
def health():
    """
    Simple health endpoint.
    """
    logger.debug("Health check")
    return jsonify({"status": "ok"}), 200


@app.route("/ai/webhook/analytics", methods=["POST"])
def webhook_analytics():
    """
    Endpoint expected to be called by Google Apps Script (AutoUploader_v2.gs / AnalyticsModule_v2.gs).
    Accepts JSON payload and returns an AI-generated analysis.
    """
    try:
        payload = request.get_json(silent=True)
        if payload is None:
            logger.error("Webhook called with invalid JSON")
            return jsonify({"status": "error", "error": "Invalid JSON payload"}), 400

        logger.info("Received analytics webhook", extra={"payload_preview": {k: payload.get(k) for k in list(payload)[:5]}})
        result = perform_analysis(payload)
        response = {"status": "ok", "result": result}
        logger.info("Returning analysis result", extra={"result_summary": (result.get("analysis") or "")[:200]})
        return jsonify(response), 200
    except Exception as exc:
        logger.exception(exc, message="Unhandled exception in webhook_analytics")
        return jsonify({"status": "error", "error": str(exc)}), 500


# ---- Integration helpers between scheduler and brain server ----
def daily_analysis_job_from_drive(limit: int = 10) -> None:
    """
    Example job that fetches recent items (using drive_sync) and runs analysis on them.
    The job writes logs and silently returns; results are stored in logs or via drive_sync if available.
    """
    logger.info("Running daily_analysis_job_from_drive")
    try:
        recent = []
        if hasattr(drive_sync, "get_recent_files") and callable(getattr(drive_sync, "get_recent_files")):
            try:
                recent = drive_sync.get_recent_files(limit=limit)
            except Exception as exc:
                logger.debug("drive_sync.get_recent_files failed in job", extra={"error": str(exc)})

        payload = {"event": "daily_summary", "items": recent}
        analysis = perform_analysis(payload)
        # Optionally save analysis via drive_sync if it exposes an upload/save API
        if hasattr(drive_sync, "save_analysis") and callable(getattr(drive_sync, "save_analysis")):
            try:
                drive_sync.save_analysis(analysis)
            except Exception as exc:
                logger.debug("drive_sync.save_analysis failed", extra={"error": str(exc)})
        # Log the analysis summary
        logger.info("Daily analysis completed", extra={"summary": (analysis.get("analysis") or "")[:400]})
    except Exception as exc:
        logger.exception(exc, message="daily_analysis_job_from_drive failed")


def start_default_scheduler() -> None:
    """
    Start the scheduler and register a default daily analysis job at 02:00 UTC.
    Consumers may call scheduler.add_daily_job or add_interval_job to customize.
    """
    try:
        scheduler.start()
        # Only add the default daily job if not already present
        existing = [j for j in scheduler.list_jobs().keys() if j.startswith("daily_")]
        if not existing:
            scheduler.add_daily_job(name="daily_analysis_02_00", hour=2, minute=0, func=daily_analysis_job_from_drive)
            logger.info("Default daily analysis job scheduled at 02:00 UTC")
    except Exception as exc:
        logger.exception(exc, message="Failed to start default scheduler")


# If run as the main module, start the server and scheduler
if __name__ == "__main__":
    start_default_scheduler()
    logger.info("Starting Flask ai_brain_server on 0.0.0.0:5000")
    # For production, a WSGI server is recommended. For local/offline dev, Flask builtin is OK.
    app.run(host="0.0.0.0", port=5000)
