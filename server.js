require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Update this if deploying
        methods: ["GET", "POST"]
    }
});

let buzzerLocked = false;
let firstResponder = null;

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Send current buzzer status when a new client connects
    socket.emit("buzzerStatus", { buzzerLocked, firstResponder });

    // Handle buzzer press
    socket.on("buzz", (name) => {
        if (!buzzerLocked) {
            buzzerLocked = true;
            firstResponder = name || socket.id;
            console.log(`First to buzz: ${firstResponder}`);
            io.emit("buzzerLocked", firstResponder);
        }
    });

    // Reset buzzer
    socket.on("resetBuzzer", () => {
        buzzerLocked = false;
        firstResponder = null;
        console.log("Buzzer reset by admin.");
        io.emit("buzzerReset");
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
