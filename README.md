# scrape_app (Using Mongoose and Cheerio)

## App Description
* A News Article app (Referencing New York Times) that lets users view and leave comments on the latest news.

## Scrape App Overview
* server.js (Sets up our app to use express and to listen at a port.)
* package.json
* package-lock.json
### models
* Article.js
* Comment.js
* index.js
### public
* assets
### views
* handlebars (several handlebars to display a specicif page layout).
### server.js
* Scrape script
* Handling all the routes for the app
* The server connection to Mongo db

## Instructions to Run App
* Run "npm init". When finished, install and save theses npm packages:
    * express
    * express-handlebars
    * mongoose
    * cheerio
    * axios
* Run the applications using node in the command line ("node server.js or nodemon server.js") and open up browser with correct port to see the magic. You can save and comment on articles, as well as clear all.

## Technologies Used
* CSS3
* Bootstrap 4
* JavaScript
* jQuery
* Node
* MongoDB
* NPMs: Express, express-handlebars, Handlebars, body-parser, mongoose, cheerio, axios
## This app was created entirely by Sandy Enow