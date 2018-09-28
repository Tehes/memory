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
    selection = document.querySelectorAll(".selected");

    if (selection.length < 2) {
        if (clicked.parentElement.classList.contains("selected") === false &&
            clicked.classList.contains("front") === true) {
            clicked.parentElement.classList.add("selected");
            if (timerRunning === false) {
                timer = window.setInterval(updateTimer, 1000);
                timerRunning = true;
            }
        }
    }
    selection = document.querySelectorAll(".selected");
    if (selection.length === 2) {
        setTimeout(function() {
            match(selection);
        }, 700);
    }
}

function match(sel) {
    if (sel[0].dataset.name === sel[1].dataset.name) {
        sel[0].classList.add("matched");
        sel[1].classList.add("matched");
    }
    setTimeout(function() {
        sel[1].classList.remove("selected");
        sel[0].classList.remove("selected");
    }, 300);

}

function updateTimer() {
    var minzero, seczero;
    seconds++;

    if (seconds === 60) {
        minutes++;
        seconds = 0;
    }
    if (seconds < 10) {
        seczero = "0";
    }
    else {
        seczero = "";
    }
    if (minutes < 10) {
        minzero = "0";
    }
    else {
        minzero = "";
    }
    var time = document.querySelector("#time");
    time.textContent = minzero + minutes + ":" + seczero + seconds;

    var matched = document.querySelectorAll(".matched")
    if (matched.length === 30) {
        window.clearInterval(timer);
        timerRunning = false;
    }
}

function init() {
    timerRunning = false;
    seconds = 0;
    minutes = 0;
    assignMotifs();

    var Grid = document.querySelector("#GameGrid");
    Grid.addEventListener("click", selectCards);
    var header = document.querySelector("#restart");
    header.addEventListener("click", reset);
}

function reset() {
    var allCards, i, selection;

    selection = document.querySelectorAll(".selected")[0];
    if (selection) {
        selection.classList.remove("selected");
    }

    allCards = document.querySelectorAll(".matched");

    for (i = 0; i < allCards.length; i++) {

        allCards[i].classList.add("selected");
        allCards[i].classList.remove("matched");

        (function(i) {
            setTimeout(function() {
                allCards[i].classList.remove("selected");
            }, 500);
        })(i);
    }
    setTimeout(assignMotifs, 510);
    window.clearInterval(timer);
    timerRunning = false;
    seconds = 0;
    minutes = 0;
    var time = document.querySelector("#time");
    time.textContent = "00:00";
}

init();
