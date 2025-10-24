import { io } from "socket.io-client";

const socket = io("http://localhost:5050/assign", {
  //auth: { userId: "TECHNICIAN_ID_HERE", role: "technician" } // replace with real id or use query
});

socket.on("connect", () => {
  console.log("connected", socket.id);
  socket.emit("send_message", { text: "hello from Technician" });
});

socket.on("assigned_issue", (issue) => {
  console.log("assigned_issue received:", issue);
});

socket.on("disconnect", () => console.log("disconnected"));