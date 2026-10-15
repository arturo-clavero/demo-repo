import uuid

from flask import Blueprint, current_app, jsonify, request, send_from_directory

from . import db, exports, imports
from .auth import require_api_key
from .errors import WorkerError

bp = Blueprint("worker", __name__)


@bp.errorhandler(WorkerError)
def worker_error(err: WorkerError):
    return jsonify(error=str(err)), err.status


@bp.get("/health")
def health():
    return jsonify(ok=True)


@bp.post("/exports")
@require_api_key
def create_export():
    body = request.get_json(force=True)
    kind = body.get("kind", "")
    if kind not in exports.COLUMNS:
        raise WorkerError(f"kind must be one of {', '.join(exports.COLUMNS)}")
    with db.connect(current_app.config["DB"]) as conn:
        result = exports.build_export(conn, current_app.config["EXPORT_DIR"], kind, body.get("params") or {})
    return jsonify(result), 201


@bp.get("/exports/<export_id>")
@require_api_key
def download_export(export_id: str):
    try:
        uuid.UUID(hex=export_id)
    except ValueError as err:
        raise WorkerError("unknown export") from err
    matches = sorted(current_app.config["EXPORT_DIR"].glob(f"*-{export_id[:8]}.zip"))
    if not matches:
        raise WorkerError("unknown export")
    return send_from_directory(current_app.config["EXPORT_DIR"], matches[0].name, as_attachment=True)


@bp.post("/imports")
@require_api_key
def import_catalogue():
    upload = request.files.get("file")
    if upload is None or not upload.filename:
        raise WorkerError("attach the catalogue as 'file'")
    rows = imports.parse_upload(upload.filename, upload.read())
    with db.connect(current_app.config["DB"]) as conn:
        changed = db.upsert_products(conn, rows)
    return jsonify(rows=len(rows), changed=changed)
