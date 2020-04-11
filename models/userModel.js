const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: String,
  password: String,
  full_name: String
});

module.exports = mongoose.model('User', userSchema);

/*

// fake database functions *********
const getUser = (id) => {
  const user = users.filter((usr) => {
    if (usr.user_id === id) {
      return usr;
    }
  });
  return user[0];
};

const getUserLogin = (email) => {
  const user = users.filter((usr) => {
    if (usr.email === email) {
      return usr;
    }
  });
  return user[0];
};

// *****************

module.exports = {
  users,
  getUserLogin,
  getUser,
};
*/