#! /bin/bash

build_type="${1:-release}"

if [ $build_type != debug ] && [ $build_type != release ]
then
    echo Usage: build.sh [release|debug]
    echo
    echo Build defaults to 'release'
    exit
fi

build_arch="linux-$(uname -m)"
build_dir="./build/$build_type/$build_arch"

echo Building pi-health in $build_type configuration for $build_arch

TIMEFORMAT='Finished in %R seconds'
time {
    cd ui
    rm -r ./dist
    npm ci
    npm run build
    cd ..

    cd client
    cargo build --$build_type
    cd ..

    rm -r $build_dir
    mkdir -p $build_dir/ui

    cp ./client/target/$build_type/pi-health $build_dir
    cp -r ./ui/dist/* $build_dir/ui
}