var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var path = require('path');
var axios = require('axios');

// Scraping tools
var request = require('request');
var cheerio = require('cheerio');

// Requiring Comment and Article models
var db = require("./models");
// var Comment = require("../models/Comment.js");
// var Article = require("../models/Article.js");

// Set mongoose to leverage built-in ES6 Promise
mongoose.Promise = Promise;

var PORT = process.env.PORT || 3000;

var app = express();

// Use morgan and body parser middleware
app.use(logger("dev"));
app.use(bodyParser.urlencoded({extended: true}));
// app.use(express.static('public'));
app.use(express.static(process.cwd() + "/public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({defaultLayout: "main", partialsDir: path.join(__dirname, "/views/layouts/partials/nav")}));
app.set('view engine', 'handlebars');

mongoose.connect(MONGODB_URI);
var connection = mongoose.connection;

connection.on('error', function(error) {
    console.log('Mongoose error: ', error);
});

connection.once('open', function() {
    console.log('Connected to Mongoose!');
});

// Scrape Script function========================================================================
var scrape = function() {
  // Scrape the NYTimes website
  return axios.get("http://www.nytimes.com").then(function(res) {
    var $ = cheerio.load(res.data);

    // Make an empty array to save our article info
    var articles = [];

    // Now, find and loop through each element that has the ".assetWrapper" class
    // (i.e, the section holding the articles)
app.use(bodyParser.urlencoded({extended: true}));
    $(".assetWrapper").each(function(i, element) {
      // In each article section, we grab the headline, URL, and summary

      console.log(element);

      // Grab the headline of the article
      var head = $(this)
        .find("h2")
        .text()
        .trim();

      // Grab the URL of the article
      var url = $(this)
        .find("a")
        .attr("href");

      // Grab the summary of the article
      var sum = $(this)
        .find("p")
        .text()
        .trim();

      // So long as our headline and sum and url aren't empty or undefined, do the following
      if (head && sum && url) {
        // This section uses regular expressions and the trim function to tidy our headlines and summaries
        // We're removing extra lines, extra spacing, extra tabs, etc.. to increase to typographical cleanliness.
        var headNeat = head.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();
        var sumNeat = sum.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();

        // Initialize an object we will push to the articles array
        var dataToAdd = {
          headline: headNeat,
          summary: sumNeat,
          url: "https://www.nytimes.com" + url
        };

        // Push new article into articles array
        articles.push(dataToAdd);
      }
    });
    return articles;
  });
};
// Export the function, so other files in our backend can use it


// Routes======================================================================================

// GET request to render handlebars page
app.get("/", function(req, res) {
    db.Article.find({saved: false}, function(error, data) {
        var hbsObject = {
            article: data
        };
        console.log(hbsObject);
        res.render("home", hbsObject);
    })
})

app.get("/saved", function(req, res) {
    db.Article.find({saved: true})
    .populate("comments")
    .exec(function(error, articles) {
        var hbsObject = {
            article: articles
        };
        res.render("saved", hbsObject);
    });
});

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  return scrape();
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
    db.Article.find({})
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

// Grab an article by it's ObjectId
app.get('/articles/:id', function(req, res) {
    db.Article.findOne({ _id: req.params.id })
    .populate('comments')
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

// Save an article
app.post('/articles/save/:id', function(req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: true})
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

// Delete an article
app.post('/articles/delete/:id', function(req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: false, Comment
: [] }, function(err) {
        if (err) {
            console.log(err);
            res.end(err);
        }    
        else {
            db.Comment.deleteMany({ article: req.params.id })
            .exec(function(err) {
                if (err) {
                    console.log(err);
                    res.end(err);
                } else
                res.send("Article Deleted");
            });
        }        
    }); 
});

// Create a new Comment
app.post("/Comment/save/:id", function(req, res) {
    var newComment = new db.Comment ({
        body: req.body.text,
        article: req.params.id
    });
    newComment.save(function(error, Comment) {
        return db.Article.findOneAndUpdate({ _id: req.params.id }, {$push: {Comment
    : Comment}})
    .exec(function(err) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.send(Comment);
        }
        });    
    });
});    

// Delete a Comment
app.delete('/Comment/delete/:comment_id/:article_id', function(req, res) {
    db.Comment.findOneAndRemove({ _id: req.params.comment_id }, function(err) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            db.Article.findOneAndUpdate({ _id: req.params.article_id }, {$pull: {Comment
        : req.params.note_id}})
            .exec(function(err) {
                if (err) {
                    console.log(err);
                    res.send(err);
                } else {
                    res.end("Comment Deleted");
                }
            });
        }
    });
});

// Start the server
app.listen(PORT, function() {
    console.log(`App running on port ${PORT}!`);
})







































// //dependencies
// var bodyParser = require("body-parser");
// var mongoose = require("mongoose");
// var logger = require("morgan");

// var db = require("./models");
// //initialize Express app
// var express = require("express");
// var app = express();

// app.use(logger("dev"));
// app.use(bodyParser.urlencoded({extended: false}));

// app.use(express.static(process.cwd() + "/public"));
// //Require set up handlebars
// var exphbs = require("express-handlebars");
// app.engine("handlebars",exphbs({defaultLayout: "main", partialsDir: path.join(__dirname, "/views/layouts/partials/nav")}));
// app.set("view engine", "handlebars");

// //connecting to MongoDB
// //mongoose.connect("mongodb://localhost/scraped_news");
// mongoose.connect(MONGODB_URI);
// var connection = mongoose.connection;

// connection.on('error', function(error) {
//     console.log('Mongoose error: ', error);
// });

// connection.once('open', function() {
//     console.log('Connected to Mongoose!');
// });

// var routes = require("./controller/controller.js");
// app.use("/", routes);
// //Create localhost port
// var port = process.env.PORT || 3000;
// app.listen(port, function () {
//   console.log("Listening on PORT " + port);
// });
