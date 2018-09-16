var Grid = document.querySelector("#GameGrid");

Grid.addEventListener("click", test);

function test(e) {
    e.target.classList.toggle("selected");
}
