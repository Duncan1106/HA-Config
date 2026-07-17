#!/bin/bash
# NOTE: BusyBox-compatible script (HA OS). Avoid GNU-only flags (e.g., find -printf, stat).
set -euo pipefail

# -------------------------
# Bash safety tweaks
# -------------------------
shopt -s nullglob  # Prevent unmatched globs from returning literal strings

# -------------------------
# Configuration
# -------------------------
BACKUP_DIR="/share/NAS_Share/Backup"
TYPE="${1:-}"         # backup type: hourly, daily, weekly, monthly
DRY_RUN_RAW="${2:-0}" # flexible dry-run param: 1/0/true/false/yes/no
DEBUG_RAW="${3:-0}"   # flexible debug param: 1/0/true/false/yes/no
MIN_FILES=3           # safety net: always leave at least this many backups

# -------------------------
# Flexible Dry-Run Parsing
# -------------------------
case "${DRY_RUN_RAW,,}" in
    1|true|yes) DRY_RUN=1 ;;
    0|false|no|"") DRY_RUN=0 ;;
    *) 
        echo "Invalid DRY_RUN value '$DRY_RUN_RAW', defaulting to 0" >&2
        DRY_RUN=0
        ;;
esac

# -------------------------
# Flexible Debug Parsing
# -------------------------
case "${DEBUG_RAW,,}" in
    1|true|yes) DEBUG=1 ;;
    0|false|no|"") DEBUG=0 ;;
    *) DEBUG=0 ;;
esac

# -------------------------
# Debug logging function
# -------------------------
log() {
    if [[ "$DEBUG" -eq 1 ]]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
    fi
}

# -------------------------
# JSON escaping function
# -------------------------
json_escape() {
    local s="$1"
    s="${s//\\/\\\\}"   # escape backslashes
    s="${s//\"/\\\"}"   # escape double quotes
    s="${s//$'\n'/\\n}" # escape newlines
    printf '%s' "$s"
}

log "Backup type: $TYPE"
log "Backup directory: $BACKUP_DIR"
log "Dry-run mode: $DRY_RUN"
log "Debug logging: $DEBUG"

# -------------------------
# Validate TYPE and BACKUP_DIR
# -------------------------
if [[ -z "$TYPE" ]]; then
  echo "ERROR: no backup type specified" >&2
  exit 1
fi

if [[ ! -d "$BACKUP_DIR" ]]; then
  echo "ERROR: backup directory '$BACKUP_DIR' does not exist or is not mounted" >&2
  exit 2
fi

# -------------------------
# Determine pattern and retention (GFS)
# -------------------------
case "$TYPE" in
  hourly)
    PATTERN="Hourly*Backup*.tar"
    MTIME="+2"
    ;;
  daily)
    PATTERN="Daily*Backup*.tar"
    MTIME="+7"
    ;;
  weekly)
    PATTERN="Weekly*Backup*.tar"
    MTIME="+45"
    ;;
  monthly)
    PATTERN="Monthly*Backup*.tar"
    MTIME="+90"
    ;;
  *)
    echo "ERROR: invalid backup type '$TYPE'" >&2
    exit 3
    ;;
esac

log "Pattern: $PATTERN, MTIME: $MTIME"

# -------------------------
# Collect all files for safety guard
# -------------------------
mapfile -d '' ALL_FILES < <(find "$BACKUP_DIR" -maxdepth 1 -name "$PATTERN" -type f -print0 )
TOTAL_FILES=${#ALL_FILES[@]}

log "Total files matching pattern: $TOTAL_FILES"

# -------------------------
# Collect files to delete safely (BusyBox-compatible)
# -------------------------
mapfile -d '' FILES_TO_DELETE < <(
    find "$BACKUP_DIR" -name "$PATTERN" -type f -mtime "$MTIME" -print0 |
    xargs -0 -r ls -1tr |
    tr '\n' '\0'
)

NUM_TO_DELETE=${#FILES_TO_DELETE[@]}
log "Files considered for deletion (oldest first):"
for f in "${FILES_TO_DELETE[@]}"; do
    log "  $f"
done
log "Initial number of files to delete: $NUM_TO_DELETE"

# Apply minimum file guard: Keep the N newest backups
if (( TOTAL_FILES - NUM_TO_DELETE < MIN_FILES )); then
    NUM_TO_DELETE=$(( TOTAL_FILES - MIN_FILES ))
    (( NUM_TO_DELETE < 0 )) && NUM_TO_DELETE=0
    FILES_TO_DELETE=( "${FILES_TO_DELETE[@]:0:$NUM_TO_DELETE}" )
fi
NUM_TO_DELETE=${#FILES_TO_DELETE[@]}

log "Number of files to delete after MIN_FILES guard: $NUM_TO_DELETE"

# -------------------------
# Compute space to free (BusyBox-safe)
# -------------------------
TOTAL_BYTES=0
FILE_LIST_JSON="["

for f in "${FILES_TO_DELETE[@]}"; do
    [[ -f "$f" ]] || continue
    SIZE=$(ls -ln "$f" | awk '{print $5}')  # $5 = size in bytes
    TOTAL_BYTES=$(( TOTAL_BYTES + SIZE ))
    FILE_LIST_JSON+="\"$(json_escape "$f")\","
    log "File: $f, Size: $SIZE bytes"
done

# Remove trailing comma for JSON
FILE_LIST_JSON="${FILE_LIST_JSON%,}]"

SIZE_MB=$(awk "BEGIN {printf \"%.2f\", $TOTAL_BYTES/1024/1024}")
SIZE_GB=$(awk "BEGIN {printf \"%.2f\", $TOTAL_BYTES/1024/1024/1024}")
log "Total space to free: $TOTAL_BYTES bytes ($SIZE_MB MB / $SIZE_GB GB)"

# -------------------------
# Dry-run vs actual deletion
# -------------------------
if [[ "$DRY_RUN" -eq 1 ]]; then
    RESULT_MSG="Dry-run [$TYPE]: would delete ${#FILES_TO_DELETE[@]} file(s), freeing ${SIZE_MB} MB (${SIZE_GB} GB)"
else
    for f in "${FILES_TO_DELETE[@]}"; do
        rm -f "$f"
        log "Deleted file: $f"
    done
    RESULT_MSG="Cleanup [$TYPE]: deleted ${#FILES_TO_DELETE[@]} file(s), freed ${SIZE_MB} MB (${SIZE_GB} GB)"
fi

if [[ "$DEBUG" -eq 1 ]]; then
    echo "$RESULT_MSG"
fi

# -------------------------
# JSON Summary Output
# -------------------------
cat <<EOF
{
  "type": "$TYPE",
  "dry_run": $( [[ "$DRY_RUN" -eq 1 ]] && echo true || echo false ),
  "total_files": $TOTAL_FILES,
  "files_to_delete": ${#FILES_TO_DELETE[@]},
  "space_to_free_MB": $SIZE_MB,
  "space_to_free_GB": $SIZE_GB,
  "files": $FILE_LIST_JSON
}
EOF