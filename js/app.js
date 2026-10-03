/* --------------------------------------------------------------------------------------------------
Imports
---------------------------------------------------------------------------------------------------*/

import { initServiceWorker } from "./service-worker-registration.js";

/* --------------------------------------------------------------------------------------------------
Variables
---------------------------------------------------------------------------------------------------*/
const USE_SERVICE_WORKER = true; // enable or disable SW for this project
const SERVICE_WORKER_VERSION = "2026-10-04-v4"; // bump to force new SW and new cache
const AUTO_RELOAD_ON_SW_UPDATE = true; // reload page once after an update

const THEMES = {
	"fruits-and-vegetables": {
		label: "Fruits & Vegetables",
		credit: {
			label: "Flaticon",
			url: "https://www.flaticon.com/packs/fruits-and-vegetables-14",
		},
		motifs: [
			"apple",
			"avocado",
			"banana",
			"bell-pepper",
			"cabbage",
			"cauliflower",
			"cherry",
			"grapes",
			"kiwi",
			"orange",
			"pineapple",
			"pumpkin",
			"strawberry",
			"tomato",
			"watermelon",
		],
	},
	halloween: {
		label: "Halloween",
		credit: {
			label: "SVG Repo",
			url: "https://www.svgrepo.com/collection/halloween-scary-vectors/",
		},
		motifs: [
			"bat",
			"broomstick",
			"cauldron",
			"death",
			"eyeball",
			"ghost",
			"gravestone",
			"hand",
			"hat",
			"mummy",
			"owl",
			"pumpkin",
			"skeleton",
			"spider",
			"vampire",
		],
	},
	animals: {
		label: "Animals",
		credit: {
			label: "SVG Repo",
			url: "https://www.svgrepo.com/collection/animal-outlined-sepia-icons/",
		},
		motifs: [
			"bat",
			"camel",
			"chameleon",
			"cobra",
			"crab",
			"elk",
			"octopus",
			"ostrich",
			"panda",
			"pelican",
			"raccoon",
			"squirrel",
			"toucan",
			"turtle",
			"whale",
		],
	},
};

const game = {
	playerNum: 1,
	activePlayer: 1,
	attempts: 0,
	theme: "fruits-and-vegetables",
	isResetting: false,
	matchTimeout: null,
	flipTimeout: null,
	resetTimeout: null,
};

let isInitialized = false;

/* --------------------------------------------------------------------------------------------------
DOM references
---------------------------------------------------------------------------------------------------*/

const ui = {
	themePicker: document.querySelector("#theme"),
	playerPicker: document.querySelector("#players"),
	grid: document.querySelector("#GameGrid"),
	restart: document.querySelector("#restart"),
	attempts: document.querySelector("#attempts"),
	attemptsValue: document.querySelector("#attempts span"),
	best: document.querySelector("#best"),
	bestValue: document.querySelector("#best span"),
	player1: document.querySelector("#pairs_1"),
	player2: document.querySelector("#pairs_2"),
	player1Value: document.querySelector("#pairs_1 span"),
	player2Value: document.querySelector("#pairs_2 span"),
	creditLink: document.querySelector("#themeCredit a"),
	cardTemplate: document.querySelector("#cardTemplate"),
	cards: null,
	backs: null,
};

/* --------------------------------------------------------------------------------------------------
functions
---------------------------------------------------------------------------------------------------*/

function shuffle(array) {
	let currentIndex = array.length;

	while (currentIndex !== 0) {
		const randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		const temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

function changeTheme(event) {
	const theme = event.target.value;
	if (!Object.prototype.hasOwnProperty.call(THEMES, theme)) {
		return;
	}

	game.theme = theme;
	document.body.dataset.theme = theme;
	updateThemeCredit();
	try {
		localStorage.setItem("memory_theme", theme);
	} catch (error) {
		console.warn("Could not save the selected theme.", error);
	}
	reset();
}

function updateThemeCredit() {
	const source = THEMES[game.theme].credit;
	ui.creditLink.textContent = source.label;
	ui.creditLink.href = source.url;
	ui.creditLink.title = source.label;
}

function changePlayers(event) {
	const playerNum = Number(event.target.value);
	if ((playerNum !== 1 && playerNum !== 2) || playerNum === game.playerNum) {
		return;
	}

	setPlayerMode(playerNum);
	reset();
}

function setPlayerMode(playerNum) {
	game.playerNum = playerNum;
	ui.attempts.classList.toggle("hidden", playerNum === 2);
	ui.best.classList.toggle("hidden", playerNum === 2);
	ui.player1.classList.toggle("hidden", playerNum === 1);
	ui.player2.classList.toggle("hidden", playerNum === 1);

	if (playerNum === 1) {
		loadStoredAttempts();
	}
}

function loadStoredAttempts() {
	ui.bestValue.textContent = "--";
	try {
		ui.bestValue.textContent = localStorage.getItem("memory_bestAttempts") ?? "--";
	} catch (error) {
		console.warn("Could not load the saved best attempts.", error);
	}
}

function createCards() {
	const fragment = document.createDocumentFragment();
	const cardCount = THEMES[game.theme].motifs.length * 2;
	for (let index = 0; index < cardCount; index += 1) {
		const card = ui.cardTemplate.content.firstElementChild.cloneNode(true);
		card.id = String(index + 1);
		fragment.appendChild(card);
	}
	ui.grid.replaceChildren(fragment);
	ui.cards = ui.grid.querySelectorAll(".card");
	ui.backs = ui.grid.querySelectorAll(".back");
}

function assignMotifs() {
	const themeMotifs = THEMES[game.theme].motifs;
	const motifs = shuffle(themeMotifs.concat(themeMotifs));

	ui.backs.forEach((card, index) => {
		card.style.backgroundImage = `url("assets/themes/${game.theme}/${motifs[index]}.svg")`;
		card.parentElement.dataset.name = motifs[index];
	});
}

function selectCards(event) {
	const clicked = event.target;
	const selection = ui.grid.querySelectorAll(".selected");
	if (
		game.isResetting || selection.length >= 2 ||
		!clicked.classList.contains("front") || clicked.parentElement.classList.contains("selected")
	) {
		return;
	}

	clicked.parentElement.classList.add("selected");
	const selectedCards = ui.grid.querySelectorAll(".selected");
	if (selectedCards.length === 2) {
		game.attempts += 1;
		ui.attemptsValue.textContent = game.attempts;
		game.matchTimeout = setTimeout(() => {
			if (selectedCards[0].dataset.name === selectedCards[1].dataset.name) {
				selectedCards[0].classList.add("matched");
				selectedCards[1].classList.add("matched");
				if (game.playerNum === 2) {
					const pairsCounter = game.activePlayer === 1 ? ui.player1Value : ui.player2Value;
					pairsCounter.textContent = Number(pairsCounter.textContent) + 1;
				}
				isFinished();
			} else if (game.playerNum === 2) {
				game.activePlayer = game.activePlayer === 1 ? 2 : 1;
			}
			game.flipTimeout = setTimeout(() => {
				selectedCards[0].classList.remove("selected");
				selectedCards[1].classList.remove("selected");
				ui.player1.classList.toggle("active", game.activePlayer === 1);
				ui.player2.classList.toggle("active", game.activePlayer === 2);
			}, 300);
		}, 700);
	}
}

function reset() {
	clearTimeout(game.matchTimeout);
	clearTimeout(game.flipTimeout);
	clearTimeout(game.resetTimeout);
	game.isResetting = true;
	ui.cards.forEach((card) => card.classList.remove("matched", "selected"));
	game.resetTimeout = setTimeout(() => {
		assignMotifs();
		game.isResetting = false;
	}, 510);

	game.activePlayer = 1;
	ui.player1.classList.add("active");
	ui.player2.classList.remove("active");
	ui.player1Value.textContent = "0";
	ui.player2Value.textContent = "0";
	game.attempts = 0;
	ui.attemptsValue.textContent = "0";
}

function solve() {
	ui.cards.forEach((card) => card.classList.add("matched"));
}

function isFinished() {
	if (ui.grid.querySelectorAll(".matched").length !== ui.cards.length) {
		return;
	}

	if (game.playerNum === 1) {
		try {
			const oldBest = localStorage.getItem("memory_bestAttempts");
			if (oldBest === null || game.attempts < Number(oldBest)) {
				localStorage.setItem("memory_bestAttempts", game.attempts);
				loadStoredAttempts();
			}
		} catch (error) {
			console.warn("Could not save the best attempts.", error);
		}
	}
}

/* --------------------------------------------------------------------------------------------------
Initialization
---------------------------------------------------------------------------------------------------*/

function init() {
	if (isInitialized) {
		return;
	}
	isInitialized = true;

	try {
		const storedTheme = localStorage.getItem("memory_theme");
		if (Object.prototype.hasOwnProperty.call(THEMES, storedTheme)) {
			game.theme = storedTheme;
		}
	} catch (error) {
		console.warn("Could not load the saved theme.", error);
	}

	Object.entries(THEMES).forEach(([theme, config]) => {
		const option = document.createElement("option");
		option.value = theme;
		option.textContent = config.label;
		ui.themePicker.appendChild(option);
	});
	ui.themePicker.value = game.theme;
	ui.themePicker.addEventListener("change", changeTheme);
	ui.playerPicker.querySelector(`input[value="${game.playerNum}"]`).checked = true;
	ui.playerPicker.addEventListener("change", changePlayers);
	ui.grid.addEventListener("click", selectCards);
	ui.restart.addEventListener("click", reset);
	document.body.dataset.theme = game.theme;
	updateThemeCredit();
	setPlayerMode(game.playerNum);
	createCards();
	assignMotifs();

	initServiceWorker({
		useServiceWorker: USE_SERVICE_WORKER,
		serviceWorkerVersion: SERVICE_WORKER_VERSION,
		autoReloadOnSwUpdate: AUTO_RELOAD_ON_SW_UPDATE,
	});
}

/* --------------------------------------------------------------------------------------------------
Public members
---------------------------------------------------------------------------------------------------*/
globalThis.app = {
	init,
	solve,
};

globalThis.app.init();
