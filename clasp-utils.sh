#!/bin/bash

# Get the directory where the script is located
scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

echo "Script directory: $scriptDir"

# Define root directory dynamically, optionally use a provided one
rootDir="${ROOTDIR:-$scriptDir}"

echo "Root directory: $rootDir"

# Check for proper command usage
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 [push|deploy]"
    exit 1
fi

dirs=("")  # Array of directories

# Execute actions based on command given
if [ "$1" = "push" ]; then
    for dir in "${dirs[@]}"; do
        (cd "$rootDir/$dir" && clasp push)
    done
elif [ "$1" = "deploy" ]; then
    for dir in "${dirs[@]}"; do
        (cd "$rootDir/$dir" && clasp push && clasp deploy -d "$(date '+%s')")
    done
else
    # If the argument doesn't match any known commands, display an error message
    echo "Error: Invalid command. Use 'push' or 'deploy'."
    exit 1
fi
