let rackData = null;
let toastTimer = null;

// ── Setup ──────────────────────────────────────────────────────────────────
document.getElementById('setupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name     = document.getElementById('rackName').value.trim() || 'Main Rack';
    const shelves  = document.getElementById('numShelves').value;
    const capacity = document.getElementById('shelfCapacity').value;

    const res  = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, shelves, capacity })
    });
    const data = await res.json();

    if (data.success) {
        rackData = data.rack;

        // Animate setup modal out
        const modal = document.querySelector('#setupModal .modal');
        gsap.to(modal, {
            y: -20, opacity: 0, scale: 0.95, duration: 0.3, ease: 'power2.in',
            onComplete: () => {
                document.getElementById('setupModal').classList.remove('active');
                document.getElementById('app').classList.remove('hidden');
                animateAppIn();
                renderRack(true);
            }
        });
    }
});

// ── App entrance animation ─────────────────────────────────────────────────
function animateAppIn() {
    gsap.from('header', { y: -20, opacity: 0, duration: 0.5, ease: 'power2.out' });
}

// ── Add Item ───────────────────────────────────────────────────────────────
document.getElementById('addForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name     = document.getElementById('itemName').value.trim();
    const category = document.getElementById('itemCategory').value.trim() || 'General';
    const weight   = document.getElementById('itemWeight').value;
    const quantity = document.getElementById('itemQuantity').value;
    const shelfId  = document.getElementById('itemShelf').value;

    const res  = await fetch('/api/item/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category, weight, quantity, shelfId })
    });
    const data = await res.json();

    if (data.success) {
        rackData = data.rack;
        closeModal('addModal');
        document.getElementById('addForm').reset();
        renderRack(false);
        showToast(`'${name}' added successfully`, 'success');
        if (document.getElementById('capacityPanel').classList.contains('open')) renderCapacity();
    } else {
        shakeModal('addModal');
        showToast('Could not add item — shelf may be full', 'error');
    }
});

// ── Remove Item ────────────────────────────────────────────────────────────
document.getElementById('removeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name    = document.getElementById('removeName').value.trim();
    const shelfId = document.getElementById('removeShelf').value;

    const res  = await fetch('/api/item/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, shelfId })
    });
    const data = await res.json();

    if (data.success) {
        rackData = data.rack;
        closeModal('removeModal');
        document.getElementById('removeForm').reset();
        renderRack(false);
        showToast(`'${name}' removed`, 'success');
        if (document.getElementById('searchPanel').classList.contains('open')) doSearch();
        if (document.getElementById('capacityPanel').classList.contains('open')) renderCapacity();
    } else {
        shakeModal('removeModal');
        showToast('Item not found', 'error');
    }
});

// ── Quick remove from shelf card ───────────────────────────────────────────
async function quickRemove(name, shelfId) {
    const res  = await fetch('/api/item/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, shelfId })
    });
    const data = await res.json();

    if (data.success) {
        rackData = data.rack;
        renderRack(false);
        showToast(`'${name}' removed`, 'success');
        if (document.getElementById('searchPanel').classList.contains('open')) doSearch();
        if (document.getElementById('capacityPanel').classList.contains('open')) renderCapacity();
    }
}

// ── Render rack ────────────────────────────────────────────────────────────
function renderRack(animate) {
    if (!rackData) return;

    // Header
    document.getElementById('rackTitle').textContent = rackData.name;
    document.getElementById('headerStats').textContent =
        `${rackData.totalUsed} / ${rackData.totalCapacity} items`;

    const overallPct = rackData.totalCapacity > 0
        ? ((rackData.totalUsed / rackData.totalCapacity) * 100).toFixed(1)
        : 0;
    document.getElementById('overallPct').textContent = overallPct + '%';
    document.getElementById('overallFill').style.width = overallPct + '%';

    // Grid
    const grid = document.getElementById('shelvesGrid');
    grid.innerHTML = '';

    rackData.shelves.forEach(shelf => {
        const pct       = shelf.capacity > 0 ? shelf.numberItems / shelf.capacity : 0;
        const pctVal    = (pct * 100).toFixed(1);
        const isFull    = shelf.isFull;
        const isWarn    = !isFull && pct >= 0.75;
        const fillClass = isFull ? 'fill-full' : isWarn ? 'fill-warn' : 'fill-ok';
        const badgeClass = isFull ? 'badge-full' : isWarn ? 'badge-warn' : 'badge-ok';
        const badgeText  = isFull ? 'Full' : isWarn ? 'Almost Full' : 'OK';

        const itemsHTML = shelf.items.length === 0
            ? '<div class="empty-shelf">No items on this shelf</div>'
            : shelf.items.map(item => `
                <div class="item-row">
                    <div class="item-dot"></div>
                    <div class="item-info">
                        <div class="item-name">${escHtml(item.name)}</div>
                        <div class="item-meta">
                            <span class="category-chip">${escHtml(item.category)}</span>
                            Qty: ${item.quantity} &middot; ${item.weight}kg
                        </div>
                    </div>
                    <button class="item-remove" onclick="quickRemove('${escAttr(item.name)}', ${shelf.id})" title="Remove">&#10005;</button>
                </div>
            `).join('');

        const card = document.createElement('div');
        card.className = `shelf-card${isFull ? ' is-full' : isWarn ? ' is-warn' : ''}`;
        card.innerHTML = `
            <div class="shelf-top-bar"></div>
            <div class="shelf-header">
                <span class="shelf-title">Shelf ${shelf.id}</span>
                <span class="shelf-badge ${badgeClass}">${badgeText}</span>
            </div>
            <div class="shelf-progress">
                <div class="progress-bar">
                    <div class="progress-fill ${fillClass}" data-target="${pctVal}" style="width:0%"></div>
                </div>
                <div class="shelf-capacity-text">${shelf.numberItems} of ${shelf.capacity} slots used</div>
            </div>
            <div class="shelf-items">${itemsHTML}</div>
        `;
        grid.appendChild(card);
    });

    // Animate progress bars
    document.querySelectorAll('.progress-fill').forEach(bar => {
        const target = bar.dataset.target + '%';
        gsap.to(bar, { width: target, duration: 1, ease: 'power2.out', delay: animate ? 0.3 : 0.1 });
    });

    // Stagger cards in
    if (animate) {
        gsap.from('.shelf-card', {
            y: 28,
            opacity: 0,
            duration: 0.5,
            stagger: 0.07,
            ease: 'power2.out',
            delay: 0.15
        });
    } else {
        gsap.from('.shelf-card', {
            scale: 0.98,
            opacity: 0,
            duration: 0.3,
            stagger: 0.04,
            ease: 'power2.out'
        });
    }

    updateShelfSelectors();
}

function updateShelfSelectors() {
    const opts = rackData.shelves.map(s =>
        `<option value="${s.id}">Shelf ${s.id}${s.isFull ? ' (Full)' : ''}</option>`
    ).join('');

    document.getElementById('itemShelf').innerHTML =
        '<option value="0">Auto-assign (first available)</option>' + opts;
    document.getElementById('removeShelf').innerHTML =
        '<option value="0">Search all shelves</option>' + opts;
}

// ── Capacity report ────────────────────────────────────────────────────────
function renderCapacity() {
    if (!rackData) return;
    const pct = rackData.totalCapacity > 0
        ? ((rackData.totalUsed / rackData.totalCapacity) * 100).toFixed(1) : 0;

    let html = `
        <div class="capacity-overview">
            <div class="capacity-big">${pct}%</div>
            <div class="capacity-label">Overall Capacity Used</div>
            <div class="capacity-sub">${rackData.totalUsed} / ${rackData.totalCapacity} items</div>
        </div>
    `;

    rackData.shelves.forEach(shelf => {
        const sp = shelf.capacity > 0
            ? ((shelf.numberItems / shelf.capacity) * 100).toFixed(1) : 0;
        const fillClass  = shelf.isFull ? 'fill-full' : sp >= 75 ? 'fill-warn' : 'fill-ok';
        const statusClass = shelf.isFull ? 'cap-status-full' : 'cap-status-ok';
        const statusText  = shelf.isFull ? 'Full' : 'OK';

        html += `
            <div class="capacity-shelf-row">
                <div class="capacity-shelf-header">
                    <span class="capacity-shelf-name">
                        Shelf ${shelf.id}
                        <span class="cap-status ${statusClass}">${statusText}</span>
                    </span>
                    <span class="capacity-shelf-count">${shelf.numberItems}/${shelf.capacity} · ${sp}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${fillClass}" data-target="${sp}" style="width:0%"></div>
                </div>
            </div>
        `;
    });

    document.getElementById('capacityBody').innerHTML = html;

    // Animate bars
    document.querySelectorAll('#capacityBody .progress-fill').forEach(bar => {
        gsap.to(bar, { width: bar.dataset.target + '%', duration: 0.9, ease: 'power2.out', delay: 0.1 });
    });
}

// ── Search ─────────────────────────────────────────────────────────────────
async function doSearch() {
    const q         = document.getElementById('searchInput').value.trim();
    const container = document.getElementById('searchResults');

    if (!q) {
        container.innerHTML = '<p class="empty-hint">Start typing to search...</p>';
        return;
    }

    const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();

    if (data.results.length === 0) {
        container.innerHTML = '<p class="empty-hint">No results found.</p>';
        return;
    }

    container.innerHTML = data.results.map(r => `
        <div class="search-result-item">
            <div class="search-shelf-tag">Shelf ${r.shelfId}</div>
            <div class="item-name">${escHtml(r.item.name)}</div>
            <div class="item-meta">
                <span class="category-chip">${escHtml(r.item.category)}</span>
                Qty: ${r.item.quantity} &middot; ${r.item.weight}kg
            </div>
        </div>
    `).join('');

    gsap.from('.search-result-item', {
        y: 10, opacity: 0, duration: 0.25, stagger: 0.05, ease: 'power2.out'
    });
}

// ── Modal helpers ──────────────────────────────────────────────────────────
function openModal(id) {
    const overlay = document.getElementById(id);
    const modal   = overlay.querySelector('.modal');
    overlay.classList.add('active');
    gsap.fromTo(modal,
        { y: -16, opacity: 0, scale: 0.97 },
        { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
    );
}

function closeModal(id) {
    const overlay = document.getElementById(id);
    const modal   = overlay.querySelector('.modal');
    gsap.to(modal, {
        y: -10, opacity: 0, scale: 0.97, duration: 0.2, ease: 'power2.in',
        onComplete: () => overlay.classList.remove('active')
    });
}

function shakeModal(id) {
    const modal = document.querySelector(`#${id} .modal`);
    gsap.to(modal, {
        x: [-8, 8, -6, 6, 0], duration: 0.4, ease: 'power1.inOut'
    });
}

function openAddItem()  { openModal('addModal'); }

// ── Panel helpers ──────────────────────────────────────────────────────────
function openSearch() {
    openPanel('searchPanel');
    setTimeout(() => document.getElementById('searchInput').focus(), 350);
}

function openCapacity() {
    openPanel('capacityPanel');
    renderCapacity();
}

function openPanel(id) {
    document.getElementById(id).classList.add('open');
    document.getElementById('panelBackdrop').classList.add('active');
}

function closePanel(id) {
    document.getElementById(id).classList.remove('open');
    document.getElementById('panelBackdrop').classList.remove('active');
}

function closeAllPanels() {
    document.querySelectorAll('.side-panel').forEach(p => p.classList.remove('open'));
    document.getElementById('panelBackdrop').classList.remove('active');
}

// Close modals on backdrop click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay && overlay.id !== 'setupModal') closeModal(overlay.id);
    });
});

// ── Toast ──────────────────────────────────────────────────────────────────
function showToast(message, type = '') {
    const toast    = document.getElementById('toast');
    toast.textContent = message;
    toast.className   = `toast ${type} show`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        gsap.to(toast, {
            y: 20, opacity: 0, duration: 0.3, ease: 'power2.in',
            onComplete: () => { toast.className = 'toast'; toast.style = ''; }
        });
    }, 3000);
}

// ── Escape helpers ─────────────────────────────────────────────────────────
function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function escAttr(str) {
    return String(str).replace(/'/g, "\\'");
}
