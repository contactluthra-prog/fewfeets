/* ============================================
   FEWFEETS — Listings Manager
   Easy add/remove via listings.json
   ============================================ */

const ListingsManager = {
    listings: [],
    currentFilter: 'all',

    async init() {
        await this.loadListings();
        this.render();
        this.bindFilters();
    },

    async loadListings() {
        try {
            const response = await fetch('data/listings.json');
            if (!response.ok) throw new Error('Failed to load listings');
            this.listings = await response.json();
        } catch (error) {
            console.warn('Could not load listings.json, using empty array:', error);
            this.listings = [];
        }
    },

    getFilteredListings() {
        if (this.currentFilter === 'all') return this.listings;
        return this.listings.filter(l => l.category === this.currentFilter);
    },

    getCategoryIcon(category) {
        const icons = {
            residential: '🏠',
            commercial: '🏢',
            land: '🌿',
            international: '🌍'
        };
        return icons[category] || '🏛️';
    },

    getStatusClass(status) {
        const classes = {
            sale: 'sale',
            lease: 'lease',
            new: 'new'
        };
        return classes[status] || 'sale';
    },

    getStatusLabel(status) {
        const labels = {
            sale: 'For Sale',
            lease: 'For Lease',
            new: 'New Launch'
        };
        return labels[status] || 'For Sale';
    },

    createListingCard(listing) {
        const card = document.createElement('div');
        card.className = 'listing-card fade-in';
        card.setAttribute('data-category', listing.category);
        
        const imageHtml = listing.image 
            ? `<img src="${listing.image}" alt="${listing.title}" loading="lazy">`
            : `<div class="listing-image-placeholder">${this.getCategoryIcon(listing.category)}</div>`;

        const metaItems = [];
        if (listing.area) metaItems.push(`<span class="listing-meta-item">📐 ${listing.area}</span>`);
        if (listing.bedrooms) metaItems.push(`<span class="listing-meta-item">🛏️ ${listing.bedrooms}</span>`);
        if (listing.bathrooms) metaItems.push(`<span class="listing-meta-item">🚿 ${listing.bathrooms} Bath</span>`);
        if (listing.type) metaItems.push(`<span class="listing-meta-item">🏷️ ${listing.type}</span>`);

        card.innerHTML = `
            <div class="listing-image">
                ${imageHtml}
                <span class="listing-badge ${this.getStatusClass(listing.status)}">${this.getStatusLabel(listing.status)}</span>
            </div>
            <div class="listing-body">
                <div class="listing-location">${listing.location}</div>
                <h3 class="listing-title">${listing.title}</h3>
                <p class="listing-desc">${listing.description}</p>
                <div class="listing-meta">${metaItems.join('')}</div>
                <div class="listing-price">${listing.price}</div>
            </div>
        `;
        
        return card;
    },

    render() {
        const grid = document.getElementById('listingsGrid');
        const empty = document.getElementById('listingsEmpty');
        if (!grid) return;

        const filtered = this.getFilteredListings();
        grid.innerHTML = '';

        if (filtered.length === 0) {
            grid.style.display = 'none';
            if (empty) empty.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        if (empty) empty.style.display = 'none';

        filtered.forEach((listing, index) => {
            const card = this.createListingCard(listing);
            card.style.transitionDelay = `${index * 100}ms`;
            grid.appendChild(card);
            // Trigger fade-in
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    card.classList.add('visible');
                });
            });
        });
    },

    bindFilters() {
        const buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.render();
            });
        });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ListingsManager.init();
});
