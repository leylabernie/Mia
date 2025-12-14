
async function fetchProducts() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const products = await response.json();
    return products;
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
  }
}

function renderProducts(products) {
  const productGrid = document.getElementById('product-grid');
  if (!productGrid) {
    return;
  }
  productGrid.innerHTML = '';
  products.forEach(product => {
    const productCard = `
      <div class="group relative flex flex-col luxury-hover transition-all duration-300">
        <div class="aspect-[3/4] overflow-hidden bg-white rounded-t-lg relative">
          <div class="absolute inset-0 bg-neutral-sage/10 mix-blend-multiply z-10 pointer-events-none"></div>
          <img alt="${product.name}" class="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out" src="${product.image}"/>
          <div class="absolute inset-x-0 bottom-4 px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">
            <button class="w-full bg-white/90 backdrop-blur text-brand-sage text-xs py-3 uppercase tracking-widest font-semibold hover:bg-brand-sage hover:text-white transition-colors shadow-lg border border-brand-sage/20">
              Quick View
            </button>
          </div>
          <button class="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-accent-pop hover:text-white transition-colors z-20 group/btn">
            <span class="material-symbols-outlined text-text-secondary group-hover/btn:text-white text-lg">favorite</span>
          </button>
          ${product.originalPrice ? `<span class="absolute top-3 left-3 bg-accent-pop text-white text-[10px] px-3 py-1 uppercase tracking-widest font-semibold z-20 shadow-sm">Sale</span>` : ''}
        </div>
        <div class="pt-6 pb-4 px-4 bg-white rounded-b-lg border-x border-b border-neutral-sage/20 flex flex-col flex-1 text-center">
          <h3 class="text-lg font-display text-text-primary leading-tight mb-1 group-hover:text-brand-sage transition-colors">
            <a href="#">${product.name}</a>
          </h3>
          <p class="text-xs text-text-secondary mb-3 font-light">${product.description}</p>
          <div class="mt-auto flex items-center justify-center space-x-3">
            <p class="text-base font-bold text-brand-sage" data-base-price="${product.price}">₹${product.price.toLocaleString()}</p>
            ${product.originalPrice ? `<p class="text-xs text-text-secondary line-through decoration-text-secondary/50" data-base-price="${product.originalPrice}">₹${product.originalPrice.toLocaleString()}</p>` : ''}
          </div>
        </div>
      </div>
    `;
    productGrid.innerHTML += productCard;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  fetchProducts().then(products => {
    if (products) {
      renderProducts(products);
    }
  });
});
