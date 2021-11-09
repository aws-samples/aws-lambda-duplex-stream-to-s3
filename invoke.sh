#!/usr/bin/env bash
DEFAULT_URL="https://ai2-public-datasets.s3.us-west-2.amazonaws.com/arc/ARC-V1-Feb2018.zip"
URL=${1:-$DEFAULT_URL}

# Invoke our lambda function with the URL of the file to download
aws lambda invoke \
    --function-name duplex-stream-to-s3 \
    --payload '{"url":"'"$URL"'"}' \
    --cli-binary-format raw-in-base64-out \
    --invocation-type RequestResponse \
    response.json
