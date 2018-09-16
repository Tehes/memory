var Card = document.querySelectorAll(".card")[0];

Card.addEventListener("click", test);

function test() {
    this.classList.toggle("selected");
}
