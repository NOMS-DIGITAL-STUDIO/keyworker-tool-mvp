#!/bin/bash

script=public/main.css

mkdir .tmp

# copy sass to temp location
cp -fr ./assets/sass/* .tmp/
cp -fr ./bower_components/bootstrap-sass/assets/stylesheets/* .tmp/

# compile sass
./node_modules/node-sass/bin/node-sass --output-style expanded .tmp/main.scss > .tmp/main.css
rm -f "${script}"
cp .tmp/main.css "${script}"

# clean up
rm -fr .tmp

# copy additional assets to public folder
cp -fr ./bower_components/bootstrap-sass/assets/fonts ./public
cp -fr ./assets/fonts ./public
cp -fr ./assets/images ./public
