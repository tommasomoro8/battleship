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


// ----------------- //


//Crea una stanza
let room;

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
})

document.getElementById("join-game-back").addEventListener("click", () => {
    openModal(false)
})

document.getElementById("join-game-join").addEventListener("click", () => {
    let joinGameCode = document.getElementById("join-game-code").value
    socket.emit("join-room", joinGameCode)
})

socket.on("join-room-response", response => {
    if (response.outcome) {
        openModal(false)
        changeScreen("place-boats-container")
    } else {
        document.getElementById("join-game-error").style.display = "flex"
        document.getElementById("join-game-error").innerText = response.message
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
    alert("il gioco è cominciato")
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
