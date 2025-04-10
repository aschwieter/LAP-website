/* my-custom-ui/src/js/soc-filter.js */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Filter Script: DOMContentLoaded fired.');
  
    const filterControls = document.querySelector('.filter-controls');
    // ... (keep existing checks for filterControls) ...
    console.log('Filter Script: Found filter controls:', filterControls);
  
    const filterButtons = filterControls.querySelectorAll('.filter-button');
    // ... (keep existing checks for filterButtons) ...
    console.log(`Filter Script: Found ${filterButtons.length} filter buttons.`);
  
    const allPossibleFilters = Array.from(filterButtons).map(button => button.dataset.filter);
    console.log('Filter Script: All possible filters:', allPossibleFilters);
  
    const contentArea = document.querySelector('article.doc');
    // ... (keep existing checks for contentArea) ...
    console.log('Filter Script: Found content area:', contentArea);
  
    const allFilterableItems = contentArea.querySelectorAll(
        allPossibleFilters.map(f => `.${f}`).join(',')
    );
    // ... (keep existing checks for allFilterableItems) ...
    console.log(`Filter Script: Found ${allFilterableItems.length} filterable items...`, allFilterableItems);
  
    // --- NEW: Select TOC links ---
    // Adjust selector if your TOC structure is different
    const tocMenu = document.querySelector('aside.toc.sidebar .toc-menu');
    const tocLinks = tocMenu ? tocMenu.querySelectorAll('ul li a') : []; // Get all links within the TOC list
    if (tocLinks.length > 0) {
        console.log(`Filter Script: Found ${tocLinks.length} TOC links.`);
    } else {
        console.log('Filter Script: No TOC links found on this page.');
    }
  
    let activeFilters = new Set(allPossibleFilters);
    console.log('Filter Script: Initial active filters:', activeFilters);
  
    // --- NEW: Function to update TOC visibility ---
    function updateTocVisibility() {
      if (!tocLinks.length) return; // Do nothing if no TOC
  
      console.log('Filter Script: Updating TOC visibility...');
      tocLinks.forEach(link => {
        const listItem = link.closest('li'); // Get the parent <li> element
        if (!listItem) return; // Skip if structure is unexpected
  
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return; // Skip if not an internal anchor
  
        const targetId = href.substring(1); // Remove the '#'
        try {
          // Find the heading element in the main document
          const headingElement = document.getElementById(targetId);
  
          if (headingElement) {
            // Check if the heading element is effectively hidden
            // Using offsetParent is a reliable way to check if display is 'none' or element is detached
            const isHidden = headingElement.offsetParent === null;
  
            if (isHidden) {
              listItem.classList.add('content-hidden-by-filter');
              // console.log(`Filter Script: Hiding TOC item for #${targetId}`);
            } else {
              listItem.classList.remove('content-hidden-by-filter');
              // console.log(`Filter Script: Showing TOC item for #${targetId}`);
            }
          } else {
            // Heading not found, maybe show the TOC item? Or hide? Decided to show for robustness.
            listItem.classList.remove('content-hidden-by-filter');
             // console.warn(`Filter Script: Heading element with ID #${targetId} not found for TOC link.`);
          }
        } catch (e) {
           // Handle potential errors with invalid IDs (though unlikely for valid HTML)
           console.error(`Filter Script: Error processing TOC link for ID #${targetId}:`, e);
           listItem.classList.remove('content-hidden-by-filter'); // Default to showing on error
        }
      });
    }
  
  
    // --- REVISED: applyFilters now calls updateTocVisibility at the end ---
    function applyFilters() {
      console.log('Filter Script: applyFilters called. Active filters:', activeFilters);
  
      // ... (keep the existing logic for hiding/showing main content items) ...
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
      // --- ---
  
      // --- Call TOC update *after* main content is processed ---
      updateTocVisibility();
    }
  
  
    // --- Initialize buttons and add listeners (Keep this part as it was) ---
    filterButtons.forEach(button => {
      const filter = button.dataset.filter;
      if (activeFilters.has(filter)) {
          button.classList.add('is-active');
      } else {
           button.classList.remove('is-active');
      }
  
      button.addEventListener('click', () => {
        console.log(`Filter Script: Button clicked! Filter: ${filter}`);
        if (activeFilters.has(filter)) {
          activeFilters.delete(filter);
          button.classList.remove('is-active');
        } else {
          activeFilters.add(filter);
          button.classList.add('is-active');
        }
        console.log('Filter Script: Button classList:', button.classList);
        console.log('Filter Script: Updated active filters:', activeFilters);
        applyFilters(); // This will now also trigger updateTocVisibility
      });
    });
  
    // Initial filter application on page load
    console.log('Filter Script: Initial applyFilters call.');
    applyFilters(); // Run once on load
  
  }); // End DOMContentLoaded