async function loadCopperNews() {
  const url =
    "https://acceptable-desire-0cca5bb827.strapiapp.com/api/news-categories?filters[slug][$eq]=copper-news&populate[news_sections][fields][0]=title&populate[news_sections][fields][1]=author&populate[news_sections][fields][2]=publish_on&populate[news_sections][populate][image]=true";
  const copperNewsContainer = document.getElementById("copperNews");

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    console.log("firstcopper", payload.data[0].news_sections);

    let sections = payload?.data?.[0]?.news_sections;

     const sortedSections = sections.sort((a, b) => {
      const dateA = new Date(a.publish_on || 0).getTime();
      const dateB = new Date(b.publish_on || 0).getTime();
      return dateB - dateA; // descending order (newest first)
    });

    const view = sortedSections.slice(0, 5).map((item) => {
      return `<div class="right-box">
          <h4>${item.title || "Untitled"}</h4>
          <span>${formatDate(item.publish_on)}  |   ${escapeHtml(
        item.author || "Unknown"
      )}</span>
        </div>`;
    });

    copperNewsContainer.innerHTML += view.join("");
  } catch (err) {
    console.error(err);
    copperNewsContainer.innerHTML = `<p style="color:#b00">Failed to load news.</p>`;
  }
}
