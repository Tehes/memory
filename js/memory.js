/* ----------------------------------------------
helper functions
------------------------------------------------*/

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

/* ----------------------------------------------
Memory Object
------------------------------------------------*/

var memory = {
    playerNum: 1,
    activePlayer: 1,
    setup: function() {
        var playerButtons = document.querySelectorAll("#setup div");

        playerButtons[0].addEventListener("click", this.init.bind(this, 1));
        playerButtons[1].addEventListener("click", this.init.bind(this, 2));
    },
    init: function(pNum) {
        var setupScreen = document.querySelector("#setup");
        setupScreen.style.display = "none";

        this.playerNum = pNum;

        this.assignMotifs();

        var Grid = document.querySelector("#GameGrid");
        var restart = document.querySelector("#restart");

        var time = document.querySelector("#time");
        var best = document.querySelector("#best");
        var player1 = document.querySelector("#pairs_1");
        var player2 = document.querySelector("#pairs_2");

        Grid.addEventListener("click", this.selectCards.bind(this));
        restart.addEventListener("click", this.reset.bind(this));

        if (this.playerNum === 1) {
            document.addEventListener('DOMContentLoaded', this.loadStoredVars);
        }
        else if (this.playerNum === 2) {
            time.classList.toggle("hidden");
            best.classList.toggle("hidden");
            player1.classList.toggle("hidden");
            player2.classList.toggle("hidden");
        }
    },
    loadStoredVars: function() {
        var bestMin, bestSec, minzero = "", seczero = "";
        bestMin = localStorage.getItem("bestTimeMins") || "--";
        bestSec = localStorage.getItem("bestTimeSecs") || "--";

        if (bestMin.length === 1) {
            minzero = "0";
        }
        if (bestSec.length === 1) {
            seczero = "0";
        }

        var best = document.querySelector("#best span");
        best.textContent = minzero + bestMin + ":" + seczero + bestSec;
    },
    assignMotifs: function() {
        var Motifs, Cards, i;

        Motifs = ["apple", "avocado", "banana", "bell-pepper", "cabbage", "cauliflower", "cherry", "grapes", "kiwi", "orange", "pineapple", "pumpkin", "strawberry", "tomato", "watermelon"];

        Motifs = Motifs.concat(Motifs);
        Motifs = shuffle(Motifs);

        Cards = document.querySelectorAll(".card .back");

        for (i = 0; i < Motifs.length; i++) {
            Cards[i].style.backgroundImage = "url('assets/" + Motifs[i] + ".svg')";
            Cards[i].parentElement.dataset.name = Motifs[i];
        }
    },
    selectCards: function(e) {
        var clicked, selection, match;

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
                if (selection[0].dataset.name === selection[1].dataset.name) {
                    selection[0].classList.add("matched");
                    selection[1].classList.add("matched");

                    if (this.playerNum === 2) {
                        var pairsCounter = document.querySelector("#pairs_"+ this.activePlayer +" span");
                        pairsCounter.textContent++;
                    }
                }
                else {
                    if (this.playerNum === 2) {
                        this.activePlayer = ( this.activePlayer == 1 ? 2 : 1);
                    }
                }
                setTimeout(function() {
                    selection[1].classList.remove("selected");
                    selection[0].classList.remove("selected");

                    var player1 = document.querySelector("#pairs_1");
                    var player2 = document.querySelector("#pairs_2");

                    if (this.activePlayer === 1) {
						player1.classList.add("active");
						player2.classList.remove("active");
                    }
					else if (this.activePlayer === 2) {
						player2.classList.add("active");
						player1.classList.remove("active");
					}
                }.bind(this), 300);
            }.bind(this), 700);
        }
    },
    reset: function() {
        var allCards, i, selection, time;

        allCards = document.querySelectorAll(".matched, .selected");

        for (i = 0; i < allCards.length; i++) {

            allCards[i].classList.add("selected");
            allCards[i].classList.remove("matched");

            (function(i) {
                setTimeout(function() {
                    allCards[i].classList.remove("selected");
                }, 10);
            })(i);
        }
        setTimeout(this.assignMotifs, 510);
		var player1 = document.querySelector("#pairs_1 span");
		var player2 = document.querySelector("#pairs_2 span");
		player1.textContent = 0;
		player2.textContent = 0;
        timer.reset();
    },
    solve: function() {
        var cards = document.querySelectorAll(".card");
        var i;
        for (i = 0; i < cards.length; i++) {
            cards[i].classList.add("matched");
        }
        this.isFinished();
    },
    isFinished: function() {
        var matched = document.querySelectorAll(".matched");
        if (matched.length === 30) {
            timer.stop();

            if (this.playerNum === 1) {
                var oldbestMin = localStorage.getItem("bestTimeMins") || 60;
                var oldbestSec = localStorage.getItem("bestTimeSecs") || 60;

                if (timer.minutes <= oldbestMin) {
                    if (timer.seconds < oldbestSec) {
                        localStorage.setItem("bestTimeMins", timer.minutes);
                        localStorage.setItem("bestTimeSecs", timer.seconds);
                        memory.loadStoredVars();
                    }
                }
            }
        }
    }
};

/* ----------------------------------------------
Timer object
------------------------------------------------*/

var timer = {
    running: false,
    seconds: 0,
    minutes: 0,
    time: document.querySelector("#time span"),
    start: function() {
        if (this.running === false) {
            timer.instance = window.setInterval(this.update.bind(this), 1000);
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

        memory.isFinished();
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

memory.setup();
