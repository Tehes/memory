# Memory – A Matching Game

Memory is a browser-based version of the classic matching game: turn over two cards, remember what you see, and find all
15 pairs. Find them in as few moves as possible on your own or challenge a second player on the same device.

🔗 **Play Here:** [Memory](https://tehes.github.io/memory/)

---

## ✨ Features

- **Single-player challenge:** Find all pairs in as few moves as possible and try to beat your saved best.
- **Local two-player mode:** Take turns, collect pairs, and compete for the higher score.
- **Selectable themes:** Choose between **Fruits & Vegetables**, **Halloween**, and **Animals**, each with 15 different motifs.
- **Remembered preferences:** Your selected theme and single-player best move count are saved in the browser.
- **Animated cards:** Cards flip to reveal their motifs, and matching pairs stay face up.
- **Responsive design & dark mode:** Play on phones, tablets, or desktop browsers, with colors that follow your system
  preference.
- **Offline play:** Previously loaded files and themes can be used offline through the Service Worker.

---

## 🎮 How to Play

1. Choose a theme and select **1 Player** or **2 Players**.
2. Click or tap two cards to reveal them.
3. If the motifs match, the pair stays face up. Otherwise, both cards turn face down again.
4. Keep going until you have found all 15 pairs.

### Single Player

Each time you reveal a second card, it counts as one move, whether the cards match or not. Finding the final pair
saves your move count if it is lower than your previous best. Your best is saved locally and shared across all themes.
Previous best times remain stored separately and are not converted into moves.

### Two Players

Player 1 starts. Each matching pair earns one point and another turn. If the cards do not match, the turn passes to the
other player. The highlighted score shows whose turn it is. After all pairs have been found, the player with the most
points wins; a tie is possible.

Use **Restart** to shuffle the cards and start again. Changing the theme or player mode also starts a new round.

---

## 🛠️ For Developers

The game uses plain HTML, CSS, and JavaScript modules, with no frameworks or build step. To run it locally, serve the
project folder with a static server such as VS Code's Live Server and open `index.html`.

```text
├── index.html          # Game layout, controls, and templates
├── manifest.json       # Web app name, icon, start URL, and display settings
├── css/
│   └── style.css        # Layout, theme colors, and animations
├── js/
│   ├── app.js           # Module entry point, game logic, move counter, and storage
│   └── service-worker-registration.js  # Service Worker registration and updates
├── service-worker.js    # Dynamic caching for offline use
├── icons/              # Browser favicons
├── svg/                # Footer social icons
└── assets/
    └── themes/          # SVG card motifs and source references
```

Themes and their motif lists are defined in `THEMES` in `js/app.js`. Each active theme contains 15 motifs,
loaded from `assets/themes/<theme>/<motif>.svg`.

The Service Worker is enabled in `js/app.js` and caches files dynamically after it takes control of the page. After
the first online visit, wait for registration and reload normally, then open each theme you want to use offline.
Only previously loaded URLs are available offline; no asset list is maintained. Service Workers require HTTPS or
localhost, and registration is intentionally skipped on GitHub Pages user root URLs. Bump `SERVICE_WORKER_VERSION`
in `js/app.js` with each subsequent code commit.

---

## 📖 License

This project is licensed under **MIT + Commons Clause** and is source-available. You may read, modify, and redistribute
the code under the terms in [LICENSE.txt](LICENSE.txt). The Commons Clause restricts selling the software as defined in
that license.

Third-party artwork retains its original licenses and attribution requirements.

---

## 🙏 Credits

- **Fruits & Vegetables:** Icons by Freepik from Flaticon's
  [Fruits and Vegetables pack](https://www.flaticon.com/packs/fruits-and-vegetables-14)
  ([CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)).
- **Halloween:** [Halloween Scary Vectors](https://www.svgrepo.com/collection/halloween-scary-vectors/) from SVG Repo.
- **Animals:**
  [Animal Outlined Sepia Icons](https://www.svgrepo.com/collection/animal-outlined-sepia-icons/) from SVG Repo.
