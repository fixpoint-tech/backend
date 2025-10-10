import { createServer } from "http";
import { io as Client } from "socket.io-client";
import { setupSocket } from "../socket/socket.js";
import { jest } from '@jest/globals';

describe("Socket.IO Basic Communication", () => {
    let httpServer, socketServer, port;
    let client1, client2;

    beforeAll(() => {
        // Suppress console logs during tests
        jest.spyOn(console, "log").mockImplementation(() => { });
    });

    beforeAll((done) => {
        httpServer = createServer();
        socketServer = setupSocket(httpServer);

        httpServer.listen(() => {
            port = httpServer.address().port;

            client1 = new Client(`http://localhost:${port}`);
            client2 = new Client(`http://localhost:${port}`);

            let connectedCount = 0;
            const checkDone = () => {
                connectedCount++;
                if (connectedCount === 2) done();
            };

            client1.on("connect", checkDone);
            client2.on("connect", checkDone);
        });
    });

    afterAll(async () => {
        if (client1.connected) client1.disconnect();
        if (client2.connected) client2.disconnect();

        await new Promise(resolve => socketServer.close(resolve));
        await new Promise(resolve => httpServer.close(resolve));
    });

    test("should broadcast message to other clients", (done) => {
        const testMessage = { text: "Hello world" };

        client2.once("receive_message", (msg) => {
            expect(msg).toEqual(testMessage);
            done();
        });

        client1.emit("send_message", testMessage);
    });

    test("sender should not receive its own message", (done) => {
        const testMessage = { text: "Sender check" };

        // If sender receives a message, fail
        client2.once("receive_message", () => {
            done(new Error("Sender received its own message!"));
        });

        // Emit from client2
        client2.emit("send_message", testMessage);

        // Wait a bit to ensure no message arrives
        setTimeout(done, 500);
    });

});
