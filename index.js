//Imports
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

//Middleware use for server
app.use(cors());
app.use(express.json());


//MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cxsup.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        await client.connect();
        const database = client.db("makemycomplaint");
        const storesCollection = database.collection("stores");
        const usersCollection = database.collection("users");

        //Add users to database those who signed up with Email Password
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        })

        //Add users to database those who signed up with External Provider
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);

        })

        //GET STORES FROM DB
        app.get('/stores', async (req, res) => {
            const cursor = storesCollection.find({});
            const stores = await cursor.toArray();
            res.json(stores);
        })

        //Get single store by unique id
        app.get('/store/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const store = await storesCollection.findOne(query);
            res.json(store);
        })

        //Register new store
        app.post('/register-store', async (req, res) => {
            const store = req.body;
            const result = await storesCollection.insertOne(store);
            res.json(result);
        })



    }
    finally {
        //   await client.close();
    }
}
run().catch(console.dir);
app.get('/', (req, res) => {
    console.log('Hitting backend');
    res.send('MakeMyComplaint Backend Running')
})

app.listen(port, () => {
    console.log('Listening to port number ', port);
})