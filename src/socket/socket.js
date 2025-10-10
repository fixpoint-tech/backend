import 'dotenv/config';
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

export const setupSocket = (server) => {
    const io = new Server(server, {
        cors: { origin: "*" }
    });

    // Middleware to authenticate user
    // io.use((socket, next) => {
    //     const token = socket.handshake.auth?.token;
    //     if (!token) return next(new Error("No token"));

    //     try {
    //         const payload = jwt.verify(token, process.env.JWT_KEY);
    //         socket.data.userId = String(payload.id);
    //         next();
    //     } catch (err) {
    //         next(new Error("Invalid token"));
    //     }
    // });

    io.on("connection", async (socket) => {
        console.log(`User connected with socket ${socket.id}`);

        //Recieve message
        socket.on("send_message", async (message) => {
            console.log(`Message received from ${socket.id}:`, message);

            // Broadcast to everyone EXCEPT the sender
            socket.broadcast.emit("receive_message", message);
        })

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
}