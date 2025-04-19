const mongoose = require("mongoose");
const connectDb = (uri) => {
  const clientOptions = {
    serverApi: { version: "1", strict: true, deprecationErrors: true },
  };
  async function run() {
    try {
      await mongoose.connect(uri, clientOptions);
      await mongoose.connection.db.admin().command({ ping: 1 });
      console.log("You successfully connected to MongoDB!");
    } finally {
    }
  }
  run().catch(console.dir);
};

module.exports = connectDb;
