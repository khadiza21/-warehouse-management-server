const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

//moddleware
app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zsuwx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


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

    //find user for details
    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await inventoryCollection.findOne(query);
      res.send(result);
    });

    //POST
    app.post("/inventory", async (req, res) => {
      const newInventory = req.body;
      const result = await inventoryCollection.insertOne(newInventory);
      res.send(result);
    });

    //delete
    app.delete("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await inventoryCollection.deleteOne(query);
      res.send(result);
    });

      //update user
      app.put("/inventory/:id", async (req, res) => {
        const id = req.params.id;
        const updatedQuantity = req.body;
        console.log(updatedQuantity);
        const filter = {_id: ObjectId(id)};
        const options = { upsert: true };
        const updatedDoc = {
          $set: {
            quantity: updatedQuantity.quantity
            
          },
        };
        const result = await inventoryCollection.updateOne(filter,updatedDoc,options);
        res.send(result);
      });

  } finally {
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("server is runnuning and wating for client");
});
app.listen(port, () => {
  console.log("serverr is running on port", port);
});
