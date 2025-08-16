// frontend/plugins/fontawesome.js
import { library, config } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBook, faStar, faSearch, faTrash, faEdit, faTimes, faChevronRight, faChevronLeft, faHome, faUser } from '@fortawesome/free-solid-svg-icons';

// No añadir el CSS automáticamente para poder importarlo en main.scss
config.autoAddCss = false;

// Añadir los iconos que vas a usar a la librería
library.add(faBook, faStar, faSearch, faTrash, faEdit, faTimes, faChevronRight, faChevronLeft, faHome, faUser);

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon);
});