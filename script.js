const TOTAL_POKEMON = 1025;
const SPRITE_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
const API_BASE = "https://pokeapi.co/api/v2/pokemon";

const grid = document.getElementById("grid");
const countEl = document.getElementById("count");
const searchInput = document.getElementById("search");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeModalBtn = document.getElementById("closeModal");

countEl.textContent = `${TOTAL_POKEMON}匹`;

function buildGrid() {
  const fragment = document.createDocumentFragment();
  for (let id = 1; id <= TOTAL_POKEMON; id++) {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = id;
    card.dataset.name = "";
    card.innerHTML = `
      <img src="${SPRITE_BASE}/${id}.png" alt="No.${id}" loading="lazy">
      <div class="num">No.${String(id).padStart(4, "0")}</div>
      <div class="name"></div>
    `;
    card.addEventListener("click", () => openDetail(id));
    fragment.appendChild(card);
  }
  grid.appendChild(fragment);
}

const nameCache = new Map();
async function fetchJapaneseName(id) {
  if (nameCache.has(id)) return nameCache.get(id);
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
  const data = await res.json();
  const jaName = data.names.find((n) => n.language.name === "ja-Hrkt" || n.language.name === "ja");
  const result = jaName ? jaName.name : data.name;
  nameCache.set(id, result);
  return result;
}

async function openDetail(id) {
  modal.classList.remove("hidden");
  modalBody.innerHTML = `<div class="loading">読み込み中...</div>`;
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    const data = await res.json();
    const jaName = await fetchJapaneseName(id);

    const card = grid.querySelector(`.card[data-id="${id}"]`);
    if (card) {
      card.querySelector(".name").textContent = jaName;
      card.dataset.name = jaName;
    }

    const typesHtml = data.types
      .map(
        (t) =>
          `<span class="type-badge type-${t.type.name}">${t.type.name}</span>`
      )
      .join("");

    const statsHtml = data.stats
      .map(
        (s) => `<tr><td>${s.stat.name}</td><td>${s.base_stat}</td></tr>`
      )
      .join("");

    modalBody.innerHTML = `
      <div class="detail-header">
        <img src="${SPRITE_BASE}/${id}.png" alt="${jaName}">
        <div>
          <h2>${jaName}</h2>
          <div>No.${String(id).padStart(4, "0")}</div>
          <div class="types">${typesHtml}</div>
        </div>
      </div>
      <table class="stats-table">
        <tr><td>身長</td><td>${data.height / 10} m</td></tr>
        <tr><td>体重</td><td>${data.weight / 10} kg</td></tr>
        ${statsHtml}
      </table>
    `;
  } catch (err) {
    modalBody.innerHTML = `<div class="loading">読み込みに失敗しました。</div>`;
    console.error(err);
  }
}

closeModalBtn.addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  document.querySelectorAll(".card").forEach((card) => {
    const id = card.dataset.id;
    const name = (card.dataset.name || "").toLowerCase();
    const matches =
      !query || id === query || id.padStart(4, "0") === query || name.includes(query);
    card.classList.toggle("hidden", !matches);
  });
});

buildGrid();
