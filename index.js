const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7fnf5wg.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();


        const assignmentCollection = client.db('groupDB').collection('assignments');
        const submitCollection = client.db('groupDB').collection('submittedAssignments');

        // auth related api
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            console.log(user);
            res.send(user);
        })


        // assignment related api
        app.get('/assignments', async (req, res) => {
            const cursor = assignmentCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/assignments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await assignmentCollection.findOne(query);
            res.send(result);
        })

        app.get('/assignments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: id }
            const result = await assignmentCollection.findOne(query);
            res.send(result);
        })

        // app.get('/assignments/:email', async (req, res) =>{
        //     const email = req.params.email;
        //     console.log(email);
        //     const query = {user_email : email}
        //     console.log(query);
        //     const result = await assignmentCollection.find(query).toArray();
        //     res.send(result);
        // })

        app.post('/assignments', async (req, res) => {
            const newAssignment = req.body;
            console.log(newAssignment);
            const result = await assignmentCollection.insertOne(newAssignment);
            res.send(result);
        })

        app.put('/assignments/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updatedAssignment = req.body;
            const assignment = {
                $set: {
                    title: updatedAssignment.title,
                    imgURL: updatedAssignment.imgURL,
                    description: updatedAssignment.description,
                    assignment_difficulty_level: updatedAssignment.assignment_difficulty_level,
                    thumbnail: updatedAssignment.thumbnail,
                    marks: updatedAssignment.marks,
                    due_date: updatedAssignment.due_date,
                    user_email: updatedAssignment.user_email,
                    user_name: updatedAssignment.user_name
                }
            }

            const result = await assignmentCollection.updateOne(filter, assignment, options)
            res.send(result);
        })

        // submittedAssignments

        app.get('/submittedAssignments', async (req, res) => {
            const result = await submitCollection.find().toArray();
            res.send(result);
        })
        app.post('/submittedAssignments', async (req, res) => {
            const submitAssignment = req.body;
            console.log(submitAssignment);
            const result = await submitCollection.insertOne(submitAssignment);
            res.send(result);
        })

        app.delete('/submittedAssignments/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id : new ObjectId(id) }
            const result = await submitCollection.deleteOne(query);
            res.send(result);
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
    res.send('online group study is running')
})

app.listen(port, () => {
    console.log(`Online Group Study Server is running on port ${port}`)
})