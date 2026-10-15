class WorkerError(Exception):
    """Base class; the message is safe to return to the caller."""

    status = 400


class ImportFailed(WorkerError):
    pass


class ExportFailed(WorkerError):
    status = 500


class Unauthorized(WorkerError):
    status = 401
