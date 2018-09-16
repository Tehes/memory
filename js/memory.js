var Grid = document.querySelector("#GameGrid");

Grid.addEventListener("click", test);

function test(e) {
    var clicked = e.target;
    if (clicked.id !== "GameGrid") {
        e.target.parentElement.classList.toggle("selected");
    }
}
