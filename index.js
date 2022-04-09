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