const TYPE_SPEED_MS = 14

// Kaboom only receives keyboard events through its canvas, so give it focus back
// whenever an HTML layer (button, overlay, dialogue) has taken it.
export function focusGame() {
    const canvas = document.getElementById("game")
    if (canvas && document.activeElement !== canvas) canvas.focus({ preventScroll: true })
}

let activeDialogue = null

// Shows the HTML dialogue box with a typewriter effect. Clicking the box or pressing
// a key finishes the typing first, and closes the box on the second press.
export function displayDialogue(entry, onDisplayEnd) {
    const container = document.getElementById("textbox-container")
    const titleEl = document.getElementById("dialogue-title")
    const textEl = document.getElementById("dialogue")
    const closeBtn = document.getElementById("close")
    const hint = document.getElementById("dialogue-hint")

    if (activeDialogue) activeDialogue.close()

    const fullText = entry.text.replace(/\s+/g, " ").trim()
    titleEl.textContent = entry.title
    textEl.innerHTML = ""
    container.classList.add("open")
    hint.textContent = "click or press any key to skip"

    let index = 0
    let typing = true
    const interval = setInterval(() => {
        if (index >= fullText.length) {
            finishTyping()
            return
        }
        // Insert HTML tags in one go so links render as soon as they appear.
        if (fullText[index] === "<") {
            const end = fullText.indexOf(">", index)
            index = end === -1 ? fullText.length : end + 1
        } else {
            index++
        }
        textEl.innerHTML = fullText.slice(0, index)
    }, TYPE_SPEED_MS)

    function finishTyping() {
        clearInterval(interval)
        typing = false
        textEl.innerHTML = fullText
        hint.textContent = "press Esc, Enter or E to close"
    }

    function advance() {
        if (typing) {
            finishTyping()
        } else {
            close()
        }
    }

    function onBoxClick(e) {
        if (e.target.closest("a") || e.target === closeBtn) return
        advance()
    }

    function onKey(e) {
        if (e.key === "Escape") {
            close()
            return
        }
        if (["Enter", " ", "e", "E"].includes(e.key)) {
            e.preventDefault()
            advance()
        }
    }

    function close() {
        clearInterval(interval)
        container.classList.remove("open")
        textEl.innerHTML = ""
        closeBtn.removeEventListener("click", close)
        container.removeEventListener("click", onBoxClick)
        window.removeEventListener("keydown", onKey)
        activeDialogue = null
        focusGame()
        onDisplayEnd()
    }

    closeBtn.addEventListener("click", close)
    container.addEventListener("click", onBoxClick)
    window.addEventListener("keydown", onKey)
    activeDialogue = { close }
}

export function setCamScale(k) {
    const ratio = k.width() / k.height()
    if (ratio < 1) {
        // Portrait phones: zoom out a little so more of the room fits.
        k.camScale(k.vec2(0.9))
        return
    }
    k.camScale(k.vec2(1.25))
}

// Small toast message at the top of the screen.
export function showToast(message, ms = 3500) {
    const toast = document.getElementById("toast")
    toast.textContent = message
    toast.classList.add("show")
    clearTimeout(toast._timer)
    toast._timer = setTimeout(() => toast.classList.remove("show"), ms)
}

// "Explored n/total" tracker in the HUD, persisted per browser so a returning
// visitor keeps their progress.
export function createProgress(keys) {
    const STORAGE_KEY = "portfolio-visited"
    const seen = new Set()
    try {
        for (const key of JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")) {
            if (keys.includes(key)) seen.add(key)
        }
    } catch (_) { /* storage unavailable: progress is per session only */ }

    const countEl = document.getElementById("progress-count")
    const barEl = document.getElementById("progress-bar")

    function render() {
        countEl.textContent = `${seen.size}/${keys.length}`
        barEl.style.width = `${(seen.size / keys.length) * 100}%`
    }

    render()

    return {
        has: (key) => seen.has(key),
        mark(key) {
            if (!keys.includes(key) || seen.has(key)) return false
            seen.add(key)
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen])) } catch (_) { /* ignore */ }
            render()
            return true
        },
        isComplete: () => seen.size === keys.length,
    }
}
