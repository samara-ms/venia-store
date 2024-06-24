document.addEventListener('DOMContentLoaded', function () {
    const mobileMenu = document.querySelector('.mobile-menu');
    const navListWrap = document.getElementById('navListWrap');

    // Header
    if (mobileMenu && navListWrap) {
        mobileMenu.addEventListener('click', function () {
            navListWrap.classList.toggle('nav-header__nav-list-wrap--show');
        });
    }
    // StickyHeader
    const header = document.querySelector('.header');
    
    const handleScroll = () => {
        if (window.scrollY > 100) { 
            header.classList.add('nav-header--fixed');
        } else {
            header.classList.remove('nav-header--fixed');
        }
    };


    window.addEventListener('scroll', handleScroll);

    const productFilterElt = document.getElementById('productFilter');
    const mobileFilterBtn = document.querySelector('.mobile-filter');
    const filterCloseButton = document.querySelector('.product__filter-close');

    if (mobileFilterBtn && productFilterElt) {
        mobileFilterBtn.addEventListener('click', function () {
            productFilterElt.classList.toggle('product__filter--show');
        });
    }

    if (filterCloseButton) {
        filterCloseButton.addEventListener('click', function () {
            productFilterElt.classList.remove('product__filter--show');
        });
    }
});

let sortBy = '';
let category = [];
let currentPage = 1;
const itemsPerPage = 10;
let products = [];
let displayedProducts = [];
let searchQuery = '';


const Plp = {
    async Sort() {
        try {
            let sort = document.getElementById('sort');
            sort.addEventListener('change', function (e) {
                sortBy = e.target.value;
                currentPage = 1;
                Plp.getProductsList(sortBy, category, searchQuery);
            });
        } catch (err) {
            console.log('Error Sort:', err);
        }
    },
    async categoryFilter() {
        try {
            let categoryFilter = document.querySelectorAll('.checkbox-input');
            for (let item of categoryFilter) {
                item.addEventListener('change', function (e) {
                    if (e.target.checked) {
                        category.push(e.target.value);
                    } else {
                        const index = category.indexOf(e.target.value);
                        if (index > -1) {
                            category.splice(index, 1);
                        }
                    }
                    currentPage = 1;
                    Plp.getProductsList(sortBy, category,searchQuery);
                });
            }
        } catch (err) {
            console.log('Error Filter', err);
        }
    },
    async searchFilter() {
        try {
            let searchBar = document.getElementById('searchBar');
            searchBar.addEventListener('input', function (e) {
                const searchQuery = e.target.value.toLowerCase();
                currentPage = 1;
                Plp.getProductsList(sortBy, category, searchQuery);
            });
        } catch (err) {
            console.error('Error in search filter:', err);
        }
    },
    async getProductsList(sortBy = '', category = [], searchQuery = '') {
        try {
            document.getElementById('loading').style.display = 'block';
            const URL = 'https://fakestoreapi.com/products';
            let response = await fetch(URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            products = await response.json();
            
            if (sortBy) {
                if (sortBy === 'LowToHigh') {
                    products.sort((a, b) => a.price - b.price);
                } else {
                    products.sort((a, b) => b.price - a.price);
                }
            }

            if (category.length > 0) {
                products = products.filter(product => category.includes(product.category));
            }

            if (searchQuery) {
                products = products.filter(product => product.title.toLowerCase().includes(searchQuery));
            }

            displayedProducts = products.slice(0, itemsPerPage * currentPage);
            Plp.displayProducts(displayedProducts);
            Plp.setupPagination();
            document.getElementById('loading').style.display = 'none';

            if (products.length > displayedProducts.length) {
                document.getElementById('loadMore').style.display = 'block';
            } else {
                document.getElementById('loadMore').style.display = 'none';
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            document.getElementById('productList').innerHTML = '<p class="error-message">Failed to load products. Please try again later.</p>';
            document.querySelector('.product__product-result').innerText = `0 Results`;
            document.getElementById('loading').style.display = 'none';
        }
    },
    displayProducts(productsToDisplay) {
        try {
            let productHTML = '';
            productsToDisplay.forEach(item => {
                productHTML += `<li class="product__product-card">
                    <div class="product__product-img">
                        <img src="${item.image}" alt="${item.title}">
                    </div>
                    <div class="product__product-content">
                        <h3 class="product__product-title">${item.title.substring(0, 30)}</h3>
                        <p class="product__product-price">$${item.price}</p>
                        <button class="product__add-to-cart">
                            <img src="assets/images/heart.png" alt="cart icon" class="product__cart-icon">
                        </button>
                    </div>
                </li>`;
            });
            document.getElementById('productList').innerHTML = productHTML;
            document.querySelector('.product__product-result').innerText = `${products.length} Results`;
        } catch (err) {
            console.error('Error displaying products:', err);
            document.getElementById('productList').innerHTML = '<p class="error-message">Failed to display products. Please try again later.</p>';
        }
    },
    setupPagination() {
        try {
            const paginationList = document.querySelector('.product__pagination');
            const totalPages = Math.ceil(products.length / itemsPerPage);

            paginationList.innerHTML = '';

            if (displayedProducts.length >= products.length) {
                paginationList.style.display = 'none';
            } else {
                for (let i = 1; i <= totalPages; i++) {
                    const pageItem = document.createElement('li');
                    pageItem.className = 'product__page-item';
                    if (i === currentPage) {
                        pageItem.classList.add('product__page-item--active');
                    }
                    pageItem.innerHTML = `<a class="product__page-link" href="#">${i}</a>`;
                    pageItem.addEventListener('click', function (event) {
                        event.preventDefault();
                        currentPage = i;
                        displayedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
                        Plp.displayProducts(displayedProducts);
                        Plp.setupPagination();
                    });
                    paginationList.appendChild(pageItem);
                }
            }
        } catch (err) {
            console.error('Error setting up pagination:', err);
            document.querySelector('.product__pagination').innerHTML = '<p class="error-message">Failed to set up pagination. Please try again later.</p>';
        }
    }
};

document.getElementById('loadMore').addEventListener('click', function () {
    const startIndex = displayedProducts.length;
    const nextProducts = products.slice(startIndex, startIndex + itemsPerPage);
    displayedProducts = displayedProducts.concat(nextProducts);
    Plp.displayProducts(displayedProducts);

    if (displayedProducts.length >= products.length) {
        document.getElementById('loadMore').style.display = 'none';
        document.querySelector('.product__pagination').style.display = 'none';
    } else {
        document.querySelector('.product__pagination').style.display = 'block';
    }
});

// Calling
Plp.getProductsList(sortBy, category, searchQuery);
Plp.categoryFilter();
Plp.Sort();
Plp.searchFilter();
