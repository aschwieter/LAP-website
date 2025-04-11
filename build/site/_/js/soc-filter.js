/* my-custom-ui/src/js/soc-filter.js */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Filter Script: DOMContentLoaded fired.');

  // --- Persistence Configuration ---
  const storageKey = 'antoraActiveFilters'; // Key for session/local storage
  const storage = sessionStorage; // Use sessionStorage (or localStorage for longer persistence)
  // --- ---

  const filterControls = document.querySelector('.filter-controls');
  if (!filterControls) {
    console.error('Filter Script: Filter controls container (.filter-controls) NOT FOUND.');
    return;
  }
  console.log('Filter Script: Found filter controls:', filterControls);

  const filterButtons = filterControls.querySelectorAll('.filter-button');
  if (!filterButtons.length) {
      console.error('Filter Script: No filter buttons (.filter-button) found within controls.');
      return;
  }
  console.log(`Filter Script: Found ${filterButtons.length} filter buttons.`);

  const allPossibleFilters = Array.from(filterButtons).map(button => button.dataset.filter);
  console.log('Filter Script: All possible filters:', allPossibleFilters);

  const contentArea = document.querySelector('article.doc');
  if (!contentArea) {
    console.error('Filter script: Main content area "article.doc" NOT FOUND.');
    return;
  }
  console.log('Filter Script: Found content area:', contentArea);

  const allFilterableItems = contentArea.querySelectorAll(
      allPossibleFilters.map(f => `.${f}`).join(',')
  );
  if (allFilterableItems.length === 0) {
    console.warn('Filter Script: No elements with defined filter classes found within content area.');
  }
  console.log(`Filter Script: Found ${allFilterableItems.length} filterable items...`, allFilterableItems);

  const tocMenu = document.querySelector('aside.toc.sidebar .toc-menu');
  const tocLinks = tocMenu ? tocMenu.querySelectorAll('ul li a') : [];
  if (tocLinks.length > 0) {
      console.log(`Filter Script: Found ${tocLinks.length} TOC links.`);
  } else {
      console.log('Filter Script: No TOC links found on this page.');
  }


  // --- MODIFIED: Initialize activeFilters from storage or default ---
  let activeFilters;
  const storedFiltersJson = storage.getItem(storageKey);
  let loadedFromStorage = false;

  if (storedFiltersJson) {
      try {
          const storedFiltersArray = JSON.parse(storedFiltersJson);
          // Basic validation: check if it's an array
          if (Array.isArray(storedFiltersArray)) {
              // Further validation: ensure loaded filters are still valid options
              const validStoredFilters = storedFiltersArray.filter(f => allPossibleFilters.includes(f));
              activeFilters = new Set(validStoredFilters);
              loadedFromStorage = true;
              console.log('Filter Script: Loaded filters from storage:', activeFilters);
          } else {
              console.warn('Filter Script: Invalid data type found in storage. Resetting filters.');
              storage.removeItem(storageKey); // Clear invalid data
          }
      } catch (e) {
          console.error('Filter Script: Error parsing stored filters. Resetting filters.', e);
          storage.removeItem(storageKey); // Clear corrupted data
      }
  }

  // If not loaded from storage or loading failed, use the default (all ON)
  if (!loadedFromStorage) {
      activeFilters = new Set(allPossibleFilters);
      console.log('Filter Script: Initializing default filters (all ON):', activeFilters);
  }
  // --- End Initialization Modification ---


  // --- updateTocVisibility function (Keep as before) ---
  function updateTocVisibility() {
    if (!tocLinks.length) return;
    // console.log('Filter Script: Updating TOC visibility...');
    tocLinks.forEach(link => {
      const listItem = link.closest('li');
      if (!listItem) return;
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const targetId = href.substring(1);
      try {
        const headingElement = document.getElementById(targetId);
        if (headingElement) {
          const isHidden = headingElement.offsetParent === null;
          if (isHidden) {
            listItem.classList.add('content-hidden-by-filter');
          } else {
            listItem.classList.remove('content-hidden-by-filter');
          }
        } else {
          listItem.classList.remove('content-hidden-by-filter');
        }
      } catch (e) {
         console.error(`Filter Script: Error processing TOC link for ID #${targetId}:`, e);
         listItem.classList.remove('content-hidden-by-filter');
      }
    });
  }

  // --- applyFilters function (Keep as before) ---
  function applyFilters() {
    // console.log('Filter Script: applyFilters called. Active filters:', activeFilters);
    allFilterableItems.forEach(item => {
      const itemClasses = item.classList;
      let shouldShow = false;
      const itemRelevantFilters = allPossibleFilters.filter(filterName => itemClasses.contains(filterName));
      if (itemRelevantFilters.length === 0) {
          shouldShow = true;
      } else {
          for (const relevantFilter of itemRelevantFilters) {
              if (activeFilters.has(relevantFilter)) {
                  shouldShow = true;
                  break;
              }
          }
      }
      if (shouldShow) {
        item.classList.remove('content-hidden-by-filter');
      } else {
        item.classList.add('content-hidden-by-filter');
      }
    });
    updateTocVisibility();
  }

  // --- Setup Buttons: Initial state based on loaded/default activeFilters ---
  filterButtons.forEach(button => {
    const filter = button.dataset.filter;

    // Set initial visual state based on the now-initialized activeFilters
    if (activeFilters.has(filter)) {
        button.classList.add('is-active');
    } else {
         button.classList.remove('is-active');
    }

    // Add click listener
    button.addEventListener('click', () => {
      console.log(`Filter Script: Button clicked! Filter: ${filter}`);

      // Toggle the filter state
      if (activeFilters.has(filter)) {
        activeFilters.delete(filter);
        button.classList.remove('is-active');
      } else {
        activeFilters.add(filter);
        button.classList.add('is-active');
      }
      console.log('Filter Script: Button classList:', button.classList);
      console.log('Filter Script: Updated active filters:', activeFilters);

      // --- MODIFIED: Save the updated state to storage ---
      try {
          const filtersToSave = Array.from(activeFilters);
          storage.setItem(storageKey, JSON.stringify(filtersToSave));
          console.log('Filter Script: Saved filters to storage.');
      } catch (e) {
          console.error('Filter Script: Error saving filters to storage.', e);
          // Decide if you want to alert the user, e.g., if storage quota is exceeded
      }
      // --- End Save Modification ---

      // Re-apply filters to the content & TOC
      applyFilters();
    });
  }); // End forEach button

  // Initial filter application on page load using loaded/default state
  console.log('Filter Script: Initial applyFilters call.');
  applyFilters();

}); // End DOMContentLoaded