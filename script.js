 function toggleMenu() {
      const header = document.querySelector('.main-header');
      header.classList.toggle('mobile-active');
    }

      function toggleDropdown() {
      const dropdown = document.getElementById("dropdownMenu");
      const header = document.getElementById("newsToggle");
      dropdown.classList.toggle("show");
      header.classList.toggle("rotate");
    }


       const carousel = document.getElementById("carousel");
    const prev = document.getElementById("prev");
    const next = document.getElementById("next");

    prev.addEventListener("click", () => {
      carousel.scrollBy({ left: -260, behavior: 'smooth' });
    });

    next.addEventListener("click", () => {
      carousel.scrollBy({ left: 260, behavior: 'smooth' });
    });

    const slider = document.getElementById("videoSlider");
const leftBtn = document.querySelector(".arrow.left");
const rightBtn = document.querySelector(".arrow.right");

leftBtn.addEventListener("click", () => {
  slider.scrollBy({ left: -300, behavior: "smooth" });
});

rightBtn.addEventListener("click", () => {
  slider.scrollBy({ left: 300, behavior: "smooth" });
});

const messages = [
      "Search gold prices",
      "Search silver value",
      "Search copper rates",
      "Search platinum updates",
      "Search latest news"
    ];

    let index = 0;
    const animatedText = document.getElementById("animatedText");

    setInterval(() => {
      index = (index + 1) % messages.length;
      animatedText.innerText = messages[index];
      animatedText.style.animation = "none"; // reset animation
      void animatedText.offsetWidth;         // reflow to restart
      animatedText.style.animation = "slideText 5s ease-in-out infinite";
    }, 5000);





     function loadIframe(el) {
    el.outerHTML = `
      <iframe width="560" height="315"
        src="https://www.youtube.com/embed/pzxdSK6t2Eo?autoplay=1"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen>
      </iframe>`;
  }
  function loadIframe2(el){
    el.outerHTML = `<iframe width="560" height="315" src="https://www.youtube.com/embed/D2S9tbVMDRQ?si=oYaYU3_svLfnWTij" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
  }

  // youtube-popup
      window.addEventListener("load", () => {
  const popup = document.getElementById("popup");
  const closeBtn = document.getElementById("closeBtn");
  const youtubeIframe = document.getElementById("youtube-video");

  const youtubeLink = "https://www.youtube.com/embed/pzxdSK6t2Eo?autoplay=1";

  // Show popup after 4 seconds
  setTimeout(() => {
    youtubeIframe.src = youtubeLink;
    popup.style.display = "block";
  }, 4000);

  // Close popup
  closeBtn.addEventListener("click", () => {
    popup.style.display = "none";
    youtubeIframe.src = ""; // Stop video
  });
});


  const moreCards = [
    {
      image: "./image/pexels-castorlystock-5139206 1.png",
      title: "New Goldmine Discovery in Australia",
      description: "Exploration companies have uncovered new gold veins in the Kalgoorlie region, expected to boost local economies.",
      date: "July 25, 2025",
      author: "AURA MINES"
    },
    {
      image: "./image/pexels-castorlystock-5139206 1.png",
      title: "Silver Demand Soars",
      description: "Investors rush toward silver as green energy demand spikes globally. Analysts predict a 10% increase in demand.",
      date: "July 26, 2025",
      author: "SILVERSTREAM INC"
    }
  ];

  const showMoreBtn = document.querySelector(".btn-more");
  const container = document.getElementById("news-container");

  showMoreBtn.addEventListener("click", function () {
    moreCards.forEach(card => {
      const cardDiv = document.createElement("div");
      cardDiv.classList.add("news-card");
      cardDiv.innerHTML = `
        <img src="${card.image}" alt="">
        <div class="text-content">
          <h3>${card.title}</h3>
          <p>${card.description} <span>read more.....</span></p>
          <span>${card.date}</span>
          <p>By: ${card.author}</p>
        </div>
      `;
      container.appendChild(cardDiv);
    });

    showMoreBtn.style.display = "none"; // hide button after showing
  });


// show  extra news
 document.getElementById("showMoreBtn").addEventListener("click", function() {
    const extraNews = document.querySelectorAll(".extra-news");

    extraNews.forEach(section => {
        section.style.display = "block"; // Keep natural block layout
        section.style.opacity = "0"; // Start invisible
        section.style.transition = "opacity 0.4s ease"; // Smooth fade
        requestAnimationFrame(() => {
            section.style.opacity = "1"; // Fade in
        });
    });

    this.style.display = "none"; // Hide button after showing
});
// show extra news
