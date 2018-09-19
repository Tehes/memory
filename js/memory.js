function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function assignMotifs() {
    var Motifs, Cards, i;

    Motifs = ["apple", "avocado", "banana", "bell-pepper", "cabbage", "cauliflower", "cherry", "grapes", "kiwi", "orange", "pineapple", "pumpkin", "strawberry", "tomato", "watermelon"];

    Motifs = Motifs.concat(Motifs);
    Motifs = shuffle(Motifs);

    Cards = document.querySelectorAll(".card .back");

    for (i = 0; i < Motifs.length; i++) {
        Cards[i].style.backgroundImage = "url('assets/" + Motifs[i] + ".svg')";
        Cards[i].parentElement.dataset.name = Motifs[i];
    }
}

function selectCards(e) {
    var clicked, selection;

    clicked = e.target;
    selection = document.getElementsByClassName("selected");

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
    if (sel[0].dataset.name === sel[1].dataset.name) {
        sel[0].classList.add("matched");
        sel[1].classList.add("matched");
    }
    sel[1].classList.remove("selected");
    sel[0].classList.remove("selected");
}

function init() {
    assignMotifs();

    var Grid = document.querySelector("#GameGrid");
    Grid.addEventListener("click", selectCards);
}

init();
