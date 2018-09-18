var Grid = document.querySelector("#GameGrid");

Grid.addEventListener("click", selectCards);

function selectCards(e) {
    var clicked = e.target;
    var selection = document.getElementsByClassName("selected");

    if (selection.length < 2) {
        if (clicked.id !== "GameGrid" && clicked.parentElement.classList.contains("selected") === false) {
            clicked.parentElement.classList.add("selected");
        }
    }
    if (selection.length === 2) {
        setTimeout(function() {
            match(selection);
        }, 1000)
    }
}

function match(sel) {
    var selection = document.querySelectorAll(".selected");
    if (selection.length === 2) {
        sel[1].classList.remove("selected");
        sel[0].classList.remove("selected");
    }
}
