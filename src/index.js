import Notiflix, { Notify } from 'notiflix';
// Notify.failure('Sorry, there are no images matching your search query. Please try again.');

async function getUser() {
  try {
    const response = await axios.get('/user?ID=12345');
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}
