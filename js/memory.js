var Grid = document.querySelector("#GameGrid");

var Motifs = ["apple", "avocado", "banana", "bell-pepper", "cabbage", "cauliflower", "cherry", "grapes", "kiwi", "orange", "pineapple", "pumpkin", "strawberry", "tomato", "watermelon"];

var Motifs = Motifs.concat(Motifs);

var Cards = document.querySelectorAll(".card .back");

for (var i = 0; i < Motifs.length; i++) {
    Cards[i].style.backgroundImage = "url('assets/"+ Motifs[i] +".svg')";
    Cards[i].parentElement.dataset.name = Motifs[i];
}


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
        }, 1000);
    }
}

function match(sel) {
    var selection = document.querySelectorAll(".selected");
    if (selection.length === 2) {
        if (sel[0].dataset.name === sel[1].dataset.name) {
            sel[0].classList.add("matched");
            sel[1].classList.add("matched");
        }
        sel[1].classList.remove("selected");
        sel[0].classList.remove("selected");
    }
}
