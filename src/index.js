import Notiflix, { Notify } from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import './style.css';


const formEl = document.querySelector('.search-form');
const inputEl = document.querySelector('input[name="searchQuery"]');
const galleryList = document.querySelector('.gallery');
const buttonLoadMore = document.querySelector('.load-more');
const target = document.querySelector('.js-sentry');

let currentPage = 1;
let totalPages = null;

let options = {
  root: null, 
  rootMargin: '300px',
  threshold: 1.0,
};


let observer = new IntersectionObserver(onScrollLoad, options);


let lightbox = new SimpleLightbox('.gallery a', {
    captionDelay: 250,
});

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '37452121-a108d404886ded7cf81df8024';
const IMAGE = 'image_type=photo';
const ORIENTATION = 'orientation=horizontal';
const SAFESEARCH = 'safesearch=true';

formEl.addEventListener('submit', handleSubmit);


function handleSubmit(e) {
    e.preventDefault();
    
    galleryList.innerHTML = '';
    const inputValue = inputEl.value.trim();
    currentPage = 1;

        if (!inputValue) {
            Notiflix.Notify.error('Please enter a search query.');
            buttonLoadMore.hidden = true;
          return;
        }
 
    getImage(inputValue, currentPage)
        .then(data => {
            processData(data);
         })
    .catch(error => {
        console.log(error);
        Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    });
}

async function getImage(inputValue, page) {
    try {
     const response = await axios.get(`${BASE_URL}?key=${API_KEY}&q=${inputValue}&${IMAGE}&${ORIENTATION}&${SAFESEARCH}&page=${page}&per_page=40`);
    console.log(response);

        const totalHits = response.data.totalHits;
        const hitsPerPage = response.data.hits.length;
        totalPages = Math.ceil(totalHits / hitsPerPage);

        return response.data;
        } catch (error) {
        Notiflix.Notify.failure('Sorry, an error occurred while fetching images. Please try again.');
        throw error;
    }
}

function createMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
    `<div class="card-container">

        <div class="photo-card">
          <a href="${largeImageURL}">
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
          </a>
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
          lightbox.refresh();
           if (currentPage === totalPages) {
            
            buttonLoadMore.hidden = true;
            Notiflix.Notify.info(
              'We are sorry, but you have reached the end of search results.'
            )
              }
           else {
            buttonLoadMore.hidden = false;
          }
      })
      .catch(error => {
        console.log(error);
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      });
}

function processData(data) {
    console.log(inputEl);
  // функція працює коректно, але не виврдить те що написав про запит, а показує помилку.

  galleryList.insertAdjacentHTML('beforeend', createMarkup(data.hits));
    lightbox.refresh();
    
              if (currentPage === totalPages) {
                buttonLoadMore.hidden = true;
                Notiflix.Notify.info(
                  'We are sorry, but you have reached the end of search results.'
                );
              } else {
                buttonLoadMore.hidden = false;
              }


  if (data.hits.length > 0) {
    const totalImagesFound = data.totalHits;
    Notiflix.Notify.success(`Hooray! We found ${totalImagesFound} images.`);
  }
}

    document.addEventListener('scroll', onscroll);


function onScrollLoad(entries, observer) {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            currentPage += 1;
            getImage(currentPage)
                .then((data) => {
                  galleryList.insertAdjacentHTML('beforeend', createMarkup(data.hits)
                  );
                    if (currentPage === totalPages) {
                        observer.unobserve(target);
                    }

                })
            .catch((error) => console.log(error))
        }
    })
}
observer.observe(target);

