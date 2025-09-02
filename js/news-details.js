// news-details.js
const API_ROOT = "https://acceptable-desire-0cca5bb827.strapiapp.com";

function getQueryId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function loadNewsDetails() {
  const id = getQueryId();
  if (!id) {
    document.getElementById("newsDetails").innerHTML = `<p>Invalid news item.</p>`;
    return;
  }

  try {
    // First, try to get the news section directly
    let res = await fetch(`${API_ROOT}/api/news-sections/${id}`);
    let data;
    
    if (!res.ok) {
      // If direct fetch fails, try getting from the news collection
      res = await fetch(`${API_ROOT}/api/news?populate=news_sections.image`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const newsData = await res.json();
      // Find the specific news section by ID
      const newsItem = newsData.data[0]; // Assuming first item for now
      const newsSection = newsItem.news_sections.find(section => section.id == id);
      
      if (!newsSection) {
        throw new Error('News section not found');
      }
      
      data = { data: newsSection };
    } else {
      data = await res.json();
    }

    const newsSection = data.data;
    console.log('News section data:', newsSection);

    // Format the publish date if available
    const publishDate = newsSection.publish_on ? 
      new Date(newsSection.publish_on).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : '';

    // Get image URL if available
    const imageUrl = newsSection.image?.url ? 
      `${API_ROOT}${newsSection.image.url}` : '';

    document.getElementById("newsDetails").innerHTML = `
      <div class="news-detail">
        ${imageUrl ? `<img src="${imageUrl}" alt="${newsSection.image.alternativeText || newsSection.title}" style="width: 100%; max-width: 600px; height: auto; margin-bottom: 20px;">` : ''}
        
        <h1>${newsSection.title || "Untitled"}</h1>
        
        ${newsSection.author ? `<p class="author"><strong>${newsSection.author}</strong></p>` : ''}
        
        ${publishDate ? `<p class="publish-date"><em>Published: ${publishDate}</em></p>` : ''}
        
        ${newsSection.short_description ? `
          <div class="content">
            <p>${newsSection.short_description.replace(/\n\n/g, '</p><p>')}</p>
          </div>
        ` : ''}
      </div>
      
      <style>
        .news-detail {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.6;
        }
        .news-detail h1 {
          color: #333;
          margin-bottom: 15px;
        }
        .author {
          color: #666;
          margin: 10px 0;
        }
        .publish-date {
          color: #888;
          font-size: 0.9em;
          margin-bottom: 20px;
        }
        .content p {
          margin-bottom: 15px;
          text-align: justify;
        }
        img {
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
      </style>
    `;
    
  } catch (err) {
    console.error('Error loading news details:', err);
    document.getElementById("newsDetails").innerHTML = `<p style="color:#b00">Failed to load news: ${err.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadNewsDetails);