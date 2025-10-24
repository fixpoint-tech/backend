import { io } from "socket.io-client";

const socket = io("http://localhost:5050/new-issue", {
  // auth: { token: "YOUR_JWT" }, // uncomment if server uses token
});

socket.on("connect", () => {
  console.log("connected", socket.id);
  socket.emit("send_message", { text: "hello from ME" });
});

socket.on("new_issue", (issue) => {
  console.log("new_issue received:", issue);
});

socket.on("disconnect", () => {
  console.log("disconnected");
});