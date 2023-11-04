#!/bin/bash

# ensure you have the standalone tailwindcss CLI on your path.
# see: https://tailwindcss.com/blog/standalone-cli

tw-init() {
	tailwindcss init
}
	
tw-watch() {
	tailwindcss -i assets/css/input.css -o assets/css/main.css --watch
}

tw-compile() {
	tailwindcss -i assets/css/input.css -o assets/css/main.css --minify
}