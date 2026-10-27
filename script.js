// --- NAVIGATION PRINCIPALE ---
function switchMainTab(tabName) {
    document.querySelectorAll('.app-section').forEach(sec => sec.classList.add('hidden'));
    document.querySelectorAll('.top-nav-btn').forEach(btn => btn.classList.remove('active'));

    if (tabName === 'buyer') {
        document.getElementById('section-buyer').classList.remove('hidden');
        document.getElementById('top-btn-buyer').classList.add('active');
        displayProducts();
    } else if (tabName === 'seller') {
        document.getElementById('section-seller').classList.remove('hidden');
        document.getElementById('top-btn-seller').classList.add('active');
    } else if (tabName === 'admin') {
        document.getElementById('section-admin').classList.remove('hidden');
        document.getElementById('top-btn-admin').classList.add('active');
    }
}

// --- NAVIGATION INTERNE ESPACE VENDEUR (SIDEBAR SHOPIFY) ---
function switchSellerTab(tabId) {
    document.querySelectorAll('.seller-tab-pane').forEach(pane => pane.classList.add('hidden'));
    document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('active'));

    const targetPane = document.getElementById(`seller-content-${tabId}`);
    const targetBtn = document.getElementById(`s-tab-${tabId}`);

    if (targetPane) targetPane.classList.remove('hidden');
    if (targetBtn) targetBtn.classList.add('active');
}

window.onload = function() {
    displayProducts();
};

// --- GESTION VENDEUR ---
let currentSellerPhone = "";

function loginSeller() {
    const phoneInput = document.getElementById('seller-phone').value.trim();
    const alertBox = document.getElementById('seller-login-alert');

    if (!phoneInput) {
        alertBox.innerHTML = '<div class="alert alert-error">Veuillez entrer votre numéro WhatsApp.</div>';
        return;
    }

    currentSellerPhone = phoneInput;
    let sellers = JSON.parse(localStorage.getItem('daga_sellers')) || {};
    let seller = sellers[currentSellerPhone];

    document.getElementById('seller-login-container').classList.add('hidden');
    document.getElementById('seller-dashboard-container').classList.remove('hidden');

    const statusBox = document.getElementById('subscription-status-box');
    const now = new Date().getTime();

    if (seller && seller.expireAt > now) {
        let daysLeft = Math.ceil((seller.expireAt - now) / (1000 * 60 * 60 * 24));
        statusBox.className = "alert alert-success";
        statusBox.innerHTML = `✨ Boutique active ! Il vous reste ${daysLeft} jour(s) d'abonnement.`;

        // Charger les paramètres
        document.getElementById('shop-name').value = seller.shopName || "Ma Boutique";
        document.getElementById('sidebar-shop-title').innerText = seller.shopName || "Ma Boutique";
        document.getElementById('shop-category').value = seller.shopCategory || "Mode";
        document.getElementById('shop-desc').value = seller.shopDesc || "";
        document.getElementById('shop-fb').value = seller.shopFb || "";
        document.getElementById('shop-tiktok').value = seller.shopTiktok || "";

        updateSellerStats(daysLeft);
        loadMyProducts();
    } else {
        let adminWaNumber = "+22651892952";
        let activationMsg = encodeURIComponent(`Bonjour ! Je souhaite activer ma boutique sur Daga. Mon numéro est le ${currentSellerPhone}. Merci !`);
        let waLink = `https://wa.me/${adminWaNumber.replace(/[^0-9]/g, '')}?text=${activationMsg}`;

        statusBox.className = "alert alert-info";
        statusBox.innerHTML = `
            🛍️ <strong>Bienvenue dans votre espace Daga</strong><br>
            Effectuez votre règlement de 30 jours par <strong>Orange Money ou Moov Money</strong> au <strong>${adminWaNumber}</strong>, puis contactez l'administrateur.<br>
            <a href="${waLink}" target="_blank" class="whatsapp-btn" style="margin-top:10px;">💬 Activer ma boutique sur WhatsApp</a>
        `;
    }
}

function logoutSeller() {
    document.getElementById('seller-dashboard-container').classList.add('hidden');
    document.getElementById('seller-login-container').classList.remove('hidden');
    document.getElementById('seller-phone').value = '';
}

function updateSellerStats(daysLeft) {
    let products = JSON.parse(localStorage.getItem('daga_products')) || [];
    let myProducts = products.filter(p => p.whatsapp === currentSellerPhone);

    document.getElementById('seller-stat-products').innerText = myProducts.length;
    document.getElementById('seller-stat-days').innerText = daysLeft;

    let percentage = Math.min(Math.round((daysLeft / 30) * 100), 100);
    let bar = document.getElementById('seller-progress-bar');
    if (bar) {
        bar.style.width = percentage + "%";
        bar.innerText = percentage + "%";
    }
}

function saveShopSettings() {
    let sellers = JSON.parse(localStorage.getItem('daga_sellers')) || {};
    if (!sellers[currentSellerPhone]) sellers[currentSellerPhone] = {};

    let sName = document.getElementById('shop-name').value.trim() || "Ma Boutique";
    sellers[currentSellerPhone].shopName = sName;
    sellers[currentSellerPhone].shopCategory = document.getElementById('shop-category').value;
    sellers[currentSellerPhone].shopDesc = document.getElementById('shop-desc').value.trim();
    sellers[currentSellerPhone].shopFb = document.getElementById('shop-fb').value.trim();
    sellers[currentSellerPhone].shopTiktok = document.getElementById('shop-tiktok').value.trim();

    localStorage.setItem('daga_sellers', JSON.stringify(sellers));
    document.getElementById('sidebar-shop-title').innerText = sName;
    alert("Paramètres enregistrés avec succès !");
    displayProducts();
}

function publishProduct() {
    const name = document.getElementById('p-name').value.trim();
    const price = document.getElementById('p-price').value.trim();
    const desc = document.getElementById('p-pdesc').value.trim();

    if (!name || !price) {
        alert("Veuillez renseigner le nom et le prix.");
        return;
    }

    let sellers = JSON.parse(localStorage.getItem('daga_sellers')) || {};
    let seller = sellers[currentSellerPhone];
    const now = new Date().getTime();

    if (!seller || seller.expireAt <= now) {
        alert("Votre abonnement est expiré. Veuillez le renouveler.");
        return;
    }

    let products = JSON.parse(localStorage.getItem('daga_products')) || [];
    products.unshift({
        id: Date.now(),
        name,
        price,
        desc,
        category: seller.shopCategory || "Mode",
        whatsapp: currentSellerPhone
    });

    localStorage.setItem('daga_products', JSON.stringify(products));
    alert("Article publié !");
    document.getElementById('p-name').value = '';
    document.getElementById('p-price').value = '';
    document.getElementById('p-pdesc').value = '';

    loadMyProducts();
    displayProducts();
}

function loadMyProducts() {
    let products = JSON.parse(localStorage.getItem('daga_products')) || [];
    let myProducts = products.filter(p => p.whatsapp === currentSellerPhone);
    const container = document.getElementById('my-products-list');

    if (myProducts.length === 0) {
        container.innerHTML = '<p style="color:#6d7175;">Aucun produit enregistré.</p>';
        return;
    }

    let html = '';
    myProducts.forEach(p => {
        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #e1e3e5;">
                <div><strong>${p.name}</strong> - <span style="color:#008060;">${p.price}</span></div>
                <button onclick="deleteMyProduct(${p.id})" style="background:#fee2e2; color:#991b1b; border:none; padding:6px 10px; border-radius:4px; cursor:pointer;">Supprimer</button>
            </div>`;
    });
    container.innerHTML = html;
}

function deleteMyProduct(id) {
    if (confirm("Supprimer cet article ?")) {
        let products = JSON.parse(localStorage.getItem('daga_products')) || [];
        products = products.filter(p => p.id !== id);
        localStorage.setItem('daga_products', JSON.stringify(products));
        loadMyProducts();
        displayProducts();
    }
}

// --- CATALOGUE PUBLIC ---
function displayProducts() {
    const listContainer = document.getElementById('products-list');
    if (!listContainer) return;

    let products = JSON.parse(localStorage.getItem('daga_products')) || [];
    let sellers = JSON.parse(localStorage.getItem('daga_sellers')) || {};
    const now = new Date().getTime();

    let visible = products.filter(p => sellers[p.whatsapp] && sellers[p.whatsapp].expireAt > now);

    if (visible.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center; color:#6d7175; padding:30px;">Aucun produit disponible actuellement sur le marché.</p>';
        return;
    }

    let html = '<div class="products-grid">';
    visible.forEach(p => {
        let shop = sellers[p.whatsapp] || {};
        let shopName = shop.shopName || "Boutique Daga";
        let waLink = `https://wa.me/${p.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour, intéressé par "${p.name}" (${p.price}).`)}`;

        html += `
            <div class="product-card" data-category="${p.category}">
                <small style="color:#008060; font-weight:bold;">🏪 ${shopName}</small>
                <h3 style="margin:8px 0; font-size:1.1em;">${p.name}</h3>
                <div style="color:#008060; font-weight:800; font-size:1.2em; margin-bottom:8px;">${p.price}</div>
                <p style="color:#6d7175; font-size:0.9em; margin:0 0 12px 0;">${p.desc}</p>
                <a href="${waLink}" target="_blank" class="whatsapp-btn">Commander via WhatsApp</a>
            </div>`;
    });
    html += '</div>';
    listContainer.innerHTML = html;
}

function filterProducts() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const cat = document.getElementById('category-filter').value;
    document.querySelectorAll('.product-card').forEach(card => {
        let text = card.innerText.toLowerCase();
        let cardCat = card.getAttribute('data-category');
        if (text.includes(query) && (!cat || cardCat === cat)) {
            card.style.display = "flex";
        } else {
            card.style.display = "none";
        }
    });
}

// --- ADMIN ---
function verifyAdminPassword() {
    if (document.getElementById('admin-pass').value === "admin2026") {
        document.getElementById('admin-login-box').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        loadAdminData();
    } else {
        document.getElementById('admin-alert').innerHTML = '<div class="alert alert-error">Mot de passe incorrect.</div>';
    }
}

function loadAdminData() {
    let products = JSON.parse(localStorage.getItem('daga_products')) || [];
    let sellers = JSON.parse(localStorage.getItem('daga_sellers')) || {};
    document.getElementById('admin-stat-products').innerText = products.length;
    document.getElementById('admin-stat-sellers').innerText = Object.keys(sellers).length;

    let html = '<table><tr><th>WhatsApp</th><th>Boutique</th><th>Statut</th><th>Action</th></tr>';
    let now = new Date().getTime();
    for (let phone in sellers) {
        let active = sellers[phone].expireAt > now;
        html += `<tr><td>${phone}</td><td>${sellers[phone].shopName || '-'}</td><td>${active ? 'Actif' : 'Expiré'}</td><td><button onclick="adminRenewSpecific('${phone}')" style="background:#008060; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">+30 Jours</button></td></tr>`;
    }
    html += '</table>';
    document.getElementById('admin-sellers-list').innerHTML = html;
}

function adminRenewSubscription() {
    let phone = document.getElementById('new-seller-phone').value.trim();
    if (!phone) return;
    let sellers = JSON.parse(localStorage.getItem('daga_sellers')) || {};
    let now = new Date().getTime();
    let base = (sellers[phone] && sellers[phone].expireAt > now) ? sellers[phone].expireAt : now;
    if (!sellers[phone]) sellers[phone] = {};
    sellers[phone].expireAt = base + (30 * 24 * 60 * 60 * 1000);
    localStorage.setItem('daga_sellers', JSON.stringify(sellers));
    document.getElementById('admin-renew-alert').innerHTML = '<div class="alert alert-success">Abonnement validé !</div>';
    loadAdminData();
}

function adminRenewSpecific(phone) {
    let sellers = JSON.parse(localStorage.getItem('daga_sellers')) || {};
    let now = new Date().getTime();
    let base = (sellers[phone] && sellers[phone].expireAt > now) ? sellers[phone].expireAt : now;
    sellers[phone].expireAt = base + (30 * 24 * 60 * 60 * 1000);
    localStorage.setItem('daga_sellers', JSON.stringify(sellers));
    loadAdminData();
    alert(`Abonnement prolongé pour ${phone}`);
}