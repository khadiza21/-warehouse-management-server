const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

//moddleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fg0f0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const inventoryCollection = client.db("warehouse").collection("inventory");

    app.get("/inventory", async (req, res) => {
      const query = {};
      const cursor = inventoryCollection.find(query);
      const inventory = await cursor.toArray();
      res.send(inventory);
    });
  } finally {
  }
}
run().catch(console.dir);
// client.connect((err) => {

//   // perform actions on the collection object
//   console.log("Mongo is Connected!");
//   client.close();
// });

app.get("/", (req, res) => {
  res.send("server is runnuning and wating for client");
});
app.listen(port, () => {
  console.log("server is running on port", port);
});
