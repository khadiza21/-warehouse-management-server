const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

//moddleware
app.use(cors());
app.use(express.json());

//token setup
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    console.log("decoded", decoded);
    req.decoded = decoded;
    next();
  });
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zsuwx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const inventoryCollection = client.db("warehouse").collection("inventory");

    // AUTH
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });

    //get all data of inventory items
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

    // get users items
    app.get("/myitems", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      console.log(email);
      if (email == decodedEmail) {
        const query = { email: email };
        const cursor = inventoryCollection.find(query);
        const myitems = await cursor.toArray();
        res.send(myitems);
      } else {
        res.status(403).send({ message: "forbidden access" });
      }
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

    //update 
    app.put("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const updatedQuantity = req.body;
      console.log(updatedQuantity);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          quantity: updatedQuantity.quantity,
        },
      };
      const result = await inventoryCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("warehouse server is runnuning");
});
app.listen(port, () => {
  console.log("server is running on port", port);
});
