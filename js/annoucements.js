async function loadAnnouncements() {
  const url =
    "https://acceptable-desire-0cca5bb827.strapiapp.com/api/news-categories?filters[slug][$eq]=announcement&populate[news_sections][fields][0]=title&populate[news_sections][fields][1]=author&populate[news_sections][fields][2]=publish_on&populate[news_sections][populate][image]=true";
  const container = document.getElementById("announcements");
  if (!container) return;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();

    console.log("payload", payload);

    // Strapi v5 flat → payload.data[0].news_sections; v4 fallback included
    let sections = payload?.data?.[0]?.news_sections;
    if (!Array.isArray(sections)) {
      const v4Data = payload?.data?.[0]?.attributes?.news_sections?.data || [];
      sections = v4Data.map((x) => x.attributes);
    }

    if (!sections?.length) {
      container.insertAdjacentHTML("beforeend", `<p>No news found.</p>`);
      return;
    }
 const sortedSections = sections.sort((a, b) => {
      const dateA = new Date(a.publish_on || 0).getTime();
      const dateB = new Date(b.publish_on || 0).getTime();
      return dateB - dateA; // descending order (newest first)
    });

    // Build 5 cards
    const cardsHtml = sortedSections
      .slice(0, 5)
      .map((item) => {
        const title = item.title || "Untitled";
        const author = (item.author || "").trim().replace(/^by:\s*/i, "");
        const dateStr = formatDate(item.publish_on);
        const imgUrl = getImageUrl(item) || "./image/slider2.png"; // fallback to your static image

        return `
       <ul>
              <li>${escapeHtml(title)}</li>
            
            </ul>
      `;
      })
      .join("");

    // Keep any existing header; only (re)render cards
    container.querySelectorAll(".team-card").forEach((el) => el.remove());
    container.insertAdjacentHTML("beforeend", cardsHtml);
  } catch (err) {
    console.error(err);
    container.insertAdjacentHTML(
      "beforeend",
      `<p style="color:#b00">Failed to load news.</p>`
    );
  }
}

// --- helpers ---
function getImageUrl(item) {
  // Try common media field names and shapes (v5/v4, single/array)
  let m = item?.image ?? item?.cover ?? item?.thumbnail ?? null;
  if (!m) return null;
  if (Array.isArray(m)) m = m[0] || null;

  let url =
    m?.url || m?.data?.attributes?.url || m?.formats?.thumbnail?.url || null;

  if (url && url.startsWith("/")) {
    url = "https://acceptable-desire-0cca5bb827.strapiapp.com" + url;
  }
  return url;
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const day = d.getDate();
  const ord = (n) => {
    const s = ["th", "st", "nd", "rd"],
      v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };
  const month = d.toLocaleString("en-GB", { month: "long" });
  const year = d.getFullYear();
  return `${day}${ord(day)} ${month} ${year}`;
}

function escapeHtml(str) {
  return String(str).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ])
  );
}
