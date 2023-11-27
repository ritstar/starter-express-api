const express = require('express');
const session = require('express-session');
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
app.use(session({
    secret: '9J46LF05vj8DtR2g', // This should be a secret key used to sign the session ID cookie
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false,
        maxAge: 15 * 60 * 1000 } // This should be set to true if you're using HTTPS
  }));

const convertRoute = require('./routes/convert');
const LoginRoute = require('./routes/login');
const LogoutRoute = require('./routes/logout');
const CheckAuthRoute = require('./routes/checkAuth');
const youtubeVideoDownload = require('./routes/youtubeVideoDownload');

app.use('/convert',convertRoute);
app.use('/login',LoginRoute);
app.use('/logout',LogoutRoute);
app.use('/checkAuth',CheckAuthRoute);
app.use('/youtubeVideoDownload',youtubeVideoDownload);

app.listen(process.env.PORT || 3000);