import { k } from "./kaboomContext"
import { scaleFactor, dialogueData, discoverable } from "./constants"
import { displayDialogue, setCamScale, showToast, createProgress, focusGame } from "./utils"

const TILE = 16
const LABEL_DISTANCE = 70 * scaleFactor / 2 // world units within which an object's label fades in

k.loadSprite("spritesheet", "./spritesheet.png", {
    sliceX: 39,
    sliceY: 31,
    anims: {
        "idle-down": 936,
        "walk-down": { from: 936, to: 939, loop: true, speed: 8 },
        "idle-side": 975,
        "walk-side": { from: 975, to: 978, loop: true, speed: 8 },
        "idle-up": 1014,
        "walk-up": { from: 1014, to: 1017, loop: true, speed: 8 },
        "guide-idle": { from: 944, to: 945, loop: true, speed: 2 },
        bunny: { from: 780, to: 783, loop: true, speed: 6 },
        frog: { from: 788, to: 791, loop: true, speed: 4 },
        slime: { from: 858, to: 861, loop: true, speed: 5 },
        fire: { from: 489, to: 490, loop: true, speed: 6 },
    },
})
k.loadSprite("map", "./map.png")
k.loadFont("monogram", "./monogram.ttf")
k.setBackground(k.Color.fromHex("#1b0b2e"))

// ---------------------------------------------------------------------------
// shared helpers
// ---------------------------------------------------------------------------

function setLocation(name) {
    document.getElementById("location").textContent = name
}

function makePlayer() {
    return k.make([
        k.sprite("spritesheet", { anim: "idle-down" }),
        k.area({ shape: new k.Rect(k.vec2(0, 3), 10, 10) }),
        k.body(),
        k.anchor("center"),
        k.pos(),
        k.scale(scaleFactor),
        k.z(5),
        {
            speed: 250,
            direction: "down",
            isInDialogue: false,
            mouseMoving: false,
        },
        "player",
    ])
}

// Floating label shown above an interactable when the player is near.
// (x, y) are world coordinates of the label's bottom-center.
function makeLabel(x, y, textStr, always = false) {
    const label = k.add([k.pos(x, y), k.anchor("bot"), k.opacity(0), k.z(20)])
    const text = label.add([
        k.text(textStr, { size: 22, font: "monogram" }),
        k.anchor("bot"),
        k.pos(0, -6),
        k.color(255, 255, 255),
        k.opacity(0),
    ])
    const pad = 8
    const box = label.add([
        k.rect(text.width + pad * 2, text.height + pad, { radius: 3 }),
        k.anchor("bot"),
        k.pos(0, -2),
        k.color(27, 11, 46),
        k.opacity(0),
        k.outline(2, k.rgb(255, 255, 255)),
        k.z(-1),
    ])
    return { obj: label, text, box, always }
}

// Wires dialogue, progress, labels, keyboard and mouse movement for a scene.
function setupScene(player, labels, progress, opts = {}) {
    function setIdle() {
        if (player.direction === "down") player.play("idle-down")
        else if (player.direction === "up") player.play("idle-up")
        else player.play("idle-side")
    }

    function face(direction) {
        player.direction = direction
        if (direction === "up" && player.curAnim() !== "walk-up") player.play("walk-up")
        if (direction === "down" && player.curAnim() !== "walk-down") player.play("walk-down")
        if (direction === "left" || direction === "right") {
            player.flipX = direction === "left"
            if (player.curAnim() !== "walk-side") player.play("walk-side")
        }
    }

    function interact(name) {
        const entry = dialogueData[name]
        if (!entry || player.isInDialogue) return
        if (entry.action === "go-outside") {
            showToast("Heading outside...")
            k.go("street")
            return
        }
        if (entry.action === "go-home") {
            showToast("Back home...")
            k.go("room")
            return
        }
        player.isInDialogue = true
        player.mouseMoving = false
        setIdle()
        displayDialogue(entry, () => {
            player.isInDialogue = false
            if (opts.afterDialogue) opts.afterDialogue(name)
            if (progress.mark(name)) {
                if (progress.isComplete()) {
                    showToast("You have explored everything. Thanks for visiting!", 5000)
                } else {
                    showToast(`Discovered: ${entry.title}`)
                }
            }
        })
    }

    const keyMap = {
        left: ["left", "a"],
        right: ["right", "d"],
        up: ["up", "w"],
        down: ["down", "s"],
    }
    const isHeld = (dir) => keyMap[dir].some((key) => k.isKeyDown(key))
    let keyboardMoving = false

    k.onUpdate(() => {
        k.camPos(player.pos.x, player.pos.y + 100)

        for (const { obj, text, box, always } of labels) {
            const near = always || obj.pos.dist(player.pos) < LABEL_DISTANCE
            const target = near && !player.isInDialogue ? 1 : 0
            const next = k.lerp(obj.opacity, target, k.dt() * 10)
            obj.opacity = next
            text.opacity = next
            box.opacity = next * 0.9
            text.pos.y = -6 + Math.sin(k.time() * 4) * 2
        }

        if (player.isInDialogue) return

        const dir = k.vec2(0, 0)
        if (isHeld("left")) dir.x -= 1
        if (isHeld("right")) dir.x += 1
        if (isHeld("up")) dir.y -= 1
        if (isHeld("down")) dir.y += 1

        if (dir.x !== 0 || dir.y !== 0) {
            keyboardMoving = true
            player.mouseMoving = false
            player.move(dir.unit().scale(player.speed))
            if (Math.abs(dir.x) >= Math.abs(dir.y)) face(dir.x < 0 ? "left" : "right")
            else face(dir.y < 0 ? "up" : "down")
        } else if (keyboardMoving) {
            keyboardMoving = false
            setIdle()
        }
    })

    k.onMouseDown((mouseBtn) => {
        if (mouseBtn !== "left" || player.isInDialogue || keyboardMoving) return
        if (document.body.classList.contains("ui-open")) return
        const worldMousePos = k.toWorld(k.mousePos())
        player.mouseMoving = true
        player.moveTo(worldMousePos, player.speed)

        const mouseAngle = player.pos.angle(worldMousePos)
        const lowerBound = 50
        const upperBound = 125
        if (mouseAngle > lowerBound && mouseAngle < upperBound) face("up")
        else if (mouseAngle < -lowerBound && mouseAngle > -upperBound) face("down")
        else if (Math.abs(mouseAngle) > upperBound) face("right")
        else if (Math.abs(mouseAngle) < lowerBound) face("left")
    })

    k.onMouseRelease(() => {
        if (!player.mouseMoving) return
        player.mouseMoving = false
        setIdle()
    })

    setCamScale(k)
    k.onResize(() => setCamScale(k))

    return { interact }
}

// ---------------------------------------------------------------------------
// scene 1: the room (Tiled map)
// ---------------------------------------------------------------------------

k.scene("room", async () => {
    setLocation("My room")
    const mapData = await (await fetch("./map.json")).json()
    const progress = createProgress(discoverable)
    const map = k.add([k.sprite("map"), k.pos(), k.scale(scaleFactor)])
    const player = makePlayer()
    const labels = []
    const scene = setupScene(player, labels, progress, {
        afterDialogue: () => {
            let shown = false
            try { shown = localStorage.getItem("door-hint") === "1" } catch (_) { /* ignore */ }
            if (!shown) {
                try { localStorage.setItem("door-hint", "1") } catch (_) { /* ignore */ }
                k.wait(0.5, () => showToast("Tip: the door on the left wall leads outside", 5000))
            }
        },
    })

    for (const layer of mapData.layers) {
        if (layer.name === "boundaries") {
            for (const boundary of layer.objects) {
                map.add([
                    k.area({ shape: new k.Rect(k.vec2(0), boundary.width, boundary.height) }),
                    k.body({ isStatic: true }),
                    k.pos(boundary.x, boundary.y),
                    boundary.name,
                ])
                if (boundary.name && dialogueData[boundary.name]) {
                    player.onCollide(boundary.name, () => scene.interact(boundary.name))
                    const isDoor = boundary.name === "exit"
                    if (isDoor) {
                        // a wooden door in the doorway so the way out is obvious
                        map.add([k.sprite("spritesheet", { frame: 21 }), k.pos(boundary.x, boundary.y + 16), k.z(1)])
                    }
                    labels.push(makeLabel(
                        (boundary.x + boundary.width / 2) * scaleFactor,
                        // doors get their label below the doorway so the HUD never covers it
                        (isDoor ? boundary.y + boundary.height + 14 : boundary.y - 4) * scaleFactor,
                        dialogueData[boundary.name].label,
                        isDoor,
                    ))
                }
            }
        }
        if (layer.name === "spawnpoint") {
            for (const entity of layer.objects) {
                if (entity.name === "player") {
                    player.pos = k.vec2(entity.x * scaleFactor, entity.y * scaleFactor)
                    k.add(player)
                }
            }
        }
    }
})

// ---------------------------------------------------------------------------
// scene 2: the tech street (built from the spritesheet at runtime)
// ---------------------------------------------------------------------------

const F = {
    grass: [40], // only the center tile: the other grass frames carry autotile borders
    dirt: 118,
    water: 196,
    flowers: [83, 84, 90, 91, 278, 279, 285, 286],
    bush: 160,
    treeTop: 122,
    treeBottom: 161,
    smallTree: 162,
    orangeTree: 169,
    blueTree: 357,
    fence: 60,
    chestClosed: 137,
    chestOpen: 138,
    sign: 334,
    logs: 488,
    towerA: [250, 289, 328],
    towerB: [253, 292, 331],
    tentA: [[484, 485], [523, 524]],
    tentB: [[486, 487], [525, 526]],
    castle: [[367, 368, 369], [406, 407, 408], [445, 446, 447]],
}

const W = 40 // street width in tiles
const H = 28 // street height in tiles

k.scene("street", () => {
    setLocation("Tech street")
    const progress = createProgress(discoverable)
    const world = k.add([k.pos(0, 0), k.scale(scaleFactor)])
    const player = makePlayer()
    const labels = []
    const scene = setupScene(player, labels, progress)

    const rand = mulberry32(7)
    const pick = (arr) => arr[Math.floor(rand() * arr.length)]

    const tile = (col, row, frame, extra = []) => world.add([
        k.sprite("spritesheet", { frame }),
        k.pos(col * TILE, row * TILE),
        ...extra,
    ])

    const solid = (col, row, w = 1, h = 1, tag) => world.add([
        k.area({ shape: new k.Rect(k.vec2(0), w * TILE, h * TILE) }),
        k.body({ isStatic: true }),
        k.pos(col * TILE, row * TILE),
        ...(tag ? [tag] : []),
    ])

    const station = (key, col, row, w, h) => {
        solid(col, row, w, h, key)
        player.onCollide(key, () => scene.interact(key))
        labels.push(makeLabel(
            (col + w / 2) * TILE * scaleFactor,
            (row - 0.25) * TILE * scaleFactor,
            dialogueData[key].label,
        ))
    }

    // --- ground ---
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) tile(c, r, pick(F.grass), [k.z(0)])
    }

    // --- paths (dirt rectangles: col, row, width, height) ---
    const paths = [
        [19, 5, 2, 20],  // main avenue down from the castle door
        [7, 8, 27, 1],   // upper street
        [11, 13, 20, 1], // middle street
        [13, 19, 14, 1], // lower street
        [7, 8, 1, 6],    // lab spur
        [33, 8, 1, 6],   // voice spur
        [27, 19, 1, 4],  // pond spur
    ]
    for (const [c, r, w, h] of paths) {
        for (let y = r; y < r + h; y++) for (let x = c; x < c + w; x++) tile(x, y, F.dirt, [k.z(1)])
    }

    // --- pond with frogs ---
    for (let y = 21; y < 23; y++) for (let x = 29; x < 33; x++) tile(x, y, F.water, [k.z(1)])
    solid(29, 21, 4, 2)
    for (const [c, r] of [[28, 22], [33, 21]]) {
        tile(c, r, 788, [k.z(3)]).play("frog")
    }

    // --- flowers ---
    for (let i = 0; i < 40; i++) {
        const c = 1 + Math.floor(rand() * (W - 2))
        const r = 1 + Math.floor(rand() * (H - 2))
        tile(c, r, pick(F.flowers), [k.z(1)])
    }

    // --- border of bushes, trees and fences ---
    for (let c = 0; c < W; c++) {
        tile(c, 0, F.bush, [k.z(2)])
        tile(c, H - 1, F.bush, [k.z(2)])
    }
    for (let r = 1; r < H - 1; r++) {
        tile(0, r, F.bush, [k.z(2)])
        tile(W - 1, r, F.bush, [k.z(2)])
    }
    solid(0, 0, W, 1)
    solid(0, H - 1, W, 1)
    solid(0, 0, 1, H)
    solid(W - 1, 0, 1, H)

    const tallTree = (c, r) => {
        tile(c, r - 1, F.treeTop, [k.z(4)])
        tile(c, r, F.treeBottom, [k.z(3)])
        solid(c, r)
    }
    for (const [c, r] of [[3, 3], [36, 3], [3, 24], [36, 24], [12, 24], [24, 3], [15, 3], [38 - 1, 15], [2, 15]]) tallTree(c, r)
    for (const [c, r, f] of [[5, 20, F.orangeTree], [34, 17, F.blueTree], [10, 4, F.smallTree], [30, 4, F.smallTree], [17, 25, F.orangeTree], [22, 25, F.blueTree]]) {
        tile(c, r, f, [k.z(3)])
        solid(c, r)
    }
    for (let c = 9; c <= 14; c++) tile(c, 15, F.fence, [k.z(2)])
    solid(9, 15, 6, 1)
    for (let c = 25; c <= 30; c++) tile(c, 15, F.fence, [k.z(2)])
    solid(25, 15, 6, 1)

    // --- home: the castle, door in the middle of the bottom row ---
    F.castle.forEach((rowFrames, dy) => rowFrames.forEach((frame, dx) => tile(18 + dx, 2 + dy, frame, [k.z(3)])))
    solid(18, 2, 3, 3)
    station("home-door", 19, 5, 1, 1)
    labels[labels.length - 1].obj.pos.y = (5 + 1.2) * TILE * scaleFactor // label under the door, not over the wall
    labels[labels.length - 1].always = true

    // --- stations ---
    const tower = (frames, c, r) => {
        frames.forEach((frame, i) => tile(c, r - 2 + i, frame, [k.z(3)]))
        solid(c, r)
    }
    tower(F.towerA, 7, 6)
    station("agents-lab", 7, 6, 1, 1)

    tower(F.towerB, 33, 6)
    station("voice", 33, 6, 1, 1)

    const tent = (frames, c, r) => {
        frames.forEach((rowFrames, dy) => rowFrames.forEach((frame, dx) => tile(c + dx, r + dy, frame, [k.z(3)])))
    }
    tent(F.tentA, 10, 10)
    station("llm", 10, 10, 2, 2)

    tent(F.tentB, 28, 10)
    station("rag", 28, 10, 2, 2)

    const chest = tile(14, 17, F.chestClosed, [k.z(3)])
    station("cloud", 14, 17, 1, 1)
    player.onCollide("cloud", () => { chest.frame = F.chestOpen })

    tile(25, 17, F.sign, [k.z(3)])
    station("frontend", 25, 17, 1, 1)

    tile(20, 22, F.logs, [k.z(2)])
    tile(20, 22, 489, [k.z(3)]).play("fire")
    station("campfire", 20, 22, 1, 1)

    // --- the guide: an "AI agent" standing by the avenue ---
    tile(22, 6, 944, [k.z(4)]).play("guide-idle")
    station("guide", 22, 6, 1, 1)

    // --- wandering bunnies and a slime ---
    const critters = [
        { c: 5, r: 12, anim: "bunny" },
        { c: 35, r: 20, anim: "bunny" },
        { c: 16, r: 23, anim: "slime" },
    ]
    for (const { c, r, anim } of critters) {
        const critter = tile(c, r, 780, [k.z(3), { home: k.vec2(c * TILE, r * TILE), dir: k.vec2(0, 0), timer: 0 }])
        critter.play(anim)
        critter.onUpdate(() => {
            critter.timer -= k.dt()
            if (critter.timer <= 0) {
                critter.timer = 1 + rand() * 2
                critter.dir = rand() < 0.4 ? k.vec2(0, 0) : k.vec2(rand() * 2 - 1, rand() * 2 - 1).unit()
                if (critter.dir.x !== 0) critter.flipX = critter.dir.x < 0
            }
            const next = critter.pos.add(critter.dir.scale(12 * k.dt()))
            if (next.dist(critter.home) < TILE * 2.5) critter.pos = next
            else critter.dir = critter.home.sub(critter.pos).unit()
        })
    }

    // --- player spawns on the avenue just below the castle door ---
    player.pos = k.vec2((19.5) * TILE * scaleFactor, (7.3) * TILE * scaleFactor)
    k.add(player)
    showToast("Follow the path and walk into each place", 4000)
})

// Small seeded PRNG so the street looks the same on every visit.
function mulberry32(seed) {
    let t = seed
    return () => {
        t += 0x6D2B79F5
        let r = Math.imul(t ^ (t >>> 15), 1 | t)
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296
    }
}

// ---------------------------------------------------------------------------
// HTML UI wiring
// ---------------------------------------------------------------------------

function setupUi() {
    const intro = document.getElementById("intro")
    const start = document.getElementById("start")
    const help = document.getElementById("help")
    const helpBtn = document.getElementById("help-btn")
    const helpClose = document.getElementById("help-close")

    const openUi = (el) => { el.classList.add("open"); document.body.classList.add("ui-open") }
    const closeUi = (el) => { el.classList.remove("open"); document.body.classList.remove("ui-open"); focusGame() }

    start.addEventListener("click", () => {
        closeUi(intro)
        showToast("Walk into things to learn more about me", 4000)
    })
    helpBtn.addEventListener("click", () => openUi(help))
    helpClose.addEventListener("click", () => closeUi(help))
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && help.classList.contains("open")) closeUi(help)
        if ((e.key === "Enter" || e.key === " ") && intro.classList.contains("open")) {
            e.preventDefault()
            start.click()
        }
    })
}

setupUi()
document.getElementById("game").tabIndex = 0
window.addEventListener("pointerdown", () => {
    if (!document.body.classList.contains("ui-open")) focusGame()
})
k.go("room")
