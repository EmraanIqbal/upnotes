const mongoose = require("mongoose");

const connectDB = (url) => {
  return mongoose
    .connect(url, {
      useNewUrlParser: true,
      //   useCreateIndex: true,
      useUnifiedTopology: true,
      //   useFindAndModify: true,
    })
    .then(() => console.log("Mongodb connected succesfully"))
    .catch((err) => console.log(err));
};

module.exports = connectDB;
