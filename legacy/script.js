const STORAGE_KEY = "rant.posts.v1";

const form = document.querySelector("#rantForm");
const input = document.querySelector("#rantInput");
const feed = document.querySelector("#rantFeed");
const emptyState = document.querySelector("#emptyState");
const charCount = document.querySelector("#charCount");
const rantCount = document.querySelector("#rantCount");
const clearAllButton = document.querySelector("#clearAllButton");
const filterBar = document.querySelector("#filterBar");
const emptyTitle = document.querySelector("#emptyTitle");
const emptyMessage = document.querySelector("#emptyMessage");

let rants = loadRants();
let activeFilter = "All";

function loadRants() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.map((rant) => ({
      ...rant,
      id: rant.id || createId(),
      mood: getMood(rant),
    }));
  } catch {
    return [];
  }
}

function saveRants() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rants));
}

function formatTime(dateString) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString));
}

function pluralizePosts(count) {
  return count === 1 ? "1 post" : `${count} posts`;
}

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function updateCharacterCount() {
  charCount.textContent = `${input.value.length} / ${input.maxLength}`;
}

function renderFeed() {
  const visibleRants = activeFilter === "All" ? rants : rants.filter((rant) => getMood(rant) === activeFilter);

  feed.innerHTML = "";
  rantCount.textContent =
    activeFilter === "All" ? pluralizePosts(rants.length) : `${pluralizePosts(visibleRants.length)} shown`;
  emptyState.hidden = visibleRants.length > 0;
  clearAllButton.disabled = rants.length === 0;
  updateEmptyState();

  visibleRants.forEach((rant) => {
    const item = document.createElement("li");
    item.className = "rant-card";

    const meta = document.createElement("div");
    meta.className = "rant-meta";

    const time = document.createElement("span");
    time.textContent = formatTime(rant.createdAt);

    const mood = document.createElement("span");
    mood.className = `mood-pill mood-${getMood(rant).toLowerCase()}`;
    mood.textContent = getMood(rant);

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteRant(rant.id));

    const copy = document.createElement("p");
    copy.textContent = rant.text;

    meta.append(time, mood, deleteButton);
    item.append(meta, copy);
    feed.append(item);
  });
}

function getMood(rant) {
  return rant.mood || "Annoyed";
}

function updateEmptyState() {
  if (rants.length === 0) {
    emptyTitle.textContent = "Nothing has escaped yet.";
    emptyMessage.textContent = "Your first rant will land here, timestamped and ready to stare back at you.";
    return;
  }

  emptyTitle.textContent = `No ${activeFilter.toLowerCase()} rants yet.`;
  emptyMessage.textContent = "Try another filter or post one with this mood.";
}

function addRant(text, mood) {
  rants = [
    {
      id: createId(),
      text,
      mood,
      createdAt: new Date().toISOString(),
    },
    ...rants,
  ];

  saveRants();
  renderFeed();
}

function deleteRant(id) {
  rants = rants.filter((rant) => rant.id !== id);
  saveRants();
  renderFeed();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) {
    input.focus();
    return;
  }

  const mood = new FormData(form).get("mood") || "Annoyed";

  addRant(text, mood);
  form.reset();
  form.elements.mood.value = mood;
  updateCharacterCount();
  input.focus();
});

input.addEventListener("input", updateCharacterCount);

clearAllButton.addEventListener("click", () => {
  if (rants.length === 0) {
    return;
  }

  rants = [];
  saveRants();
  renderFeed();
  input.focus();
});

filterBar.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) {
    return;
  }

  activeFilter = button.dataset.filter;
  filterBar.querySelectorAll(".filter-button").forEach((filterButton) => {
    filterButton.classList.toggle("is-active", filterButton === button);
  });
  renderFeed();
});

updateCharacterCount();
renderFeed();
