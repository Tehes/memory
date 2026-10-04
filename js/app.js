/* --------------------------------------------------------------------------------------------------
Imports
---------------------------------------------------------------------------------------------------*/

import { initServiceWorker } from "./service-worker-registration.js";

/* --------------------------------------------------------------------------------------------------
Variables
---------------------------------------------------------------------------------------------------*/
const USE_SERVICE_WORKER = true; // enable or disable SW for this project
const SERVICE_WORKER_VERSION = "2026-10-04-v6"; // bump to force new SW and new cache
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
	moves: 0,
	cards: [],
	selectedCards: [],
	pairs: [0, 0],
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
	moves: document.querySelector("#moves"),
	movesValue: document.querySelector("#moves span"),
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
	if (!Object.hasOwn(THEMES, theme)) {
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
	ui.moves.classList.toggle("hidden", playerNum === 2);
	ui.best.classList.toggle("hidden", playerNum === 2);
	ui.player1.classList.toggle("hidden", playerNum === 1);
	ui.player2.classList.toggle("hidden", playerNum === 1);

	if (playerNum === 1) {
		loadStoredMoves();
	}
}

function loadStoredMoves() {
	ui.bestValue.textContent = "--";
	try {
		ui.bestValue.textContent = localStorage.getItem("memory_bestMoves") ?? "--";
	} catch (error) {
		console.warn("Could not load the saved best moves.", error);
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
	game.cards = motifs.map((motif) => ({ motif, matched: false }));

	ui.backs.forEach((back, index) => {
		back.style.backgroundImage = `url("assets/themes/${game.theme}/${game.cards[index].motif}.svg")`;
	});
	renderCards();
}

function renderCards() {
	ui.cards.forEach((card, index) => {
		card.classList.toggle("selected", game.selectedCards.includes(index));
		card.classList.toggle("matched", game.cards[index].matched);
	});
}

function renderScores() {
	ui.movesValue.textContent = game.moves;
	ui.player1Value.textContent = game.pairs[0];
	ui.player2Value.textContent = game.pairs[1];
	ui.player1.classList.toggle("active", game.activePlayer === 1);
	ui.player2.classList.toggle("active", game.activePlayer === 2);
}

function selectCards(event) {
	const clicked = event.target;
	if (
		game.isResetting || game.selectedCards.length >= 2 ||
		!clicked.classList.contains("front")
	) {
		return;
	}

	const cardIndex = Number(clicked.parentElement.id) - 1;
	if (game.cards[cardIndex].matched || game.selectedCards.includes(cardIndex)) {
		return;
	}

	game.selectedCards.push(cardIndex);
	renderCards();
	if (game.selectedCards.length === 2) {
		const [firstCard, secondCard] = game.selectedCards.map((index) => game.cards[index]);
		game.moves += 1;
		renderScores();
		game.matchTimeout = setTimeout(() => {
			const isMatch = firstCard.motif === secondCard.motif;
			if (isMatch) {
				firstCard.matched = true;
				secondCard.matched = true;
				if (game.playerNum === 2) {
					game.pairs[game.activePlayer - 1] += 1;
				}
				renderCards();
				renderScores();
				isFinished();
			}
			game.flipTimeout = setTimeout(() => {
				if (!isMatch && game.playerNum === 2) {
					game.activePlayer = game.activePlayer === 1 ? 2 : 1;
				}
				game.selectedCards = [];
				renderCards();
				renderScores();
			}, 300);
		}, 700);
	}
}

function reset() {
	clearTimeout(game.matchTimeout);
	clearTimeout(game.flipTimeout);
	clearTimeout(game.resetTimeout);
	game.isResetting = true;
	game.selectedCards = [];
	game.cards.forEach((card) => {
		card.matched = false;
	});
	game.activePlayer = 1;
	game.pairs = [0, 0];
	game.moves = 0;
	renderCards();
	renderScores();
	game.resetTimeout = setTimeout(() => {
		assignMotifs();
		game.isResetting = false;
	}, 510);
}

function solve() {
	if (game.isResetting) {
		return;
	}

	clearTimeout(game.matchTimeout);
	clearTimeout(game.flipTimeout);
	game.selectedCards = [];
	game.cards.forEach((card) => {
		card.matched = true;
	});
	renderCards();
	renderScores();
}

function isFinished() {
	if (!game.cards.every((card) => card.matched)) {
		return;
	}

	if (game.playerNum === 1) {
		try {
			const oldBest = localStorage.getItem("memory_bestMoves");
			if (oldBest === null || game.moves < Number(oldBest)) {
				localStorage.setItem("memory_bestMoves", game.moves);
				loadStoredMoves();
			}
		} catch (error) {
			console.warn("Could not save the best moves.", error);
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
		if (Object.hasOwn(THEMES, storedTheme)) {
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
	renderScores();

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
