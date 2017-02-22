#!/bin/bash

./node_modules/bower/bin/bower install

rm -fr public
mkdir public

./tasks/script.sh
./tasks/sass.sh
