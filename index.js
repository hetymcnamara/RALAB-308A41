import * as Carousel from "./Carousel.js";
import axios from "axios";

const baseUrl = "https://api.thecatapi.com/v1";
const API_KEY = "live_9WXhUCOrvvQgMzbdWRC6k26iSjARQUQoVmAqN0VvENBXDZQqXBX108uwqZM3zUyb";
const subId = "user-123";

axios.defaults.baseURL = baseUrl;
axios.defaults.headers.common["x-api-key"] = API_KEY;

// Elements
const breedSelect = document.getElementById("breedSelect");
const infoDump = document.getElementById("infoDump");
const progressBar = document.getElementById("progressBar");
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// Events
breedSelect.addEventListener("change", handleBreedSelection);
getFavouritesBtn.addEventListener("click", getFavourites);

// Initial load
async function initialLoad() {
  try {
    const breeds = await fetchBreeds();
    populateBreeds(breeds);
  } catch (error) {
    console.error("Sorry, there was an error loading breeds", error);
  }
}

// Fetch breeds 
async function fetchBreeds() {
  const response = await axios.get("/breeds");
  return response.status === 200 ? response.data : [];
}

// Populate breeds 
function populateBreeds(breeds) {
  breedSelect.innerHTML = "";
  const defaultOption = createOption("Select a Breed", "");
  breedSelect.appendChild(defaultOption);

  breeds.forEach((breed) => {
    const option = createOption(breed.name, breed.id);
    breedSelect.appendChild(option);
  });
}

// Create option 
function createOption(text, value) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  return option;
}

// Handle breed selection and errors
async function handleBreedSelection() {
  const selectedBreedId = breedSelect.value;
  try {
    const breedInfo = await fetchBreedInfo(selectedBreedId);
    displayBreedInfo(breedInfo);
  } catch (error) {
    console.error("Sorry, there was an error loading breed information", error);
  }
}

// Fetch breed info function
async function fetchBreedInfo(selectedBreedId) {
  const response = await axios.get(`/images/search?breed_ids=${selectedBreedId}&limit=10`);
  return response.status === 200 ? response.data : [];
}

// Display breed info function
function displayBreedInfo(breedInfo) {
  Carousel.clear();
  infoDump.innerHTML = "";
  infoDump.style.border = "10px solid red;";

  breedInfo.forEach((info) => {
    const carouselItem = Carousel.createCarouselItem(info.url, info.breeds[0].name, info.id);
    Carousel.appendCarousel(carouselItem);

    const infoElement = createInfoElement(info.breeds[0]);
    infoDump.appendChild(infoElement);
  });

  Carousel.start();
}

// Create info element function
function createInfoElement(breedInfo) {
  const infoElement = document.createElement("div");
  infoElement.classList.add("info-border");
  infoElement.innerHTML = `
    <h2>${breedInfo.name}</h2>
    <p>Description: ${breedInfo.description}</p>
    <p>Origin: ${breedInfo.origin}</p>
  `;
  return infoElement;
}

// Get favorites function
async function getFavourites() {
  try {
    const favourites = await fetchFavorites();
    displayFavorites(favourites);
  } catch (error) {
    console.error("Sorry, there was an error getting favorites:", error);
  }
}

// Fetch favorites function
async function fetchFavorites() {
  const response = await axios.get("/favourites", { params: { sub_id: subId } });
  return response.status === 200 ? response.data : [];
}

// Display favorites function
function displayFavorites(favourites) {
  Carousel.clear();

  favourites.forEach((favourite) => {
    const carouselItem = Carousel.createCarouselItem(
      favourite.image.url,
      "Favorite",
      favourite.image_id
    );
    Carousel.appendCarousel(carouselItem);
  });

  Carousel.start();
}

// Axios interceptors
axios.interceptors.request.use(configInterceptor);
axios.defaults.onDownloadProgress = updateProgress;
axios.interceptors.response.use(responseInterceptor);

// Request interceptor function
function configInterceptor(config) {
  config.metadata = { startTime: new Date().getTime() };
  progressBar.style.width = "0%";
  document.body.style.cursor = "progress";
  console.log(`The request started ${new Date(config.metadata.startTime).toISOString()}`);
  return config;
}

// Update progress function
function updateProgress(event) {
  if (event.lengthComputable) {
    const percentComplete = (event.loaded / event.total) * 100;
    progressBar.style.width = percentComplete + "%";
    console.log("ProgressEvent object:", event);
  }
}

// Response interceptor function
function responseInterceptor(response) {
  const endTime = new Date().getTime();
  console.log(`Response received at ${new Date(endTime).toISOString()}`);
  console.log("Config data:", response);
  const timeDifference = endTime - response.config.metadata.startTime;
  console.log(`Time taken: ${timeDifference} ms`);
  progressBar.style.width = "100%";
  document.body.style.cursor = "default";
  return response;
}

// Call initialLoad to execute it immediately
initialLoad();