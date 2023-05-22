const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const connection = () => {
  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: "true",
    })
    .then((conn) => {
      console.log(`mongodb connect success in ${conn.connection.host} `);
    });
};

module.exports = connection;
