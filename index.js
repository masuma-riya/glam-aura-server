const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-wkac0pk-shard-00-00.rbwl5qc.mongodb.net:27017,ac-wkac0pk-shard-00-01.rbwl5qc.mongodb.net:27017,ac-wkac0pk-shard-00-02.rbwl5qc.mongodb.net:27017/?ssl=true&replicaSet=atlas-1019oo-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const ProductsCollection = client.db("glamAura").collection("products");

    // all data get

    // app.get("/allProducts", async (req, res) => {
    //   const result = await ProductsCollection.find().toArray();
    //   res.send(result);
    // });
    app.get("/allProducts", async (req, res) => {
      const { brand, category, sortBy, priceMin, priceMax } = req.query;
      const query = {};

      if (brand) {
        query.brand = brand;
      }

      if (priceMin || priceMax) {
        query.price = {};
        if (priceMin) {
          query.price.$gte = parseFloat(priceMin);
        }
        if (priceMax) {
          query.price.$lte = parseFloat(priceMax);
        }
      }

      let sortOption = {};
      if (sortBy === "priceLowToHigh") {
        sortOption.price = 1;
      } else if (sortBy === "priceHighToLow") {
        sortOption.price = -1;
      } else if (sortBy === "newestFirst") {
        sortOption.createdAt = -1;
      }

      const result = await ProductsCollection.find(query)
        .sort(sortOption)
        .toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Glam Aura server side is running on...");
});

app.listen(port, () => {
  console.log(`Glam Aura running on http://localhost:${5000}`);
});
