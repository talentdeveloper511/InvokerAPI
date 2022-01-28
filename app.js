var createError = require("http-errors");
var express = require("express");
var mongoose = require("mongoose");
var path = require("path");
cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
const anchor = require("@project-serum/anchor");
const web3 = require("@solana/web3.js");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var config = require("./config/mongodb.json");
var TokenModel = require("./models/TokenModel");
const res = require("express/lib/response");
const { filters } = require("pug/lib");

var app = express();

// Mockup Data
var tokenData =
  "3p2vBFDnk6JF9faqy6LmmivV4udk5pLPTbjyWaaKJSWN ABMxi67zHLz19bpgpzExq7v4a1C4SRp8sTtJC3sYGWBA";
var tokenAddress = "3p2vBFDnk6JF9faqy6LmmivV4udk5pLPTbjyWaaKJSWN";

// DB connection
var mongoDB =
  "mongodb://" + config.database.host + "/" + config.database.database;

const connection = new anchor.web3.Connection(
  "https://solana-api.projectserum.com"
);
const TOKEN_PUBKEY = new web3.PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);
mongoose
  .connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    // don't show the log when it is test
    if (process.env.NODE_ENV !== "test") {
      console.log("Connected to %s", mongoDB);
      console.log("MongoDB is connected ... \n");
      getNFTOwner("3p2vBFDnk6JF9faqy6LmmivV4udk5pLPTbjyWaaKJSWN");
    }
  })
  .catch((err) => {
    console.log("App starting error".err);
    process.exit(1);
  });

const getNFTOwner = async (address) => {
  try {
    let filter = {
      memcmp: {
        offset: 0,
        bytes: address,
      },
    };
    let filter2 = {
      dataSize: 165,
    };
    let getFilter = [filter, filter2];
    let programAccountsConfig = { filters: getFilter, encoding: "jsonParsed" };
    let _listOfTokens = await connection.getParsedProgramAccounts(
      TOKEN_PUBKEY,
      programAccountsConfig
    );

    let res;
    for (let i = 0; i < _listOfTokens.length; i++) {
      if (
        _listOfTokens[i]["account"]["data"]["parsed"]["info"]["tokenAmount"][
          "amount"
        ] == 1
      ) {
        res = _listOfTokens[i]["account"]["data"]["parsed"]["info"]["owner"];
        console.log(
          _listOfTokens[i]["account"]["data"]["parsed"]["info"]["owner"]
        );
        console.log(
          _listOfTokens[i]["account"]["data"]["parsed"]["info"]["tokenAmount"][
            "amount"
          ]
        );
      }
    }

    return res;
  } catch (e) {
    console.log(`An error occured: ${e}`);
  }
};

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
