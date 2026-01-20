#!/bin/bash
set -e

SOURCE="/media/timemachine"
DEST="/share/NAS_Share/Timemachine"

log() {
    echo "$(date) $*"
}

log "Starting Timemachine NAS sync"

# Safety checks
[ -d "$SOURCE" ] || { log "ERROR: Source missing: $SOURCE"; exit 1; }
[ -d "$DEST" ]   || { log "ERROR: Dest missing or not mounted: $DEST"; exit 1; }

case "$SOURCE" in
    ''|'/') log "ERROR: Unsafe source: $SOURCE"; exit 1 ;;
esac
case "$DEST" in
    ''|'/') log "ERROR: Unsafe dest: $DEST"; exit 1 ;;
esac

# Build snapshot lists (relative paths)
mapfile -t SRC_SNAPS < <(
    find "$SOURCE" -mindepth 3 -maxdepth 3 -type d \
    | sed "s|^$SOURCE/||" | sort
)

mapfile -t DEST_SNAPS < <(
    find "$DEST" -mindepth 3 -maxdepth 3 -type d \
    | sed "s|^$DEST/||" | sort
)

# Convert SRC snapshots to lookup table
declare -A SRC_SET
for s in "${SRC_SNAPS[@]}"; do
    SRC_SET["$s"]=1
done

# Guard: abort if no snapshots found
SNAP_COUNT=$(echo "$SRC_SNAPS" | wc -l)
if [ "$SNAP_COUNT" -eq 0 ]; then
    log "ERROR: Source snapshot list empty ($SOURCE). Aborting."
    exit 1
fi

# ---- Delete obsolete snapshots ----
DELETED=0
for snap in "${DEST_SNAPS[@]}"; do
    if [[ -z "${SRC_SET[$snap]:-}" ]]; then
        log "Deleting obsolete snapshot: $snap"
        rm -rf "$DEST/$snap"
        ((DELETED++))
    fi
done

log "Deleted $DELETED obsolete snapshots"

# ---- Copy snapshots missing in DEST ----
COPIED=0
FAILED=0
while read -r src_snap; do
    rel="${src_snap#$SOURCE/}"

    if [ ! -d "$DEST/$rel" ]; then
        log "Copying snapshot: $rel"
        mkdir -p "$(dirname "$DEST/$rel")"

        if cp -a "$src_snap" "$DEST/$rel"; then
            COPIED=$((COPIED + 1))
        else
            log "WARNING: cp reported non-zero exit while copying $rel"
            FAILED=$((FAILED + 1))
        fi
    fi
done < <(find "$SOURCE" -mindepth 3 -maxdepth 3 -type d) # Feed find output here
log "Copied $COPIED new snapshots"
if [ "$FAILED" -gt 0 ]; then
    log "ERROR: $FAILED snapshot(s) failed to copy"
    exit 1
fi

log "Timemachine NAS sync completed"
