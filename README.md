# Memory – A Matching Game

Memory is a browser-based version of the classic matching game: turn over two cards, remember what you see, and find all
15 pairs. Play against the clock on your own or challenge a second player on the same device.

🔗 **Play Here:** [Memory](https://tehes.github.io/memory/)

---

## ✨ Features

- **Single-player challenge:** Find all pairs as quickly as possible and try to beat your saved best time.
- **Local two-player mode:** Take turns, collect pairs, and compete for the higher score.
- **Selectable themes:** Choose between **Fruits & Vegetables** and **Halloween**, each with 15 different motifs.
- **Remembered preferences:** Your selected theme and single-player best time are saved in the browser.
- **Animated cards:** Cards flip to reveal their motifs, and matching pairs stay face up.
- **Responsive design & dark mode:** Play on phones, tablets, or desktop browsers, with colors that follow your system
  preference.

---

## 🎮 How to Play

1. Choose a theme and select **1 Player** or **2 Players**.
2. Click or tap two cards to reveal them.
3. If the motifs match, the pair stays face up. Otherwise, both cards turn face down again.
4. Keep going until you have found all 15 pairs.

### Single Player

The clock starts with your first card. Finding the final pair stops the timer. Your best time is saved locally and
shared across both themes.

### Two Players

Player 1 starts. Each matching pair earns one point and another turn. If the cards do not match, the turn passes to the
other player. The highlighted score shows whose turn it is. After all pairs have been found, the player with the most
points wins; a tie is possible.

Use **Restart** to shuffle the cards and start again. Changing the theme or player mode also starts a new round.

---

## 🛠️ For Developers

The game uses plain HTML, CSS, and JavaScript, with no frameworks or build step. To run it locally, serve the project
folder with a static server such as VS Code's Live Server and open `index.html`.

```text
├── index.html          # Game board and controls
├── css/
│   └── style.css        # Layout, theme colors, and animations
├── js/
│   └── memory.js        # Game logic, scoring, timer, and storage
└── assets/
    └── themes/          # SVG card motifs and source references
```

Themes and their motif lists are defined in `memory.themes` in `js/memory.js`. Each active theme contains 15 motifs,
loaded from `assets/themes/<theme>/<motif>.svg`.

---

## 📖 License

This project is licensed under **MIT + Commons Clause** and is source-available. You may read, modify, and redistribute
the code under the terms in [LICENSE.txt](LICENSE.txt). The Commons Clause restricts selling the software as defined in
that license.

Third-party artwork retains its original licenses and attribution requirements.

---

## 🙏 Credits

- **Fruits & Vegetables:** Icons by Freepik from Flaticon's
  [Fruits and Vegetables pack](https://www.flaticon.com/packs/fruits-and-vegetables-14), credited in the game under CC
  BY 3.0.
- **Halloween:** [Halloween Scary Vectors](https://www.svgrepo.com/collection/halloween-scary-vectors/) from SVG Repo.
- **Additional animal assets:**
  [Animal Outlined Sepia Icons](https://www.svgrepo.com/collection/animal-outlined-sepia-icons/) from SVG Repo.
