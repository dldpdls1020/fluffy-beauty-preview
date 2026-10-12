const galleryItems = [...document.querySelectorAll('.gallery-item')];
const galleryDialog = document.querySelector('#gallery-dialog');
const galleryLarge = document.querySelector('#gallery-large');
const galleryCaption = document.querySelector('#gallery-caption');
const galleryCount = document.querySelector('#gallery-count');
let activeGalleryIndex = 0;
let activeGalleryOpener = null;

function showGalleryImage(index) {
  activeGalleryIndex = (index + galleryItems.length) % galleryItems.length;
  const item = galleryItems[activeGalleryIndex];
  const thumbnail = item.querySelector('img');
  galleryLarge.src = thumbnail.currentSrc || thumbnail.src;
  galleryLarge.alt = thumbnail.alt;
  galleryCaption.textContent = item.querySelector('strong').textContent;
  galleryCount.textContent = `${activeGalleryIndex + 1} / ${galleryItems.length}`;
}

function openGallery(index, opener) {
  activeGalleryOpener = opener;
  showGalleryImage(index);
  galleryDialog.showModal();
  document.body.classList.add('gallery-open');
  galleryDialog.querySelector('.gallery-close').focus();
}

galleryItems.forEach((item, index) => {
  item.addEventListener('click', () => openGallery(index, item));
});
document.querySelectorAll('.proof-shot').forEach(item => {
  item.addEventListener('click', () => openGallery(Number(item.dataset.galleryIndex), item));
});

galleryDialog.querySelector('.gallery-close').addEventListener('click', () => galleryDialog.close());
galleryDialog.querySelector('.gallery-prev').addEventListener('click', () => showGalleryImage(activeGalleryIndex - 1));
galleryDialog.querySelector('.gallery-next').addEventListener('click', () => showGalleryImage(activeGalleryIndex + 1));
galleryDialog.addEventListener('click', event => {
  if (event.target === galleryDialog) galleryDialog.close();
});
galleryDialog.addEventListener('close', () => {
  document.body.classList.remove('gallery-open');
  activeGalleryOpener?.focus();
});
document.addEventListener('keydown', event => {
  if (!galleryDialog.open) return;
  if (event.key === 'ArrowLeft') showGalleryImage(activeGalleryIndex - 1);
  if (event.key === 'ArrowRight') showGalleryImage(activeGalleryIndex + 1);
});

let touchStartX = null;
galleryLarge.addEventListener('touchstart', event => {
  touchStartX = event.changedTouches[0].screenX;
}, { passive: true });
galleryLarge.addEventListener('touchend', event => {
  if (touchStartX === null) return;
  const distance = event.changedTouches[0].screenX - touchStartX;
  touchStartX = null;
  if (Math.abs(distance) < 45) return;
  showGalleryImage(activeGalleryIndex + (distance < 0 ? 1 : -1));
}, { passive: true });

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const moodFilm = document.querySelector('.mood-film video');
const moodFilmToggle = document.querySelector('.mood-film-toggle');
let moodFilmManuallyPaused = false;
if (moodFilm && moodFilmToggle) {
  const updateMoodFilmToggle = () => {
    const label = moodFilm.paused ? '영상 재생' : '영상 일시정지';
    moodFilmToggle.textContent = label;
    moodFilmToggle.setAttribute('aria-label', label);
  };
  moodFilm.addEventListener('play', updateMoodFilmToggle);
  moodFilm.addEventListener('pause', updateMoodFilmToggle);
  moodFilmToggle.addEventListener('click', () => {
    if (moodFilm.paused) {
      moodFilmManuallyPaused = false;
      moodFilm.play().catch(() => {});
    } else {
      moodFilmManuallyPaused = true;
      moodFilm.pause();
    }
  });
}
if (moodFilm && 'IntersectionObserver' in window && !reducedMotion.matches) {
  const filmObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !moodFilmManuallyPaused) {
      moodFilm.play().catch(() => {});
    } else {
      moodFilm.pause();
    }
  }, { threshold: 0.25 });
  filmObserver.observe(moodFilm);
}
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const revealElements = [...document.querySelectorAll('[data-reveal]')];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -25px 0px' });
  const sectionOrder = new Map();
  revealElements.forEach(element => {
    const section = element.closest('section') || document.body;
    const order = sectionOrder.get(section) || 0;
    sectionOrder.set(section, order + 1);
    element.style.setProperty('--reveal-delay', `${Math.min(order % 4, 3) * 70}ms`);
    observer.observe(element);
  });
  document.documentElement.classList.add('motion-ready');
}
