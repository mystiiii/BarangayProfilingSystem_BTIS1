let allResidents = [];
let filteredResidents = [];
let currentPage = 1;
const PAGE_SIZE = 10;
let pendingResidentData = null;
 
// ─── Init ─────────────────────────────────────────────────────────────────────
 
document.addEventListener('DOMContentLoaded', () => {
  loadResidents();
  document.getElementById('statusFilter').addEventListener('change', applyFilters);
  document.getElementById('sectorFilter').addEventListener('change', applyFilters);
});

// ─── Table Rendering ──────────────────────────────────────────────────────────
 
function renderTable() {
  const tbody   = document.getElementById('residentsTableBody');
  const empty   = document.getElementById('emptyState');
  const tableEl = document.getElementById('residentsTable');
 
  const total      = filteredResidents.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;
 
  const start    = (currentPage - 1) * PAGE_SIZE;
  const end      = Math.min(start + PAGE_SIZE, total);
  const pageData = filteredResidents.slice(start, end);
 
  tbody.innerHTML = '';
 
  if (pageData.length === 0) {
    tableEl.style.display = 'none';
    empty.style.display   = 'flex';
  } else {
    tableEl.style.display = 'table';
    empty.style.display   = 'none';
 
    pageData.forEach(r => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><span class="cell-id">${r.residentId}</span></td>
        <td>
          <div class="cell-name-primary">${getFullName(r)}</div>
          <div class="cell-name-secondary">DOB: ${r.dateOfBirth} &bull; ${r.civilStatus}</div>
        </td>
        <td>
          <div class="cell-age-primary">${r.age} yrs / ${r.sex}</div>
          <div class="cell-age-secondary">${r.occupation || '—'}</div>
        </td>
        <td>
          <div class="cell-address-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9.75L12 3l9 6.75V21a.75.75 0 0 1-.75.75H3.75A.75.75 0 0 1 3 21V9.75z"/>
            </svg>
            ${r.streetAddress}
          </div>
          <div class="cell-address-secondary">${r.barangaySector.toUpperCase()} &bull; ID: ${r.householdId}</div>
        </td>
        <td>
          <div class="cell-relations-primary"><span class="placeholder-tag">— Pending linkage</span></div>
          <div class="cell-relations-secondary"></div>
        </td>
        <td>${renderBadge(r.residencyStatus)}</td>
        <td>
          <button class="btn-verify" onclick="openVerifyResident('${r.residentId}')">Verify Profile</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }
 
  // Counts
  document.getElementById('recordsCount').textContent =
    total === 0 ? 'No records found' : `Showing ${total} of ${allResidents.length} total records`;
 
  const showing = total === 0
    ? 'No entries found'
    : `Showing ${start + 1}–${end} of ${total} residents`;
 
  document.getElementById('paginationInfo').textContent  = showing;
  document.getElementById('pageIndicator').textContent   = `Page ${currentPage} of ${totalPages}`;
  document.getElementById('prevBtn').disabled            = currentPage <= 1;
  document.getElementById('nextBtn').disabled            = currentPage >= totalPages;
}
 
function getFullName(r) {
  return [r.firstName, r.middleName, r.lastName].filter(Boolean).join(' ');
}
 
function renderBadge(status) {
  const map = {
    'Active':   'badge-active',
    'Pending':  'badge-pending',
    'Inactive': 'badge-inactive',
    'Deceased': 'badge-deceased',
    'Moved':    'badge-moved',
  };
  return `<span class="badge ${map[status] || 'badge-inactive'}">${status}</span>`;
}
 
// ─── Filters ──────────────────────────────────────────────────────────────────
 
function applyFilters() {
  const status = document.getElementById('statusFilter').value;
  const sector = document.getElementById('sectorFilter').value;
 
  filteredResidents = allResidents.filter(r => {
    const matchStatus = !status || r.residencyStatus === status;
    const matchSector = !sector || r.barangaySector === sector;
    return matchStatus && matchSector;
  });
 
  currentPage = 1;
  renderTable();
}
 
// ─── Pagination ───────────────────────────────────────────────────────────────
 
function changePage(direction) {
  const totalPages = Math.ceil(filteredResidents.length / PAGE_SIZE);
  currentPage = Math.max(1, Math.min(currentPage + direction, totalPages));
  renderTable();
}
 
// ─── Add Resident Modal ───────────────────────────────────────────────────────
 
function openAddResidentModal() {
  document.getElementById('addResidentForm').reset();
  document.getElementById('age').value = '';
  document.getElementById('addResidentOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
 
function closeAddResidentModal() {
  document.getElementById('addResidentOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
 
function handleOverlayClick(event) {
  if (event.target === document.getElementById('addResidentOverlay')) {
    closeAddResidentModal();
  }
}
 
function calculateAge() {
  const dob = document.getElementById('dateOfBirth').value;
  if (!dob) return;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  document.getElementById('age').value = age >= 0 ? age : '';
}
 
// ─── Form → Confirm Dialog ────────────────────────────────────────────────────
 
function handleAddResident(event) {
  event.preventDefault();
 
  pendingResidentData = {
    firstName:         document.getElementById('firstName').value.trim(),
    middleName:        document.getElementById('middleName').value.trim(),
    lastName:          document.getElementById('lastName').value.trim(),
    dateOfBirth:       document.getElementById('dateOfBirth').value,
    age:               parseInt(document.getElementById('age').value) || 0,
    sex:               document.getElementById('sex').value,
    civilStatus:       document.getElementById('civilStatus').value,
    citizenship:       document.getElementById('citizenship').value.trim(),
    occupation:        document.getElementById('occupation').value.trim(),
    contactNumber:     document.getElementById('contactNumber').value.trim(),
    streetAddress:     document.getElementById('streetAddress').value.trim(),
    barangaySector:    document.getElementById('barangaySector').value,
    householdId:       document.getElementById('householdId').value.trim(),
    lengthOfResidency: document.getElementById('lengthOfResidency').value.trim(),
    residencyStatus:   document.getElementById('residencyStatus').value,
  };
 
  document.getElementById('confirmOverlay').classList.add('open');
}
 
function closeConfirmDialog() {
  document.getElementById('confirmOverlay').classList.remove('open');
}
 
async function confirmSaveResident() {
  if (!pendingResidentData) return;
  closeConfirmDialog();
  closeAddResidentModal();
 
  try {
    const saved = await apiRequest('/residents', {
      method: 'POST',
      body: JSON.stringify(pendingResidentData),
    });
    allResidents.unshift(saved);
  } catch {
    const newId = `R-${String(allResidents.length + 1).padStart(4, '0')}`;
    allResidents.unshift({ residentId: newId, ...pendingResidentData });
  }
 
  pendingResidentData = null;
  applyFilters();
  showToast('Resident saved successfully.');
}
 
// ─── Verify Profile (stub) ────────────────────────────────────────────────────
 
function openVerifyResident(residentId) {
  const resident = allResidents.find(r => r.residentId === residentId);
  if (!resident) return;
  console.log('Verify profile:', resident);
  // TODO: open a verify/edit panel for this resident
}
 
// ─── Toast ────────────────────────────────────────────────────────────────────
 
function showToast(message) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMessage').textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}
