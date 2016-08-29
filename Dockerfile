FROM node:argon
# RUN apt-get update -qq && apt-get upgrade -y
ADD package.json npm-shrinkwrap.json* /usr/src/app/
ADD data/. /usr/src/app/data
ADD icons/. /usr/src/app/icons
ADD logos/. /usr/src/app/logos
ADD scripts/. /usr/src/app/scripts
ADD bower_components/. /usr/src/app/bower_components
ADD server/. /usr/src/app/server
ADD stylesheets/. /usr/src/app/stylesheets
ADD font-awesome/. /usr/src/app/font-awesome
ADD bower.json/. /usr/src/app/bower.json
ADD grid.html/. /usr/src/app/grid.html
ADD index.html/. /usr/src/app/index.html
ADD about.html/. /usr/src/app/about.html
WORKDIR /usr/src/app
RUN npm --unsafe-perm install
# ADD node_modules/. /usr/src/app/node_modules
ADD server/app.js /usr/src/app/app.js
ADD server/city_comparisons_data.js /usr/src/app/city_comparisons_data.js
EXPOSE 8080
CMD [ "npm", "start" ]
