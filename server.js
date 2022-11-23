import express from "express";
import data from "./data.js";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import seedRouter from "./Routes/seedRoutes.js";
import productRouter from "./Routes/productRoutes.js";
import userRouter from "./Routes/userRoutes.js";
import orderRouter from "./Routes/orderRoutes.js";
import uploadRouter from "./Routes/uploadRoutes.js";

const app = express();
app.use(bodyParser.json());
app.use(cors());
dotenv.config();

mongoose
	.connect(process.env.MONGODM_URL)
	.then(() => {
		console.log("Connected to Mango DB");
	})
	.catch((e) => {
		console.log(e.message);
	});

app.use(express.urlencoded({ extended: true }));

app.get("/api/keys/paypal", (req, res) => {
	res.send(process.env.PAYPAL_CLIENT_ID || "sb");
});

app.use("/api/seed", seedRouter);

app.use("/api/products", productRouter);

app.use("/api/users", userRouter);

app.use("/api/orders", orderRouter);

app.use("/api/uploads", uploadRouter);

// const __dirname = path.resolve();
// console.log(__dirname);
// app.use(express.static(path.join(__dirname, "/frontend/build")));
// app.get("*", (req, res) =>
// 	res.sendFile(path.join(__dirname, "/frontend/build/index.html"))
// );

app.use((err, req, res, next) => {
	res.status(500).send({ message: err.message });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
	console.log(`Running on http://localhost:${port}`);
});
