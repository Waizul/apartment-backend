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

		app.get('/apartments', async (req, res) => {
			const number = parseInt(req.query.number);
			console.log(number);
			const cursor = apartmentCollection.find({});
			const apartments = await cursor.limit(number).toArray();
			// console.log(appointments);
			res.json(apartments);
		});

		app.get('/apartments/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const apartment = await apartmentCollection.findOne(query);
			res.json(apartment);
			console.log(apartment);
		});
		app.post('/apartments', async (req, res) => {
			const apartment = req.body;

			const result = await apartmentCollection.insertOne(apartment);
			res.json(result);
		});
		app.post('/users', async (req, res) => {
			const user = req.body;
			// console.log(user);
			const result = await userCollection.insertOne(user);
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
		// app.put('/users/admin', verifyToken, async (req, res) => {
		// 	const user = req.body;
		// 	console.log(req.decodedEmail);

		// 	const requester = req.decodedEmail;
		// 	if (requester) {
		// 		const requesterAccount = await userCollection.findOne({
		// 			email: requester,
		// 		});
		// 		if (requesterAccount.role === 'admin') {
		// 			const filter = { email: user.email };
		// 			const updateDoc = {
		// 				$set: {
		// 					role: 'admin',
		// 				},
		// 			};
		// 			const result = await userCollection.updateOne(
		// 				filter,
		// 				updateDoc,
		// 			);
		// 			res.json(result);
		// 		}
		// 	} else {
		// 		res.status(403).json('you do not have authority');
		// 	}
		// 	// console.log(user, result);
		// });
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
	} finally {
		// await client.close()
	}
}
run().catch(console.dir);
app.get('/', (req, res) => {
	console.log('novartdb');
});

app.listen(port, () => {
	console.log('running port no', port);
});
