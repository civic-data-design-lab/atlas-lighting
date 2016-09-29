# Atlas of lighting
Atlas of lighting is an interactive mapping tool in which the user can combine, isolate or cross-reference both quantitative and qualitative datasets.
Atlas of Lighting is a joint project between Philips, MIT Center for Advanced Urbanism and MIT Civic Data Design Lab.


## development: a microservices setup with docker-compose
This application is written using a _distributed microservices architecture_ and a _CI/CD development_ setup using _docker containers_, and it needs to run four services including a web application with nodejs, a postgres databse, a nginx web server, and a service for database migration works called data_services. These will be managed by docker-compose, and are deployed on docker cloud.

###Why the setup?
Microservices architecture highly increases the scalability of the application, meaning not only additional services (for example to handle the authentications, etc.) but also makes the application reusable (for example the database could be used as part of other projects).

### local development setup
#### pre-requirements
#####Environment Setup for Mac

This application uses Docker and containers technology. If you don't already have Docker installed, you can do so using one of the following:

- [Docker for Mac](https://docs.docker.com/docker-for-mac/) 
- [Docker Toolbox](https://docs.docker.com/toolbox/toolbox_install_mac/)

Further instructions on how to test if Docker is correctly installed and troubleshooting instructions are available on Docker's website.


#####Environment Setup for Windows

This application uses Docker and containers technology. If you don't already have Docker installed, you can do so using one of the following:

- [Docker for Windows](https://docs.docker.com/docker-for-windows/) (for Windows 10) 
- [Docker Toolbox](https://docs.docker.com/toolbox/toolbox_install_windows/) (for Windows 8.1 or earlier) 

Further instructions on how to test if Docker is correctly installed and troubleshooting instructions are available on Docker's website.

#### Develop
After cloning from github and in terminal cd in the directory and run `docker-compose up -d --build` to build and run the application. Make sure they are up and running with `docker-compose ps`.

If you using docker for windows you should be able to see the app using just localhost for the address, if not and you are using older versions of docker such as docker-toolbox, you need to get the ip using: `docker-machine ip default`. You will still need to do database migration and populate it with data from the csv files. For that I made a service called `data_services` which is a `flask` app with custom migration methods. Run  the following commands in terminal (note that atlaslighting_dataservices_1 is the name of the service the `docker-compose ps` command returns and might be different in your machine if you changed the folder name):

```
docker exec -it atlaslighting_dataservices_1 rm -rf migrations
docker exec -it atlaslighting_dataservices_1 python manage.py create_db
docker exec -it atlaslighting_dataservices_1 python manage.py db init
docker exec -it atlaslighting_dataservices_1 python manage.py db migrate
docker exec -it atlaslighting_dataservices_1 python manage.py db upgrade
docker exec -it atlaslighting_dataservices_1 python manage.py populate
```
## web application module stand alone setup
_please note that the stand alone setup of the app won't have the web server, and database components_
### setup
This app is written for a [*NIX](https://en.wikipedia.org/wiki/Unix-like) environment only, all commands are run in terminal.
You need Nodejs and [npm](https://www.npmjs.com/) for package management.     
In Mac, you can install npm using [Homebrew](http://brew.sh/)– Install Homebrew if you don't have it from their webpage.     
After brew installed, in your terminal:

```brew install npm```     




### develop     
For development, we will need to have a distributed version control system set up. See this [short intro](https://storage.googleapis.com/arminakhavan-dot-co/introgit/intro_to_git.html#6) for general information on git.



First, fork this repository to your Github account. You can do this by clicking on __Fork__ on the project's Github page at https://github.com/civic-data-design-lab/atlas-lighting.git.       


After Forking to your account, __Clone__ the repository to your local machine by:      

``` git clone <your-github-repository>```


Point into the project folder in terminal:     



```cd atlas-lighting```


Install the project dependencies with npm.   


```
npm install
```   
Install bower for front-end packages.   



```
npm install -g bower
```

Then

```
bower install
```   

After installing all dependencies using npm, and bower, the local application environment should all set up to serve the application on your local host. Run the node server with:    

```
npm start
```

Check out the application live on `localhost:8080` in your browser.