var express = require('express');
var router = express.Router();
const userModel = require("./users");
const postModel = require("./post");
const passport = require('passport');
const upload = require("./multer")

const localstrategy = require("passport-local")
passport.use(new localstrategy(userModel.authenticate()))



router.get('/', function (req, res, next) {
  res.render('login', { title: 'Express' });
});
router.get('/login', function (req, res, next) {
  res.render('login', { title: 'Express' });
});



router.get('/register', function (req, res, next) {
  res.render('register', { title: 'Express' });
});




router.get('/profile', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts");

  res.render("profile", { user })
});

router.get('/show/posts', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts");

  res.render("show", { user });

});

router.get('/feed', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
 const post = await postModel.find().populate("user")

  res.render("feed", { user, post });
});



router.get('/add', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render("add", { user })
});

router.post('/createpost', isLoggedIn, upload.single("postimage"), async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });

  const postdata = await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename,
  })

  user.posts.push(postdata._id);
  await user.save();
  res.redirect("/profile");

});


router.post('/fileupload', isLoggedIn, upload.single("image"), async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect("/profile")

});

router.post('/register', function (req, res, next) {

  const userdata = new userModel({
    username: req.body.username,
    email: req.body.email,
    contact: req.body.contact,
    name:req.body.fullname,
  })
  userModel.register(userdata, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile")

    })
  })

});

router.post('/login', passport.authenticate("local", {
  failureRedirect: "/",
  successRedirect: "/profile"
}), function (req, res, next) {

});


router.get("/logout", function (req, res, next) {

  req.logOut(function (err) {
    if (err) return next(err)
    res.redirect("/")
  })

})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/")
}

module.exports = router;
