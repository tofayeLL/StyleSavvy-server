
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






    //  get all products and also set limit form pagination
    app.get('/products', async (req, res) => {


      const { page = 1, limit = 8, search = '', sort = '', category = '', brand = '' } = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;


      // for searching depends on product name
      const searchQuery = search ? { productName: { $regex: search, $options: 'i' } } : {};


      // Filter product data depends on category and brand name
      if (category) {
        searchQuery.category = category;
      }
      if (brand) {
        searchQuery.brandName = brand;
      }




      // for sorting data depends on price low to high and hight to low and newest date
      let sortProduct = {};
      if (sort === 'priceAsc') {
        sortProduct = { price: 1 };
      } else if (sort === 'priceDesc') {
        sortProduct = { price: -1 };
      }
      /* else if (sort === 'dateDesc') {
        sortProduct = { createdDate: -1 };
      } */

      else if (sort === 'dateDesc') {

        // Sorting by date string
        const products = await productCollection.find(searchQuery).toArray();

        products.sort((a, b) => {

          // Convert "dd-mm-yyyy" to "yyyy-mm-dd"
          const dateA = a.createdDate.split('-').reverse().join('-'); 
          
          const dateB = b.createdDate.split('-').reverse().join('-');
          return new Date(dateB) - new Date(dateA);
        });

        const paginatedProducts = products.slice(skip, skip + limitNum);

        res.send({
          products: paginatedProducts,
          totalPages: Math.ceil(products.length / limitNum),
          currentPage: pageNum,
        });

        return;
      }






      const products = await productCollection.find(searchQuery)
        .sort(sortProduct)
        .skip(skip)
        .limit(limitNum)
        .toArray();

      const totalProducts = await productCollection.countDocuments(searchQuery);

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