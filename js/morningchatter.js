// JS
const API_ROOT = "https://acceptable-desire-0cca5bb827.strapiapp.com";
const ENDPOINT =
  API_ROOT +
  "/api/news-categories?filters[slug][$eq]=morning-chatter" +
  "&populate[news_sections][fields][0]=title" +
  "&populate[news_sections][fields][1]=author" +
  "&populate[news_sections][fields][2]=publish_on" +
  "&populate[news_sections][fields][3]=short_description" +
  "&populate[news_sections][populate][image]=true";

const BATCH = 5;             // 5 per click
const DESC_WORD_LIMIT = 30; // <= 100 words for Morning Chatter

const morningChatterNewsContainer = document.getElementById("morningChatterNews");
const showMoreBtn = document.getElementById("showMoreBtn");

let _items = [];
let _nextIndex = 0;

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function stripTags(html = "") {
  return String(html).replace(/<\/?[^>]+(>|$)/g, "");
}

function truncateWords(text = "", limit = 100) {
  const words = text.trim().split(/\s+/);
  if (words.length <= limit) return text.trim();
  return words.slice(0, limit).join(" ");
}

function fmtDate(d) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function resolveImageUrl(raw) {
  const url =
    raw?.data?.attributes?.url ||
    raw?.attributes?.url ||
    raw?.url ||
    null;
  if (!url) return "./image/mrng.png";
  return url.startsWith("http") ? url : API_ROOT + url;
}

function normalizeSections(payload) {
  const cat = payload?.data?.[0];
  let nodes = [];

  const v4 = cat?.attributes?.news_sections?.data;
  if (Array.isArray(v4)) nodes = v4.map((n) => n?.attributes ?? n);
  if (!nodes.length && Array.isArray(cat?.news_sections)) nodes = cat.news_sections;

  const normalizedItems = nodes.map((a) => {
    const img = a?.image;
    return {
      title: a?.title ?? "",
      author: a?.author ?? "",
      publish_on: a?.publish_on ?? a?.publishOn ?? "",
      short_description: a?.short_description ?? a?.shortDescription ?? "",
      imageUrl: resolveImageUrl(img),
      documentId: a?.documentId || "",
    };
  });

  // 🔥 Sort by publish_on (newest first)
  return normalizedItems.sort((a, b) => {
    const dateA = new Date(a.publish_on || 0).getTime();
    const dateB = new Date(b.publish_on || 0).getTime();
    return dateB - dateA; // descending order (newest first)
  });
}

function cardHTML(item) {
  const title = escapeHtml(item.title || "Untitled");
  const author = escapeHtml(item.author || "Unknown");
  const date = fmtDate(item.publish_on);

  const descPlain = stripTags(item.short_description || "");
  const descLimited = truncateWords(descPlain, DESC_WORD_LIMIT);
  const desc = escapeHtml(descLimited);
  const docId = item.documentId;

  return `
    <div class="news-card">
      <img src="${item.imageUrl}" alt="${title}">
      <div class="text-content">
        <h3>${title}</h3>
        <hr class="custom-line">
        <p>${desc} <a href="news-details.html?id=${docId}">read more.....</a></p>
        <span>${date}</span>
        <p>${author}</p>
      </div>
    </div>
  `;
}

function renderNextBatch() {
  if (!_items.length) return;

  const slice = _items.slice(_nextIndex, _nextIndex + BATCH);
  if (!slice.length) return;

  morningChatterNewsContainer.insertAdjacentHTML(
    "beforeend",
    slice.map(cardHTML).join("")
  );

  _nextIndex += slice.length;
  showMoreBtn.style.display = _nextIndex >= _items.length ? "none" : "";
}

async function morningChatterNews() {
  // morningChatterNewsContainer.innerHTML = `<p>Loading...</p>`;
  showMoreBtn.disabled = true;

  try {
    const res = await fetch(ENDPOINT);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();

    _items = normalizeSections(payload);
    _nextIndex = 0;
    morningChatterNewsContainer.innerHTML = "";

    if (!_items.length) {
      morningChatterNewsContainer.innerHTML = `<p>No news found.</p>`;
      showMoreBtn.style.display = "none";
      return;
    }

    console.log("Morning Chatter items sorted by date:", _items.map(item => ({
      title: item.title,
      publish_on: item.publish_on,
      formatted_date: fmtDate(item.publish_on)
    })));

    renderNextBatch();
    showMoreBtn.disabled = false;
  } catch (err) {
    console.error(err);
    morningChatterNewsContainer.innerHTML = `<p style="color:#b00">Failed to load news.</p>`;
    showMoreBtn.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  morningChatterNews();
  showMoreBtn?.addEventListener("click", renderNextBatch);
});