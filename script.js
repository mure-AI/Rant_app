const STORAGE_KEY = "rant.posts.v1";

const form = document.querySelector("#rantForm");
const input = document.querySelector("#rantInput");
const feed = document.querySelector("#rantFeed");
const emptyState = document.querySelector("#emptyState");
const charCount = document.querySelector("#charCount");
const rantCount = document.querySelector("#rantCount");
const clearAllButton = document.querySelector("#clearAllButton");

let rants = loadRants();

function loadRants() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
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
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function updateCharacterCount() {
  charCount.textContent = `${input.value.length} / ${input.maxLength}`;
}

function renderFeed() {
  feed.innerHTML = "";
  rantCount.textContent = pluralizePosts(rants.length);
  emptyState.hidden = rants.length > 0;
  clearAllButton.disabled = rants.length === 0;

  rants.forEach((rant, index) => {
    const item = document.createElement("li");
    item.className = "rant-card";

    const meta = document.createElement("div");
    meta.className = "rant-meta";

    const time = document.createElement("span");
    time.textContent = formatTime(rant.createdAt);

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteRant(index));

    const copy = document.createElement("p");
    copy.textContent = rant.text;

    meta.append(time, deleteButton);
    item.append(meta, copy);
    feed.append(item);
  });
}

function addRant(text) {
  rants = [
    {
      id: createId(),
      text,
      createdAt: new Date().toISOString(),
    },
    ...rants,
  ];

  saveRants();
  renderFeed();
}

function deleteRant(index) {
  rants = rants.filter((_, currentIndex) => currentIndex !== index);
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

  addRant(text);
  form.reset();
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

updateCharacterCount();
renderFeed();
