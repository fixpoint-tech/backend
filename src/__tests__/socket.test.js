import { createServer } from "http";
import { io as Client } from "socket.io-client";
import { setupSocket, makeDynamicNamespace } from "../socket/socket.js";
import { jest } from '@jest/globals';

describe("Socket.IO Basic Communication", () => {
    let httpServer, socketServer, port;
    let issueClient1, issueClient2;

    // Set a timeout for the entire test suite
    jest.setTimeout(10000);

    beforeAll(() => {
        // Suppress console logs during tests
        jest.spyOn(console, "log").mockImplementation(() => { });
        jest.spyOn(console, "error").mockImplementation(() => { });
    });

    beforeAll((done) => {
        httpServer = createServer();
        socketServer = setupSocket(httpServer);

        httpServer.listen(() => {
            port = httpServer.address().port;

            // Create a dynamic namespace first
            const testIssueId = 123;
            makeDynamicNamespace(testIssueId);
            
            // Connect clients to the dynamic namespace
            issueClient1 = new Client(`http://localhost:${port}/issue-${testIssueId}`, {
                forceNew: true,
                timeout: 5000,
                transports: ['websocket'],
                query: { userId: 'user1' }
            });
            issueClient2 = new Client(`http://localhost:${port}/issue-${testIssueId}`, {
                forceNew: true,
                timeout: 5000,
                transports: ['websocket'],
                query: { userId: 'user2' }
            });

            let connectedCount = 0;
            const checkDone = () => {
                connectedCount++;
                if (connectedCount === 2) done();
            };

            const handleError = (error) => {
                done(error);
            };

            issueClient1.on("connect", checkDone);
            issueClient2.on("connect", checkDone);
            issueClient1.on("connect_error", handleError);
            issueClient2.on("connect_error", handleError);
        });
    });

    afterEach(() => {
        // Clean up event listeners after each test
        if (issueClient1) {
            issueClient1.removeAllListeners("receive_message");
        }
        if (issueClient2) {
            issueClient2.removeAllListeners("receive_message");
        }
    });

    afterAll(async () => {
        // Close clients first
        if (issueClient1?.connected) {
            issueClient1.disconnect();
        }
        if (issueClient2?.connected) {
            issueClient2.disconnect();
        }

        // Wait a bit for disconnections to process
        await new Promise(resolve => setTimeout(resolve, 100));

        // Close socket server
        if (socketServer) {
            await new Promise(resolve => {
                socketServer.close(() => {
                    resolve();
                });
            });
        }

        // Close HTTP server
        if (httpServer && httpServer.listening) {
            await new Promise(resolve => {
                httpServer.close(() => {
                    resolve();
                });
            });
        }
    });

    test("should broadcast message to all clients in issue room", (done) => {
        const testMessage = { text: "Hello world" };

        issueClient2.once("receive_message", (msg) => {
            expect(msg).toEqual(testMessage);
            done();
        });

        issueClient1.emit("send_message_to_all", testMessage);
    });

    test("sender should not receive its own message", (done) => {
        const testMessage = { text: "Sender check" };
        let messageReceived = false;

        // If sender receives a message, fail
        const messageHandler = () => {
            messageReceived = true;
            done(new Error("Sender received its own message!"));
        };

        issueClient2.once("receive_message", messageHandler);

        // Emit from client2
        issueClient2.emit("send_message_to_all", testMessage);

        // Wait a bit to ensure no message arrives, then clean up
        setTimeout(() => {
            issueClient2.removeListener("receive_message", messageHandler);
            if (!messageReceived) {
                done();
            }
        }, 300);
    });

});
