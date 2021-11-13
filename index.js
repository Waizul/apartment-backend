const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const port = process.env.PORT || 7000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q5fov.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

async function run() {
	try {
		await client.connect();
		const database = client.db('novartdb');
		const apartmentCollection = database.collection('apartments');
		const userCollection = database.collection('users');
		const bookingCollection = database.collection('bookings');
		const reviewCollection = database.collection('reviews');

		app.get('/apartments', async (req, res) => {
			let number = 0;
			number = parseInt(req.query.number);
			const cursor = apartmentCollection.find({});
			const apartments = await cursor.limit(number).toArray();
			res.json(apartments);
		});

		app.get('/apartments/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const apartment = await apartmentCollection.findOne(query);
			res.json(apartment);
		});

		app.post('/apartments', async (req, res) => {
			const apartment = req.body;
			const result = await apartmentCollection.insertOne(apartment);
			res.json(result);
		});

		app.delete('/apartments/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await apartmentCollection.deleteOne(query);
			res.json(result);
		});

		app.post('/users', async (req, res) => {
			const user = req.body;
			const result = await userCollection.insertOne(user);
			res.json(result);
		});

		app.put('/users/admin', async (req, res) => {
			const user = req.body;
			const filter = { email: user.email };
			const updateDoc = {
				$set: {
					role: 'admin',
				},
			};
			const result = await userCollection.updateOne(filter, updateDoc);
			res.json(result);
		});

		app.put('/users', async (req, res) => {
			const user = req.body;
			const filter = { email: user.email };
			const options = { upsert: true };
			const updateDoc = { $set: user };
			const result = await userCollection.updateOne(
				filter,
				updateDoc,
				options,
			);
			res.json(result);
		});

		app.get('/users/:email', async (req, res) => {
			const email = req.params.email;
			const query = { email: email };
			const user = await userCollection.findOne(query);
			let isAdmin = false;
			if (user?.role === 'admin') {
				isAdmin = true;
			}
			res.json({ admin: isAdmin });
		});

		app.post('/bookings', async (req, res) => {
			const booking = req.body;
			const result = await bookingCollection.insertOne(booking);
			res.json(result);
		});

		app.get('/bookings', async (req, res) => {
			const cursor = bookingCollection.find({});
			const bookings = await cursor.toArray();
			res.json(bookings);
		});

		app.put('/bookings/:id', async (req, res) => {
			const id = req.params.id;
			const filter = { _id: ObjectId(id) };
			const options = { upsert: true };
			const updateDoc = {
				$set: {
					status: 'confirmed',
				},
			};
			const result = await bookingCollection.updateOne(
				filter,
				updateDoc,
				options,
			);
			res.json(result);
		});

		app.get('/bookings/:email', async (req, res) => {
			const email = req.params.email;
			const query = { email: email };
			const cursor = bookingCollection.find(query);
			const myBooking = await cursor.toArray();
			res.json(myBooking);
		});

		app.delete('/bookings/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await bookingCollection.deleteOne(query);
			res.json(result);
		});

		app.get('/review', async (req, res) => {
			const cursor = reviewCollection.find({});
			const result = await cursor.toArray();
			res.json(result);
		});

		app.post('/review', async (req, res) => {
			const review = req.body;
			const result = await reviewCollection.insertOne(review);
			res.json(result);
		});
	} finally {
		// await client.close()
	}
}
run().catch(console.dir);

app.get('/', (req, res) => {
	res.send('novartdb');
});

app.listen(port, () => {
	console.log('running on port', port);
});
