const mongoose = require('mongoose');

// Create a new database
const newDataBase = async () => {
  await mongoose.connect('mongodb://localhost:27017/userDB', {
    useNewUrlParser: true,
  });
};
newDataBase();
