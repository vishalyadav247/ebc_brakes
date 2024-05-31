document.addEventListener('DOMContentLoaded', function () {
    if (!window.location.href.includes('https://jgw-new.myshopify.com/pages/nodeproduct')) {
        const form = document.getElementById('ebc-product-search');

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            const make = document.getElementById('make').value;
            const model = document.getElementById('model').value;
            const year = document.getElementById('start_year').value;
            const engineType = document.getElementById('engine_type').value;

            // Construct the URL with query parameters
            const baseUrl = 'https://jgw-new.myshopify.com/pages/nodeproduct'; // Change this URL to your search page or wherever you want to redirect
            const queryString = `?make=${encodeURIComponent(make)}&model=${encodeURIComponent(
                model
            )}&year=${encodeURIComponent(year)}&engine_type=${encodeURIComponent(engineType)}`;

            // Redirect to the new URL
            window.location.href = baseUrl + queryString;
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    let makeSelect = document.querySelector('#make');
    let modelSelect = document.querySelector('#model');
    let yearSelect = document.querySelector('#start_year');
    let engineTypeSelect = document.querySelector('#engine_type');
    let skuSelect = document.querySelector('#sku');
    let productInfo = document.querySelector('#product-info');
    let domProducts = [];

    const make = getQueryParam('make');
    const model = getQueryParam('model');
    const year = getQueryParam('year');
    const engineType = getQueryParam('engine_type');

    // Function to fetch all unique makes
    function fetchMakes() {
        fetch('http://localhost:3000/api/csvProducts/makes')
            .then((response) => response.json())
            .then((csvProducts) => {
                makeSelect.innerHTML = '<option value="">Select Make</option>';
                csvProducts.sort((a, b) => a.make.localeCompare(b.make));
                csvProducts.forEach((product) => {
                    const option = document.createElement('option');
                    option.value = product.make;
                    option.textContent = product.make;
                    makeSelect.appendChild(option);
                });
                if (make) {
                    makeSelect.value = make;
                    fetchModels(make, () => {
                        if (model) {
                            modelSelect.value = model;
                            fetchYears(make, model, () => {
                                if (year) {
                                    yearSelect.value = year;
                                    fetchEngineTypes(make, model, year, () => {
                                        if (engineType) {
                                            engineTypeSelect.value = engineType;
                                            function cleanURL() {
                                                const url = new URL(window.location.href);
                                                const path = url.pathname.split('/'); // Split the pathname into segments
                                                const newPath = path.slice(0, path.indexOf('nodeproduct') + 1).join('/'); // Rejoin the path up to 'nodeproduct'
                                                // Set the new URL without query parameters
                                                const newUrl = `${url.origin}${newPath}`;
                                                window.history.pushState({ path: newUrl }, '', newUrl); // Update the URL in the browser without reloading the page
                                            }
                                            cleanURL();
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            })
            .catch((error) => console.error('Error fetching makes:', error));
    }

    // Function to fetch models based on the selected make
    function fetchModels(selectedMake, callback) {
        if (!selectedMake) return;

        fetch(`http://localhost:3000/api/csvProducts/models?make=${selectedMake}`)
            .then((response) => response.json())
            .then((models) => {
                // Clear previous options
                modelSelect.innerHTML = '<option value="">Select Model</option>';

                // Populate the dropdown with fetched models
                models.forEach((modelOption) => {
                    const option = document.createElement('option');
                    option.value = modelOption;
                    option.textContent = modelOption;
                    modelSelect.appendChild(option);
                });

                // Execute the callback if provided
                if (callback) callback();
            })
            .catch((error) => console.error('Error fetching models:', error));
    }

    // Function to fetch years based on the selected model
    function fetchYears(selectedMake, selectedModel, callback) {
        if (!selectedModel) return;
        fetch(`http://localhost:3000/api/csvProducts/years?make=${selectedMake}&model=${selectedModel}`)
            .then((response) => response.json())
            .then((years) => {
                yearSelect.innerHTML = '<option value="">Select Year</option>';
                let uniqueYears = new Set(years.map((year) => year.year).flat());
                Array.from(uniqueYears)
                    .sort((a, b) => a - b)
                    .forEach((Year) => {
                        const option = document.createElement('option');
                        option.value = Year;
                        option.textContent = Year;
                        yearSelect.appendChild(option);
                    });
                if (callback) callback();
            })
            .catch((error) => console.error('Error fetching years:', error));
    }

    // Function to fetch engine types based on the selected year
    function fetchEngineTypes(selectedMake, selectedModel, selectedYear, callback) {
        if (!selectedYear) return;
        fetch(
            `http://localhost:3000/api/csvProducts/engineTypes?make=${selectedMake}&model=${selectedModel}&year=${selectedYear}`
        )
            .then((response) => response.json())
            .then((engineTypes) => {
                engineTypeSelect.innerHTML = '<option value="">Select Engine Type</option>';
                engineTypes.forEach((engineType) => {
                    const option = document.createElement('option');
                    option.value = engineType.engineType;
                    option.textContent = engineType.engineType;
                    engineTypeSelect.appendChild(option);
                });
                if (callback) callback();
            })
            .catch((error) => console.error('Error fetching engine types:', error));
    }

    // Function to fetch SKUs based on the selected engine type
    function fetchSKUs(selectedMake, selectedModel, selectedYear, selectedEngineType) {
        // Check if a engine type is selected
        if (selectedEngineType) {
            // Make a request to the backend with the selected engine type value
            fetch(
                `http://localhost:3000/api/csvProducts/skus?make=${selectedMake}&model=${selectedModel}&year=${selectedYear}&engine_type=${selectedEngineType}`
            )
                .then((response) => response.json())
                .then((sku) => {
                    console.log('Total sku = ', sku);
                    console.log('---------------');
                    sku.forEach((product) => {
                        fetchProduct(product.sku, selectedMake, selectedModel, selectedYear, selectedEngineType);
                    });

                })
                .catch((error) => console.error('Error fetching SKUs:', error));
        }
    }

    // Function to fetch products based on the giving sku
    async function fetchProduct(sku, selectedMake, selectedModel, selectedYear, selectedEngineType) {
        const response = await fetch(
            `http://localhost:3000/api/csvProducts/bySku?sku=${sku}&make=${selectedMake}&model=${selectedModel}&year=${selectedYear}&engine_type=${selectedEngineType}`
        );
        if (response.ok) {
            const products = await response.json();
            domProducts.push(products);

            // console.log('product', products);

            // getting included product title and rows
            const { includedRow, includedTitle } = await includedData(products.csvProducts[0].included)

            // getting car rear or front image and text
            const { carEndText, carEndImageUrl } = getCarEnd(products.csvProducts[0].carEnd);

            // generating html for result products
            if (products.shopifyProducts.length >= 1) {
                productInfo.innerHTML += updateProductInfoHTML(sku, products, carEndText, carEndImageUrl, includedTitle, includedRow);
            }
        } else {
            console.log('No products found or there was an error.');
        }
    }

    // Event listener for changes in the "Make" dropdown
    makeSelect.addEventListener('change', () => {
        if (productInfo) {
            productInfo.innerHTML = '';
        }
        yearSelect.innerHTML = '<option value="">Select Year</option>';
        engineTypeSelect.innerHTML = '<option value="">Select Engine Type</option>';
        fetchModels(makeSelect.value);
    });

    // Event listener for changes in the "Model" dropdown
    modelSelect.addEventListener('change', () => {
        if (productInfo) {
            productInfo.innerHTML = '';
        }
        engineTypeSelect.innerHTML = '<option value="">Select Engine Type</option>';
        fetchYears(makeSelect.value, modelSelect.value);
    });

    // Event listener for changes in the "Year" dropdown
    yearSelect.addEventListener('change', () => {
        if (productInfo) {
            productInfo.innerHTML = '';
        }
        fetchEngineTypes(makeSelect.value, modelSelect.value, yearSelect.value);
    });

    // Event listener for changes in the "engineType" dropdown
    engineTypeSelect.addEventListener('change', () => {
        if (productInfo) {
            productInfo.innerHTML = '';
        }
        fetchSKUs(makeSelect.value, modelSelect.value, yearSelect.value, engineTypeSelect.value);
    });

    // Initialize the "Make" dropdown on page load
    fetchMakes();

    // Optionally, trigger the event to fetch and display the product info
    if (make && model && year && engineType) {
        // Assume fetchProductInfo is the function that fetches and displays the product info
        fetchSKUs(make, model, year, engineType);
    }

    // getting value of carEndText and carEndImageUrl
    function getCarEnd(carEndValue) {
        // Define car end images and text based on car_end value
        let carEndImageUrl;
        let carEndText;

        switch (carEndValue) {
            case '99':
                carEndText = 'Both';
                carEndImageUrl = 'https://www.ebcbrakeshop.co.uk/sites/EBC-Brakes/fitment-Both-axel.svg';
                break;
            case '0':
                carEndText = 'Front';
                carEndImageUrl = 'https://www.ebcbrakeshop.co.uk/sites/EBC-Brakes/fitment-Front-axel.svg';
                break;
            case '1':
                carEndText = 'Rear';
                carEndImageUrl = 'https://www.ebcbrakeshop.co.uk/sites/EBC-Brakes/fitment-Rear-axel.svg';
                break;
            default:
                carEndText = 'Not Specified';
                carEndImageUrl = '';
                break;
        }

        return { carEndText, carEndImageUrl };
    }

    // getting included product data based on sku(included)
    async function includedData(includedValue) {

        // console.log('included sku ', includedValue);

        const response1 = includedValue.length >= 1 ? await fetch(`http://localhost:3000/api/products/bySku?sku=${includedValue}`) : '';
        const incProduct = includedValue.length >= 1 ? await response1.json() : '';

        let includedTitle = '';
        if (incProduct.length >= 1) {
            incProduct.forEach((element) => {
                includedTitle += `<li>${element.productTitle}</li>`;
            });
        }

        let includedRow = '';
        if (incProduct.length >= 1) {
            incProduct.forEach((element) => {
                includedRow += `<div class="ebc-box-two-main" bis_skin_checked="1">
                                  <div class="ebc-box-two" bis_skin_checked="1">
                                    <p><strong>${element.variantSku}</strong></p>
                                    <p><strong>${element.productTitle}</strong></p>
                                  </div>
                                  <img src="${element.productImageUrl}" alt="EBC Brakes Pad and Disc Full vehicle Kit PD40K2617" class="ebc-box-two-img">
                                </div>`;
            });
        }
        return { includedTitle, includedRow };
    }

    function updateProductInfoHTML(sku, products, carEndText, carEndImageUrl, includedTitle, includedRow) {

        const productHTML = `<div class="product-div-inner" bis_skin_checked="1">
          <div class="product-sku-row" bis_skin_checked="1">
              <div class="product-sku-css" bis_skin_checked="1">${sku}</div>
              <div bis_skin_checked="1">
                  <h3>
                      <a
                          href="https://jgw-new.myshopify.com/products/${products.shopifyProducts[0].productHandle}"
                          class="product-title-css"
                      >
                          ${products.shopifyProducts[0].productTitle}
                      </a>
                  </h3>
              </div>
          </div>
          <div class="product-sku-img-row" bis_skin_checked="1">
              <div class="product-sku-img-column" bis_skin_checked="1">
                  <img
                      src="${products.shopifyProducts[0].productImageUrl}"
                      alt="EBC Brakes Pad and Disc Full vehicle Kit PD40K2617"
                  >
              </div>
              <div class="product-sku-content-column" bis_skin_checked="1">
                  <p><strong>Car Fitment</strong></p>
                  <p>Make: ${products.csvProducts[0].make}</p>
                  <p>Model: ${products.csvProducts[0].model}</p>
                  <p>Engine: ${products.csvProducts[0].engineType}</p>
                  <p>BHP: ${products.csvProducts[0].bhp}</p>
                  <p>Year From: ${products.csvProducts[0].year[0]}</p>
                  <p>Year To: ${products.csvProducts[0].year[products.csvProducts[0].year.length - 1]}</p>
                  <p>Caliper: ${products.csvProducts[0].caliper}</p>
                  <p>EBC Disc Diameter: ${products.csvProducts[0].discDiameter}</p>
                  <p>Car End:<strong> ${carEndText}</strong></p>
                  <p>Product Tag : <strong>${products.shopifyProducts[0].productTag}</strong></p>
                  <p>
                      <img
                          src=${carEndImageUrl}
                          alt="Both"
                          style="width:200px;"
                          class="car-img"
                      >
                  </p>
              </div>
              <div class="what-include-box" bis_skin_checked="1">
                  <p><strong>What's Included</strong></p>
                  <ul id="included-product">
                      ${includedTitle}
                  </ul>
              </div>
          </div>
          <div class="add-to-card-btn-box" bis_skin_checked="1">
              <p class="product-price-css">Price: ${products.shopifyProducts[0].variantPrice}</p>
              <button class="add-to-cart-btn">
                  <a href="https://jgw-new.myshopify.com/cart/add?id=${products.shopifyProducts[0].variantId}" target="_blank">Add to cart</a>
              </button>
          </div>
          <div id="" class="what-included" bis_skin_checked="1">
              ${includedRow}
          </div>
      </div>`;

        return productHTML;
    }

    const filterGroups = document.querySelectorAll('.productTagList');
    let activeFilters = {};

    // Initialize activeFilters with empty sets for each group
    filterGroups.forEach((group, index) => {
        activeFilters[`group${index}`] = new Set();
    });

    function applyFilters() {
        productInfo.innerHTML = ''; // Clear previous results

        let filteredProducts = domProducts.filter(product => {
            let tags = product.shopifyProducts[0].productTag.toLowerCase();
            return Object.values(activeFilters).every(filters => {
                if (filters.size === 0) return true; // No filter selected in this group
                return Array.from(filters).some(filter => tags.includes(filter));
            });
        });

        if (filteredProducts.length) {
            filteredProducts.forEach(async (product) => {
                let sku = product.shopifyProducts[0].variantSku;
                const { includedRow, includedTitle } = await includedData(product.csvProducts[0].included);
                const { carEndText, carEndImageUrl } = getCarEnd(product.csvProducts[0].carEnd);
                productInfo.innerHTML += updateProductInfoHTML(sku, product, carEndText, carEndImageUrl, includedTitle, includedRow);
            });
        } else {
            productInfo.innerHTML = '';
        }
    }

    document.querySelectorAll('.productTagList').forEach((group, index) => {
        group.addEventListener('change', (event) => {
            if (event.target.matches('input[type="checkbox"]')) {
                const filterValue = event.target.value.toLowerCase();
                const groupKey = `group${index}`;

                if (event.target.checked) {
                    activeFilters[groupKey].add(filterValue);
                } else {
                    activeFilters[groupKey].delete(filterValue);
                }

                applyFilters();
            }
        });
    });

    applyFilters();

});