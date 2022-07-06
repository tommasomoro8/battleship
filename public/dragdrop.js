
//--- DRAG DROP ---//

let _boats = document.getElementsByClassName("boat")
let boats = []

let divTaken
let indexDivTaken
let whereTaken
let over = false

let boatsGrid

function boatsGridReset() {
    boatsGrid = []
    for (let i = 0; i < 8; i++) {
        boatsGrid[i] = []
        for (let j = 0; j < 8; j++)
            boatsGrid[i][j] = false;
    }
} boatsGridReset()


for (let i = 0; i < _boats.length; i++) {
    boats.push({div: _boats[i], length: (i < 2) ? i + 2 : i + 1, vertical: true, position: [], reSaveBoatPosition: {}, hit: 0, sunk: false})
    boats[i].div.addEventListener("click", () => {

        if (boats[i].position.length == 0 || !eval(boats[i].div.getAttribute('draggable'))) return
        
        boats[i].vertical = !boats[i].vertical

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


defGrid.forEach((row, i) => row.forEach((box, j) => {
    
    function dragoverEventListener(e) {
        e.preventDefault()
        over = true
    }

    box.div.addEventListener("dragover", dragoverEventListener)
    
    box.div.addEventListener("dragenter", (e) => setTimeout(() => {
        e.preventDefault()

        over = true
        illegalPos = false

        let centralPosition = findCentralPosition(i, j)
        let positions = saveBoatPosition(centralPosition.i, centralPosition.j, indexDivTaken, centralPosition.centralPos, false)

        illegalPos = checkIllegality(positions, indexDivTaken)
            
        if (illegalPos)
            box.div.removeEventListener("dragover", dragoverEventListener)
    }, 1))


    box.div.addEventListener("dragleave", () => {
        over = false
        box.div.addEventListener("dragover", dragoverEventListener)
    })

    box.div.addEventListener("drop", () => {
        let centralPosition = findCentralPosition(i, j)
    
        defGrid[centralPosition.i][centralPosition.j].div.append(divTaken)
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
            if (boatsPosition.i == position.i && boatsPosition.j == position.j)
                cubeOwnBoat = true

        if (boatsGrid[position.i][position.j] && !cubeOwnBoat) {
            illegal = true
            break
        }
    }

    return illegal
}


function showCannotTurn(boatIndex) {
    const className = (boats[boatIndex].length % 2 == 0 && boats[boatIndex].vertical) ? "tickerEvenHorizontal" : "ticker"
    
    boats[boatIndex].div.classList.add(className)
    setTimeout(() => boats[boatIndex].div.classList.remove(className), 600);
}


function findCentralPosition(i, j) {
    let centralPos = Math.round(boats[indexDivTaken].length / 2)
    if (boats[indexDivTaken].length % 2 == 0) centralPos += 1

    let attachPos = centralPos - whereTaken
    if (boats[indexDivTaken].vertical)
        return {i: i + attachPos, j, centralPos}
    else
        return {i, j: j + attachPos, centralPos}
}


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
    
    return positions

}

function resetBoats() {
    boatsGridReset()

    for (let i = 0; i < boats.length; i++) {
        document.getElementById(`boat-holder-${i}`).appendChild(boats[i].div)

        boats[i].div.classList.remove('horizontal')
        boats[i].vertical = true
        boats[i].position = []
        boats[i].reSaveBoatPosition = {}
        boats[i].hit = 0
        boats[i].sunk = false
    }
}


function checkPlaceAllBoats() {
    for (const boat of boats)
        if (boat.position.length == 0)
            return false

    return true
}


function blockBoats(block) {
    for (const boat of boats)
        boat.div.setAttribute('draggable', !block);
}