"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
// Utility functions
function makeRemoteId(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}
const app = (0, express_1.default)();
const port = 5000;
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    }
});
// Devices mapping
let remotesIdToWs = new Map();
let remotesWsToId = new Map();
let idToWs = new Map();
let wsToId = new Map();
// Websocket listeners
io.on("connection", ws => {
    console.log(`New connection by ${ws.id}`);
    // Cleanup on disconnect
    ws.on("disconnect", (msg) => {
        const allocatedId = wsToId.get(ws);
        if (allocatedId) {
            console.log(`Browser ${ws.id} disconnected, allocated ID: ${allocatedId}`);
            wsToId.delete(ws);
            idToWs.delete(allocatedId);
        }
        const remoteId = remotesWsToId.get(ws);
        if (remoteId) {
            console.log(`Remote ${ws.id} disconnected, allocated ID: ${remoteId}`);
            remotesWsToId.delete(ws);
            remotesIdToWs.delete(remoteId);
        }
    });
    ws.on("message", (data) => {
        const { type } = data;
        switch (type) {
            // Handle allocate UID requests
            case "request-id":
                console.log("Received request for ID");
                // Do not allocate again if this connection has already been allocated an id
                if (wsToId.has(ws)) {
                    console.log("Sending back cached id");
                    ws.send({
                        type: "request-id",
                        success: true,
                        id: wsToId.get(ws),
                    });
                    break;
                }
                var id;
                do {
                    id = Math.floor(Math.floor(100000 + Math.random() * 900000)).toString();
                } while (idToWs.has(id));
                idToWs.set(id, ws);
                wsToId.set(ws, id);
                console.log(`Allocating ${id} to browser`);
                // Send allocated UID back to client
                ws.send({
                    type: "request-id",
                    success: true,
                    id: id,
                });
                break;
            // Handle connect offer by remote
            case "offer-connect":
                var { to, sdp } = data;
                if (idToWs.has(to)) {
                    console.log(`Forwarding offer to ${to}`);
                    const browserSocket = idToWs.get(to);
                    // Allocate ID for remote
                    var remoteId;
                    do {
                        remoteId = makeRemoteId(Math.floor(Math.random() * 10));
                    } while (remotesIdToWs.has(remoteId));
                    // Add id to remotes
                    remotesIdToWs.set(remoteId, ws);
                    // Pass offer to browser
                    browserSocket.send({
                        type: "offer-connect",
                        sdp: sdp,
                        from: remoteId,
                    });
                }
                else {
                    ws.send({
                        type: "offer-connect",
                        success: false,
                        msg: "ID not found",
                    });
                }
                break;
            // Handle accept by browser 
            case "answer":
                var { sdp, to } = data;
                if (remotesIdToWs.has(to)) {
                    console.log(`Forwarding acceptance to ${to}`);
                    var remoteSocket = remotesIdToWs.get(to);
                    remoteSocket.send({
                        type: "accept",
                        sdp: sdp,
                    });
                }
                break;
            // Handle ice candidate msgs
            case "ice-candidate":
                console.log("At ice candidate");
                var { to, candidate } = data;
                if (remotesIdToWs.has(to)) {
                    console.log(`Forwarding ice candidate to remote ${to}`);
                    var remoteSocket = remotesIdToWs.get(to);
                    remoteSocket.send({
                        type: "ice-candidate",
                        candidate: candidate,
                    });
                }
                else if (idToWs.has(to)) {
                    console.log(`Forwarding ice candidate to browser ${to}`);
                    var browserSocket = idToWs.get(to);
                    browserSocket.send({
                        type: "ice-candidate",
                        candidate: candidate,
                    });
                }
        }
    });
});
server.listen(port, () => {
    console.log(`Signaling server running on port ${port}`);
});
//# sourceMappingURL=index.js.map