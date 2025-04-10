/* my-custom-ui/src/js/soc-filter.js */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Filter Script: DOMContentLoaded fired.');
  
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
  
    // --- NEW: Define all possible filter categories ---
    const allPossibleFilters = Array.from(filterButtons).map(button => button.dataset.filter);
    console.log('Filter Script: All possible filters:', allPossibleFilters);
  
    const contentArea = document.querySelector('article.doc');
    if (!contentArea) {
      console.error('Filter script: Main content area "article.doc" NOT FOUND.');
      return;
    }
    console.log('Filter Script: Found content area:', contentArea);
  
    // Select only elements that have at least one filter class.
    // Elements *without* any filter class will be ignored and always remain visible.
    const allFilterableItems = contentArea.querySelectorAll(
        allPossibleFilters.map(f => `.${f}`).join(',') // Builds a selector like ".filter-cat1,.filter-cat2,..."
    );
  
    if (allFilterableItems.length === 0) {
      console.warn('Filter Script: No elements with defined filter classes found within content area.');
      // Optionally hide controls if nothing is filterable
      // filterControls.style.display = 'none';
      // return; // Keep listeners active even if empty, maybe content loads dynamically?
    }
    console.log(`Filter Script: Found ${allFilterableItems.length} filterable items matching defined buttons:`, allFilterableItems);
  
    // --- MODIFIED: Initialize with all filters active ---
    let activeFilters = new Set(allPossibleFilters);
    console.log('Filter Script: Initial active filters:', activeFilters);
  
  
      // --- REVISED: Core filtering logic for "Show if ANY relevant filter is ON" ---
  function applyFilters() {
    console.log('Filter Script: applyFilters called. Active filters:', activeFilters);

    // Optional: Add/remove a class to the controls container if needed for styling
    // if (activeFilters.size < allPossibleFilters.length) { // Check if any filter is OFF
    //   filterControls.classList.add('has-inactive-filters');
    // } else {
    //   filterControls.classList.remove('has-inactive-filters');
    // }

    allFilterableItems.forEach(item => {
      const itemClasses = item.classList;
      let shouldShow = false; // Default: Assume we should hide unless proven otherwise

      // Find which of the defined filters this specific item actually has
      const itemRelevantFilters = allPossibleFilters.filter(filterName => itemClasses.contains(filterName));

      // If the item somehow doesn't have any known filter classes (shouldn't happen with current selector),
      // default to showing it to be safe, although it ideally wouldn't be in allFilterableItems.
      if (itemRelevantFilters.length === 0) {
          shouldShow = true;
      } else {
          // Check if *any* of this item's relevant filters are currently *active* (ON)
          for (const relevantFilter of itemRelevantFilters) {
              if (activeFilters.has(relevantFilter)) {
                  // Found at least one active filter that applies to this item
                  shouldShow = true;
                  break; // No need to check the rest for this item
              }
          }
          // If the loop finishes without finding any active relevant filters, shouldShow remains false.
      }


      // Apply or remove the hiding class based on the check
      if (shouldShow) {
        item.classList.remove('content-hidden-by-filter');
        // console.log(`Filter Script: Showing item because at least one relevant filter is ON:`, item);
      } else {
        // Hide only if ALL relevant filters are OFF
        item.classList.add('content-hidden-by-filter');
        // console.log(`Filter Script: Hiding item because ALL relevant filters are OFF:`, item);
      }
    });
  }

  
    // Add click listeners to buttons
    filterButtons.forEach(button => {
      const filter = button.dataset.filter;
  
      // --- MODIFIED: Set initial button state ---
      if (activeFilters.has(filter)) {
          button.classList.add('is-active');
      } else {
           button.classList.remove('is-active'); // Should not happen with current init, but safe
      }
  
      button.addEventListener('click', () => {
        console.log(`Filter Script: Button clicked! Filter: ${filter}`);
  
        // Toggle active state (the logic is the same, but the *meaning* changes)
        if (activeFilters.has(filter)) {
          activeFilters.delete(filter);       // Turn OFF
          button.classList.remove('is-active');
        } else {
          activeFilters.add(filter);         // Turn ON
          button.classList.add('is-active');
        }
        console.log('Filter Script: Button classList:', button.classList);
        console.log('Filter Script: Updated active filters:', activeFilters);
  
        // Re-apply filters to the content
        applyFilters();
      });
    });
  
    // Initial filter application on page load
    console.log('Filter Script: Initial applyFilters call.');
    applyFilters(); // Run once on load to ensure correct initial visibility
  });