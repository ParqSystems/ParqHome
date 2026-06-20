const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const mqttClient = require("./mqttClient.js");

const { initIO } = require("./socket.js");
const http = require("http");

const app = express();
app.use(express.json());

const authRoutes = require("./Routes/AuthRoutes.js");

const dashboardRoutes = require("./Routes/DashboardRoutes.js");



app.use(cors());



app.use("/api/auth", authRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
    res.send("Backend is Running....")
});

console.log("PORT : " + process.env.PORT);
console.log("Mongo URI : " + process.env.MONGO_URI);


mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Connected to MongoDB successfully");


    // app.listen(process.env.PORT, () => {
    //     console.log("Server running on port : " + process.env.PORT);
    // });
    
    
    const server = http.createServer(app);
    const io = initIO(server);

    server.listen(process.env.PORT, () => {
        console.log("Server running on port : " + process.env.PORT);
    });



}).catch((error) => {
        console.log("An error occured while connecting to MongoDB : " + error);
});