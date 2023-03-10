const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.d48h4e6.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri)

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        const serviceCollection = client.db('dentist-review').collection('services');
        const reviewsCollection = client.db('dentist-review').collection('reviews');

        app.get('/homeservices', async (req, res) => {
            const query = {}
           
            const cursor = serviceCollection.find().sort({lastUpdated: -1})
            const services = await cursor.limit(3).toArray();
            res.send(services);
        });
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find().sort({lastUpdated: -1})
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        });

        app.get('/reviews', async (req, res) => {
            let query = {};

            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewsCollection.find().sort({lastUpdated: -1})
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.post('/reviews', async (req, res) => {
            const order = req.body;
            const result = await reviewsCollection.insertOne(order);
            res.send(result);
        });

        // app.patch('/reviews/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const status = req.body.status
        //     const query = { _id: ObjectId(id) }
        //     const updatedDoc = {
        //         $set:{
        //             status: status
        //         }
        //     }
        //     const result = await reviewsCollection.updateOne(query, updatedDoc);
        //     res.send(result);
        // })
        app.put('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const reviewservice = req.body;
            const option = {upsert: true};
            const updatedReview = {
                $set: {
                    name: reviewservice.customer,
                    text: reviewservice.text,
                    img: reviewservice.img
                }
            }
            const result = await reviewsCollection.updateOne(filter, updatedReview, option);
            res.send(result);
        })

        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewsCollection.deleteOne(query);
            res.send(result);
        })


    }
    finally {

    }

}

run().catch(err => console.error(err));


app.get('/', (req, res) => {
    res.send('dentist review server running')
})

app.listen(port, () => {
    console.log(`dentist review server running on ${port}`);
})
