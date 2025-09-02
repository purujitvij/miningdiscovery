const API_ROOT = "https://acceptable-desire-0cca5bb827.strapiapp.com";

// Global variable to store all categories
let allCategories = [];
let currentCategorySlug = "latest-news";

function toArray(x) {
  if (!x) return [];
  if (Array.isArray(x)) return x;
  return [x];
}

async function newsCategory() {
  try {
    const res = await fetch(`${API_ROOT}/api/news-categories`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const payload = json?.data ?? json; 
    return toArray(payload);
  } catch (error) {
    console.error("Error fetching news categories:", error);
    return [];
  }
}

function safeSlugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function buildCategoryEndpoint(slug) {
  // If slug not provided, use predefined "latest-news"
  const finalSlug = slug || "latest-news";
  const encSlug = encodeURIComponent(finalSlug);

  // 🆕 Get next category slug for additional data
  const nextCategoryInfo = getNextCategoryInfo(finalSlug);
  const nextSlug = nextCategoryInfo?.slug || "latest-news";
  const encNextSlug = encodeURIComponent(nextSlug);

  console.log("Current encSlug ===>", encSlug);
  console.log("Next encSlug ===>", encNextSlug);

  return (
    API_ROOT +
    `/api/news-categories?filters[$or][0][slug][$eq]=${encSlug}` +
    `&filters[$or][1][slug][$eq]=${encNextSlug}` +
    `&populate[news_sections][fields][0]=title` +
    `&populate[news_sections][fields][1]=author` +
    `&populate[news_sections][fields][2]=publish_on` +
    `&populate[news_sections][fields][3]=short_description` +
    `&populate[news_sections][populate][image]=true`+
    `&pagination[pageSize]=10`  // Increased to accommodate both categories
  );
}

function absUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_ROOT}${url}`;
}

function fmtDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return iso;
  }
}

function escapeHTML(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function truncateWords(str, maxWords = 15) {
  const words = String(str || "").split(/\s+/);
  if (words.length <= maxWords) return str || "";
  return words.slice(0, maxWords).join(" ");
}

// 🧱 Builds ONE card exactly like the structure you provided
function buildNewsCard({ title, author, publish_on, short_description, imageUrl, docId }) {
  const safeTitle = escapeHTML(title || "Untitled");
  const safeAuthor = escapeHTML(author || "");
  const safeDate = fmtDate(publish_on);
  const safeDesc = escapeHTML(truncateWords(short_description || ""));

  // Fallback image if none from API
  const imgSrc = imageUrl || "./image/pexels-castorlystock-5139206 1.png";

  const safeDocId = escapeHTML(docId || "");

  return `
    <div class="news-card">
      <img src="${imgSrc}" alt="">
      <div class="text-content">
        <h3>${safeTitle}</h3>
        <hr class="custom-line">
        <p>${safeDesc} <span><a href="news-details.html?id=${safeDocId}">read more.....</a></span></p>
        <span>${safeDate}</span>
        <p> ${safeAuthor || "ARRAS MINERALS"}</p>
      </div>
    </div>
  `;
}
   
function buildNextNewsCard({ title, author, publish_on, short_description, imageUrl, docId }) {
  const safeTitle = escapeHTML(title || "Untitled");
  const safeAuthor = escapeHTML(author || "");
  const safeDate = fmtDate(publish_on);
  const safeDesc = escapeHTML(truncateWords(short_description || ""));

  // Fallback image if none from API
  const imgSrc = imageUrl || "./image/pexels-castorlystock-5139206 1.png";

  const safeDocId = escapeHTML(docId || "");

  return `
    <div class="gold-card">
      <img src="${imgSrc}" alt="">
      <h3>${safeTitle}</h3>
      <p>${safeDesc}</p>
      ${safeDocId ? `<a href="news-details.html?id=${safeDocId}" class="read-more-link">Read More</a>` : ''}
    </div>
  `;
}

function extractSectionsFromResponse(apiJson, targetSlug) {
  // Find the specific category data from the response
  const categories = toArray(apiJson?.data || []);
  const targetCategory = categories.find(cat => {
    const src = cat?.attributes ?? cat ?? {};
    const slug = src.slug ?? (src.category ? safeSlugify(src.category) : null);
    return slug === targetSlug;
  });

  if (!targetCategory) {
    console.warn(`Category with slug "${targetSlug}" not found in response`);
    return [];
  }

  // Extract sections from the target category
  const bucket = targetCategory?.attributes ?? targetCategory ?? {};
  const rawSections = bucket?.news_sections || [];

  const sections = toArray(rawSections).map((sec) => {
    const s = sec?.attributes ?? sec ?? {};

    // Strapi image path: attributes.image.data.attributes.url (or null)
    const imageUrl =
      sec?.image?.data?.attributes?.url ||
      s?.image?.data?.attributes?.url ||
      s?.image?.url ||
      null;

    return {
      title: s.title,
      author: s.author,
      publish_on: s.publish_on,
      short_description: s.short_description,
      imageUrl: absUrl(imageUrl),
      docId: sec?.documentId || s?.documentId || null
    };
  });

  // 🔥 Sort by publish_on (newest first)
  return sections.sort((a, b) => {
    const da = new Date(a.publish_on || 0).getTime();
    const db = new Date(b.publish_on || 0).getTime();
    return db - da; // descending
  });
}

// 🆕 NEW FUNCTION: Extract next category sections
function extractNextCategorySections(apiJson, nextSlug) {
  return extractSectionsFromResponse(apiJson, nextSlug);
}

function renderNewsSections(sections) {
  const container = document.getElementById("newsContainer");
  if (!container) return;

  if (!sections.length) {
    container.innerHTML = `<p>No news available for this category.</p>`;
    return;
  }

  // Build all cards (or slice(0,5) if you want only the first)
  const html = sections.slice(0,5).map(buildNewsCard).join("");
  container.innerHTML = html;
}

// 🆕 NEW FUNCTION: Render next category preview cards (3 cards)
function renderNextCategoryPreview(sections) {
  const nextNewsContainer = document.getElementById("nextNewsContainer");
  if (!nextNewsContainer || !sections.length) return;

  const nextNewsCard = sections.slice(0,3).map(buildNextNewsCard).join("");
  nextNewsContainer.innerHTML = nextNewsCard;
}

// 🆕 NEW FUNCTION: Render all next category sections when "show more" is clicked
function renderNextCategoryFull(sections) {
  const container = document.getElementById("newsContainer");
  if (!container) return;

  if (!sections.length) {
    container.innerHTML = `<p>No news available for this category.</p>`;
    return;
  }

  // Build all cards for next category
  const html = sections.slice(0,5).map(buildNewsCard).join("");
  container.innerHTML = html;

  // Clear the next category preview since we're now showing it as main
  const nextNewsContainer = document.getElementById("nextNewsContainer");
  if (nextNewsContainer) {
    nextNewsContainer.innerHTML = "";
  }
}

// 🆕 NEW FUNCTION: Get next category info (name and slug)
function getNextCategoryInfo(currentSlug) {
  if (!allCategories.length) return null;
  
  // Find current category index
  const currentIndex = allCategories.findIndex(cat => {
    const src = cat?.attributes ?? cat ?? {};
    const slug = src.slug ?? (src.category ? safeSlugify(src.category) : null);
    return slug === currentSlug;
  });
  
  // If current category not found or it's the last one, return first category
  const nextIndex = currentIndex === -1 || currentIndex === allCategories.length - 1 
    ? 0 
    : currentIndex + 1;
  
  const nextCategory = allCategories[nextIndex];
  const src = nextCategory?.attributes ?? nextCategory ?? {};
  const nextSlug = src.slug ?? (src.category ? safeSlugify(src.category) : null);
  const nextName = src.title ?? src.category ?? src.name ?? "Unknown Category";
  
  return {
    name: nextName,
    slug: nextSlug
  };
}

// 🆕 NEW FUNCTION: Update next category display
function updateNextCategoryDisplay() {
  const nextCategoryEl = document.getElementById("nextCategoryTitle");
  if (nextCategoryEl) {
    const nextCategoryInfo = getNextCategoryInfo(currentCategorySlug);
    nextCategoryEl.textContent = nextCategoryInfo?.name || "No Next Category";
    console.log("Next category:", nextCategoryInfo?.name, "with slug:", nextCategoryInfo?.slug);
  }
}

async function fetchAndRenderCategory(slug) {
  const endpoint = buildCategoryEndpoint(slug);
  console.log("Endpoint:", endpoint);

  // Update current category slug
  currentCategorySlug = slug || "latest-news";

  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // 🔎 Full API response in console
    console.log("Full API response for", slug || "latest-news", ":", data);

    // Find current category data from response
    const categories = toArray(data?.data || []);
    const currentCategory = categories.find(cat => {
      const src = cat?.attributes ?? cat ?? {};
      const categorySlug = src.slug ?? (src.category ? safeSlugify(src.category) : null);
      return categorySlug === currentCategorySlug;
    });

    // 🏷️ Extract category title from API or fallback to slug
    const categoryName =
      currentCategory?.attributes?.title ||
      currentCategory?.attributes?.name ||
      currentCategory?.attributes?.category ||
      (slug || "latest-news")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

    // Show category in <h2>
    const headingEl = document.getElementById("categoryTitle");
    console.log("categoryName:", categoryName, "headingEl:", !!headingEl);
    if (headingEl) {
      headingEl.textContent = categoryName || "Latest News";
    }

    // 🆕 Update next category display
    updateNextCategoryDisplay();

    // 🔁 Extract & render current category sections
    const sections = extractSectionsFromResponse(data, currentCategorySlug);
    renderNewsSections(sections);

    // 🆕 Extract next category sections and render preview
    const nextCategoryInfo = getNextCategoryInfo(currentCategorySlug);
    if (nextCategoryInfo?.slug) {
      const nextCategorySections = extractNextCategorySections(data, nextCategoryInfo.slug);
      console.log("Next category sections available:", nextCategorySections);
      
      // Render next category preview (3 cards)
      renderNextCategoryPreview(nextCategorySections);
      
      // Store globally for "show more" functionality
      window.nextCategoryData = {
        name: nextCategoryInfo.name,
        slug: nextCategoryInfo.slug,
        sections: nextCategorySections
      };
    }

  } catch (err) {
    console.error("Error fetching news for", slug, err);
    const container = document.getElementById("newsContainer");
    if (container) container.innerHTML = `<p>Failed to load news.</p>`;
  }
}

function generateDropdownMenu(categories) {
  const dropdownMenu = document.getElementById("dropdownMenu");
  dropdownMenu.innerHTML = "";

  categories.forEach((item) => {
    const src = item?.attributes ?? item ?? {};
    const title =
      src.title ?? src.category ?? src.name ?? `Category ${item?.id ?? ""}`;
    const slug = src.slug ?? (src.category ? safeSlugify(src.category) : null);

    if (!title) return;

    const a = document.createElement("a");
    a.textContent = title;
    a.href = "javascript:void(0)";
    a.dataset.slug = slug || ""; // 🔑 store slug
    dropdownMenu.appendChild(a);
  });

  // 🔥 attach click handler here (renders on click)
  dropdownMenu.addEventListener("click", async (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    const slug = link.dataset.slug || "latest-news"; // fallback
    console.log("Clicked slug:", slug);
    await fetchAndRenderCategory(slug);
  });
}

// 🆕 NEW FUNCTION: Handle "Show More" button click
function handleShowMoreClick() {
  if (window.nextCategoryData && window.nextCategoryData.sections) {
    // Update current category to next category
    currentCategorySlug = window.nextCategoryData.slug;
    
    // Update main category title
    const headingEl = document.getElementById("categoryTitle");
    if (headingEl) {
      headingEl.textContent = window.nextCategoryData.name;
    }
    
    // Update next category display
    updateNextCategoryDisplay();
    
    // Render next category sections in main area
    renderNextCategoryFull(window.nextCategoryData.sections);
    
    // Get new next category data
    const newNextCategoryInfo = getNextCategoryInfo(currentCategorySlug);
    if (newNextCategoryInfo?.slug) {
      // You might want to fetch new next category data here
      // For now, clear the preview area
      const nextNewsContainer = document.getElementById("nextNewsContainer");
      if (nextNewsContainer) {
        nextNewsContainer.innerHTML = "<p>Loading next category preview...</p>";
      }
      
      // Clear stored data
      window.nextCategoryData = null;
      
      // Fetch new data with updated current category
      fetchAndRenderCategory(currentCategorySlug);
    }
  } else {
    console.warn("No next category data available");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const dropdownToggle = document.getElementById("dropdownToggle");
  const dropdownMenu = document.getElementById("dropdownMenu");

  // 🆕 Store categories globally for next category functionality
  allCategories = await newsCategory();
  generateDropdownMenu(allCategories);

  // ⚡ Initial load (latest-news)
  await fetchAndRenderCategory("latest-news");

  // 🆕 Add event listener for "Show More" button
  const showMoreBtn = document.querySelector(".btn-more");
  if (showMoreBtn) {
    showMoreBtn.addEventListener("click", handleShowMoreClick);
  }

  // Toggle open/close
  if (dropdownToggle && dropdownMenu) {
    dropdownToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle("show");
      dropdownToggle.setAttribute(
        "aria-expanded",
        dropdownMenu.classList.contains("show") ? "true" : "false"
      );
    });
  }

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (dropdownMenu && dropdownToggle) {
      const inside =
        dropdownMenu.contains(e.target) || dropdownToggle.contains(e.target);
      if (!inside) {
        dropdownMenu.classList.remove("show");
        dropdownToggle.setAttribute("aria-expanded", "false");
      }
    }
  });

  // Close with Esc
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && dropdownMenu && dropdownToggle) {
      dropdownMenu.classList.remove("show");
      dropdownToggle.setAttribute("aria-expanded", "false");
    }
  });
});