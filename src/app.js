const express = require("express");
const app = express();

const { Server: HttpServer } = require("http");
const httpServer = new HttpServer(app);

const { Server: IOServer } = require("socket.io");
const io = new IOServer(httpServer);

const { faker } = require("@faker-js/faker");

const { containerMessages, containerProducts } = require("./Container");
const session = require("express-session");

const User = require("./models/users");

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

io.on("connection", async (socket) => {
  console.log("Un cliente se ha conectado");
  const messages = await containerMessages.getDataBaseMessages();
  const products = await containerProducts.getDataBaseProducts();

  socket.emit("products", products);
  socket.on("new-products", async (product) => {
    product.price = parseInt(product.price);

    containerProducts.insertProduct(product);
    const products = await containerProducts.getDataBaseProducts();
    io.sockets.emit("products", products);
  });

  socket.emit("messages", messages);
  socket.on("new-message", async (message) => {
    containerMessages.insertMessage(message);
    const messages = await containerMessages.getDataBaseMessages();

    io.sockets.emit("messages", messages);
  });
});

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "secreto",
    cookie: { httpOnly: false, secure: false, maxAge: 1000 * 600 },
    rolling: true,
    resave: true,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.set("views", "./views");
app.set("view engine", "ejs");

function isValidPassword(user, password) {
  return bcrypt.compareSync(password, user.password);
}

passport.use(
  "login",
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        console.log("Usuario no encontrado");
        return done(null, false);
      }
      if (!isValidPassword(user, password)) {
        console.log("Contraseña incorrecta");
        return done(null, false);
      }
      return done(null, user);
    });
  })
);

function createHash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

passport.use(
  "signup",
  new LocalStrategy(
    { passReqToCallback: true },
    (req, username, password, done) => {
      User.findOne({ username: username }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (user) {
          console.log("Usuario ya existe");
          return done(null, false);
        }
        const newUser = new User({
          username: username,
          password: createHash(password)
        });
        newUser.save((err) => {
          if (err) {
            return done(err);
          }
          return done(null, newUser);
        });
      });
    }
  )
);

passport.serializeUser((user, done) => {
  const { username, _id } = user;
  const response = { username, _id };
  done(null, response);
});

passport.deserializeUser(({ _id }, done) => {
  User.findById(_id, (err, user) => {
    if (err) {
      return done(err);
    }
    return done(null, user);
  });
});

app.get("/", (req, res) => {
  if (req.session.passport) {
    const { username } = req.session.passport.user;
    return res.render("form", { username });
  }
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post(
  "/register",
  passport.authenticate("signup", {
    successRedirect: "/login",
    failureRedirect: "/failregister"
  })
);

app.get("/failregister", (req, res) => {
  res.render("failregister");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("login", {
    successRedirect: "/",
    failureRedirect: "/faillogin"
  })
);

app.get("/faillogin", (req, res) => {
  res.render("faillogin");
});

app.get("/logout", (req, res) => {
  if (req.session.passport) {
    const { username } = req.session.passport.user;
    return req.logOut((err) => {
      if (err) {
        return res.redirect("/login");
      }
      return res.render("logout", { username });
    });
  }
  res.redirect("/login");
});

app.get("/api/productos-test", (req, res) => {
  const products = [];
  for (let i = 0; i < 5; i++) {
    const product = {
      title: faker.commerce.productName(),
      price: faker.commerce.price(),
      thumbnail: faker.image.image()
    };
    products.push(product);
  }
  res.json(products);
});

module.exports = httpServer;
