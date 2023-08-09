import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import Notiflix from 'notiflix';
import 'simplelightbox/dist/simple-lightbox.min.css';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '38612538-8ea737d14f77121ff1f861688';
const elements = {
  input: document.querySelector('input'),
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMore: document.querySelector('.load-more'),
};
const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});
let currentPage = 1;
const imagesPerPage = 40;
let currentSearchQuery = '';
let isLoading = false;
let totalImages = 0;
elements.form.addEventListener('submit', givePhotos);

async function givePhotos(evt) {
  evt.preventDefault();

  if (!elements.input.value) {
    return Notiflix.Notify.failure('Your input is empty', {
      showOnlyTheLastOne: true,
    });
  }

  currentSearchQuery = elements.input.value;
  isLoading = true;
  Notiflix.Block.standard('.main-wrapper', {
    position: 'center',
  });

  currentPage = 1;
  elements.gallery.innerHTML = '';

  try {
    const imagesData = await servicePhoto(currentSearchQuery);
    elements.input.value = '';
    if (!imagesData.length) {
      Notiflix.Block.remove('.main-wrapper');
      return Notiflix.Notify.failure('Sorry, there are no such images...', {
        showOnlyTheLastOne: true,
      });
    }

    Notiflix.Notify.success(
      'We have found some images for you! Scroll down to see all of them',
      { showOnlyTheLastOne: true }
    );
    elements.input.value = '';
    renderGalleryMarkup(imagesData);
    Notiflix.Block.remove('.main-wrapper');
    lightbox.refresh();
    createIntersectionObserver();
  } catch (error) {
    console.warn(error.message);
  } finally {
    isLoading = false;
  }
}
async function servicePhoto(query) {
  try {
    const response = await axios.get(
      `${BASE_URL}?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${imagesPerPage}&page=${currentPage}`
    );

    totalImages = response.data.totalHits;
    currentPage += 1;

    return response.data.hits;
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
}
const renderGalleryMarkup = data => {
  const markup = data
    .map(img => {
      return `
        <div class="photo-card">
          <a href="${img.largeImageURL}">
            <img class="photo-image" src="${img.webformatURL}" alt="${img.tags}" loading="lazy" />
          </a>
          <div class="info">
            <p class="info-item"><span>Likes:</span> <b>${img.likes}</b></p>
            <p class="info-item"><span>Views:</span> <b>${img.views}</b></p>
            <p class="info-item"><span>Comments:</span> <b>${img.comments}</b></p>
            <p class="info-item"><span>Downloads:</span> <b>${img.downloads}</b></p>
          </div>
        </div>
      `;
    })
    .join('');
  elements.gallery.insertAdjacentHTML('beforeend', markup);
};

async function loadMoreImages() {
  try {
    const imagesData = await servicePhoto(currentSearchQuery);

    if (imagesData.length === 0) {
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results.",
        {
          showOnlyTheLastOne: true,
        }
      );
      return;
    }

    renderGalleryMarkup(imagesData);
    lightbox.refresh();

    const loadedImages = document.querySelectorAll('.photo-card').length;
    if (loadedImages >= totalImages) {
      Notiflix.Notify.info('You have reached the last page.', {
        showOnlyTheLastOne: true,
      });
      target.classList.remove('visible');
    }
  } catch (error) {
    console.warn(error.message);
  }
}
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1,
};

const target = document.querySelector('.load-more');

const createIntersectionObserver = () => {
  const observer = new IntersectionObserver(async entries => {
    if (isLoading) return;
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadMoreImages();
      }
    });
  }, observerOptions);

  observer.observe(target);
};
