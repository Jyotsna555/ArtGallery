require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const aboutme = require(__dirname+"/views/aboutArtist.js");
const https = require("https");
const mongoose = require("mongoose");
const { stringify } = require("querystring");

// mongoose.connect("mongodb://localhost:27017/artgallery", {useNewUrlParser:true, useUnifiedTopology: true, useFindAndModify:false});
mongoose.connect("mongodb+srv://admin_jyotsna:jojo123@cluster0.bqhnk.mongodb.net/artgallery", {useNewUrlParser:true, useUnifiedTopology: true, useFindAndModify:false});

commentSchema=({
    firstName:String,
    lastName:String,
    commtime: Date,
    cbody: String
});

const Comment = mongoose.model("comment", commentSchema);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const aboutText = "Jyotsna Pandit is a student pursuing Electrical Engineering at Delhi Technological University. In her free time, she likes to make digital artwork on her ipad. Apart from this, she has keen interest in web development."
const aboutText = aboutme.getAbout();
let fname="";
let lname="";
let email="";
let pageheading="";


app.get("/", function(req, res){
    pageheading="Guest Registration";
    res.render("register",{pageHeading: pageheading});
});


app.post("/", function(req, res){
     fname = req.body.fname;
     lname = req.body.lname;
     email = req.body.email;

    console.log("Name is: "+fname+" "+lname);

    //Using Mailchimp API pattern https://mailchimp.com/developer/marketing/api/lists/
    //create an object
    //"members" key is an ARRAY OF OBJECTS

    var myObject = {
        members:[
            {
                email_address: email,
                // email_type: text,
                status: "subscribed",
                merge_fields:{
                    // https://us1.admin.mailchimp.com/lists/settings/merge-tags?id=1579378
                    FNAME: fname,
                    LNAME: lname
                }
            }
        ]
    };

    var JSONmyObject = JSON.stringify(myObject);
    //next step is to make a request, POST REQUEST
    const url= "https://us1.api.mailchimp.com/3.0/lists/cbd851fe47";

    const options = {
        method: "POST",
        auth: "jyotsna:"+process.env.API_KEY
    }

    const myRequest = https.request(url, options, function(response){
        console.log("Got a response!!");
        if(response.statusCode === 200){
            res.redirect("home");
        }else{
            res.redirect("error");
        }


        response.on("data", function(data){
            let parsedResponseData = JSON.parse(data);
            //console.log(parsedResponseData);
            //console.log(parsedResponseData.errors.length);
            if(parsedResponseData.errors.length!=0){
                console.log("ERROR!!!!  No response sent to Mailchimp");
            }
            else{
                console.log("Guest has been registered properly.")
            }
        });

    })
    
    myRequest.write(JSONmyObject);

    //res.redirect("home");
    myRequest.end();

});

app.get("/home", function(req, res){
    pageheading="HOME";
    if(fname!="" && email!=""){
        res.render("home", {pageHeading: pageheading});
    }
    else{
        res.render("error", {pageHeading: "OOPS!"});
    }
    //res.render("home", {guestName: fname, pageHeading: pageheading});
});

app.get("/about", function(req, res){
    pageheading="ABOUT";
    if(fname!="" && email!=""){
        res.render("about", {aboutContent: aboutText, pageHeading: pageheading});
    }
    else{
        res.render("error", {pageHeading: "OOPS!"});
    }
    // res.render("about", {aboutContent: aboutText, pageHeading: pageheading});
});

app.get("/artwork", function(req, res){
    pageheading="ARTWORK";
    if(fname!="" && email!=""){
        res.render("artwork", {guestName: fname, pageHeading: pageheading});
    }
    else{
        res.render("error", {pageHeading: "OOPS!"});
    }
    // res.render("artwork", {guestName: fname, pageHeading: pageheading});
});

app.post("/artwork", function(req, res){
    res.redirect("exit");
});

app.get("/exit", function(req, res){
    pageheading = "Thank you for visiting!"
    exitContent="You may close the site!";
    if(fname!="" && email!=""){
        res.render("exit", {guestName: fname, pageHeading: pageheading, exitContent: exitContent});
    }
    else{
        res.render("error", {pageHeading: "OOPS!"});
    }
    // res.render("exit", {guestName: fname, pageHeading: pageheading, exitContent: exitContent});
});

app.post("/back", function(req, res){
    res.redirect("artwork");
});

app.post("/error", function(req, res){
    res.redirect("/");
});

app.get("/comminput", function(req, res){
    pageheading = "Please enter a comment";
    res.render("comminput", {pageHeading: pageheading});
});

app.post("/comminput", function(req, res){
    const fname=req.body.fname;
    const lname=req.body.lname;
    const cbody=req.body.cbody;
    const commtime = new Date();

    const newcomment = new Comment({
        firstName:fname,
        lastName:lname,
        commtime:commtime,
        cbody:cbody
    });

    newcomment.save();

    res.redirect("/comments");
});

app.get("/comments", function(req, res){
    pageheading = "Comments";
    Comment.find({}, function(err, foundcomms){
        if(!err && foundcomms.length!=0){
            const commsHeading = "";

            res.render("comments", {pageHeading: pageheading, commsHeading: commsHeading, comments: foundcomms.reverse()});

        }else{
            const commsHeading = "No comments yet.";
            res.render("comments", {pageHeading: pageheading, commsHeading: commsHeading, comments: []});
        }
    });
});

app.post("/comments", function(req, res){
    res.redirect("comminput");
});

app.post("/exit", function(req, res){
    res.redirect("exit");
});

app.post("/comminput2", function(req, res){
    res.redirect("comminput");
});

app.listen(process.env.PORT || 3000, function(){
    console.log("Server is up and running!");
});

// https://jyotsnasartgallery.herokuapp.com/