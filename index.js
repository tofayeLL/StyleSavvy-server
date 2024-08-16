
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;





// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8mgufzz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();



    // collection
    const productCollection = client.db("StyleSavvy").collection("products");



    //  get all products
    app.get('/products', async (req, res) => {

      /*  const result = await productCollection.find().toArray();
       res.send(result); */


      const { page = 1, limit = 8 } = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      const skip = (pageNum - 1) * limitNum;

      const products = await productCollection.find()
        .skip(skip)
        .limit(limitNum)
        .toArray();

      const totalProducts = await productCollection.countDocuments();

      res.send({
        products,
        totalPages: Math.ceil(totalProducts / limitNum),
        currentPage: pageNum,
      });









    })













    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





















app.get('/', (req, res) => {
  res.send('StyleSavvy Server is running... ');
})

app.listen(port, () => {
  console.log(`StyleSavvy Server is running at port:${port}`)
})