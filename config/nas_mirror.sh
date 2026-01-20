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

# 2. Stateless Change Detection (checksums with relative paths)
get_tree_hash() {
    cd "$1"
    find . -type f -exec md5sum {} + | sort | md5sum | awk '{print $1}'
}

echo "$(date) Calculating checksums..."
SRC_HASH=$(get_tree_hash "$SOURCE")
DST_HASH=$(get_tree_hash "$DEST")

if [ "$SRC_HASH" = "$DST_HASH" ]; then
    echo "$(date) No changes detected. Skipping sync."
    exit 0
fi

# 3. Perform Mirror
echo "$(date) Changes detected. Mirroring files..."

# Delete orphaned files and directories in DEST that don't exist in SRC
cd "$DEST"
find . -depth ! -path . | while read -r item; do
    if [ ! -e "$SOURCE/$item" ]; then
        rm -rf "$item"
    fi
done

# Copy all files from SOURCE to DEST (preserve timestamps, permissions, symlinks)
cp -a "$SOURCE/." "$DEST/"

echo "$(date) Timemachine NAS sync completed"