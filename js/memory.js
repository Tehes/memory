var Grid = document.querySelector("#GameGrid");

Grid.addEventListener("click", test);

function test(e) {
    var clicked = e.target;
    var selection = document.querySelectorAll(".selected");
    if (selection.length < 2) {
        if (clicked.id !== "GameGrid" && clicked.parentElement.classList.contains("selected") === false) {
            clicked.parentElement.classList.toggle("selected");
        }
    }
}
