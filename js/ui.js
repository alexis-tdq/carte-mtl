import { debounce } from './utils.js';

export const ui = {
  noResultsMessage: document.getElementById('no-results-message'),
  apiErrorMessage: document.getElementById('api-error-message'),
  filterContainer: document.getElementById('filter-container'),
  toggleButton: null,
  resetButton: null,
  aboutModal: null, 
};

/**
 * Creates and populates the filter controls in the UI.
 */
export function createFilterControls(
  allRecords,
  currentFilters,
  onFilterChange,
  onReset
) {
  const boroughsSet = new Set();
  const eventTypesSet = new Set();
  const emplacementsSet = new Set();
  const costsSet = new Set();

  allRecords.forEach(r => {
      if (r.arrondissement && r.arrondissement !== 'nan') boroughsSet.add(r.arrondissement);
      if (r.type_evenement && r.type_evenement !== 'nan') eventTypesSet.add(r.type_evenement);
      if (r.emplacement && r.emplacement !== 'nan') emplacementsSet.add(r.emplacement);
      if (r.cout && r.cout !== 'nan') costsSet.add(r.cout);
  });

  const boroughs = [...boroughsSet].sort();
  const eventTypes = [...eventTypesSet].sort();
  const emplacements = [...emplacementsSet].sort();
  const costs = [...costsSet].sort();

  ui.filterContainer.innerHTML = `
        <div class="filter-control">
            <label for="search-filter">Rechercher</label>
            <input type="text" id="search-filter" placeholder="Par titre ou description...">
        </div>
        <div class="filter-control">
            <label for="date-filter">Date</label>
            <select id="date-filter">
                <option value="all">Toutes les dates</option>
                <option value="today">Aujourd'hui</option>
                <option value="thisWeek">Cette semaine</option>
                <option value="thisMonth">Ce mois-ci</option>
            </select>
        </div>
        <div class="filter-control">
            <label for="borough-filter">Arrondissement</label>
            <select id="borough-filter">
                <option value="all">Tous les arrondissements</option>
            </select>
        </div>
        <div class="filter-control">
            <label for="type-filter">Type d'événement</label>
            <select id="type-filter">
                <option value="all">Tous les types</option>
            </select>
        </div>
        <div class="filter-control">
            <label for="emplacement-filter">Lieu</label>
            <select id="emplacement-filter">
                <option value="all">Tous les lieux</option>
            </select>
        </div>
        <div class="filter-control">
            <label for="cost-filter">Coût</label>
            <select id="cost-filter">
                <option value="all">Tous les coûts</option>
            </select>
        </div>
        <button id="reset-filters">Réinitialiser les filtres</button>
    `;

  // Helper to safely append options
  const populateSelect = (selectId, dataArray) => {
    const select = document.getElementById(selectId);
    dataArray.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });
  };

  populateSelect('borough-filter', boroughs);
  populateSelect('type-filter', eventTypes);
  populateSelect('emplacement-filter', emplacements);
  populateSelect('cost-filter', costs);

  const debouncedOnFilterChange = debounce(onFilterChange, 300);

  document.getElementById('search-filter').addEventListener('input', (e) => {
      currentFilters.search = e.target.value;
      debouncedOnFilterChange();
  });

  const selects = ui.filterContainer.querySelectorAll('select');
  selects.forEach((select) => {
    select.addEventListener('change', (e) => {
      const filterKey = e.target.id.replace('-filter', '');
      if (filterKey === 'borough') {
        currentFilters.arrondissement = e.target.value;
      } else if (filterKey === 'type') {
        currentFilters.type_evenement = e.target.value;
      } else if (filterKey === 'cost') {
        currentFilters.cout = e.target.value;
      } else {
        currentFilters[filterKey] = e.target.value;
      }
      onFilterChange();
    });
  });

  document.getElementById('reset-filters').addEventListener('click', onReset);
}

export function setFilterControlsFromState(currentFilters) {
  document.getElementById('search-filter').value = currentFilters.search || '';
  document.getElementById('date-filter').value = currentFilters.date || 'all';
  document.getElementById('borough-filter').value = currentFilters.arrondissement || 'all';
  document.getElementById('type-filter').value = currentFilters.type_evenement || 'all';
  document.getElementById('emplacement-filter').value = currentFilters.emplacement || 'all';
  document.getElementById('cost-filter').value = currentFilters.cout || 'all';
}

export function createMapControls(onReset) {
  const controlsContainer = document.getElementById('map-controls-container');
  
  ui.toggleButton = document.createElement('button');
  ui.toggleButton.id = 'filter-toggle';
  ui.toggleButton.className = 'map-control-button';
  ui.toggleButton.title = 'Afficher/masquer les filtres';
  ui.toggleButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M3.9 54.9C10.5 40.9 24.5 32 40 32H472c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L320 320.9V448c0 12.1-6.8 23.2-17.7 28.6s-23.8 4.3-33.5-3l-64-48c-8.1-6-12.8-15.5-12.8-25.6V320.9L9 97.3C-.7 85.4-2.8 68.8 3.9 54.9z"/></svg>`;
  controlsContainer.appendChild(ui.toggleButton);

  ui.toggleButton.addEventListener('click', () => {
    ui.filterContainer.classList.toggle('hidden');
  });

  ui.resetButton = document.createElement('button');
  ui.resetButton.id = 'reset-button-map';
  ui.resetButton.className = 'map-control-button';
  ui.resetButton.title = 'Réinitialiser les filtres';
  ui.resetButton.classList.add('hidden');
  ui.resetButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>`;
  controlsContainer.appendChild(ui.resetButton);

  ui.resetButton.addEventListener('click', onReset);
}

export function updateFilterIndicator(currentFilters) {
  const isAnyFilterActive = Object.keys(currentFilters).some(
    (key) => {
        if (key === 'event') return currentFilters[key] !== null;
        if (key === 'search') return currentFilters[key] !== '';
        return currentFilters[key] !== 'all';
    }
  );
  if (ui.toggleButton) {
    ui.toggleButton.classList.toggle('active', isAnyFilterActive);
  }
  if (ui.resetButton) {
    ui.resetButton.classList.toggle('hidden', !isAnyFilterActive);
  }
}

export function createExtraControls(onGeoLocate) {
  const controlsContainer = document.getElementById('map-controls-container');
  const geoButton = document.createElement('button');
  geoButton.id = 'geolocation-button';
  geoButton.className = 'map-control-button';
  geoButton.title = 'Trouver ma position';
  geoButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 0c17.7 0 32 14.3 32 32V66.7C368.4 80.1 431.9 143.6 445.3 224H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H445.3C431.9 368.4 368.4 431.9 288 445.3V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V445.3C143.6 431.9 80.1 368.4 66.7 288H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H66.7C80.1 143.6 143.6 80.1 224 66.7V32c0-17.7 14.3-32 32-32zM128 256a128 128 0 1 0 256 0 128 128 0 1 0 -256 0zm128-80a80 80 0 1 1 0 160 80 80 0 1 1 0-160z"/></svg>`;
  controlsContainer.appendChild(geoButton);
  geoButton.addEventListener('click', onGeoLocate);
}

export function createAboutModal() {
  ui.aboutModal = document.getElementById('about-modal');
  const aboutButton = document.getElementById('about-button');
  const closeModalButton = document.getElementById('close-modal-button');
  const controlsContainer = document.getElementById('map-controls-container');

  if (aboutButton && controlsContainer) {
    controlsContainer.appendChild(aboutButton);
  }

  if (aboutButton && ui.aboutModal && closeModalButton) {
    aboutButton.addEventListener('click', () => {
      ui.aboutModal.classList.remove('hidden');
    });
  
    closeModalButton.addEventListener('click', () => {
      ui.aboutModal.classList.add('hidden');
    });
  
    ui.aboutModal.addEventListener('click', (e) => {
        if (e.target === ui.aboutModal) {
            ui.aboutModal.classList.add('hidden');
        }
    });
  }
}

export function createZoomControls(map) {
  const zoomContainer = document.createElement('div');
  zoomContainer.id = 'zoom-controls-container';
  
  document.getElementById('map').appendChild(zoomContainer);

  const zoomInBtn = document.createElement('button');
  zoomInBtn.className = 'map-control-button';
  zoomInBtn.title = 'Zoom avant';
  zoomInBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>`;
  zoomInBtn.addEventListener('click', () => map.zoomIn());

  const zoomOutBtn = document.createElement('button');
  zoomOutBtn.className = 'map-control-button';
  zoomOutBtn.title = 'Zoom arrière';
  zoomOutBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"/></svg>`;
  zoomOutBtn.addEventListener('click', () => map.zoomOut());

  zoomContainer.appendChild(zoomInBtn);
  zoomContainer.appendChild(zoomOutBtn);
}