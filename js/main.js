 const slides = document.getElementById('carouselSlides');
    const slide = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    let index = 0;
    let interval;

    function showSlide(i) {
      slides.style.transform = `translateX(${-i * 100}%)`;
    }

    function nextSlide() {
      index = (index + 1) % slide.length;
      showSlide(index);
    }

    function prevSlide() {
      index = (index - 1 + slide.length) % slide.length;
      showSlide(index);
    }

    function startAutoSlide() {
      interval = setInterval(nextSlide, 3000); // 3 seconds
    }

    function stopAutoSlide() {
      clearInterval(interval);
    }

    nextBtn.addEventListener('click', () => {
      stopAutoSlide();
      nextSlide();
      startAutoSlide();
    });

    prevBtn.addEventListener('click', () => {
      stopAutoSlide();
      prevSlide();
      startAutoSlide();
    });

    document.querySelector('.carousel-container').addEventListener('mouseover', stopAutoSlide);
    document.querySelector('.carousel-container').addEventListener('mouseout', startAutoSlide);

    showSlide(index);
    startAutoSlide();