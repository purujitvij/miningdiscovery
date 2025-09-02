async function loadProjects() {
  const url =
    "https://acceptable-desire-0cca5bb827.strapiapp.com/api/projects?populate[project_image]=true";
  const projectsContainer = document.getElementById("projects");

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    console.log('payload', payload.data)

    let sections = payload.data;

    const view = sections.map((item) => {
      return `
       <div class="section-box">

      <img src="${item.project_image.url || ""}" alt="">
        <p>${item.project_title || ""}</p>
      </div>
    `;
    });

    projectsContainer.innerHTML = view.join("");
  } catch (err) {
    console.error(err);
    projectsContainer.innerHTML = `<p style="color:#b00">Failed to load news.</p>`;
  }
}
