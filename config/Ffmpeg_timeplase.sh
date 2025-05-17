#!/bin/bash

time_now=$(date '+%d_%m_%Y_%X')
output_name=$1
output_path=/media/m5ccam/video_$time_now--$output_name.mp4

echo $output_name
echo $output_path
echo $time_now

#cat /media/m5ccam/pictures/*.jpg | ffmpeg -framerate 15 -f image2pipe -i - -c:v libx264 -crf 30 -vf 'scale=720:-1' -preset slow -pix_fmt yuv420p -y $output_path

#cat /media/m5ccam/pictures/*.jpg | ffmpeg -framerate 15 -f image2pipe -i - -c:v libx264 -crf 30 -vf 'scale=720:trunc(ow/a/2)*2,transpose=1' -preset slow -pix_fmt yuv420p -y $output_path

cat /media/m5ccam/pictures/*.jpg | ffmpeg -framerate 24 -f image2pipe -i - -c:v libx264 -crf 30 -vf 'scale=720:trunc(ow/a/2)*2' -preset slow -pix_fmt yuv420p -y $output_path