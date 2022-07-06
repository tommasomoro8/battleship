//starting-page-container

//create-game-container
//join-game-container
//-----


//place-boats-container

//place-boats-waiting-container
//-----


//gioco attacco
//gioco attaccato
//-----


//risulatati/gioca ancora
//-----


//overlay

// ----------------- //


const socket = io()

socket.on("player-number-change", playerNum => document.getElementById("players-starting-page").innerText = `Giocatori online ora: ${playerNum}`)


// ----------------- //



const images = ["img/bg.png"]

for (const image of images) {
    const img = new Image()
    img.src = image
}


// ----------------- //


const screens = ["starting-page-container", "place-boats-container"]

function changeScreen(to) {
    let continuee = false
    for (let i = 0; i < screens.length; i++)
        if (to == screens[i]) continuee = true
    if (!continuee) return console.error(`"${to}" is not a screen`)

    for (let i = 0; i < screens.length; i++)
        document.getElementById(screens[i]).style.display = "none"

    document.getElementById(to).style.display = "flex"
}

const modals = ["create-game-container", "join-game-container", "place-boats-waiting-container", "quit-warn-container"]

let lastModalOpened
let modalOpen = false

function openModal(open, what) {
    if (open) {
        if (modalOpen) openModal(false)

        let continuee = false
        for (let i = 0; i < modals.length; i++)
            if (what == modals[i]) continuee = true
        if (!continuee) return console.error(`"${what}" is not a modal`)

        lastModalOpened = document.getElementById(what)

        lastModalOpened.classList.add('active')
        document.getElementById("overlay").classList.add('active')

        modalOpen = true

    } else {
        if (lastModalOpened == undefined || modalOpen == false) return

        lastModalOpened.classList.remove('active')
        document.getElementById("overlay").classList.remove('active')

        modalOpen = false
        
    }

}



// ----- GAME ----- //


//Crea una stanza
let room;
let gameStarted = false

document.getElementById("create-game").addEventListener("click", () => {
    openModal(true, "create-game-container")
    socket.emit("create-room")
})

socket.on("create-room-response", _room => {
    room = _room
    document.getElementById("create-game-code").value = room
})

socket.on("room-ready", () => {
    openModal(false)
    changeScreen("place-boats-container")
})

document.getElementById("create-game-back").addEventListener("click", () => {
    openModal(false)

    socket.emit("delate-room")
    room = undefined

    setTimeout(() => document.getElementById("create-game-code").value = "", 500);
})


//Partecipa a una stanza
document.getElementById("join-game").addEventListener("click", () => {
    openModal(true, "join-game-container")
    document.getElementById("join-game-code").focus()

    document.addEventListener("keyup", gameJoin);
})


document.getElementById("join-game-back").addEventListener("click", () => {
    openModal(false)
    document.removeEventListener("keyup", gameJoin);
    setTimeout(() => document.getElementById("join-game-code").value = "", 500);
})

document.getElementById("join-game-join").addEventListener("click", gameJoin)

function gameJoin(e) {
    if (e.type == "keyup" && e.key != "Enter") return
    
    let joinGameCode = document.getElementById("join-game-code").value
    socket.emit("join-room", joinGameCode)
}

socket.on("join-room-response", response => {
    if (response.outcome) {
        openModal(false)
        setTimeout(() => document.getElementById("join-game-code").value = "", 500);
        document.removeEventListener("keyup", gameJoin);
        changeScreen("place-boats-container")
    } else {
        document.getElementById("join-game-error").style.display = "flex"
        document.getElementById("join-game-error").innerText = response.message
        setTimeout(() => {
            document.getElementById("join-game-error").style.display = "none"
            document.getElementById("join-game-error").innerText = ""
        }, 3000);
    }
})


//Posizionamento navi
document.getElementById("boats-container-quit").addEventListener("click", () => {
    socket.emit("quit-room")
    changeScreen("starting-page-container")
    resetBoats()
})

document.getElementById("boats-container-clear").addEventListener("click", () => {
    resetBoats()
})

document.getElementById("boats-container-done").addEventListener("click", () => {
    if (!checkPlaceAllBoats()) {
        alert("controlla di aver posizionato tutte le barche")
        return
    }

    blockBoats(true)

    socket.emit("player-ready")
})

socket.on("opponent-ready-waiting", () => {
    console.log("il tuo avversario è pronto!")
})

socket.on("player-ready-wait", () => {
    openModal(true, "place-boats-waiting-container")
})

socket.on("opponent-not-ready-anymore", () => {
    console.log("il tuo avversario non è più pronto")
})


socket.on("game-start", () => {
    openModal(false)

    gameStarted = true
    //alert("il gioco è cominciato")


    
})

//Attesa posizionamento navi
document.getElementById("place-boats-waiting-back").addEventListener("click", () => {
    blockBoats(false)
    openModal(false)
    socket.emit("player-not-ready-anymore")
})







socket.on("room-quit", details => {
    if (details.canReconnect)
        document.getElementById("quit-warn-reconnect").innerHTML = `oppure condividi nuovamente il codice partita: <div style="user-select: text;">${details.room}</div>`
    
    openModal(true, "quit-warn-container")
})

document.getElementById("quit-warn-back").addEventListener("click", () => {
    socket.emit("delate-room")
    openModal(false)
    changeScreen("starting-page-container")
    document.getElementById("quit-warn-reconnect").innerText = ""
    resetBoats()
})







// ----------------- //


let offGrid = [];
let defGrid = [];

let boxes = document.getElementsByClassName("grid-box")

for (let i = 0; i < 8; i++) {
    offGrid[i] = []
    for (let j = 0; j < 8; j++) {
        offGrid[i][j] = {div: boxes[i * 8 + j], shot: false, hit: false}
        offGrid[i][j].div.addEventListener("click", () => offensiveGridEvent("click", i, j))
        offGrid[i][j].div.addEventListener("mouseover", () => offensiveGridEvent("mouseover", i, j))
        offGrid[i][j].div.addEventListener("mouseout", () => offensiveGridEvent("mouseout", i, j))
    }
}

for (let i = 0; i < 8; i++) {
    defGrid[i] = []
    for (let j = 0; j < 8; j++) {
        defGrid[i][j] = {div: boxes[i * 8 + j + 64], shot: false, hit: false}
        defGrid[i][j].div.addEventListener("click", () => defensiveGridEvent("click", i, j))
        defGrid[i][j].div.addEventListener("mouseover", () => defensiveGridEvent("mouseover", i, j))
        defGrid[i][j].div.addEventListener("mouseout", () => defensiveGridEvent("mouseout", i, j))
    }
}


let turn = false
let shots

socket.on("turn-change", _turn => {
    console.log(_turn)
    turn = _turn.socket == socket.id
    shots = _turn.shots

    if (turn) console.log("è il mio turno!")
    else console.log("è il turno del mio avversario")

})


const offensiveViewfinder = `<div class="offensiveViewfinder"><div id="offensiveViewfinder-circle" class="center"><div class="offensiveViewfinder-line" id="offensiveViewfinder-top-line"></div><div class="offensiveViewfinder-line" id="offensiveViewfinder-bottom-line"></div><div class="offensiveViewfinder-line" id="offensiveViewfinder-right-line"></div><div class="offensiveViewfinder-line" id="offensiveViewfinder-left-line"></div><div id="offensiveViewfinder-central-circle"></div></div></div>`

function offensiveGridEvent(event, i, j) {
    //if (!gameStarted) return
    switch (event) {
        case "mouseover":
            if (turn) for (let _i = 0; _i < 8; _i++) {
                offGrid[i][_i].div.style.backgroundColor = "rgba(48, 126, 57, 0.5)"
                offGrid[_i][j].div.style.backgroundColor = "rgba(48, 126, 57, 0.5)"
                if (!offGrid[i][j].shot) {
                    document.getElementById("grid-offensive").classList.add("cursorNone")
                    offGrid[i][j].div.innerHTML = offensiveViewfinder
                }
            }
        break;

        case "mouseout":
            if (turn) for (let _i = 0; _i < 8; _i++) {
                document.getElementById("grid-offensive").classList.remove("cursorNone")
                offGrid[i][_i].div.style.backgroundColor = "rgba(0, 0, 0, 0)"
                offGrid[_i][j].div.style.backgroundColor = "rgba(0, 0, 0, 0)"
                offGrid[i][j].div.innerHTML = ""
            }
        break;

        case "click":
            if (turn && !offGrid[i][j].shot)
                shoot(i, j)
        break;
    }
    

}

let shootResponsePos


function shoot(i, j) {

    offGrid[i][j].shot = true
    shootResponsePos = {i, j}

    socket.emit("shoot", {i, j})

    //showWhereAttackClear()
}

socket.on("shoot-response", (hit, sunk) => {
    console.log("shoot-response " + hit + " " + sunk)
    offGrid[shootResponsePos.i][shootResponsePos.j].hit = hit
    socket.emit("turn-manager")
})



socket.on("shoot-at", where => {
    let hit = false
    let sunk = false

    for (let i = 0; i < boats.length; i++) {
        for (let j = 0; j < boats[i].position.length; j++) {
            if (boats[i].position[j].i == where.i && boats[i].position[j].j == where.j) {
                hit = true
                boats[i].hit += 1
                if (boats[i].hit == boats[i].position.length) {
                    sunk = true
                    boats[i].sunk = true
                }
                
                break
            }
        }
    }

    console.warn(where)
    console.log(boats)


    socket.emit("shoot-at-response", hit, sunk)
})


function showWhereAttackClear() {
    for (let _i = 0; _i < 8; _i++)
        for (let _j = 0; _j < 8; _j++) {
            defGrid[_i][_j].div.style.backgroundColor = "rgba(0, 0, 0, 0)"
            defGrid[_i][_j].div.innerHTML = ""
        }
}

function showWhereAttack(i, j) {
    showWhereAttackClear()

    for (let _i = 0; _i < 8; _i++) {
        defGrid[i][_i].div.style.backgroundColor = "rgba(255, 255, 255, 0.2)"
        defGrid[_i][j].div.style.backgroundColor = "rgba(255, 255, 255, 0.2)"
        defGrid[i][j].div.innerHTML = offensiveViewfinder
    }
}

function defensiveGridEvent(event, i, j) {

}