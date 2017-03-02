#!/bin/bash

script=./public/main.js

# move scripts and concat where needed
cp ./bower_components/jquery/dist/jquery.min.js ./public/jquery.js
# cp ./bower_components/jquery-ujs ./public/jquery-ujs.js
cp ./bower_components/bootstrap-sass/assets/javascripts/bootstrap.min.js ./public/bootstrap.js

cp ./assets/scripts/govuk-admin-template/vendor/html5.js ./public/html5.js
cp ./assets/scripts/govuk-admin-template/vendor/respond.min.js ./public/respond.min.js

rm -f "${script}"
cp ./assets/scripts/govuk-admin-template/govuk-admin.js "${script}"
find ./assets/scripts/govuk-admin-template/modules -type f -name '*.js' -exec cat {} + >> "${script}"
cat ./assets/scripts/govuk-admin-template.js >> "${script}"
