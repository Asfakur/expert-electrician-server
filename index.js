
const express = require('express')
const app = express()

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require("bson-objectid");

const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config()

const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jzd7k.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db(`${process.env.DB_NAME}`).collection("services");
  const orderCollection = client.db(`${process.env.DB_NAME}`).collection("orders");
  const reviewCollection = client.db(`${process.env.DB_NAME}`).collection("reviews");

  const adminCollection = client.db(`${process.env.DB_NAME}`).collection("admins");

  // get services from db
  app.get('/services', (req, res) => {
    serviceCollection.find()
      .toArray((err, services) => {
        res.send(services);
      })
  })

  //for getting one specific service
  app.get('/service/:serviceId', (req, res) => {
    let id = req.params.serviceId;

    serviceCollection.find({ "_id": ObjectID(id) })
      .toArray((err, documents) => {
        res.send(documents[0]);
      })
  })

  //add service
  app.post('/addService', (req, res) => {
    const newService = req.body;

    //save service to db
    serviceCollection.insertOne(newService)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  //save order to db for requesting addOrder
  app.post('/addOrder', (req, res) => {
    const order = req.body; // as the method is post
    orderCollection.insertOne(order)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })

  //save review to db 
  app.post('/addReview', (req, res) => {
    const review = req.body; // as the method is post
    reviewCollection.insertOne(review)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })

  // get reviews from db
  app.get('/reviews', (req, res) => {
    reviewCollection.find()
      .toArray((err, reviews) => {
        res.send(reviews);
      })
  })

  //get all orders from db
  app.get('/orders', (req, res) => {
    orderCollection.find()
      .toArray((err, orders) => {
        res.send(orders);
      })
  })

  //order status will be changed
  app.post('/changeStatus', (req, res) => {
    const id = req.body.id;
    const newStatus = req.body.status;

    const query = { "_id": ObjectID(id) };
    const update = {
      "$set": {
        "status": newStatus,
      }
    };
    const options = { "upsert": false };
    //save service to db
    orderCollection.updateOne(query, update, options)
      .then(result => {
        res.send(result.modifiedCount > 0)
      })

      .catch(err => console.error(`Failed to update the item: ${err}`));
  })

  //for display orders by email
  app.post('/ordersByEmail', (req, res) => {
    const email = req.body.email;

    orderCollection.find({ "email": email })
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  //add new  admin
  app.post('/addNewAdmin', (req, res) => {
    const newAdmin = req.body;
    //save admin to db
    adminCollection.insertOne(newAdmin)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    adminCollection.find({ adminEmail: email })
      .toArray((err, admins) => {
        res.send(admins.length > 0);
      })
  })


  //for deleting one service
  app.delete('/deleteService/:id', (req, res) => {
    const id = ObjectID(req.params.id);
    serviceCollection.findOneAndDelete({ _id: id })
      .then(result => {
        res.send(result.value);
      })

  })

});

//optional
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})