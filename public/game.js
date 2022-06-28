
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


//changeScreen("place-boats-container")