#!/usr/bin/env bash

echo "AI Skillset Loaded"

skills=(
frontend-engineer
javascript-expert
css-architecture
ui-animation
responsive-design
mapbox-gl-js
geojson-processing
web-performance
lazy-loading
data-processing
nodejs-scripting
ui-ux-design
motion-design
javascript-debugging
browser-devtools
software-architecture
data-visualization
search-filter-systems
gpu-rendering
)

for skill in "${skills[@]}"
do
  echo "• $skill"
done