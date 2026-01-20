#!/bin/bash
set -e

# Configuration
SOURCE="/media/timemachine"
DEST="/share/NAS_Share/Timemachine"

echo "$(date) Starting Timemachine NAS sync"

# 1. Safety Checks
if [ ! -d "$SOURCE" ]; then
    echo "$(date) Error: Source directory missing: $SOURCE"
    exit 1
fi

if [ ! -d "$DEST" ]; then
    echo "$(date) Error: Destination directory missing or NAS not mounted: $DEST"
    exit 1
fi

# 2. Detect latest snapshot folder
# TimeMachine uses /YEAR/MONTH/YYYY-MM-DD-HHMMSS structure
latest_src=$(find "$SOURCE" -mindepth 3 -maxdepth 3 -type d | sort | tail -1)
latest_dest=$(find "$DEST" -mindepth 3 -maxdepth 3 -type d | sort | tail -1)
   
if [ "$latest_src" = "$latest_dest" ]; then
    echo "$(date) No changes detected. Skipping sync."
    exit 0
fi

echo "$(date) Changes detected. Mirroring files..."

# 3. Delete orphaned files and directories in DEST
cd "$DEST"
DELETED_COUNT=0
find . -depth ! -path . | while read -r item; do
    if [ ! -e "$SOURCE/$item" ]; then
        echo "$(date) Deleting $(item)"
        rm -rf "$item"
        DELETED_COUNT=$((DELETED_COUNT+1))
    fi
done
echo "$(date) Deleted $DELETED_COUNT orphaned files/directories"

# 4. Copy all files from SOURCE to DEST
echo "$(date) Starting copy task..."
cp -au "$SOURCE/." "$DEST/"
echo "$(date) Copy task completed"

echo "$(date) Timemachine NAS sync completed"