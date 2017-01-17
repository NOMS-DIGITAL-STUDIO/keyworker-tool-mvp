#!/bin/bash

cd "${0%/*}/lib/"

./node_modules/bower/bin/bower install

rm -fr public
mkdir public

cd ../

./tasks/script.sh
./tasks/sass.sh
