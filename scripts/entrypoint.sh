#!/bin/bash
set -o pipefail

export AWS_ACCESS_KEY_ID=minioadmin
export AWS_SECRET_ACCESS_KEY=minioadmin
export AWS_DEFAULT_REGION=us-west-2

if ! command -v pulumi &> /dev/null; then
    echo "Error: pulumi command not found. Please install Pulumi in the container."
    exit 1
fi

pulumi login "s3://pulumi-data?endpoint=minio:9000&disableSSL=true&s3ForcePathStyle=true"

exec "$@"
