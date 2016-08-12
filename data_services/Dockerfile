FROM python:2.7
ADD requirements.txt /usr/src/app/requirements.txt
RUN pip install -r /usr/src/app/requirements.txt
ENV APP_SETTINGS config.DevelopmentConfig
ENV DATABASE_URL postgresql://postgres:@postgresql:5432/atlasdb
# Add the application source code.
# ADD . /usr/src/app
WORKDIR /usr/src/app
# command to run the analysis
# EXPOSE 8000
# CMD ["python", "main.py"]