#!/bin/bash
echo "startup script for automating the database migrations, and updates"
rm -rf migrations
python /usr/src/app/manage.py db init
python /usr/src/app/manage.py db migrate
python /usr/src/app/manage.py db upgrade
python /usr/src/app/manage.py populate