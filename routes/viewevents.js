var express = require("express");
var router  = express.Router();
var Viewevent = require("../models/viewevent");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var geocoder = require('geocoder');

// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//INDEX - show all viewevents
router.get("/", function(req, res){
  if(req.query.search && req.xhr) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      // Get all campgrounds from DB
      Viewevent.find({name: regex}, function(err, allViewevents){
         if(err){
            console.log(err);
         } else {
            res.status(200).json(allViewevents);
         }
      });
  } else {
      // Get all viewevents from DB
      Viewevent.find({}, function(err, allViewevents){
         if(err){
             console.log(err);
         } else {
            if(req.xhr) {
              res.json(allViewevents);
            } else {
              res.render("viewevents/index",{viewevents: allViewevents, page: 'viewevents'});
            }
         }
      });
  }
});

//CREATE - add new viewevents to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to viewevents array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  var cost = req.body.cost;
  geocoder.geocode(req.body.location, function (err, data) {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newViewevent = {name: name, image: image, description: desc, cost: cost, author:author, location: location, lat: lat, lng: lng};
    // Create a new viewevents and save to DB
    Viewevent.create(newViewevent, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/viewevents");
        }
    });
  });
});

//NEW - show form to create new viewevents
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("viewevents/new"); 
});

// SHOW - shows more info about one viewevents
router.get("/:id", function(req, res){
    //find the viewevents with provided ID
    Viewevent.findById(req.params.id).populate("comments").exec(function(err, foundViewevent){
        if(err){
          console.log(err);
        } else {
          console.log(foundViewevent)
          //render show template with that viewevents
          res.render("viewevents/show", {viewevent: foundViewevent});
        }
    });
});

router.get("/:id/edit", middleware.checkUserViewevent, function(req, res){
    //find the viewevents with provided ID
    Viewevent.findById(req.params.id, function(err, foundViewevent){
        if(err){
            console.log(err);
        } else {
            //render show template with that viewevents
            res.render("viewevents/edit", {viewevent: foundViewevent});
        }
    });
});

router.put("/:id", function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newData = {name: req.body.name, image: req.body.image, description: req.body.description, cost: req.body.cost, location: location, lat: lat, lng: lng};
    Viewevent.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, viewevent){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/viewevents/" + viewevent._id);
        }
    });
  });
});

router.delete("/:id", function(req, res) {
  Viewevent.findByIdAndRemove(req.params.id, function(err, viewevent) {
    Comment.remove({
      _id: {
        $in: viewevent.comments
      }
    }, function(err, comments) {
      req.flash('error', viewevent.name + ' deleted!');
      res.redirect('/viewevents');
    })
  });
});

module.exports = router;

