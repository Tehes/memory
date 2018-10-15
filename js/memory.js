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
            timer.start();
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

function init() {
    assignMotifs();

    var Grid = document.querySelector("#GameGrid");
    var restart = document.querySelector("#restart");

    Grid.addEventListener("click", selectCards);
    restart.addEventListener("click", reset);
    document.addEventListener('DOMContentLoaded', loadStoredVars);
}

function loadStoredVars() {
    var bestMin, bestSec, minzero = "",
        seczero = "";
    bestMin = localStorage.getItem("bestTimeMins") || "--";
    bestSec = localStorage.getItem("bestTimeSecs") || "--";

    if (bestMin.length === 1) {
        minzero = "0";
    }
    if (bestSec.length === 1) {
        seczero = "0";
    }

    var best = document.querySelector("#best");
    best.textContent = minzero + bestMin + ":" + seczero + bestSec;
}

function solve() {
    var cards = document.querySelectorAll(".card");
    var i;
    for (i = 0; i < cards.length; i++) {
        cards[i].classList.add("matched");
    }
}

function reset() {
    var allCards, i, selection, time;

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
    timer.reset();
    loadStoredVars();
}

var timer = {
    running: false,
    seconds: 0,
    minutes: 0,
    time: document.querySelector("#time"),
    start: function() {
        if (this.running === false) {
            timer.instance = window.setInterval(
                (function(self) {
                    return function() {
                        self.update();
                    };
                })(this), 1000);
            this.running = true;
        }
    },
    update: function() {
        var minzero = "";
        var seczero = "";
        this.seconds++;

        if (this.seconds === 60) {
            this.minutes++;
            this.seconds = 0;
        }
        if (this.seconds < 10) {
            seczero = "0";
        }
        if (this.minutes < 10) {
            minzero = "0";
        }
        if (this.minutes === 60) {
            this.stop();
        }

        this.time.textContent = minzero + this.minutes + ":" + seczero + this.seconds;

        var matched = document.querySelectorAll(".matched");
        if (matched.length === 30) {
            this.stop();

            var oldbestMin = localStorage.getItem("bestTimeMins") || 60;
            var oldbestSec = localStorage.getItem("bestTimeSecs") || 60;

            if (this.minutes <= oldbestMin) {
                if (this.seconds < oldbestSec) {
                    localStorage.setItem("bestTimeMins", this.minutes);
                    localStorage.setItem("bestTimeSecs", this.seconds);
                }
            }
        }
    },
    stop: function() {
        window.clearInterval(timer.instance);
        this.running = false;
    },
    reset: function() {
        this.stop();
        this.seconds = 0;
        this.minutes = 0;
        this.time.textContent = "00:00";
    }
};

init();
