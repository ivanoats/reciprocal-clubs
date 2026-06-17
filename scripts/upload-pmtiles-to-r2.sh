#!/usr/bin/env bash
set -euo pipefail

if ! command -v aws >/dev/null 2>&1; then
  echo "aws CLI is required but not installed." >&2
  exit 1
fi

if [[ $# -lt 1 || $# -gt 2 ]]; then
  echo "Usage: $0 <local-pmtiles-path> [object-key]" >&2
  exit 1
fi

local_path="$1"
object_key="${2:-$(basename "$local_path")}" 

: "${R2_BUCKET:?Set R2_BUCKET (for example: styc)}"
: "${R2_ACCOUNT_ID:?Set R2_ACCOUNT_ID (Cloudflare account ID)}"

if [[ ! -f "$local_path" ]]; then
  echo "File not found: $local_path" >&2
  exit 1
fi

endpoint_url="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"

echo "Uploading $local_path to s3://${R2_BUCKET}/${object_key} ..."
aws s3 cp "$local_path" "s3://${R2_BUCKET}/${object_key}" --endpoint-url "$endpoint_url"

echo "Verifying uploaded object ..."
aws s3 ls "s3://${R2_BUCKET}/${object_key}" --endpoint-url "$endpoint_url"

echo "Upload complete."
