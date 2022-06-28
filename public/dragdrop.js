
//--- DRAG DROP ---//

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
        
        if (boats[i].position.length == 0) return
        
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


defensiveGrid.forEach((row, i) => row.forEach((box, j) => {
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
    boats[boatIndex].div.classList.add('ticker')
    setTimeout(() => boats[boatIndex].div.classList.remove('ticker'), 600);
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


function checkPlaceAllBoats() {
    for (const boat of boats)
        if (boat.position.length == 0)
            return false

    return true
}