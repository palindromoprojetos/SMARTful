import { DisconnectReason, Socket } from "socket.io";
import { serverIO } from "./http.server";

interface RoomUser {
    id: string,
    user: string,
    room: string,
}

enum RoomEvent {
    WATCH = 'WATCH',
    WASTE = 'WASTE',
    CHECK = 'CHECK',
    PRINT = 'PRINT',
    GET_NAME = 'GET_NAME',
    SET_NAME = 'SET_NAME',
    SET_ROOM = 'SET_ROOM',
}

let roomUser: Array<RoomUser> = Array<RoomUser>();

const socketName = (length: number) => {
    let result = '';
    let counter = 0;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }

    return result.toUpperCase();
}

serverIO.on('connection',
    (socket: Socket) => {

        socket.on(RoomEvent.GET_NAME,
            (data) => {
                const list = [];

                for (let key of serverIO.sockets.sockets.keys()) {
                    list.push(key);
                }

                if (list.findIndex((item) => item == data.id) != -1) {
                    data.user = `${data.user}_${socketName(5)}`;
                    serverIO.to(data.id).emit(RoomEvent.SET_NAME, data);
                }
            }
        );

        socket.on(RoomEvent.SET_ROOM,
            async (data: any) => {
                const userInRoom = roomUser.find(user => user.user == data.user);

                if(userInRoom) {
                    await socket.leave(userInRoom.room);
                    userInRoom.id = socket.id
                } else {
                    roomUser.push({
                        id: socket.id,
                        user: data.user,
                        room: data.room,
                    });
                }

                await socket.join(data.room);
            }
        );

        socket.on(RoomEvent.WATCH,
            (data: any) => {
                serverIO.to(data.room).emit(RoomEvent.WATCH, data);
            }
        );

        socket.on(RoomEvent.WASTE,
            (data: any) => {
                serverIO.to(data.room).emit(RoomEvent.WASTE, data);
            }
        );

        socket.on(RoomEvent.CHECK,
            (data: any) => {
                serverIO.to(data.room).emit(RoomEvent.CHECK, data);
            }
        );

        socket.on(RoomEvent.PRINT,
            (data: any) => {
                const user = roomUser.find(user => user.user == data.user);
                if(user) {
                    serverIO.to(user.room).emit(RoomEvent.PRINT, data);
                }
            }
        );

        socket.on('disconnect',
            (data: any) => {
                const list: Array<RoomUser> = Array<RoomUser>();

                for (let key of serverIO.sockets.sockets.keys()) {
                    const room: any = roomUser.find(user => user.id == key);

                    if(room) {
                        list.push(Object.assign({},room));
                    }
                }

                roomUser = list;
            }
        );
    }
)

export { RoomEvent, RoomUser, roomUser, serverIO }