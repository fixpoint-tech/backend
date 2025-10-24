import 'dotenv/config';
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let ioInstance = null;
let newIssue = null;
let assign = null;

export const setupSocket = (server) => {
    const io = new Server(server, {
        cors: { origin: "*" }
    });
    ioInstance = io;

    newIssue = io.of("/new-issue"); // the "new-issue" namespace for creating new issues
    assign = io.of("/assign"); // the "assign" namespace for assigning issues

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

    newIssue.on("connection", async (socket) => {
        console.log(`User connected(new-issue) with socket ${socket.id}`);

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    assign.on("connection", async (socket) => {
        console.log(`User connected with socket ${socket.id}`);

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
}

//Emit a new_issue event to all clients(Maintenance Executives) connected to the /new-issue namespace.
export function notifyNewIssue(issue) {
    if (!newIssue) return;
    try {
        newIssue.emit('new_issue', issue);
    } catch (err) {
        console.error('notifyNewIssue error:', err);
    }
}