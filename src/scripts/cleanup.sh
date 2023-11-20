#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR" && cd .. && pwd )"

directories=(
  "$PROJECT_ROOT/temp/final-video"
  "$PROJECT_ROOT/temp/temporary-video"
  "$PROJECT_ROOT/temp/temporary-image"
)

for dir in "${directories[@]}"; do
  find "$dir" -type f -mmin +15 -exec rm {} \;
done