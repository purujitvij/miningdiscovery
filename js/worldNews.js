async function loadWorldNews() {
  const url =
    "https://acceptable-desire-0cca5bb827.strapiapp.com/api/news-categories?filters[slug][$eq]=world-news&populate[news_sections][fields][0]=title&populate[news_sections][fields][1]=author&populate[news_sections][fields][2]=publish_on&populate[news_sections][populate][image]=true";
  const worldNewsContainer = document.getElementById("worldNews");

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();

    let sections = payload?.data?.[0]?.news_sections;

    const sortedSections = sections.sort((a, b) => {
      const dateA = new Date(a.publish_on || 0).getTime();
      const dateB = new Date(b.publish_on || 0).getTime();
      return dateB - dateA; // descending order (newest first)
    });

    const view = sortedSections.slice(0, 1).map((item) => {
      return `
      
      <img src="${item.image.url || './image/slider2.png'}" alt="card" />
      <div class="world-news">
      <p>${item.title || "Untitled"}</p>
      <small>${formatDate(item.publish_on)}</small>
      <div class="author">By: ${escapeHtml(item.author || "Unknown")}</div>
      <a href="./metal.html"> <button class="more-btn">
        More
        <svg viewBox="0 0 24 24"><path d="M10 6l6 6-6 6"/></svg>
      </button></a>
    `;
    });

    worldNewsContainer.innerHTML = view.join("");
  } catch (err) {
    console.error(err);
    worldNewsContainer.innerHTML = `<p style="color:#b00">Failed to load news.</p>`;
  }
}
