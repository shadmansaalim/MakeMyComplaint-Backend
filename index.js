//Imports
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const admin = require("firebase-admin");
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;


//Firebase Admin Initialization
const serviceAccount = './makemycomplaint-eb757-firebase-adminsdk-jakjx-8ca4702a96.json';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


//Middleware use for server
app.use(cors());
app.use(express.json());


//MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cxsup.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//Function to verify user using JWT token
async function verifyToken(req, res, next) {
    if (req.headers?.authorization?.startsWith('Bearer ')) {
        const token = req.headers.authorization.split(' ')[1];

        try {
            const decodedUser = await admin.auth().verifyIdToken(token);
            req.decodedEmail = decodedUser.email;
        }
        catch {

        }
    }
    next();
}


async function run() {
    try {
        await client.connect();
        await client.connect();
        const database = client.db("makemycomplaint");
        const storesCollection = database.collection("stores");
        const usersCollection = database.collection("users");
        const complaintsCollection = database.collection("complaints");

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

        //Checking if user is admin or not
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
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
            const manager = store.manager;
            const managerEmail = store.email;
            const user = {
                name: manager,
                email: managerEmail,
                role: 'manager'
            };
            const filter = { email: managerEmail };
            const options = { upsert: true };
            const updateDoc = {
                $set: user
            };
            const update = await usersCollection.updateOne(filter, updateDoc, options);
            const result = await storesCollection.insertOne(store);
            res.json(result);
        })

        // Make a complaint
        app.post('/complaint', async (req, res) => {
            const complaint = req.body;
            const result = await complaintsCollection.insertOne(complaint);
            res.json(result);
        })


        //Dashboard Data For Admin
        app.get('/dashboard-data', verifyToken, async (req, res) => {
            const userEmail = req.query.email;
            if (req.decodedEmail === userEmail && userEmail !== undefined) {
                let result = {};
                let cars = database.collection('stores');
                await cars.count().then((storesCount) => {
                    result.stores = storesCount;
                });
                let users = database.collection('users');
                await users.count().then((usersCount) => {
                    result.users = usersCount;
                });
                res.json(result);
            }
            else {
                //Sending status of unauthorization
                res.status(401).json({ message: 'User Not Authorized' })
            }
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