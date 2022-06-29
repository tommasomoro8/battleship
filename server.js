const express = require('express');
const { Socket } = require('socket.io');
const { setTimeout } = require('timers/promises');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('public'))
app.get('/', (req, res) => res.sendFile('public'))


let playerNum = 0;

let rooms = []

/*{
    id: "id della stanza",
    players: [
        {
            id: "id del player",
            num: "0 o 1 in base al primo che è entrato"
            ready: "true o false"

        }
    ],
    game: {
        turn: "0 o 1 in base a quale player tocca"
        finish: "true o false se è finita o meno la partita"
    }
} */

io.on('connection', socket => {

    playerNum++
    io.emit("player-number-change", playerNum)

    let room

    function addPlayerToRoom(num) {
        rooms[findIndexRoom(room)].players.push({id: socket.id, num})
    }

    function quitRoom() {
        if (room == undefined) return

        let index = findIndexRoom(room)

        for (let i = 0; i < rooms[index].players.length; i++)
            if (rooms[index].players[i].id == socket.id) {
                rooms[index].players.splice(i, 1)
                break
            }

        socket.to(room).emit("room-quit", {canReconnect: !rooms[index].roomClose, room})

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

        rooms.push({id: room, roomClose: false, players: [], game: {started: false, finish: false}})

        addPlayerToRoom(0)

        socket.join(room)

        socket.emit("create-room-response", room)
    })

    socket.on("delate-room", () => delateRoom())

    socket.on("join-room", _room => {
        if (room != undefined)
            return socket.emit("join-room-response", {outcome: false, message: "you are already in a room"})

        if (findIndexRoom(_room) == undefined)
            return socket.emit("join-room-response", {outcome: false, message: "the room doesn't exist"})

        if (rooms[findIndexRoom(_room)].players.length != 1) 
            return socket.emit("join-room-response", {outcome: false, message: "number of people not accepted"})

        if (rooms[findIndexRoom(_room)].roomClose)
            return socket.emit("join-room-response", {outcome: false, message: "the game has already started"})

        room = _room

        addPlayerToRoom(1)

        socket.join(room)

        socket.emit("join-room-response", {outcome: true})
        socket.to(room).emit("room-ready")
    })

    socket.on("quit-room", () => quitRoom())

    socket.on("disconnect", () => {
        if (room != undefined)
            if (rooms[findIndexRoom(room)].players.length == 1) delateRoom()
            else if (rooms[findIndexRoom(room)].players.length == 2) quitRoom()

        playerNum--
        io.emit("player-number-change", playerNum)
    })

    //--- Game ---//

    socket.on("player-ready", () => {

        let indexRoom = findIndexRoom(room)
        let indexPlayer = findIndexPlayer(room, socket.id)

        rooms[indexRoom].players[indexPlayer].ready = true

        let roomReady = true
        
        for (const player of rooms[indexRoom].players)
            if (!player.ready) roomReady = false


        if (roomReady) {
            io.to(room).emit("game-start")
            rooms[indexRoom].game.started = true
        }
        else {
            socket.emit("player-ready-wait")

            socket.to(room).emit("opponent-ready-waiting")
        }


        
    })

    socket.on("player-not-ready-anymore", () => {

        let indexRoom = findIndexRoom(room)
        let indexPlayer = findIndexPlayer(room, socket.id)

        rooms[indexRoom].players[indexPlayer].ready = false

        socket.to(room).emit("opponent-not-ready-anymore")
    })




})


//--- Make ID ---//

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
function makeid(length) {
    let id;
    do {
        id = ""
        for (let i = 0; i < length; i++)
            id += characters.charAt(Math.floor(Math.random() * characters.length));
    } while (arrayInclude(id));

    return id;
}

function arrayInclude(id) {
    for (let i = 0; i < rooms.length; i++)
        if (rooms[i].id == id) return true

    return false
}



//--- Find Index of the Room ---//

function findIndexRoom(room) {
    for (let i = 0; i < rooms.length; i++)
        if (rooms[i].id == room)
            return i
}

function findIndexPlayer(room, id) {
    let roomIndex = findIndexRoom(room)

    for (let i = 0; i < rooms[roomIndex].players.length; i++)
        if (rooms[roomIndex].players[i].id == id)
            return i
}


function printRoomsArray() {
    console.clear()
    console.log(rooms)
} setInterval(printRoomsArray, 1000);


server.listen(process.env.PORT || 3000, () => console.log(`Listening on port ${process.env.PORT || 3000}`))