# Lightweight scheduler for Casper_AutoPilot v2
# - Supports daily jobs (at HH:MM) and simple interval jobs (seconds)
# - Runs in a background thread; executes job functions in dedicated threads
# - Provides programmatic API: start(), stop(), add_daily_job(), add_interval_job(), remove_job(), list_jobs()
#
# The scheduler is intentionally dependency-free (no APScheduler) to maintain offline capability.
import threading
import time
from datetime import datetime, timedelta, time as dt_time
from typing import Callable, Any, Dict, Optional
from uuid import uuid4

from .logger import JSONLogger

_DEFAULT_CHECK_INTERVAL = 5  # seconds between scheduler checks


class Scheduler:
    def __init__(self, logger: Optional[JSONLogger] = None, check_interval: int = _DEFAULT_CHECK_INTERVAL) -> None:
        self._jobs: Dict[str, Dict] = {}
        self._lock = threading.Lock()
        self._stop_event = threading.Event()
        self._thread: Optional[threading.Thread] = None
        self.check_interval = max(1, int(check_interval))
        self.logger = logger or JSONLogger(app_name="ai_scheduler")

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            self.logger.debug("Scheduler already running")
            return
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._run_loop, name="ai_scheduler_thread", daemon=True)
        self._thread.start()
        self.logger.info("Scheduler started")

    def stop(self, wait: bool = True) -> None:
        self._stop_event.set()
        if self._thread and wait:
            self._thread.join(timeout=5)
        self.logger.info("Scheduler stopped")

    def add_daily_job(self, name: Optional[str], hour: int, minute: int, func: Callable, args: Optional[tuple] = None, kwargs: Optional[dict] = None) -> str:
        """
        Schedule a job to run every day at the specified hour and minute (24h).
        Returns job id.
        """
        with self._lock:
            job_id = name or f"daily_{uuid4().hex}"
            now = datetime.utcnow()
            target_time = datetime.combine(now.date(), dt_time(hour=hour, minute=minute))
            if target_time <= now:
                target_time += timedelta(days=1)
            job = {
                "id": job_id,
                "type": "daily",
                "hour": hour,
                "minute": minute,
                "next_run": target_time,
                "func": func,
                "args": args or (),
                "kwargs": kwargs or {},
            }
            self._jobs[job_id] = job
            self.logger.info("Added daily job", extra={"job_id": job_id, "hour": hour, "minute": minute, "next_run": job["next_run"].isoformat()})
            return job_id

    def add_interval_job(self, name: Optional[str], seconds: int, func: Callable, args: Optional[tuple] = None, kwargs: Optional[dict] = None) -> str:
        """
        Schedule a job to run repeatedly every `seconds` seconds.
        """
        with self._lock:
            job_id = name or f"interval_{uuid4().hex}"
            next_run = datetime.utcnow() + timedelta(seconds=seconds)
            job = {
                "id": job_id,
                "type": "interval",
                "seconds": int(seconds),
                "next_run": next_run,
                "func": func,
                "args": args or (),
                "kwargs": kwargs or {},
            }
            self._jobs[job_id] = job
            self.logger.info("Added interval job", extra={"job_id": job_id, "seconds": seconds, "next_run": next_run.isoformat()})
            return job_id

    def remove_job(self, job_id: str) -> bool:
        with self._lock:
            if job_id in self._jobs:
                del self._jobs[job_id]
                self.logger.info("Removed job", extra={"job_id": job_id})
                return True
            self.logger.debug("Tried to remove missing job", extra={"job_id": job_id})
            return False

    def list_jobs(self) -> Dict[str, Dict]:
        with self._lock:
            # shallow copy for safety
            return {jid: {k: v for k, v in job.items() if k != "func" and k != "args" and k != "kwargs"} for jid, job in self._jobs.items()}

    def _run_loop(self) -> None:
        self.logger.debug("Scheduler loop started")
        while not self._stop_event.is_set():
            now = datetime.utcnow()
            to_run = []
            with self._lock:
                for job_id, job in list(self._jobs.items()):
                    if job["next_run"] <= now:
                        to_run.append(job_id)
            for job_id in to_run:
                try:
                    with self._lock:
                        job = self._jobs.get(job_id)
                        if not job:
                            continue
                        # schedule next run before execution for resilience
                        if job["type"] == "interval":
                            job["next_run"] = datetime.utcnow() + timedelta(seconds=job["seconds"])
                        elif job["type"] == "daily":
                            # increment to next day same hh:mm
                            next_day = job["next_run"].date() + timedelta(days=1)
                            job["next_run"] = datetime.combine(next_day, dt_time(hour=job["hour"], minute=job["minute"]))
                    # run the job in a separate thread
                    thread = threading.Thread(target=self._run_job_safe, args=(job,), daemon=True)
                    thread.start()
                except Exception as exc:
                    self.logger.exception(exc, message="Error scheduling job")
            # sleep between checks
            self._stop_event.wait(self.check_interval)
        self.logger.debug("Scheduler loop exiting")

    def _run_job_safe(self, job: Dict) -> None:
        job_id = job.get("id", "<unknown>")
        try:
            self.logger.info("Executing job", extra={"job_id": job_id})
            func = job["func"]
            args = job.get("args", ())
            kwargs = job.get("kwargs", {})
            func(*args, **kwargs)
            self.logger.info("Job completed", extra={"job_id": job_id})
        except Exception as exc:
            self.logger.exception(exc, message="Job execution failed")
