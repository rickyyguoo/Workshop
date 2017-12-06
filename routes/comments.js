var express = require("express");
var router  = express.Router({mergeParams: true});
var Viewevent = require("../models/viewevent");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//Comments New
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find viewevents by id
    console.log(req.params.id);
    Viewevent.findById(req.params.id, function(err, viewevent){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {viewevent: viewevent});
        }
    })
});

//Comments Create
router.post("/",middleware.isLoggedIn,function(req, res){
   //lookup viewevents using ID
   Viewevent.findById(req.params.id, function(err, viewevent){
       if(err){
           console.log(err);
           res.redirect("/viewevents");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               console.log(err);
           } else {
               //add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               //save comment
               comment.save();
               viewevent.comments.push(comment);
               viewevent.save();
               console.log(comment);
               req.flash('success', 'Feedback/Comment Posted');
               res.redirect('/viewevents/' + viewevent._id);
           }
        });
       }
   });
});

router.get("/:commentId/edit", middleware.isLoggedIn, function(req, res){
    // find viewevents by id
    Comment.findById(req.params.commentId, function(err, comment){
        if(err){
            console.log(err);
        } else {
             res.render("comments/edit", {viewevent_id: req.params.id, comment: comment});
        }
    })
});

router.put("/:commentId", function(req, res){
   Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, function(err, comment){
       if(err){
          console.log(err);
           res.render("edit");
       } else {
           res.redirect("/viewevents/" + req.params.id);
       }
   }); 
});

router.delete("/:commentId",middleware.checkUserComment, function(req, res){
    Comment.findByIdAndRemove(req.params.commentId, function(err, comment){
        if(err){
            console.log(err);
        } else {
            Viewevent.findByIdAndUpdate(req.params.id, {
              $pull: {
                comments: comment.id
              }
            }, function(err) {
              if(err){ 
                console.log(err)
              } else {
                req.flash('error', 'Feedback/Comment deleted!');
                res.redirect("/viewevents/" + req.params.id);
              }
            });
        }
    });
});

module.exports = router;