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
: "${R2_AWS_PROFILE:=r2}"

if [[ ! -f "$local_path" ]]; then
  echo "File not found: $local_path" >&2
  exit 1
fi

endpoint_url="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
access_key_id="$(aws configure get aws_access_key_id --profile "$R2_AWS_PROFILE" 2>/dev/null || true)"

if [[ -z "$access_key_id" ]]; then
  echo "No AWS access key found for profile '$R2_AWS_PROFILE'." >&2
  echo "Configure it with: aws configure --profile $R2_AWS_PROFILE" >&2
  exit 1
fi

if [[ ${#access_key_id} -ne 32 ]]; then
  echo "Invalid access key length for profile '$R2_AWS_PROFILE': ${#access_key_id}. Expected 32 for Cloudflare R2." >&2
  echo "Tip: your default AWS profile may contain non-R2 credentials. Use a dedicated profile (for example: r2)." >&2
  exit 1
fi

echo "Uploading $local_path to s3://${R2_BUCKET}/${object_key} ..."
aws s3 cp "$local_path" "s3://${R2_BUCKET}/${object_key}" --profile "$R2_AWS_PROFILE" --endpoint-url "$endpoint_url"

echo "Verifying uploaded object ..."
aws s3 ls "s3://${R2_BUCKET}/${object_key}" --profile "$R2_AWS_PROFILE" --endpoint-url "$endpoint_url"

echo "Upload complete."
