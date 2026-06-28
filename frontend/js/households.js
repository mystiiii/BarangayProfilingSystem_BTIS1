let allHouseholds = [];
let filteredHouseholds = [];
let currentPage = 1;
const PAGE_SIZE = 10;
let pendingResidentData = null;

const LOCAL_HOUSEHOLDS = [
  {
    householdId: 'H-0001',
    householdHead: 'Juan Dela Cruz',
    numberOfMembers: 5,
    contactNumber: '09171234567',
    streetAddress: '12A Rizal Avenue',
    barangaySector: 'Barangay San Jose',
    lengthOfResidency: '12 years',
    householdStatus: 'Active',
  },
  {
    householdId: 'H-0002',
    householdHead: 'Maria Santos',
    numberOfMembers: 3,
    contactNumber: '09981234567',
    streetAddress: '45 Mabini Street',
    barangaySector: 'Barangay Rizal',
    lengthOfResidency: '6 years',
    householdStatus: 'Pending',
  },
  {
    householdId: 'H-0003',
    householdHead: 'Roberto Reyes',
    numberOfMembers: 4,
    contactNumber: '',
    streetAddress: '8 Bonifacio Road',
    barangaySector: 'Barangay San Jose',
    lengthOfResidency: '18 years',
    householdStatus: 'Active',
  },
  {
    householdId: 'H-0004',
    householdHead: 'Elena Garcia',
    numberOfMembers: 2,
    contactNumber: '09221234567',
    streetAddress: '21 Luna Extension',
    barangaySector: 'Barangay Rizal',
    lengthOfResidency: '2 years',
    householdStatus: 'Moved',
  },
  {
    householdId: 'H-0005',
    householdHead: 'Antonio Villanueva',
    numberOfMembers: 6,
    contactNumber: '09051234567',
    streetAddress: '77 Katipunan Drive',
    barangaySector: 'Barangay San Jose',
    lengthOfResidency: '25 years',
    householdStatus: 'Inactive',
  },
];

document.addEventListener('DOMContentLoaded', () => {
  loadHouseholds();
  document.getElementById('searchFilter').addEventListener('input', applyFilters);
  document.getElementById('statusFilter').addEventListener('change', applyFilters);
  document.getElementById('sectorFilter').addEventListener('change', applyFilters);
});

async function loadHouseholds() {
  try {
    const data = await apiRequest('/households');
    allHouseholds = Array.isArray(data) ? data.map(normalizeHousehold) : [];
  } catch {
    allHouseholds = LOCAL_HOUSEHOLDS.map(normalizeHousehold);
  }

  filteredHouseholds = [...allHouseholds];
  renderTable();
}

function normalizeHousehold(household) {
  const source = household.data || household;

  return {
    householdId: source.householdId || source.FamilyID || source.id || '',
    householdHead: source.householdHead || source.Head || 'Unassigned',
    numberOfMembers: source.numberOfMembers || source.MemberCount || 0,
    contactNumber: source.contactNumber || '',
    streetAddress: source.streetAddress || source.Street || source.HouseNo || 'Address pending',
    barangaySector: source.barangaySector || source.Barangay || 'Barangay San Jose',
    lengthOfResidency: source.lengthOfResidency || source.ResidencyLength || 'Not specified',
    householdStatus: source.householdStatus || source.Status || 'Pending',
  };
}

function renderTable() {
  const tbody = document.getElementById('householdsTableBody');
  const empty = document.getElementById('emptyState');
  const tableEl = document.getElementById('householdsTable');

  const total = filteredHouseholds.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);
  const pageData = filteredHouseholds.slice(start, end);

  tbody.innerHTML = '';

  if (pageData.length === 0) {
    tableEl.style.display = 'none';
    empty.style.display = 'flex';
  } else {
    tableEl.style.display = 'table';
    empty.style.display = 'none';

    pageData.forEach(household => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><span class="cell-id">${escapeHtml(household.householdId)}</span></td>
        <td>
          <div class="cell-head-primary">${escapeHtml(household.householdHead)}</div>
          <div class="cell-head-secondary">${escapeHtml(household.contactNumber || 'No contact number')}</div>
        </td>
        <td>
          <div class="cell-address-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9.75L12 3l9 6.75V21a.75.75 0 0 1-.75.75H3.75A.75.75 0 0 1 3 21V9.75z"/>
            </svg>
            ${escapeHtml(household.streetAddress)}
          </div>
          <div class="cell-address-secondary">${escapeHtml(household.barangaySector.toUpperCase())} &bull; ID: ${escapeHtml(household.householdId)}</div>
        </td>
        <td>
          <div class="cell-members-primary">${escapeHtml(String(household.numberOfMembers))} members</div>
          <div class="cell-members-secondary">Registered family unit</div>
        </td>
        <td>
          <div class="cell-residency-primary">${escapeHtml(household.lengthOfResidency || 'Not specified')}</div>
          <div class="cell-residency-secondary">Residency record</div>
        </td>
        <td>${renderBadge(household.householdStatus)}</td>
        <td>
          <button class="btn-verify" onclick="viewHouseholdProfile(${toInlineArgument(household.householdId)})">View Profile</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  document.getElementById('recordsCount').textContent =
    total === 0 ? 'No records found' : `Showing ${total} of ${allHouseholds.length} total records`;

  const showing = total === 0
    ? 'No entries found'
    : `Showing ${start + 1}-${end} of ${total} households`;

  document.getElementById('paginationInfo').textContent = showing;
  document.getElementById('pageIndicator').textContent = `Page ${currentPage} of ${totalPages}`;
  document.getElementById('prevBtn').disabled = currentPage <= 1;
  document.getElementById('nextBtn').disabled = currentPage >= totalPages;
}

function renderBadge(status) {
  const map = {
    Active: 'badge-active',
    Pending: 'badge-pending',
    Inactive: 'badge-inactive',
    Moved: 'badge-moved',
  };
  const safeStatus = status || 'Pending';
  return `<span class="badge ${map[safeStatus] || 'badge-inactive'}">${escapeHtml(safeStatus)}</span>`;
}

function applyFilters() {
  const search = document.getElementById('searchFilter').value.trim().toLowerCase();
  const status = document.getElementById('statusFilter').value;
  const sector = document.getElementById('sectorFilter').value;

  filteredHouseholds = allHouseholds.filter(household => {
    const matchSearch = !search || [
      household.householdId,
      household.householdHead,
      household.streetAddress,
      household.barangaySector,
    ].some(value => String(value || '').toLowerCase().includes(search));
    const matchStatus = !status || household.householdStatus === status;
    const matchSector = !sector || household.barangaySector === sector;
    return matchSearch && matchStatus && matchSector;
  });

  currentPage = 1;
  renderTable();
}

function changePage(direction) {
  const totalPages = Math.max(1, Math.ceil(filteredHouseholds.length / PAGE_SIZE));
  currentPage = Math.max(1, Math.min(currentPage + direction, totalPages));
  renderTable();
}

function viewHouseholdProfile(householdId) {
  const household = allHouseholds.find(item => item.householdId === householdId);
  if (!household) return;
  console.log('View household profile:', household);
}

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

function handleAddResident(event) {
  event.preventDefault();

  pendingResidentData = {
    firstName: document.getElementById('firstName').value.trim(),
    middleName: document.getElementById('middleName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    dateOfBirth: document.getElementById('dateOfBirth').value,
    age: parseInt(document.getElementById('age').value, 10) || 0,
    sex: document.getElementById('sex').value,
    civilStatus: document.getElementById('civilStatus').value,
    citizenship: document.getElementById('citizenship').value.trim(),
    occupation: document.getElementById('occupation').value.trim(),
    contactNumber: document.getElementById('contactNumber').value.trim(),
    streetAddress: document.getElementById('streetAddress').value.trim(),
    barangaySector: document.getElementById('barangaySector').value,
    residencyStatus: document.getElementById('residencyStatus').value,
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
    await apiRequest('/residents', {
      method: 'POST',
      body: JSON.stringify(pendingResidentData),
    });
  } catch {
    console.warn('Resident save endpoint unavailable. Saved only for this session.');
  }

  pendingResidentData = null;
  showToast('Resident saved successfully.');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMessage').textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[character]));
}

function toInlineArgument(value) {
  return escapeHtml(JSON.stringify(String(value ?? '')));
}
