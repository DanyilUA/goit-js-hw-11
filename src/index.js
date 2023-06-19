import Notiflix, { Notify } from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';


const formEl = document.querySelector('.search-form');
const inputEl = document.querySelector('input[name="searchQuery"]');
const galleryList = document.querySelector('.gallery');
const buttonLoadMore = document.querySelector('.load-more');

let currentPage = 13;
let totalPages = 1;

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '37452121-a108d404886ded7cf81df8024';
const IMAGE = 'image_type=photo';
const ORIENTATION = 'orientation=horizontal';
const SAFESEARCH = 'safesearch=true';

formEl.addEventListener('submit', handleSubmit);

function handleSubmit(e) {
    e.preventDefault();
    

    galleryList.innerHTML = '';
    const inputValue = inputEl.value;
    
    getImage(inputValue)
    .then(data => processData(data)) 
        .catch(error => {
      console.log(error);
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    });
}

async function getImage(inputValue, page) {
  try {
    const response = await axios.get(
      `${BASE_URL}?key=${API_KEY}&q=${inputValue}&${IMAGE}&${ORIENTATION}&${SAFESEARCH}&page=${page}&per_page=40`
    );
        console.log(response);
        const totalHits = response.data.totalHits;
        const hitsPerPage = response.data.hits.length;
        totalPages = Math.ceil(totalHits / hitsPerPage);
      
        return response.data;
        } catch (error) {
    console.log(error);
  }
}

function createMarkup(arr) {
  return arr.map(
      ({ webformatURL, tags, likes, views, comments, downloads }) => `
        <div class="photo-card">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" />
          <div class="info">
            <p class="info-item">
              <b>likes ${likes}</b>
            </p>
            <p class="info-item">
              <b>views ${views}</b>
            </p>
            <p class="info-item">
              <b>comments ${comments}</b>
            </p>
            <p class="info-item">
              <b>downloads ${downloads}</b>
            </p>
          </div>
        </div>
      `
    )
    .join('');
}


buttonLoadMore.addEventListener('click', onLoadMore)

function onLoadMore() {
    currentPage += 1;
    const inputValue = inputEl.value;

    getImage(inputValue, currentPage)
        .then(data => { 
            galleryList.insertAdjacentHTML('beforeend', createMarkup(data.hits));
        }
      )
      .catch(error => {
        console.log(error);
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      });
}

function processData(data) {

        galleryList.insertAdjacentHTML('beforeend', createMarkup(data.hits));
        if (currentPage !== totalPages) {
            buttonLoadMore.hidden = false;
    }   
            if (currentPage === totalPages) {
                Notiflix.Notify.info('We are sorry, but you have reached the end of search results.');
            } 
        if (data.hits.length <= 0) {
            Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
            buttonLoadMore.hidden = true;
        }
    if (data.hits.length > 0) {
        const totalImagesFound = data.totalHits;
            Notiflix.Notify.success(
              `Hooray! We found ${totalImagesFound} images.`
            );
        }
    }