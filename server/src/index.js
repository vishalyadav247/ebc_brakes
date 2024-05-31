const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const cors = require("cors");
const axios = require('axios');
const { LogInCollection, Product, CsvProduct } = require("./mongo");

app.use(cors());
const port = process.env.PORT || 3000
app.use(express.json());
app.use(express.urlencoded({ extended: false }))

// for csv file upload
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const csv = require('fast-csv');

const tempelatePath = path.join(__dirname, '../templates')
const publicPath = path.join(__dirname, '../public')

app.set('view engine', 'hbs')
app.set('views', tempelatePath)
app.use(express.static(publicPath))

// signup
app.get('/signup', (req, res) => {
    res.render('signup')
})

app.post('/signup', async (req, res) => {
    try {
        const existingUser = await LogInCollection.findOne({ name: req.body.name });
        if (existingUser) {
            return res.send("User details already exist.");
        }
        const newUser = new LogInCollection({
            name: req.body.name,
            password: req.body.password
        });
        await newUser.save();
        return res.status(201).render("home", {
            naming: req.body.name
        });
    } 
    catch (error) {
        console.error("Error:", error);
        return res.status(500).send("Internal server error");
    }
});

// login
app.get('/', (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    try {
        const check = await LogInCollection.findOne({ name: req.body.name })
        if (check.password === req.body.password) {
            res.status(201).render("home", { naming: `${req.body.name}` })
        }
        else {
            res.send("incorrect password")
        }
    }
    catch (e) {
        res.send("wrong details")
    }
})

// shopify products
app.get('/products', async (req, res) => {
    res.render('products')
});

// Save shopify products to db
app.post('/save-products', async (req, res) => {
    try {
        const apiKey = '';
        const password = '';
        const apiUrl = '';

        const response = await axios.get(apiUrl, {
            auth: {
                username: apiKey,
                password: password
            }
        });

        const productsData = response.data.products;

        await Promise.all(productsData.map(async (productData) => {
            const product = new Product({
                productTitle: productData.title,
                variantId: productData.variants[0].id,
                variantSku: productData.variants[0].sku,
                variantPrice: productData.variants[0].price,
                productHandle: productData.handle,
                productImageUrl: productData.image.src,
                productTag: productData.tags
            });
            await product.save();
        }));
        res.json({ message: 'All products Saved successfully.' });
    }
    catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data from the API' });
    }
});

// delete shopify products from db
app.post('/delete-all-products', async (req, res) => {
    try {
        await Product.deleteMany({});
        res.json({ message: 'All products deleted successfully.' });
    } catch (error) {
        console.error('Error deleting products:', error);
        res.status(500).json({ error: 'Failed to delete products from the database' });
    }
});

// csv file upload
app.get('/csv', async (req, res) => {
    res.render('csvData')
});

function normalizeKeys(data) {
    let normalizedData = {};
    Object.keys(data).forEach(key => {
        let cleanKey = key.replace(/^['"]+|['"]+$/g, '').trim(); // Remove quotes and trim whitespace
        normalizedData[cleanKey] = data[key].trim();
    });
    return normalizedData;
}

function getYearsInRange(startYear, endYear) {
    const years = [];
    for (let year = parseInt(startYear); year <= parseInt(endYear); year++) {
        years.push(year.toString());
    }
    return years;
}

const BATCH_SIZE = 10000; // Define how many records per batch

// function to save csv product to db in batch
function processCsvFile(filePath) {
    let batch = []; // Array to hold the batch
    let batchNumber = 0;

    const stream = fs.createReadStream(filePath);
    const csvStream = csv.parse({ headers: true })
    .transform(data => {
        const transformed = {
            make: data.make.trim(),
            model: data.model.trim(),
            year: getYearsInRange(data.start_year, data.end_year),
            engineType: `${data.engine.trim()}`,
            sku: data.sku.trim(),
            bhp: data.bhp.trim(),
            caliper: data.caliper.trim(),
            discDiameter: data.disc_diameter.trim(),
            included: data.Included ? data.Included.split(',').map(item => item.trim()) : [],
            carEnd: data.car_end.trim(),
        };
        return transformed;
    })
    
        .on('error', error => console.error('Error reading CSV:', error))
        .on('data', async (row) => {
            batch.push(row);

            if (batch.length >= BATCH_SIZE) {
                csvStream.pause(); // Pause the stream to manage flow control
                batchNumber++;
                // Asynchronously insert the batch
                insertBatch(batch, batchNumber).then(() => {
                    batch = []; // Clear the batch after successful insertion
                    csvStream.resume(); // Resume the stream
                }).catch(error => {
                    console.error(`Error inserting batch ${batchNumber}:`, error);
                    csvStream.resume(); // Optionally continue processing after a failed insert
                });
            }
        })
        .on('end', () => {
            // Handle the last batch
            if (batch.length > 0) {
                batchNumber++;
                insertBatch(batch, batchNumber).then(() => {
                    console.log(`Final batch ${batchNumber} inserted.`);
                }).catch(error => {
                    console.error(`Error inserting final batch ${batchNumber}:`, error);
                });
            }
            console.log('CSV file has been processed successfully.');
        });

    stream.pipe(csvStream);
}

async function insertBatch(batch, batchNumber) {
    console.log(`Inserting batch ${batchNumber} with ${batch.length} records.`);
    await CsvProduct.insertMany(batch);
    console.log(`Batch ${batchNumber} inserted successfully.`);
}

// delete csv products from db
app.post('/delete-csv-products', async (req, res) => {
    try {
        await CsvProduct.deleteMany({});
        res.json({ message: 'All products deleted successfully.' });
    } catch (error) {
        console.error('Error deleting products:', error);
        res.status(500).json({ error: 'Failed to delete products from the database' });
    }
});

app.post('/uploadCsv', upload.single('csvFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    try {
        // Assume a function processCsvFile that processes your CSV file
        await processCsvFile(req.file.path);
        res.send('File uploaded and processed successfully.');
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).send('Error processing file');
    }
});

//fetch csv products
app.get('/api/csvProducts', async (req, res) => {
    try {
        const csvProduct = await CsvProduct.find();
        res.json(csvProduct);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Route to fetch unique make for csv products
app.get('/api/csvProducts/makes', async (req, res) => {
    try {
        const uniqueMakes = await CsvProduct.aggregate([
            { $group: { _id: "$make" } }, // Group documents by "make" field
            { $project: { _id: 0, make: "$_id" } } // Project the "make" field without _id
        ]);
        res.json(uniqueMakes);
    } catch (error) {
        console.error('Error fetching unique makes:', error);
        res.status(500).json({ error: 'Failed to fetch unique makes' });
    }
});

// Route to fetch unique models for a selected make
app.get('/api/csvProducts/models', async (req, res) => {
    try {
        // Extract the selected make value from the query parameters
        const selectedMake = req.query.make;

        // Check if the selected make is provided
        if (!selectedMake) {
            return res.status(400).json({ error: 'Selected make is required' });
        }

        // Perform aggregation to get unique models for the selected make
        const uniqueModels = await CsvProduct.aggregate([
            { $match: { make: selectedMake } }, // Filter documents by selected make
            { $group: { _id: "$model" } }, // Group documents by "model" field
            { $project: { _id: 0, model: "$_id" } } // Project the "model" field without _id
        ]);

        res.json(uniqueModels.map(item => item.model));
    } catch (error) {
        console.error('Error fetching unique models:', error);
        res.status(500).json({ error: 'Failed to fetch unique models' });
    }
});

// Route to fetch years for a selected model
app.get('/api/csvProducts/years', async (req, res) => {
    try {
        // Extract the selected model and make values from the query parameters
        const selectedModel = req.query.model;
        const selectedMake = req.query.make;

        // Check if the selected model and make are provided
        if (!selectedModel || !selectedMake) {
            return res.status(400).json({ error: 'Selected model and make are required' });
        }

        // Perform aggregation to get unique years for the selected model
        const years = await CsvProduct.aggregate([
            { $match: { model: selectedModel, make: selectedMake } },
            { $group: { _id: "$year" } }, // Group documents by "startYear" field
            { $project: { _id: 0, year: "$_id" } } // Project the "startYear" field without _id
        ]);

        res.json(years);
    } catch (error) {
        console.error('Error fetching unique start and end years:', error);
        res.status(500).json({ error: 'Failed to fetch unique start and end years' });
    }
});


// route to fetch engine types based on the year
app.get('/api/csvProducts/engineTypes', async (req, res) => {
    try {
        const selectedModel = req.query.model;
        const selectedMake = req.query.make;
        const selectedYear = req.query.year;

        // Check if the engine is provided
        if (!selectedMake || !selectedModel || !selectedYear ) {
            return res.status(400).json({ error: 'year is required' });
        }

        // Perform aggregation to get unique engine types for the selected year
        const uniqueEngineTypes = await CsvProduct.aggregate([
            { $match: { model: selectedModel, make: selectedMake , year: selectedYear } },
            { $group: { _id: "$engineType" } },
            { $project: { _id: 0, engineType: "$_id" } }
        ]);

        res.json(uniqueEngineTypes);
    } catch (error) {
        console.error('Error fetching unique engine types:', error);
        res.status(500).json({ error: 'Failed to fetch unique engine types' });
    }
});

  // route to fetch SKU data based on all dropdown selection
  app.get('/api/csvProducts/skus', async (req, res) => {
    try {
        const selectedModel = req.query.model;
        const selectedMake = req.query.make;
        const selectedYear = req.query.year;
        const selectedEngineType = req.query.engine_type;

        // Check all values are provided
        if (!selectedMake || !selectedModel || !selectedYear || !selectedEngineType) {
            return res.status(400).json({ error: 'Engine type is required' });
        }

        // Perform aggregation to get unique SKUs for the selected dropdown values
        const uniqueSKUs = await CsvProduct.aggregate([
            { $match: { model: selectedModel, make: selectedMake , year: selectedYear , engineType: selectedEngineType } }, // Filter documents by selection
            { $group: { _id: "$sku" } }, // Group documents by "sku" field
            { $project: { _id: 0, sku: "$_id" } } // Project the "sku" field without _id
        ]);

        res.json(uniqueSKUs);
    } catch (error) {
        console.error('Error fetching unique SKUs:', error);
        res.status(500).json({ error: 'Failed to fetch unique SKUs' });
    }
});

// Route to fetch products by SKU
app.get('/api/csvProducts/bySku', async (req, res) => {
    try {
        const sku = req.query.sku;
        const selectedModel = req.query.model;
        const selectedMake = req.query.make;
        const selectedYear = req.query.year;
        const selectedEngineType = req.query.engine_type;
        if (!sku) {
            return res.status(400).json({ error: 'SKU is required' });
        }
        const [products, shopifyProducts] = await Promise.all([
            CsvProduct.find({ sku: sku , model: selectedModel, make: selectedMake , year: selectedYear , engineType: selectedEngineType}),
            Product.find({ variantSku: sku })
        ]);
        const response = {
            csvProducts: products,
            shopifyProducts: shopifyProducts
        };
        if (!products.length && !shopifyProducts.length) {
            return res.status(404).json({ error: 'No products found with the provided SKU' });
        }
        res.json(response);
    } catch (error) {
        console.error('Error fetching products by SKU:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Route to fetch products by SKU
app.get('/api/products/bySku', async (req, res) => {
    try {
        const skus = req.query.sku;

        // Check if SKU query parameter is provided
        if (!skus) {
            return res.status(400).json({ error: 'SKU is required' });
        }

        const skuArray = skus.split(','); // Split the SKU query param into an array

        // Find products by variant SKU using $in to handle multiple SKUs
        const products = await Product.find({ variantSku: { $in: skuArray } });

        // Check if products exist
        if (!products.length) {
            return res.status(404).json({ error: 'No products found with the provided SKU(s)' });
        }

        // Return the products
        res.json(products);
    } catch (error) {
        console.error('Error fetching products by SKU:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// listening port
app.listen(port, () => {
    console.log('port connected');
})