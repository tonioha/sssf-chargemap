'use strict';

require('dotenv').config();
const express = require('express');

const helmet = require('helmet');
const graphqlHTTP = require('express-graphql');
const MyGraphQLSchema = require('./schema/schema');
const bodyParser = require('body-parser');
const db = require('./database/db');
const passport = require('./utils/pass');
const authRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoute');

const app = express();
app.use(helmet());


app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(
    '/graphql',
    (req, res) => {
        graphqlHTTP({
            schema: MyGraphQLSchema,
            graphiql: true,
            context: {req, res}
        })(req, res);
    });

app.use('/auth', authRoute);
app.use('/user', userRoute);


db.on('connected', () => {
    if (process.env.NODE_ENV === 'production') {
        const prod = require('./production')(app, process.env.PORT);
    } else {
        const localhost = require('./localhost')(app);
    }
});
