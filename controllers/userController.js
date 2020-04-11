const bcrypt = require('bcrypt');
const saltRound = 12;
const userModel = require('../models/userModel');

const user_get_by_username = async (username) => {
    return await userModel.findOne({username});
};

const user_get_by_id = async (username) => {
    return await userModel.findOne({id});
};

const user_post = async (req, res) => {
    console.log('user_post', req.body);
    try {
        const hash = await bcrypt.hash(req.body.password, saltRound);
        req.user = {
            email: req.body.username,
            password: hash,
            full_name: req.body.full_name,
        };
        let newUser = new userModel(req.user);
        const result = await newUser.save();
        delete result.password;
        const user = {
            username: result.username,
            full_name: result.full_name,
        };
        res.json({
            message: 'User created',
            user,
        });
    }
    catch (e) {
        res.status(500).json(e);
    }

};

module.exports = {
    user_post,
    user_get_by_username,
};
