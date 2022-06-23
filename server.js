const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('public'))
app.get('/', (req, res) => res.sendFile('public'))


let playerNum = 0;

let rooms = []

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
function makeid(length) {
    let id;
    do {
        id = ""
        for (let i = 0; i < length; i++)
            id += characters.charAt(Math.floor(Math.random() * characters.length));
    } while (rooms.includes(id));

    rooms.push({id: id, players: 1})

    return id;
}



io.on('connection', socket => {
    //console.log(rooms)

    playerNum++
    io.emit("player-number-change", playerNum)

    let room;

    function quitRoom() {
        if (room == undefined) return

        rooms[findIndexRoom(room)].players -= 1

        socket.to(room).emit("room-quit")

        socket.leave(room)

        room = undefined
    }

    function delateRoom() {
        if (room == undefined) return

        socket.leave(room)

        let index = findIndexRoom(room);

        if (index != undefined) rooms.splice(index, 1)

        room = undefined
    }

    socket.on("create-room", () => {
        room = makeid(5)

        socket.join(room)

        socket.emit("create-room-response", room)
    })

    socket.on("delate-room", () => delateRoom())

    socket.on("join-room", _room => {
        if (room != undefined)
            return socket.emit("join-room-response", {outcome: false, message: "you are already in a room"})

        if (findIndexRoom(_room) == undefined)
            return socket.emit("join-room-response", {outcome: false, message: "the room doesn't exist"})

        if (rooms[findIndexRoom(_room)].players != 1) 
            return socket.emit("join-room-response", {outcome: false, message: "number of people not accepted"})


        room = _room

        rooms[findIndexRoom(room)].players += 1

        socket.join(room)

        socket.emit("join-room-response", {outcome: true})
        socket.to(room).emit("room-ready")
    })

    socket.on("quit-room", () => quitRoom())

    socket.on("disconnect", () => {

        if (room != undefined) {
            if (rooms[findIndexRoom(room)].players == 1) delateRoom()
            else if (rooms[findIndexRoom(room)].players == 2) quitRoom()
        }

        playerNum--
        io.emit("player-number-change", playerNum)
    })

})

function findIndexRoom(room) {
    for (let i = 0; i < rooms.length; i++)
        if (rooms[i].id == room)
            return i
}


server.listen(3000, () => console.log('Listening on port 3000'))