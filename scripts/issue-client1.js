import { io } from "socket.io-client";

const socket = io("http://localhost:5050/issue-30", {
  auth: { userId: 1, role: "building_manager" }
});

socket.on("connect", () => {
  console.log("connected", socket.id);

  // broadcast to everyone in the issue
  socket.emit("send_message_to_all", { text: "hello everyone from user 1" });

  // private message to user with id 2
  socket.emit("send_message_to_user", { to: 2, text: "private hello to user 2 from user 1" });
});

socket.on("receive_message", (msg) => {
  console.log("receive_message:", msg);
});

socket.on("disconnect", () => console.log("disconnected"));