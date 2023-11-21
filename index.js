const express = require('express');
const app = express();
let cors = require("cors");
app.use(cors());

const convertRoute = require('./routes/convert');
app.use('/convert',convertRoute);

app.listen(process.env.PORT || 3000);