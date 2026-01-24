#!/bin/bash
set -euo pipefail

# -------------------------
# Bash safety tweaks
# -------------------------
# Nullglob prevents unmatched globs from expanding to literal strings
shopt -s nullglob

# -------------------------
# Configuration
# -------------------------
BACKUP_DIR="/share/NAS_Share/Backup"
TYPE="${1:-}"           # backup type: hourly, daily, weekly, monthly
DRY_RUN="${2:-0}"       # pass 1 for dry-run
MIN_FILES=3             # safety net: always leave at least this many backups

# -------------------------
# Validate input
# -------------------------
if [[ -z "$TYPE" ]]; then
  echo "ERROR: no backup type specified"
  exit 1
fi

if [[ ! -d "$BACKUP_DIR" ]]; then
  echo "ERROR: backup directory '$BACKUP_DIR' does not exist or is not mounted"
  exit 2
fi

# -------------------------
# Determine pattern and retention
# -------------------------
case "$TYPE" in
  hourly)
    PATTERN="HourlyBackup*.tar"
    MTIME="+3"
    ;;
  daily)
    PATTERN="DailyBackup*.tar"
    MTIME="+7"
    ;;
  weekly)
    PATTERN="WeeklyBackup*.tar"
    MTIME="+60"
    ;;
  monthly)
    PATTERN="MonthlyBackup*.tar"
    MTIME="+120"
    ;;
  *)
    echo "ERROR: invalid backup type '$TYPE'"
    exit 3
    ;;
esac

# -------------------------
# Determine files to delete
# -------------------------
# Collect all files matching the pattern
ALL_FILES=( "$BACKUP_DIR"/$PATTERN )
TOTAL_FILES=${#ALL_FILES[@]}

# Find deletable files by mtime
FILES_TO_DELETE=( $(find "$BACKUP_DIR" -name "$PATTERN" -type f -mtime "$MTIME" -print 2>/dev/null) )
NUM_TO_DELETE=${#FILES_TO_DELETE[@]}

# Apply minimum file guard
if (( TOTAL_FILES - NUM_TO_DELETE < MIN_FILES )); then
    NUM_TO_DELETE=$(( TOTAL_FILES - MIN_FILES ))
    if (( NUM_TO_DELETE < 0 )); then
        NUM_TO_DELETE=0
    fi
    # Trim the array to the allowed number of files
    FILES_TO_DELETE=( "${FILES_TO_DELETE[@]:0:$NUM_TO_DELETE}" )
fi

# -------------------------
# Compute space to free
# -------------------------
TOTAL_BYTES=0
for f in "${FILES_TO_DELETE[@]}"; do
    if [[ -f "$f" ]]; then
        SIZE=$(stat -c %s "$f")
        TOTAL_BYTES=$(( TOTAL_BYTES + SIZE ))
    fi
done

SIZE_MB=$(awk "BEGIN {printf \"%.2f\", $TOTAL_BYTES/1024/1024}")
SIZE_GB=$(awk "BEGIN {printf \"%.2f\", $TOTAL_BYTES/1024/1024/1024}")

# -------------------------
# Dry-run vs actual deletion
# -------------------------
if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "Dry-run [$TYPE]: would delete ${#FILES_TO_DELETE[@]} file(s), freeing ${SIZE_MB} MB (${SIZE_GB} GB)"
else
    for f in "${FILES_TO_DELETE[@]}"; do
        rm -f "$f"
    done
    echo "Cleanup [$TYPE]: deleted ${#FILES_TO_DELETE[@]} file(s), freed ${SIZE_MB} MB (${SIZE_GB} GB)"
fi