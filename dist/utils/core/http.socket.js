"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverIO = exports.roomUser = exports.RoomEvent = void 0;
const http_server_1 = require("./http.server");
Object.defineProperty(exports, "serverIO", { enumerable: true, get: function () { return http_server_1.serverIO; } });
var RoomEvent;
(function (RoomEvent) {
    RoomEvent["WATCH"] = "WATCH";
    RoomEvent["WASTE"] = "WASTE";
    RoomEvent["CHECK"] = "CHECK";
    RoomEvent["PRINT"] = "PRINT";
    RoomEvent["GET_NAME"] = "GET_NAME";
    RoomEvent["SET_NAME"] = "SET_NAME";
    RoomEvent["SET_ROOM"] = "SET_ROOM";
})(RoomEvent || (exports.RoomEvent = RoomEvent = {}));
let roomUser = Array();
exports.roomUser = roomUser;
const socketName = (length) => {
    let result = '';
    let counter = 0;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result.toUpperCase();
};
http_server_1.serverIO.on('connection', (socket) => {
    socket.on(RoomEvent.GET_NAME, (data) => {
        const list = [];
        for (let key of http_server_1.serverIO.sockets.sockets.keys()) {
            list.push(key);
        }
        if (list.findIndex((item) => item == data.id) != -1) {
            data.user = `${data.user}_${socketName(5)}`;
            http_server_1.serverIO.to(data.id).emit(RoomEvent.SET_NAME, data);
        }
    });
    socket.on(RoomEvent.SET_ROOM, async (data) => {
        const userInRoom = roomUser.find(user => user.user == data.user);
        if (userInRoom) {
            await socket.leave(userInRoom.room);
            userInRoom.id = socket.id;
        }
        else {
            roomUser.push({
                id: socket.id,
                user: data.user,
                room: data.room,
            });
        }
        await socket.join(data.room);
    });
    socket.on(RoomEvent.WATCH, (data) => {
        http_server_1.serverIO.to(data.room).emit(RoomEvent.WATCH, data);
    });
    socket.on(RoomEvent.WASTE, (data) => {
        http_server_1.serverIO.to(data.room).emit(RoomEvent.WASTE, data);
    });
    socket.on(RoomEvent.CHECK, (data) => {
        http_server_1.serverIO.to(data.room).emit(RoomEvent.CHECK, data);
    });
    socket.on(RoomEvent.PRINT, (data) => {
        const user = roomUser.find(user => user.user == data.user);
        if (user) {
            http_server_1.serverIO.to(user.room).emit(RoomEvent.PRINT, data);
        }
    });
    socket.on('disconnect', (data) => {
        const list = Array();
        for (let key of http_server_1.serverIO.sockets.sockets.keys()) {
            const room = roomUser.find(user => user.id == key);
            if (room) {
                list.push(Object.assign({}, room));
            }
        }
        exports.roomUser = roomUser = list;
    });
});
