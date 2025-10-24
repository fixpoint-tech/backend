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
    let userID = 1; // temp for testing
    let role = "technician"; // temp for testing


    newIssue.on("connection", async (socket) => {
        // testing without auth
        role = "maintenance_executive";

        if (role !== "maintenance_executive") {
            console.log(`Non-ME tried to connect to new-issue namespace: ${socket.id}`);
            socket.disconnect();
            return;
        }
        console.log(`User connected(new-issue) with socket ${socket.id}`);

        socket.on("send_message", (message) => {
            console.log(message);
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    assign.on("connection", async (socket) => {
        // testing without auth
        role = "technician";

        if (role !== "technician") {
            console.log(`Non-technician tried to connect to assign namespace: ${socket.id}`);
            socket.disconnect();
            return;
        }
        const room = `technician:${userID}`;
        socket.join(room);
        console.log(`Technician ${userID} joined room: ${room} with socket ${socket.id}`);

        socket.on("send_message", (message) => {
            console.log(message);
        });

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

export function notifyAssign(id,issue) {
    if (!assign) return;
    try {
        const room = `technician:${id}`;
        assign.to(room).emit('assigned_issue', issue);
    } catch (err) {
        console.error('notifyAssign error:', err);
    }
}