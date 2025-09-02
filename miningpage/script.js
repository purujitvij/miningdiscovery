      function toggleMenu() {
      const nav = document.getElementById("navLinks");
      nav.classList.toggle("show");
    }



  const swiper = new Swiper(".mySwiper", {
  loop: true,
  slidesPerView: 1,
  spaceBetween: 10, // ↓ Reduce gap between slides
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  breakpoints: {
    768: {
      slidesPerView: 2,
      spaceBetween: 15,
    },
    1024: {
      slidesPerView: 3,
      spaceBetween: 20,
    }
  }
});

    const modal = document.getElementById("flipbookModal");
    const closeBtn = document.getElementById("closeModal");

    function openModal() {
      modal.style.display = "flex";
    }

    closeBtn.onclick = function () {
      modal.style.display = "none";
    }

    window.onclick = function (event) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    }