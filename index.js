const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust to your React app's URL
    methods: ["GET", "POST"],
  },
});

let currentQuestion = null;
let votes = {};
let totalVotes = 0;

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Teacher asks a question
  socket.on("askQuestion", (data) => {
    console.log("Teacher asked a question:", data);
    currentQuestion = data;
    votes = {}; // Reset votes
    totalVotes = 0;
    io.emit("newQuestion", currentQuestion); // Broadcast to all clients
  });

  // Student submits a vote
  socket.on("submitVote", (optionIndex) => {
    votes[optionIndex] = (votes[optionIndex] || 0) + 1;
    totalVotes++;
    const percentages = Object.keys(votes).map((key) => ({
      optionIndex: Number(key),
      percentage: ((votes[key] / totalVotes) * 100).toFixed(2),
    }));
    io.emit("updateResults", percentages); // Broadcast updated results
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
