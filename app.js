const listings = [
  { id: 1, title: "Casio fx-991EX Calculator", price: 4500, category: "Electronics", condition: "Good", featured: true },
  { id: 2, title: "Introduction to Algorithms (CLRS)", price: 3500, category: "Books", condition: "Like new" },
  { id: 3, title: "Logitech Wireless Mouse", price: 1800, category: "Electronics", condition: "Good" },
  { id: 4, title: "Discrete Mathematics by Rosen", price: 2200, category: "Books", condition: "Fair" },
  { id: 5, title: "Study Table with Drawer", price: 6000, category: "Furniture", condition: "Good" },
  { id: 6, title: "Geometry Box Set", price: 600, category: "Stationery", condition: "Like new" },
];

const savedFavorites = JSON.parse(localStorage.getItem("favs")) ?? [];
const favorites = new Set(savedFavorites);

const grid = document.querySelector("#listing-grid");
const searchInput = document.querySelector("#search");
const categorySelect = document.querySelector("#category");
const sortSelect = document.querySelector("#sort");
const resultCount = document.querySelector("#result-count");
const emptyMessage = document.querySelector("#empty-message");
const favCount = document.querySelector("#fav-count");
const savedTotal = document.querySelector("#saved-total");

const formatPrice = (n) => `Rs ${n.toLocaleString("en-PK")}`;

function fillTitle(heading, title, query) {
  const start = query ? title.toLowerCase().indexOf(query) : -1;
  if (start === -1) {
    heading.textContent = title;
    return;
  }
  const end = start + query.length;
  const mark = document.createElement("mark");
  mark.textContent = title.slice(start, end);
  heading.append(title.slice(0, start), mark, title.slice(end));
}

function createCard(listing, query) {
  const article = document.createElement("article");
  article.className = "card";
  article.dataset.id = listing.id;

  const img = document.createElement("img");
  img.src = `https://placehold.co/400x300?text=${encodeURIComponent(listing.category)}`;
  img.alt = listing.title;
  img.width = 400;
  img.height = 300;

  const body = document.createElement("div");
  body.className = "card-body";

  const h3 = document.createElement("h3");
  fillTitle(h3, listing.title, query);

  const price = document.createElement("p");
  price.className = "price";
  price.textContent = formatPrice(listing.price);

  const meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = `${listing.category} · ${listing.condition}`;

  const favBtn = document.createElement("button");
  favBtn.className = "fav-btn";
  favBtn.type = "button";
  favBtn.setAttribute("aria-pressed", favorites.has(listing.id));
  favBtn.textContent = favorites.has(listing.id) ? "❤️ Saved" : "🤍 Save";

  body.append(h3, price, meta, favBtn);

  if (listing.featured) {
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = "Featured";
    article.append(badge);
  }

  article.append(img, body);
  return article;
}

function render(items, query = "") {
  grid.replaceChildren(...items.map((listing) => createCard(listing, query)));
  resultCount.textContent = `${items.length} item(s) found`;
  emptyMessage.hidden = items.length > 0;
  favCount.textContent = favorites.size;

  const total = listings
    .filter((l) => favorites.has(l.id))
    .reduce((sum, l) => sum + l.price, 0);
  savedTotal.textContent = `Total value of saved items: ${formatPrice(total)}`;
}

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;
  const sort = sortSelect.value;

  const filtered = listings.filter((l) => {
    const matchesText =
      l.title.toLowerCase().includes(query) ||
      l.category.toLowerCase().includes(query);
    const matchesCategory = category === "All" || l.category === category;
    return matchesText && matchesCategory;
  });

  let sorted;
  if (sort === "low") {
    sorted = filtered.toSorted((a, b) => a.price - b.price);
  } else if (sort === "high") {
    sorted = filtered.toSorted((a, b) => b.price - a.price);
  } else {
    sorted = filtered.toSorted((a, b) => b.id - a.id);
  }

  render(sorted, query);
}

searchInput.addEventListener("input", applyFilters);
categorySelect.addEventListener("change", applyFilters);
sortSelect.addEventListener("change", applyFilters);

grid.addEventListener("click", (event) => {
  const button = event.target.closest(".fav-btn");
  if (!button) return;

  const id = Number(button.closest(".card").dataset.id);
  if (favorites.has(id)) favorites.delete(id);
  else favorites.add(id);

  localStorage.setItem("favs", JSON.stringify([...favorites]));
  applyFilters();
});

const toggle = document.querySelector("#theme-toggle");
const root = document.documentElement;

function isDarkNow() {
  if (root.dataset.theme) return root.dataset.theme === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

toggle.textContent = isDarkNow() ? "☀️" : "🌙";

toggle.addEventListener("click", () => {
  const isDark = isDarkNow();
  root.dataset.theme = isDark ? "light" : "dark";
  toggle.textContent = isDark ? "🌙" : "☀️";
});

applyFilters();
