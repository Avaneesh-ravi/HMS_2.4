<?php
require_once __DIR__ . '/' . '../config/database.php';
require_once __DIR__ . '/' . '../includes/functions.php';
ensureSession();
requireAdminLogin();

$assets = getViteAssets(__DIR__ . '/../../../frontend/index.html');
$latestJs = $assets['js'];
$latestCss = $assets['css'];
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Apollo Healthcare Center — Admin Dashboard</title>
    <meta name="robots" content="noindex, nofollow" />
    <script>
      window.ADMIN_HOSPITAL_ID = <?= json_encode((int)($_SESSION['hospital_id'] ?? 0)) ?>;
    </script>
    <style>html, body { height: 100%; margin: 0; } #root { height: 100%; }
      #error-box { display: none; padding: 20px; background: #fff0f0; border: 1px solid red; color: red; position: fixed; z-index: 9999; top: 0; width: 100%; font-family: monospace; }
    </style>
    <script>
      window.addEventListener('error', function(e) {
        document.getElementById('error-box').style.display = 'block';
        document.getElementById('error-box').innerHTML += e.message + '<br>' + e.filename + ':' + e.lineno + '<br>';
      });
      window.addEventListener('unhandledrejection', function(e) {
        document.getElementById('error-box').style.display = 'block';
        document.getElementById('error-box').innerHTML += e.reason + '<br>';
      });

      // Helper to check if user is strictly on the Dashboard Overview page
      function isOverviewPage() {
          const href = window.location.href.toLowerCase();
          if (href.includes('/responses') || href.includes('/branding') || href.includes('/form-builder') || href.includes('/settings')) {
              return false;
          }
          const allText = document.body ? (document.body.innerText || '') : '';
          // Positive Overview signals: presence of Overview stat cards
          const hasTotal = allText.includes("Total Responses");
          const hasRate = allText.includes("Recommend Rate");
          const hasToday = allText.includes("Today's Responses") || allText.includes("Responses in Range");
          if (hasTotal && (hasRate || hasToday)) {
              return true;
          }
          // Heading check for exact "Dashboard Overview" or "Overview"
          const headings = Array.from(document.querySelectorAll('h1, h2, h3, header'));
          const isOverviewHeading = headings.some(el => {
              const txt = el.textContent.trim().toLowerCase();
              return txt === 'dashboard overview' || txt === 'overview';
          });
          if (isOverviewHeading && !allText.includes("Patient Name") && !allText.includes("Branding Settings")) {
              return true;
          }
          return false;
      }

      function isDepartmentsPage() {
          const href = window.location.href.toLowerCase();
          if (href.includes('/departments')) { return true; }
          const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
          return headings.some(el => {
              const txt = el.textContent.trim().toLowerCase();
              return txt === 'departments' || txt === 'departments management' || txt === 'manage departments';
          });
      }

      // Global Network Interceptor for Departments
      const originalFetch = window.fetch;
      window.fetch = async function() {
          let [resource, config] = arguments;
          let promise = originalFetch.apply(this, arguments);
          
          if (typeof resource === 'string' && resource.includes('get-departments.php')) {
              promise.then(r => r.clone().json()).then(data => {
                  window.__APP_DEPARTMENTS__ = data.departments || [];
              }).catch(e => console.error(e));
          }
          
          return promise;
      };
    </script>
    
    <script type="module" crossorigin src="../../../frontend/assets/<?= $latestJs ?>"></script>
    <link rel="stylesheet" crossorigin href="../../../frontend/assets/<?= $latestCss ?>">
  </head>
  <body>
    <div id="error-box"></div>
    <div id="root"></div>
    <script>
      // Dashboard UI overrides
      let isOverriding = false;
      function handleDashboardOverrides() {
        if (isOverriding) return;
        isOverriding = true;
        
        if (window.observer) {
            window.observer.disconnect();
        }

        try {
            // Clean up any residual inline filter elements
            const existingInlineFilter = document.getElementById('overview-inline-filter');
            if (existingInlineFilter) existingInlineFilter.remove();
            const existingLegacyFilter = document.getElementById('overview-filter-group');
            if (existingLegacyFilter) existingLegacyFilter.remove();


           

        
        // 2. Filter Button Functionality
        const buttons = Array.from(document.querySelectorAll('button'));
        const filterBtn = buttons.find(b => b.textContent.includes('Filter') || b.textContent.includes('Apply'));
        if (filterBtn && !filterBtn.dataset.listenerAttached) {
          filterBtn.dataset.listenerAttached = 'true';
          
          const dropdown = document.createElement('div');
          dropdown.className = 'custom-filter-dropdown';
          dropdown.style.cssText = 'display: none; position: absolute; background: white; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); width: 250px; z-index: 50; top: 100%; left: 0; margin-top: 0.5rem;';
          
          dropdown.innerHTML = `
            <div style="margin-bottom: 0.75rem;">
                <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem;">Filter / Sort Options</label>
                <select id="custom-filter-combo" style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem; outline: none;">
                    <option value="none">Default Order</option>
                    <optgroup label="Sort Data">
                        <option value="sort:name_asc">Sort: Patient Name (A-Z)</option>
                        <option value="sort:name_desc">Sort: Patient Name (Z-A)</option>
                        <option value="sort:uhid_asc">Sort: UHID (Ascending)</option>
                        <option value="sort:uhid_desc">Sort: UHID (Descending)</option>
                    </optgroup>
                    <optgroup label="Filter by Rating">
                        <option value="rating:5">5 Stars Only</option>
                        <option value="rating:4">4+ Stars</option>
                        <option value="rating:3">3+ Stars</option>
                        <option value="rating:2">2+ Stars</option>
                        <option value="rating:1">1+ Star</option>
                    </optgroup>
                </select>
            </div>
            <button id="custom-filter-apply" style="width: 100%; padding: 0.5rem; background: #047857; color: white; border: none; border-radius: 0.375rem; font-weight: 500; cursor: pointer; transition: 0.2s;">Apply Filter</button>
          `;
          
          if (filterBtn.parentElement) {
            filterBtn.parentElement.style.position = 'relative';
            filterBtn.parentElement.appendChild(dropdown);
          }

          filterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
          }, true);
          
          // Close when clicking outside
          document.addEventListener('click', (e) => {
            if (!filterBtn.contains(e.target) && !dropdown.contains(e.target)) {
              dropdown.style.display = 'none';
            }
          });

          dropdown.querySelector('#custom-filter-apply').addEventListener('click', () => {
            dropdown.style.display = 'none';
            const comboVal = dropdown.querySelector('#custom-filter-combo').value;
            
            const tbody = document.querySelector('tbody');
            if (tbody) {
               let rows = Array.from(tbody.querySelectorAll('tr'));
               
               if (comboVal.startsWith('sort:')) {
                  const sortVal = comboVal.split(':')[1];
                  rows.sort((a, b) => {
                     const cellsA = a.querySelectorAll('td');
                     const cellsB = b.querySelectorAll('td');
                     if (cellsA.length < 5 || cellsB.length < 5) return 0;
                     if (sortVal === 'name_asc') return cellsA[3].textContent.localeCompare(cellsB[3].textContent);
                     if (sortVal === 'name_desc') return cellsB[3].textContent.localeCompare(cellsA[3].textContent);
                     if (sortVal === 'uhid_asc') return cellsA[2].textContent.localeCompare(cellsB[2].textContent, undefined, {numeric: true});
                     if (sortVal === 'uhid_desc') return cellsB[2].textContent.localeCompare(cellsA[2].textContent, undefined, {numeric: true});
                     return 0;
                  });
               }
               
               let counter = 1;
               rows.forEach(row => {
                  let match = true;
                  const cells = Array.from(row.querySelectorAll('td'));
                  
                  if (comboVal.startsWith('rating:')) {
                     const ratingVal = parseFloat(comboVal.split(':')[1]);
                     if (cells.length >= 5 && ratingVal > 0) {
                         const ratingText = cells[4].textContent;
                         const ratingNum = parseFloat(ratingText.replace(/[^0-9.]/g, '')) || 0;
                         if (ratingNum < ratingVal) match = false;
                     }
                  }
                  
                  if (match) {
                     row.style.setProperty('display', '', 'important');
                     const sno = row.querySelector('.s-no-cell');
                     if (sno) {
                       sno.textContent = String(counter++);
                     }
                  } else {
                     row.style.setProperty('display', 'none', 'important');
                  }
                  tbody.appendChild(row); // Important step: re-appending updates the DOM sequence
               });
            }
          });
        }

        // 3. Print Button in Modal
        const modals = document.querySelectorAll('[role="dialog"], .modal');
        modals.forEach(modal => {
            // Find inner white container
            let modalContent = modal.querySelector('.bg-white, [class*="bg-white"]') || modal.lastElementChild;
            
            // CRITICAL FIX: Do NOT rely on JS dataset flags, because React re-renders the inner contents and wipes our button!
            // Instead, literally check if our button class exists inside the DOM right now.
            if (modalContent && !modalContent.querySelector('.custom-print-btn')) {
              const printBtn = document.createElement('button');
              printBtn.className = 'custom-print-btn'; // Give it a class for detection
              printBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" style="display:inline-block; margin-right:4px;" viewBox="0 0 16 16"><path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5h6V7H5v1zm0 2h6v3a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-3z"/></svg>Print`;
              
              // Use absolute positioning floating on top right, escaping layout constraint fights
              printBtn.style.cssText = 'position: absolute; top: 1.25rem; right: 4rem; padding: 0.375rem 0.75rem; background: #047857; color: white; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 500; display: inline-flex; align-items: center; border: none; cursor: pointer; transition: 0.2s opacity; z-index: 99999; box-shadow: 0 4px 6px -1px transparent;';
              printBtn.onmouseover = () => printBtn.style.opacity = '0.8';
              printBtn.onmouseout = () => printBtn.style.opacity = '1';
              printBtn.onclick = () => {
                const oldTitle = document.title;
                document.title = "Patient_Report";
                window.print();
                setTimeout(() => { document.title = oldTitle; }, 100);
              };
              
              if (getComputedStyle(modalContent).position === 'static') {
                  modalContent.style.position = 'relative';
              }
              
              modalContent.appendChild(printBtn);
              
              if (!document.getElementById('print-style')) {
                 const style = document.createElement('style');
                 style.id = 'print-style';
                 style.textContent = `@media print { 
                   body * { visibility: hidden !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; }
                   [role="dialog"], [role="dialog"] *, .modal, .modal * { visibility: visible !important; } 
                   [role="dialog"], .modal { position: absolute !important; left: 0 !important; top: 0 !important; background: white !important; width: 100% !important; border: none !important; box-shadow: none !important; transform: none !important; min-height: 100vh !important; }
                 }`;
                 document.head.appendChild(style);
              }
             }
        });

        // 4. Department Cards Override
        if (isDepartmentsPage()) {
           if (!window.__DEPT_MAP) {
               window.__DEPT_MAP = new Map();
               console.log("[DEBUG] Fetching departments from ../ajax/get-departments.php...");
               fetch('../ajax/get-departments.php')
                   .then(r => r.json())
                   .then(data => { 
                       console.log("[DEBUG] Fetched data:", data);
                       if(data.departments) {
                           data.departments.forEach(d => window.__DEPT_MAP.set(d.department_name.toLowerCase(), d));
                           console.log("[DEBUG] __DEPT_MAP populated. Contents:", Array.from(window.__DEPT_MAP.entries()));
                           setTimeout(handleDashboardOverrides, 100);
                       }
                   }).catch(e => console.error("[DEBUG] Fetch failed:", e));
           }
           
           const trashIcons = document.querySelectorAll('button.hover\\:text-red-600, button.hover\\:bg-red-50');
           console.log(`[DEBUG] Found ${trashIcons.length} trash icons using selector.`);
           
           if (trashIcons.length === 0) {
               // Try generic find
               const allBtns = document.querySelectorAll('button');
               console.log("[DEBUG] Check: Total buttons on page:", allBtns.length);
           }
           
           trashIcons.forEach((target, idx) => {
               const trashBtn = target.closest('button');
               if (!trashBtn) {
                   console.log(`[DEBUG] Trash icon ${idx} has no parent <button>. Target:`, target);
                   return;
               }
               if (trashBtn.dataset.mappedhook) return;
               
               let current = trashBtn.parentElement.closest('tr, li, .card, [class*="rounded"], [class*="border"], [class*="shadow"]') || trashBtn.parentElement.parentElement;
               
               let origName = '';
               const allText = current.textContent.trim().toLowerCase();
               
               for (const [lowerName, obj] of window.__DEPT_MAP.entries()) {
                   if (allText.includes(lowerName)) {
                       origName = obj.department_name;
                       break;
                   }
               }
               
               if (!origName) {
                   const possibleNameSpans = Array.from(current.querySelectorAll('span, h3, h4, p, div')).filter(el => {
                       const txt = el.textContent.trim();
                       return !el.contains(trashBtn) && 
                              !el.querySelector('button') && 
                              txt.length > 2 && 
                              txt.toLowerCase() !== 'active' && 
                              txt.toLowerCase() !== 'inactive' &&
                              txt !== "🗑" && txt !== "Delete" && txt !== "Edit" &&
                              el.children.length === 0; 
                   });
                   const nameEl = possibleNameSpans.find(s => s.className.includes('font-medium') || s.className.includes('bold') || s.className.includes('semibold')) || possibleNameSpans[0];
                   origName = nameEl ? nameEl.textContent.trim() : (current.textContent || '').replace('🗑', '').replace('Delete', '').replace('Edit', '').trim();
               }
               
               console.log(`[DEBUG] Card ${idx}: origName extracted = "${origName}"`);
               
               if (!origName) {
                    console.log(`[DEBUG] Card ${idx}: origName is empty! Card HTML:`, current.outerHTML.substring(0, 500));
                    return;
               }
               
               const deptObj = window.__DEPT_MAP?.get(origName.toLowerCase());
               if (!deptObj) {
                    console.log(`[DEBUG] Card ${idx}: origName "${origName.toLowerCase()}" not found in __DEPT_MAP!`);
                    return;
               }
               
               console.log(`[DEBUG] Card ${idx}: Successfully mapped to deptObj:`, deptObj);
               
               trashBtn.dataset.mappedhook = "true";
               current.setAttribute('data-dept-id', deptObj.department_id);
               
               // Expand physical clickable hitbox without inflating layout
               trashBtn.style.padding = '8px';
               trashBtn.style.cursor = 'pointer';
               trashBtn.style.position = 'relative';
               trashBtn.style.zIndex = '10';
               
               // Hitbox diagnostic
               const trashRect = trashBtn.getBoundingClientRect();
               const subIcon = trashBtn.querySelector('svg') || trashBtn.firstElementChild;
               const iconRect = subIcon ? subIcon.getBoundingClientRect() : trashRect;
               console.log(`[DEBUG] Card ${idx} hitbox - Listener (Button) Box: x=${trashRect.x}, y=${trashRect.y}, w=${trashRect.width}, h=${trashRect.height} vs Icon Box: x=${iconRect.x}, y=${iconRect.y}, w=${iconRect.width}, h=${iconRect.height}`);
               
               trashBtn.addEventListener('click', (e) => {
                   e.preventDefault();
                   e.stopPropagation();
                   e.stopImmediatePropagation();
                   
                   const cId = current.getAttribute('data-dept-id');
                   console.log(`[DEBUG] Target item clicked! Initiating delete for ID = ${cId}, name = ${origName}`);
                   
                   if (!confirm(`Are you sure you want to delete ${origName}?`)) return;
                   
                   const fd = new FormData();
                   // append safety parameters
                   fd.append('department_id', cId);
                   fd.append('department_name', origName); 
                   
                   console.log(`[DEBUG] Fetch POSTing to delete-department.php...`);
                   fetch('../ajax/delete-department.php', { method: 'POST', body: fd })
                       .then(r => r.json())
                       .then(res => {
                           console.log(`[DEBUG] delete-department.php response:`, res);
                           if (res.success) {
                               current.style.display = 'none';
                           } else {
                               alert('Deletion failed: ' + res.message);
                           }
                       })
                       .catch(err => {
                           console.log(`[DEBUG] Delete Network Error:`, err);
                           alert('Network error');
                       });
               });
               
               const actionsContainer = trashBtn.parentElement;
               if (actionsContainer && !actionsContainer.querySelector('.edit-dept-btn')) {
                   actionsContainer.style.display = 'flex';
                   actionsContainer.style.gap = '8px';
                   
                   const editBtn = document.createElement('button');
                   editBtn.className = 'edit-dept-btn inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-blue-100 h-9 w-9 text-blue-600 transition-colors bg-white border border-gray-200';
                   editBtn.title = 'Edit Department';
                   editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>`;
                   actionsContainer.insertBefore(editBtn, trashBtn);
                   
                   editBtn.addEventListener('click', (e) => {
                       e.preventDefault();
                       e.stopPropagation();
                       e.stopImmediatePropagation();
                       
                       const cId = current.getAttribute('data-dept-id');
                       const currentName = cardSpan ? cardSpan.textContent.trim() : origName;
                       const newName = prompt('Enter new department name:', currentName);
                       if (!newName || newName === currentName) return;
                       
                       const activeConfirm = confirm(`Is ${newName} active? (OK for Yes, Cancel for No)`);
                       const isAct = activeConfirm ? 1 : 0;
                       
                       const fd = new FormData();
                       fd.append('department_id', cId);
                       fd.append('department_name', newName);
                       fd.append('is_active', isAct);
                       
                       fetch('../ajax/save-department.php', { method: 'POST', body: fd })
                           .then(r => r.json())
                           .then(res => {
                               if (res.success) {
                                   if (cardSpan) cardSpan.textContent = newName;
                                   current.style.opacity = isAct ? '1' : '0.6';
                                   if (!isAct) current.style.borderLeft = '4px solid #9ca3af';
                                   else current.style.borderLeft = '';
                                   
                                   deptObj.department_name = newName;
                                   deptObj.is_active = isAct === 1;
                                   window.__DEPT_MAP.delete(currentName.toLowerCase());
                                   window.__DEPT_MAP.set(newName.toLowerCase(), deptObj);
                               } else {
                                   alert('Edit failed: ' + res.message);
                               }
                           })
                           .catch(() => alert('Network error'));
                   });
               }
           });
           
           // Fix "Add Department" full page unhandled reload and hook up functionality
           const allBtns = document.querySelectorAll('button');
           allBtns.forEach(btn => {
               const txt = btn.textContent.trim().toLowerCase();
               if (txt === 'add' || txt === 'add department' || txt === '+ add department') {
                   if (btn.type === 'submit') {
                       btn.type = 'button'; // Prevent browser defaulting to form sumbit hard-load if onClick is bound instead
                   }
                   
                   if (!btn.dataset.addhooked) {
                       btn.dataset.addhooked = 'true';
                       
                       const form = btn.closest('form');
                       if (form && !form.dataset.formoverridehooked) {
                           form.dataset.formoverridehooked = 'true';
                           form.addEventListener('submit', (evt) => {
                               evt.preventDefault(); // allow React to handle it without native browser navigation breaking flow
                           });
                       }
                       
                       // Also capture the manual click to silently save the custom submission in the background 
                       // so it registers in the DB immediately when React appends it to state
                       btn.addEventListener('click', () => {
                           const wrapperLayer = btn.closest('div.flex, div.grid, form');
                           const inputNode = wrapperLayer ? wrapperLayer.querySelector('input[type="text"]') : document.querySelector('input[placeholder*="Cardiology"], input[placeholder*="epartment"]');
                           if (inputNode && inputNode.value.trim().length > 0) {
                               const newlyAdded = inputNode.value.trim();
                               const fd = new FormData();
                               fd.append('department_name', newlyAdded);
                               fd.append('is_active', 1);
                               
                               // Background silent persistence hook
                               fetch('../ajax/save-department.php', { method: 'POST', body: fd })
                                   .then(r => r.json())
                                   .then(res => {
                                       if(res.success && res.department) {
                                           window.__DEPT_MAP.set(newlyAdded.toLowerCase(), res.department);
                                       }
                                   }).catch(err => console.log('Silent Add Hook fail:', err));
                           }
                       });
                   }
               }
           });
        }
        } finally {
            isOverriding = false;
            if (window.observer) {
                window.observer.observe(document.body, { childList: true, subtree: true });
            }
        }
      }

      window.observer = new MutationObserver(() => {
        handleDashboardOverrides();
      });
      window.observer.observe(document.body, { childList: true, subtree: true });
    </script>
  </body>
</html>
