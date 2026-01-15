#!/bin/bash
time_now=$(date '+%d_%m_%Y_%X')

# Sanitize the input: keep only alphanumeric, dash, underscore; replace spaces with underscores
sanitized_output_name="${1//[^a-zA-Z0-9_-]/_}"
# Optionally limit length to prevent excessively long filenames
sanitized_output_name="${sanitized_output_name:0:100}"

# Always quote variables when building paths
output_path="/media/m5ccam/video_${time_now}--${sanitized_output_name}.mp4"
echo "Output_Path: $output_path"

cat /media/m5ccam/pictures/*.jpg | ffmpeg -framerate 24 -f image2pipe -i - -c:v libx264 -crf 30 -vf 'scale=720:trunc(ow/a/2)*2' -preset slow -pix_fmt yuv420p -y "$output_path" > /dev/null 2>&1