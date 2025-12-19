import 'dotenv/config';
import { Server } from "socket.io";
import messageService from '../services/messageService.js';
import jwt from "jsonwebtoken";
import Issue from '../models/issue.js';
import { Op } from 'sequelize';

let ioInstance = null;
let newIssue = null;
let assign = null;

export const setupSocket = async (server) => {
    const io = new Server(server, {
        cors: { origin: "*" }
    });
    ioInstance = io;

    // Initialize dynamic namespaces for existing active issues
    try {
        const issues = await Issue.findAll({
            where: {
                status: {
                    [Op.or]: ['Open', 'In Progress']
                }
            }
        });

        console.log(`Found ${issues.length} active issues. Creating namespaces...`);

        issues.forEach(issue => {
            makeDynamicNamespace(issue.id);
        });
    } catch (error) {
        console.error("Error initializing issue namespaces:", error);
    }

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
    let roleSpecificID = 3; // temp for testing
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
        const room = `technician:${roleSpecificID}`;
        socket.join(room);
        console.log(`Technician ${roleSpecificID} joined room: ${room} with socket ${socket.id}`);

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

//Emit an assigned_issue event to a specific technician in the /assign namespace.
export function notifyAssign(id,issue) {
    if (!assign) return;
    try {
        const room = `technician:${id}`;
        assign.to(room).emit('assigned_issue', issue);
    } catch (err) {
        console.error('notifyAssign error:', err);
    }
}

// Create a dynamic namespace for a specific issue ID
export function makeDynamicNamespace(issueId) {
    if (!ioInstance) return null;

    console.log(`makeDynamicNamespace for issueId: ${issueId}`);
    const dynamicNamespace = ioInstance.of(`/issue-${issueId}`);

    dynamicNamespace.on("connection", (socket) => {

        // For testing without auth
        const userId = socket.handshake?.auth?.userId || socket.handshake?.query?.userId || socket.data?.userId || socket.id;

        console.log(`User connected to /issue-${issueId} with socket ${socket.id}`);

        // room for all users in this issue
        const issueRoom = `issue:${issueId}`;
        socket.join(issueRoom);
        console.log(`User ${userId} joined room: ${issueRoom}`);

        // personal room for user
        const userRoom = `user:${userId}`;
        socket.join(userRoom);
        console.log(`User ${userId} joined room: ${userRoom}`);

        socket.on("send_message_to_all", (message) => {
            console.log(message);
            socket.to(issueRoom).emit("receive_message", message);
        });

        socket.on("send_message_to_user", async (message, receiverId) => {
            console.log(message);
            socket.to(`user:${receiverId}`).emit("receive_message", message);
            try {
                await messageService.createMessage({
                    body: message.text,
                    sender_id: userId,
                    receiver_id: receiverId,
                    issue_id: issueId,
                });
            } catch (err) {
                console.error('createMessage error:', err);
            }
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return dynamicNamespace;
}

export function removeDynamicNamespace(issueId) {
    if (!ioInstance) return;
    
    try {
        const namespaceName = `/issue-${issueId}`;
        const namespace = ioInstance.of(namespaceName);
        
        console.log(`Removing dynamic namespace: ${namespaceName}`);

        // Emit issue_update event before disconnecting
        namespace.emit('issue_update', { status: 'closed', message: 'The issue has been closed.' });
        
        // Get all sockets in the namespace and disconnect them
        namespace.fetchSockets().then((sockets) => {
            sockets.forEach((socket) => {
                console.log(`Disconnecting socket ${socket.id} from namespace ${namespaceName}`);
                socket.disconnect(true);
            });
            
            // Remove all listeners from the namespace
            namespace.removeAllListeners();
            
            // Delete the namespace from the server
            ioInstance._nsps.delete(namespaceName);
            
            console.log(`Dynamic namespace ${namespaceName} removed successfully`);
        }).catch((err) => {
            console.error(`Error removing namespace ${namespaceName}:`, err);
        });
        
    } catch (err) {
        console.error('removeDynamicNamespace error:', err);
    }
}

// Emit an issue_update event to all clients connected to the /issue-<id> namespace.
export function issueRealtimeUpdate(issueId, issueData) {
    if (!ioInstance) return;
    try {
        const namespace = ioInstance.of(`/issue-${issueId}`);
        namespace.emit('issue_update', issueData);
    } catch (err) {
        console.error('issueRealtimeUpdate error:', err);
    }
}