FROM python:2.7
ADD requirements.txt /usr/src/app/requirements.txt
ADD cities.csv /usr/src/app/cities.csv
ADD city_comparisons.csv /usr/src/app/city_comparisons.csv
ADD grids.csv /usr/src/app/grids.csv
ADD grids_values_export_no0.csv /usr/src/app/grids_values_export_no0.csv
ADD groups.csv /usr/src/app/groups.csv
ADD us.json /usr/src/app/us.json
ADD zip_business.json /usr/src/app/zip_business.json
RUN pip install -r /usr/src/app/requirements.txt
ENV APP_SETTINGS config.DevelopmentConfig
ENV DATABASE_URL postgresql://postgres:@postgresql:5432/atlasdb
# Add the application source code.
# ADD . /usr/src/app
WORKDIR /usr/src/app
# command to run the analysis
# EXPOSE 8000
# CMD ["python", "main.py"]