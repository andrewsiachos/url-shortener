'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bodyParser = require("body-parser");
var cors = require('cors');
var dns = require("dns");

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
mongoose.connect(process.env.MONGO_URI);
app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended:false}));
app.use('/public', express.static(process.cwd() + '/public'));


var urlSchema = new Schema({
  originalUrl:String,
  shortenedUrl:String
});

var UrlModel = mongoose.model("UrlModel", urlSchema);


app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});



app.post("/api/shorturl/new", (req,res,next)=>{
  var userUrl = req.body.url;
  
  
  //Function to check the URL
  dns.lookup(userUrl, (err,address,family)=>{
    if(err){
      res.json({"error":"invalid URL"});
    }else{
      var short = Math.floor(Math.random()*100000).toString();
      
      var newData = new UrlModel({
        originalUrl:userUrl,
        shortenedUrl:short
      });
      
      newData.save(error=>{
        if(error){
          res.send("Error saving to the database");
        }
      });
      res.json({"original_url":userUrl,shortUrl:short});
    }
  });
  
});

app.get("/api/shorturl/:usershorturl", (req,res,next)=>{
  var userInput = req.params.usershorturl;
  
  UrlModel.findOne({"shortenedUrl":userInput}, (error,data)=>{
    if(error){
      res.send("Error reading database");
    }else{
      var finalUrl = "https://"+data.originalUrl;
      res.redirect(301, finalUrl);
    }
  });
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});
