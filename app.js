const modes = [
  "All Cards",
  "Meaning Recall",
  "Verse-to-Concept",
  "Concept-to-Verse",
  "Key Info Drill",
  "Comparison",
  "Timeline Recall"
];

const state = {
  lessonId: window.SIMC_LESSONS[0].id,
  mode: "All Cards",
  index: 0,
  revealed: false,
  ratings: {}
};

const els = {
  lessonSelect: document.querySelector("#lessonSelect"),
  lessonMeta: document.querySelector("#lessonMeta"),
  modeSelect: document.querySelector("#modeSelect"),
  cardType: document.querySelector("#cardType"),
  counter: document.querySelector("#counter"),
  tagRow: document.querySelector("#tagRow"),
  promptText: document.querySelector("#promptText"),
  hintText: document.querySelector("#hintText"),
  revealButton: document.querySelector("#revealButton"),
  hintButton: document.querySelector("#hintButton"),
  answerSurface: document.querySelector("#answerSurface"),
  answerText: document.querySelector("#answerText"),
  difficultyLabel: document.querySelector("#difficultyLabel"),
  seenCount: document.querySelector("#seenCount"),
  masteredCount: document.querySelector("#masteredCount"),
  againCount: document.querySelector("#againCount"),
  resetButton: document.querySelector("#resetButton")
};

function currentLesson() {
  return window.SIMC_LESSONS.find((lesson) => lesson.id === state.lessonId);
}

function filteredCards() {
  const cards = currentLesson().cards;
  if (state.mode === "All Cards") return cards;
  return cards.filter((card) => card.type === state.mode);
}

function ensureModeHasCards() {
  if (filteredCards().length > 0) return;
  state.mode = "All Cards";
  els.modeSelect.value = state.mode;
}

function currentCard() {
  const cards = filteredCards();
  return cards[state.index] || cards[0];
}

function formatAnswer(items) {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function renderLessonOptions() {
  els.lessonSelect.innerHTML = window.SIMC_LESSONS.map(
    (lesson) => {
      const suffix = lesson.cards.length ? `(${lesson.cards.length})` : "(needs import)";
      return `<option value="${lesson.id}">${lesson.title} ${suffix}</option>`;
    }
  ).join("");
  els.lessonSelect.value = state.lessonId;
}

function renderModes() {
  const lessonCards = currentLesson().cards;
  els.modeSelect.innerHTML = modes
    .map((mode) => {
      const count =
        mode === "All Cards"
          ? lessonCards.length
          : lessonCards.filter((card) => card.type === mode).length;
      const disabled = count === 0 && mode !== "All Cards" ? "disabled" : "";
      return `<option value="${mode}" ${disabled}>${mode} (${count})</option>`;
    })
    .join("");
  els.modeSelect.value = state.mode;
}

function renderCard() {
  const lesson = currentLesson();
  ensureModeHasCards();
  const cards = filteredCards();
  const card = currentCard();

  if (!card) {
    els.lessonMeta.textContent = `${lesson.course} lesson. Exact answer cards have not been imported for this lesson yet.`;
    els.cardType.textContent = "Needs Import";
    els.counter.textContent = "0 / 0";
    els.promptText.textContent = "This lesson is in the SIMC folder, but exact study cards have not been created from its notes yet.";
    els.tagRow.innerHTML = "<span>SIMC folder</span><span>Needs exact cards</span>";
    els.answerText.innerHTML = "";
    els.difficultyLabel.textContent = "";
    els.hintText.textContent = "No scaffold answers are shown here. This lesson needs real answers imported from the document.";
    els.hintText.classList.remove("hidden");
    els.answerSurface.classList.add("hidden");
    els.revealButton.textContent = "Reveal Answer";
    els.revealButton.disabled = true;
    els.hintButton.disabled = true;
    document
      .querySelectorAll(".rating-row button")
      .forEach((button) => (button.disabled = true));
    renderStats();
    return;
  }

  els.lessonMeta.textContent = `${lesson.course} lesson. ${lesson.summary}`;
  els.cardType.textContent = card.type;
  els.counter.textContent = `${state.index + 1} / ${cards.length}`;
  els.promptText.textContent = card.prompt;
  els.tagRow.innerHTML = card.tags.map((tag) => `<span>${tag}</span>`).join("");
  els.answerText.innerHTML = formatAnswer(card.answer);
  els.difficultyLabel.textContent = card.difficulty;
  els.hintText.textContent = card.hint;
  els.hintText.classList.add("hidden");
  els.answerSurface.classList.toggle("hidden", !state.revealed);
  els.revealButton.textContent = state.revealed ? "Hide Answer" : "Reveal Answer";
  els.revealButton.disabled = false;
  els.hintButton.disabled = false;
  document
    .querySelectorAll(".rating-row button")
    .forEach((button) => (button.disabled = false));

  renderStats();
}

function renderStats() {
  const ratings = Object.values(state.ratings);
  els.seenCount.textContent = ratings.length;
  els.masteredCount.textContent = ratings.filter((rating) => rating === "easy").length;
  els.againCount.textContent = ratings.filter((rating) => rating === "again").length;
}

function moveNext() {
  const cards = filteredCards();
  state.index = (state.index + 1) % cards.length;
  state.revealed = false;
  renderCard();
}

function showHint() {
  const card = currentCard();
  if (!card) return;
  els.hintText.classList.toggle("hidden");
}

function init() {
  renderLessonOptions();
  renderModes();
  renderCard();

  els.lessonSelect.addEventListener("change", (event) => {
    state.lessonId = event.target.value;
    state.index = 0;
    state.revealed = false;
    renderModes();
    renderCard();
  });

  els.modeSelect.addEventListener("change", (event) => {
    state.mode = event.target.value;
    state.index = 0;
    state.revealed = false;
    renderCard();
  });

  els.revealButton.addEventListener("click", () => {
    state.revealed = !state.revealed;
    renderCard();
  });

  els.hintButton.addEventListener("click", showHint);

  document.querySelector(".rating-row").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-rating]");
    const card = currentCard();
    if (!button || !card) return;
    state.ratings[card.id] = button.dataset.rating;
    moveNext();
  });

  els.resetButton.addEventListener("click", () => {
    state.index = 0;
    state.revealed = false;
    state.ratings = {};
    renderCard();
  });
}

init();
