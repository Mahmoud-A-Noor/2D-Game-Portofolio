export const scaleFactor = 4

export const links = {
    github: "https://github.com/Mahmoud-A-Noor",
    linkedin: "https://www.linkedin.com/in/mahmoud-a-noor/",
    portfolio: "https://mahmoud-a-noor.github.io",
    cv: "https://drive.google.com/file/d/1hHMZAsWB0dOkART9MrdZVCGUWAkc1kfP/view?usp=sharing",
    email: "mailto:mahmoudnoor917@gmail.com",
}

const a = (href, label) => `<a href="${href}" target="_blank" rel="noreferrer">${label}</a>`

// Every interactable in the world. Keys for the room match object names in map.json;
// keys for the street match the station ids in main.js.
// `label` floats above the object, `title` heads the dialogue box, `text` is typed out
// inside it, and `action` replaces the dialogue with a scene change.
// The street talks about the technology in general, never about any employer's systems.
export const dialogueData = {
    // ---------------- the room ----------------
    pc: {
        label: "PC",
        title: "My PC",
        text: `This is where most of the work happens. Since April 2025 I have been the founding engineer at Rqmii,
        where I build AI agents that talk to customers over text, voice and phone calls.
        Python on the backend, React and TypeScript on the front, Kubernetes underneath.
        The code I can share is on my ${a(links.github, "GitHub")}.`,
    },
    "cs-degree": {
        label: "Degree",
        title: "The Degree on the Wall",
        text: `A bachelor's degree in Medical Informatics from Helwan University, Faculty of Computer Science and
        Artificial Intelligence. Graduated with honors in 2023 with a GPA of 3.72 / 4.0.
        I hung it here because I am proud of it, and because the theory turned out to be useful after all.`,
    },
    "sofa-table": {
        label: "Sofa",
        title: "The Sofa",
        text: `This is where I read engineering blogs and watch conference talks about LLMs, distributed systems
        and real-time media. Occasionally I actually relax here too.`,
    },
    tv: {
        label: "TV",
        title: "The TV",
        text: `Lately it mostly shows tech talks and tutorials. It is also my second monitor when I want to
        follow a long video while coding.`,
    },
    bed: {
        label: "Bed",
        title: "The Bed",
        text: `Where I sleep, in theory. Ideas about system design like to show up right here around midnight,
        so there is always a notebook within reach. If I do not write them down, I do not sleep.`,
    },
    resume: {
        label: "CV",
        title: "My Desk and CV",
        text: `On the desk is my CV. ${a(links.cv, "Read it here")}.
        I am open to interesting opportunities in AI agents, backend and platform engineering.
        Reach me at ${a(links.email, "mahmoudnoor917@gmail.com")} or on ${a(links.linkedin, "LinkedIn")}.`,
    },
    projects: {
        label: "Projects",
        title: "The Project Board",
        text: `My day job is building AI agents for text, voice and phone calls, end to end: from the model
        and its knowledge to the real-time audio and the cloud it runs on. The full story is on my
        ${a(links.portfolio, "portfolio site")}. Curious how this kind of tech works? Step outside: the door on the
        left wall leads to a street where each stop explains one idea. This room itself is built with Kaboom.js,
        and the box you are reading is plain HTML, not canvas.`,
    },
    library: {
        label: "Books",
        title: "The Bookshelf",
        text: `Programming books: distributed systems, clean architecture, Python, TypeScript, and a few on
        machine learning from my university days. I have read more of them than I used to, honestly.`,
    },
    exit: {
        label: "< Exit",
        action: "go-outside",
    },

    // ---------------- the tech street: how this kind of technology works ----------------
    "home-door": {
        label: "Home",
        action: "go-home",
    },
    guide: {
        label: "Talk",
        title: "An AI Agent",
        text: `Hi! I am an AI agent, the kind of software Mahmoud works on. Give a language model a role, some rules,
        knowledge to search and tools to act with, and you get something like me: a program that can hold a
        conversation and get things done. Each stop on this street explains one idea behind that.
        Start with the lab on the left, then follow the path.`,
    },
    "agents-lab": {
        label: "AI Agents Lab",
        title: "What Is an AI Agent?",
        text: `A language model on its own only predicts the next word. An agent wraps it in everything it needs to do a
        job: a system prompt that gives it a role and rules, the conversation so far as memory, documents it can
        search, and tools it can call to look things up or take actions. The interesting engineering is everything
        around the model: keeping it on topic, fast, safe and affordable, and letting it talk through a website,
        a chat app or a phone line with the same brain.`,
    },
    llm: {
        label: "Talking to LLMs",
        title: "Talking to Language Models",
        text: `Three ideas make conversations feel alive. Streaming: the answer is sent word by word as the model
        produces it, so nobody waits for a full paragraph. Tool calling: the model can ask to run a function, such as
        booking a meeting or searching the web, gets the result back, and continues. Prompt assembly: instructions,
        history and retrieved facts are composed into one carefully budgeted request. Different providers and
        models can sit behind the same interface, so switching is a configuration change.`,
    },
    rag: {
        label: "RAG",
        title: "Retrieval-Augmented Generation",
        text: `Models do not know your documents, and retraining them is slow and expensive. Instead, documents are split
        into chunks, each chunk is turned into an embedding (a vector that captures its meaning), and at question time
        the most relevant chunks are found and handed to the model as context. Hybrid search combines meaning-based
        matching with classic keyword matching, and a vector database such as Qdrant makes it fast at scale.`,
    },
    voice: {
        label: "Voice & Calls",
        title: "Voice and Phone Agents",
        text: `Audio comes in over WebRTC from a browser, or over SIP from the phone network. Voice activity detection
        decides when someone has finished speaking, speech-to-text turns it into words, the model replies, and
        text-to-speech speaks it back, all streamed so the pause feels natural. The hard parts: latency, letting the
        caller interrupt, and the realities of phones: transfers, hold music, voicemail and dropped connections.`,
    },
    cloud: {
        label: "Cloud & GitOps",
        title: "The Infrastructure Chest",
        text: `Inside: how all of this runs. Services are packaged as containers and scheduled on Kubernetes. With
        GitOps, the cluster is continuously synced to what is described in git, so every change is reviewed and
        reversible. Secrets stay out of code, services prove their identity to each other with short-lived tokens,
        expensive machines such as GPU nodes scale to zero when idle, and cost is watched as closely as uptime.`,
    },
    frontend: {
        label: "Frontend & SDKs",
        title: "The Signboard",
        text: `The screens people touch: a web app in React and TypeScript, built for English and Arabic alike, where
        right-to-left layout is a feature and not an afterthought. And an embeddable SDK, so an agent can live on any
        website with a single script tag: tiny loader first, heavy parts only when needed, styles isolated so the
        host page stays untouched.`,
    },
    campfire: {
        label: "Fireside",
        title: "Fireside Chat",
        text: `The tools I reach for: Python and TypeScript, PostgreSQL and Redis, React, Kubernetes. What I keep
        learning: making agents more reliable, evaluating them properly, and making voice pipelines faster.
        If you want to talk about any of this, my ${a(links.linkedin, "LinkedIn")} is open.`,
    },
}

// Objects that count towards the "explored" tracker (doors are not discoveries).
export const discoverable = [
    "pc", "cs-degree", "sofa-table", "tv", "bed", "resume", "projects", "library",
    "guide", "agents-lab", "llm", "rag", "voice", "cloud", "frontend", "campfire",
]
