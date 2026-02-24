import { fetchAllRecords } from './api.js';
import {
  initializeMap,
  drawMarkers,
  updateAllMarkerIcons,
  panToUserLocation,
  panAndOpenPopup,
  highlightMarker,
  clearAllHighlights
} from './map.js';
import {
  ui,
  createFilterControls,
  createMapControls,
  updateFilterIndicator,
  setFilterControlsFromState,
  createExtraControls,
  createAboutModal,
  createZoomControls
} from './ui.js';

// --- Global State ---
let allRecords = [];
let currentFilters = {
  arrondissement: 'all',
  type_evenement: 'all',
  emplacement: 'all',
  cout: 'all',
  date: 'all',
  search: '',
  event: null, // For permalinks
};

// --- Core Application Logic ---

function applyFiltersAndRedraw() {
  clearAllHighlights();
  const filteredRecords = filterRecords();
  
  drawMarkers(filteredRecords);

  // If a single result from search, highlight it
  if (filteredRecords.length === 1 && currentFilters.search) {
      highlightMarker(filteredRecords[0]._id);
  }

  ui.noResultsMessage.classList.toggle('hidden', filteredRecords.length > 0);
  updateURLWithFilters();
  updateFilterIndicator(currentFilters);
}

function resetAllFilters() {
  currentFilters = {
    arrondissement: 'all',
    type_evenement: 'all',
    emplacement: 'all',
    cout: 'all',
    date: 'all',
    search: '',
    event: null,
  };
  setFilterControlsFromState(currentFilters);
  applyFiltersAndRedraw();
}

/**
 * Filters the master list of records based on the current filter state.
 * @returns {Array} A new array containing only the records that match the filters.
 */
function filterRecords() {
  const searchTerm = currentFilters.search.toLowerCase();
  const now = new Date();
  // Set time to 00:00:00 to compare dates only, preventing timezone issues
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return allRecords.filter((record) => {
    // Only filter out past events if they have a valid end date.
    if (record.date_fin) {
        const recordEndDate = new Date(record.date_fin);
        if (!isNaN(recordEndDate.getTime()) && recordEndDate < today) {
            return false;
        }
    }

    // --- Filter Logic ---
    const boroughMatch =
      currentFilters.arrondissement === 'all' ||
      record.arrondissement === currentFilters.arrondissement;
    const typeMatch =
      currentFilters.type_evenement === 'all' ||
      record.type_evenement === currentFilters.type_evenement;
    const emplacementMatch =
      currentFilters.emplacement === 'all' ||
      record.emplacement === currentFilters.emplacement;
    const coutMatch =
      currentFilters.cout === 'all' || record.cout === currentFilters.cout;

    const searchMatch =
      !searchTerm ||
      (record.titre && record.titre.toLowerCase().includes(searchTerm)) ||
      (record.description &&
        record.description.toLowerCase().includes(searchTerm));

    const dateMatch = checkDateFilter(record);

    return (
      boroughMatch &&
      typeMatch &&
      emplacementMatch &&
      coutMatch &&
      searchMatch &&
      dateMatch
    );
  });
}

function checkDateFilter(record) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (!record.date_debut || !record.date_fin) return true;

  const recordStartDate = new Date(record.date_debut);
  const recordEndDate = new Date(record.date_fin);

  if (isNaN(recordStartDate.getTime()) || isNaN(recordEndDate.getTime())) return true;

  switch (currentFilters.date) {
    case 'today':
      return recordStartDate <= today && today <= recordEndDate;
    case 'thisWeek':
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + (6 - today.getDay()) + 1);
      return recordStartDate < endOfWeek && recordEndDate >= today;
    case 'thisMonth':
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return recordStartDate <= endOfMonth && recordEndDate >= today;
    default:
      return true;
  }
}

// --- URL Management ---

function updateURLWithFilters() {
  const params = new URLSearchParams();
  Object.entries(currentFilters).forEach(([key, value]) => {
    if (
      (key === 'search' && value) ||
      (key === 'event' && value) ||
      (key !== 'search' && key !== 'event' && value !== 'all' && value !== null)
    ) {
      params.set(key, value);
    }
  });

  const queryString = params.toString();
  const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
  
  history.replaceState({}, '', newUrl);
}

function readFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  params.forEach((value, key) => {
    if (currentFilters.hasOwnProperty(key)) {
        if (key === 'event') {
            currentFilters[key] = Number(value); 
        } else {
            currentFilters[key] = value;
        }
    }
  });
}

// --- Initialization ---

async function main() {
    const onPopupOpen = (eventId) => {
        currentFilters.event = eventId;
        updateURLWithFilters();
        updateFilterIndicator(currentFilters);
    };

    const map = initializeMap(onPopupOpen);
    map.on('zoomend', updateAllMarkerIcons);
    map.on('popupclose', () => {
        currentFilters.event = null;
        updateURLWithFilters();
        updateFilterIndicator(currentFilters);
        clearAllHighlights();
    });

    map.on('click', () => {
        if (ui.filterContainer && !ui.filterContainer.classList.contains('hidden')) {
            ui.filterContainer.classList.add('hidden');
        }
    });

  try {
    allRecords = await fetchAllRecords();

    readFiltersFromURL();
    createFilterControls(
      allRecords,
      currentFilters,
      applyFiltersAndRedraw,
      resetAllFilters
    );
    setFilterControlsFromState(currentFilters);
    
    createMapControls(resetAllFilters);
    createExtraControls(panToUserLocation);
    createZoomControls(map); 
    createAboutModal();
    
    applyFiltersAndRedraw();

    if (currentFilters.event) {
        panAndOpenPopup(currentFilters.event);
    }

  } catch (error) {
    console.error('Failed to initialize application:', error);
    ui.apiErrorMessage.classList.remove('hidden');
  }
}

main();