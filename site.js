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

galleryItems.forEach((item, index) => {
  item.addEventListener('click', () => {
    activeGalleryOpener = item;
    showGalleryImage(index);
    galleryDialog.showModal();
    document.body.classList.add('gallery-open');
    galleryDialog.querySelector('.gallery-close').focus();
  });
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
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const animatedSelectors = [
    '.hero-copy > *', '.hero-art', '.hero-bottom',
    '.section-kicker', '.intro-grid > div', '.signature-card',
    '.worries-grid > div:first-child', '.worries-end', '.worry-list p',
    '.approach-head > *', '.steps > div', '.process-feature',
    '.portfolio-intro > *', '.gallery-item', '.gallery-hint', '.gallery-invite > *',
    '.director-visual', '.director-copy > *',
    '.space-head > *', '.space-card',
    '.price-grid > div', '.faq-grid > div:first-child', '.faq-list details',
    '.contact-inner > *'
  ];
  document.querySelectorAll(animatedSelectors.join(',')).forEach(element => {
    element.classList.add('reveal');
  });
  document.querySelectorAll('.hero-art, .process-feature, .director-visual, .space-card').forEach(element => {
    element.classList.add('reveal-photo');
  });
  const revealElements = [...document.querySelectorAll('.reveal')];
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
