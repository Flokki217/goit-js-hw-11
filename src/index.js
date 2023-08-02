import { Notify } from 'notiflix/build/notiflix-notify-aio';
const galleryEl = document.querySelector('.gallery');
console.log(galleryEl);
const formEl = document.querySelector('.search-form');
const btnEl = formEl.lastElementChild;
const BASE_URL = 'https://pixabay.com/api/';

formEl.addEventListener('input', console.log);
