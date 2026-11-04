# Mahmoud's 2D Portfolio

A tiny pixel-art world you can walk around in: my room, and a tech street outside it about AI agents,
LLM systems, real-time voice, and cloud infrastructure. Built with [Kaboom.js](https://kaboomjs.com).

**Play it:** https://mahmoud-a-noor.github.io/2D-Game-Portofolio/

## How it works

- Move with **WASD** / arrow keys, or click / tap where you want to go.
- Walk into highlighted objects and characters to read about them; **E** / **Enter** skips the typing and closes, **Esc** closes.
- The door in the room leads outside; the house door outside leads back in.
- The HUD tracks how much of the world you have explored (stored in your browser).

## Repository layout

- `index.html`, `assets/`, `map.json`, `map.png`, `spritesheet.png`, `monogram.ttf`, `favicon.ico` – the built site served by GitHub Pages.
- `Source Code/` – the Vite project that produces it.
  - `src/main.js` – scenes (room and street), player movement, floating labels, UI wiring
  - `src/constants.js` – all dialogue text and links
  - `src/utils.js` – dialogue box, toast, progress tracker, camera scale
  - `public/` – map, spritesheet, font, favicon

## Develop and build

```bash
cd "Source Code"
npm install
npm run dev        # local dev server
npm run build      # writes dist/
```

To publish, copy the contents of `Source Code/dist/` over the repository root and push.

## Credits

- Tileset and characters: *Happy Little Adventure* by Momen.
- Font: *monogram* by datagoblin.
- Map built with Tiled; the original room idea follows JSLegendDev's Kaboom.js portfolio tutorial.
