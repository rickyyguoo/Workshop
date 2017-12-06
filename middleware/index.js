var Comment = require("../models/comment");
var Viewevent = require("../models/viewevent");
module.exports = {
    isLoggedIn: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash("error", "Please Sign in! or Sign Up to create Events / Comments !");
        res.redirect("/login");
    },
    checkUserViewevent: function(req, res, next){
        if(req.isAuthenticated()){
            Viewevent.findById(req.params.id, function(err, viewevent){
               if(viewevent.author.id.equals(req.user._id) || req.user.isAdmin){
                   next();
               } else {
                   req.flash("error", "You don't have permission to do that!");
                   console.log("Not Good");
                   res.redirect("/viewevents/" + req.params.id);
               }
            });
        } else {
            req.flash("error", "Please Sign in! or Sign Up to create Events / Comments !");
            res.redirect("/login");
        }
    },
    checkUserComment: function(req, res, next){
        console.log("YOU MADE IT!");
        if(req.isAuthenticated()){
            Comment.findById(req.params.commentId, function(err, comment){
               if(comment.author.id.equals(req.user._id) || req.user.isAdmin){
                   next();
               } else {
                   req.flash("error", "You don't have permission to do that!");
                   res.redirect("/viewevents/" + req.params.id);
               }
            });
        } else {
            req.flash("error", "Please Sign in! or Sign Up to create Events / Comments !");
            res.redirect("login");
        }
    }
}