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

const socket = io()

socket.on("player-number-change", playerNum => document.getElementById("players-starting-page").innerText = `Giocatori online ora: ${playerNum}`)


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
        if (modalOpen) return

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
})

document.getElementById("boats-container-clear").addEventListener("click", () => {

})

document.getElementById("boats-container-done").addEventListener("click", () => {
    openModal(true, "place-boats-waiting-container")
})

//Attesa posizionamento navi
document.getElementById("place-boats-waiting-back").addEventListener("click", () => {
    openModal(false)
})

socket.on("room-quit", () => {
    openModal(true, "quit-warn-container")
})

document.getElementById("quit-warn-back").addEventListener("click", () => {
    socket.emit("delate-room")
    openModal(false)
    changeScreen("starting-page-container")
})




//changeScreen("place-boats-container")


let offensiveGrid = [];
let defensiveGrid = [];

let boxes = document.getElementsByClassName("grid-box")

for (let i = 0; i < 8; i++) {
    offensiveGrid[i] = []
    for (let j = 0; j < 8; j++) {
        offensiveGrid[i][j] = boxes[i*8+j]
        offensiveGrid[i][j].addEventListener("click", () => offensiveGridEvent("click", i, j))
        offensiveGrid[i][j].addEventListener("mouseover", () => offensiveGridEvent("mouseover", i, j))
        offensiveGrid[i][j].addEventListener("mouseout", () => offensiveGridEvent("mouseout", i, j))
    }
}

for (let i = 0; i < 8; i++) {
    defensiveGrid[i] = []
    for (let j = 0; j < 8; j++) {
        defensiveGrid[i][j] = boxes[i*8+j + 64]
        defensiveGrid[i][j].addEventListener("click", () => defensiveGridEvent("click", i, j))
        defensiveGrid[i][j].addEventListener("mouseover", () => defensiveGridEvent("mouseover", i, j))
        defensiveGrid[i][j].addEventListener("mouseout", () => defensiveGridEvent("mouseout", i, j))

    }
}

//quando attacco

const offensiveViewfinder = `<div class="offensiveViewfinder"><div id="offensiveViewfinder-circle" class="center"><div class="offensiveViewfinder-line" id="offensiveViewfinder-top-line"></div><div class="offensiveViewfinder-line" id="offensiveViewfinder-bottom-line"></div><div class="offensiveViewfinder-line" id="offensiveViewfinder-right-line"></div><div class="offensiveViewfinder-line" id="offensiveViewfinder-left-line"></div><div id="offensiveViewfinder-central-circle"></div></div></div>`

function offensiveGridEvent(event, i, j) {
    //showWhereAttack(i, j)
    switch (event) {
        case "mouseover":
            for (let _i = 0; _i < 8; _i++) {
                offensiveGrid[i][_i].style.backgroundColor = "rgba(48, 126, 57, 0.5)"
                offensiveGrid[_i][j].style.backgroundColor = "rgba(48, 126, 57, 0.5)"
                offensiveGrid[i][j].innerHTML = offensiveViewfinder
            }
        break;

        case "mouseout":
            for (let _i = 0; _i < 8; _i++) {
                offensiveGrid[i][_i].style.backgroundColor = "rgba(0, 0, 0, 0)"
                offensiveGrid[_i][j].style.backgroundColor = "rgba(0, 0, 0, 0)"
                offensiveGrid[i][j].innerHTML = ""
            }
        break;

        case "click":
            showAttack()
        break;
    }
    

}


//quando vengo attaccato

function showWhereAttackClear() {
    for (let _i = 0; _i < 8; _i++)
        for (let _j = 0; _j < 8; _j++) {
            defensiveGrid[_i][_j].style.backgroundColor = "rgba(0, 0, 0, 0)"
            defensiveGrid[_i][_j].innerHTML = ""
        }
}

function showWhereAttack(i, j) {
    showWhereAttackClear()

    for (let _i = 0; _i < 8; _i++) {
        defensiveGrid[i][_i].style.backgroundColor = "rgba(255, 255, 255, 0.2)"
        defensiveGrid[_i][j].style.backgroundColor = "rgba(255, 255, 255, 0.2)"
        defensiveGrid[i][j].innerHTML = offensiveViewfinder
    }
}

function showAttack() {
    showWhereAttackClear()

}

function defensiveGridEvent(event, i, j) {
    //console.log(event, i, j)
}


changeScreen("place-boats-container") //AAAA







// DRAG DROP

let _boats = document.getElementsByClassName("boat")
let boats = []

let divTaken
let indexDivTaken
let whereTaken
let over = false

let boatsGrid = []
for (let i = 0; i < 8; i++) {
    boatsGrid[i] = []
    for (let j = 0; j < 8; j++)
        boatsGrid[i][j] = false;
}


for (let i = 0; i < _boats.length; i++) {
    boats.push({div: _boats[i], length: (i < 2) ? i + 2 : i + 1, vertical: true, position: [], reSaveBoatPosition: {}})
    boats[i].div.addEventListener("click", () => {
        
        if (boats[i].position.length == 0) return //per chiamare questa funzione la barca deve essere posizionata!!!
        
        boats[i].vertical = !boats[i].vertical

        //console.log(checkIllegality(saveBoatPosition(boats[i].reSaveBoatPosition.attachPos.i, boats[i].reSaveBoatPosition.attachPos.j, i, boats[i].reSaveBoatPosition.centralPos, false), i))

        if (checkIllegality(saveBoatPosition(boats[i].reSaveBoatPosition.attachPos.i, boats[i].reSaveBoatPosition.attachPos.j, i, boats[i].reSaveBoatPosition.centralPos, false), i)) {
            showCannotTurn(i)
            boats[i].vertical = !boats[i].vertical
        } else {
            if (!boats[i].vertical)
                boats[i].div.classList.add('horizontal')
            else
                boats[i].div.classList.remove('horizontal')

            saveBoatPosition(boats[i].reSaveBoatPosition.attachPos.i, boats[i].reSaveBoatPosition.attachPos.j, i, boats[i].reSaveBoatPosition.centralPos)
        }
    })
    
}

for (let i = 0; i < boats.length; i++) {
    // boats[i].div.addEventListener("dragstart", () => console.log("dragstart"))
    // boats[i].div.addEventListener("dragend", () => {
    //     console.log("dragend")
    // })

    boats[i].div.addEventListener("dragstart", (e) => {

        divTaken = boats[i].div
        indexDivTaken = i

        let dragYpercent

        if (boats[i].vertical)
            dragYpercent = e.offsetY / boats[i].div.offsetHeight * 100
        else
            dragYpercent = e.offsetX / boats[i].div.offsetWidth * 100

        for (let p = 1; p <= boats[i].length; p++)
            if (dragYpercent < 100 / boats[i].length * p) {
                whereTaken = p
                break
            }

        setTimeout(() => divTaken.style.display = "none", 0);

    })


    boats[i].div.addEventListener("dragend", (e) => {
        
        if (!over) divTaken.style.display = "flex"

        over = false
    })
}

let illegalPos = false

//ANCHE SE VA SOPRA!
//QUANDO GIRA
//SALVATAGGIO BARCHE

defensiveGrid.forEach((row, i) => row.forEach((box, j) => {
    // box.addEventListener("dragover", () => console.log("dragover"))
    // box.addEventListener("dragenter", () => setTimeout(() => console.log("dragenter"), 1))
    // box.addEventListener("dragleave", () => console.log("dragleave"))
    // box.addEventListener("drop", () => console.log("drop"))

    function dragoverEventListener(e) {
        e.preventDefault()
        over = true
    }

    box.addEventListener("dragover", dragoverEventListener)
    
    box.addEventListener("dragenter", (e) => setTimeout(() => {
        e.preventDefault()

        over = true
        illegalPos = false

        let centralPosition = findCentralPosition(i, j)
        let positions = saveBoatPosition(centralPosition.i, centralPosition.j, indexDivTaken, centralPosition.centralPos, false)

        //console.log(positions)

        illegalPos = checkIllegality(positions, indexDivTaken)
            
        

        if (illegalPos)
            box.removeEventListener("dragover", dragoverEventListener)
    
    }, 1))


    box.addEventListener("dragleave", () => {
        over = false
        box.addEventListener("dragover", dragoverEventListener)
    })

    box.addEventListener("drop", () => {

        let centralPosition = findCentralPosition(i, j)
    
        defensiveGrid[centralPosition.i][centralPosition.j].append(divTaken)
        saveBoatPosition(centralPosition.i, centralPosition.j, indexDivTaken, centralPosition.centralPos)
    
        divTaken.style.display = "flex"
    
    })
}))

function checkIllegality(positions, indexDiv) {
    let illegal = false

    for (const position of positions) {
        if (position.i < 0 || position.i > 7 || position.j < 0 || position.j > 7) {
            illegal = true
            break
        }

        let cubeOwnBoat = false

        for (const boatsPosition of boats[indexDiv].position)
            if (boatsPosition.i == position.i && boatsPosition.j == position.j) //PROBLEMA QUI
                cubeOwnBoat = true

        if (boatsGrid[position.i][position.j] && !cubeOwnBoat) {
            illegal = true
            break
        }
    }

    //console.log(illegal)

    return illegal
}


function showCannotTurn(boatIndex) {
    boats[boatIndex].div.classList.add('ticker')
    setTimeout(() => boats[boatIndex].div.classList.remove('ticker'), 600);
}


function findCentralPosition(i, j) {
    let centralPos = Math.round(boats[indexDivTaken].length / 2)
    if (boats[indexDivTaken].length % 2 == 0) centralPos += 1

    let attachPos = centralPos - whereTaken
    if (boats[indexDivTaken].vertical) {
        return {i: i + attachPos, j, centralPos}
    } else {
        return {i, j: j + attachPos, centralPos}
    }
}


//   dando i e j di attacco, indice della barca nell'array di barche e la posizione centrale (corrispondente a i e j di attacco)
//   torna tutte le i e j che la barca occuperebbe
function saveBoatPosition(i, j, boatIndex, centralPos, save = true) {

    let positions = []

    if (save) {
        for (let i = 0; i < boats[boatIndex].position.length; i++) 
            boatsGrid[boats[boatIndex].position[i].i][boats[boatIndex].position[i].j] = false

        boats[boatIndex].reSaveBoatPosition = {attachPos: {i, j}, centralPos}

        boats[boatIndex].position = []
    }

    for (let _i = 0; _i < centralPos; _i++) {

        if (boats[boatIndex].vertical) {
            if (i + _i != i - _i && (boats[boatIndex].length % 2 != 0 || _i + 1 != centralPos))
                positions.push({i: i + _i, j})

            positions.push({i: i - _i, j})
        } else {
            if (j + _i != j - _i && (boats[boatIndex].length % 2 != 0 || _i + 1 != centralPos))
                positions.push({i, j: j + _i})

            positions.push({i, j: j - _i})
        }   
    }

    if (save) for (let i = 0; i < positions.length; i++) {
        boats[boatIndex].position.push(positions[i])
        boatsGrid[positions[i].i][positions[i].j] = true
    }

    //if (save) console.clear()
    //if (save) console.table(boatsGrid)
    
    return positions

}