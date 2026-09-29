import express from 'express';
import cors from 'cors';
import { getGroqChatCompletion } from './utils/Response.js';
import mongoose from 'mongoose';
import chatRoutes from './routes/chat.js'
import userRoutes from './routes/user.js'
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());
app.use(passport.initialize())

const connectDB = async() => {
	try {
		await mongoose.connect(process.env.ATLASDB_URL);
		console.log("Connected to DB")
	} catch(err) {
		console.log(err)
	}
}

const store = MongoStore.create({
	mongoUrl : process.env.ATLASDB_URL,
	collectionName: "session"
})

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  store,
  cookie: { 
	maxAge : 7 * 24 * 60 * 60 *1000
  }
}))

app.use("/", chatRoutes);
app.use("/", userRoutes);

app.get("/health", (_req, res) => {
	res.status(200).json({ status: "ok" });
});



app.listen(port, () => {
  console.log("Server is running");
  connectDB();
})