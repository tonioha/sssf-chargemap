'use strict';

require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./database/db');

const passport = require('./utils/pass');

const authRoute = require('./routes/authRoute');
const stationRoute = require('./routes/stationRoute');
const connectionRoute = require('./routes/connectionRoute');
const connectionTypeRoute = require('./routes/connectionTypeRoute');
const currentTypeRoute = require('./routes/currentTypeRoute');
const levelTypeRoute = require('./routes/levelTypeRoute');

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/auth', authRoute);
app.use('/station', stationRoute);
app.use('/connection', connectionRoute);
app.use('/connectiontype', connectionTypeRoute);
app.use('/currenttype', currentTypeRoute);
app.use('/leveltype', levelTypeRoute);

db.on('connected', () => {
  app.listen(3000);
});
