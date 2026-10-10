/* --------------------------------------------------------------------------------------------------
Imports
---------------------------------------------------------------------------------------------------*/

import { initServiceWorker } from "./service-worker-registration.js";

/* --------------------------------------------------------------------------------------------------
Variables
---------------------------------------------------------------------------------------------------*/
const USE_SERVICE_WORKER = true; // enable or disable SW for this project
const SERVICE_WORKER_VERSION = "2026-10-10-v2"; // bump to force new SW and new cache
const AUTO_RELOAD_ON_SW_UPDATE = true; // reload page once after an update
const PAIR_VIEW_TIME_MS = 500;
const VICTORY_COLUMN_DELAY_MS = 120;

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
	isResolving: false,
	roundId: 0,
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

async function waitForCardAnimations(elements = [ui.grid]) {
	const animations = elements.flatMap((element) => element.getAnimations({ subtree: true }));
	const results = await Promise.allSettled(animations.map((animation) => animation.finished));
	for (const result of results) {
		// Resetting a card can cancel its current transition.
		if (result.status === "rejected" && result.reason.name !== "AbortError") {
			console.warn("Could not finish a card animation.", result.reason);
		}
	}
}

async function playVictoryAnimation() {
	const roundId = game.roundId;
	await waitForCardAnimations();
	if (roundId !== game.roundId) {
		return;
	}

	const columnCount = getComputedStyle(ui.grid).gridTemplateColumns.split(" ").length;
	ui.cards.forEach((card, index) => {
		card.style.setProperty("--victory-delay", `${(index % columnCount) * VICTORY_COLUMN_DELAY_MS}ms`);
	});
	ui.grid.classList.add("victory");
}

async function resolveSelection() {
	const roundId = game.roundId;
	const [firstCard, secondCard] = game.selectedCards.map((index) => game.cards[index]);
	const cardElements = game.selectedCards.map((index) => ui.cards[index]);
	game.isResolving = true;

	await waitForCardAnimations(cardElements);
	if (roundId !== game.roundId) {
		return;
	}

	await new Promise((resolve) => setTimeout(resolve, PAIR_VIEW_TIME_MS));
	if (roundId !== game.roundId) {
		return;
	}

	const isMatch = firstCard.motif === secondCard.motif;
	if (isMatch) {
		firstCard.matched = true;
		secondCard.matched = true;
		if (game.playerNum === 2) {
			game.pairs[game.activePlayer - 1] += 1;
		}
	} else if (game.playerNum === 2) {
		game.activePlayer = game.activePlayer === 1 ? 2 : 1;
	}
	game.selectedCards = [];
	game.isResolving = false;
	renderCards();
	renderScores();
	if (isMatch) {
		isFinished();
	}
}

function selectCards(event) {
	const clicked = event.target;
	if (
		game.isResetting || game.isResolving ||
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
		game.moves += 1;
		renderScores();
		resolveSelection();
	}
}

async function reset() {
	game.roundId += 1;
	const roundId = game.roundId;
	ui.grid.classList.remove("victory");
	game.isResetting = true;
	game.isResolving = false;
	game.selectedCards = [];
	game.cards.forEach((card) => {
		card.matched = false;
	});
	game.activePlayer = 1;
	game.pairs = [0, 0];
	game.moves = 0;
	renderCards();
	renderScores();

	await waitForCardAnimations();
	if (roundId !== game.roundId) {
		return;
	}
	assignMotifs();
	game.isResetting = false;
}

function solve() {
	if (game.isResetting) {
		return;
	}

	game.roundId += 1;
	ui.grid.classList.remove("victory");
	game.isResolving = false;
	game.selectedCards = [];
	game.cards.forEach((card) => {
		card.matched = true;
	});
	renderCards();
	renderScores();
	playVictoryAnimation();
}

function isFinished() {
	if (!game.cards.every((card) => card.matched)) {
		return;
	}

	playVictoryAnimation();

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
