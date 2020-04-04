'use strict';

require('dotenv').config();
const express = require('express');
const graphqlHTTP = require('express-graphql');
const MyGraphQLSchema = require('./schema/schema');
const bodyParser = require('body-parser');

const app = express();
const db = require('./database/db');

const passport = require('./utils/pass');

const authRoute = require('./routes/authRoute');

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}));

app.use(
    '/graphql',
    (req, res) => {
        graphqlHTTP({
            schema: MyGraphQLSchema,
            graphiql: true,
            context: {req, res, checkAuth}
        })(req, res);
    });

const checkAuth = (req, res) => {
    passport.authenticate('jwt', {session: false}, (err, user)=>{
        if(err || !user){
            throw new Error('Not authenticated');
        }
    })(req, res)
};


app.use('/auth', authRoute);


db.on('connected', () => {
    app.listen(3000);
});
