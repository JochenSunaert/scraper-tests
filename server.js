import express from 'express';
import puppeteer from 'puppeteer';
import { createObjectCsvWriter } from 'csv-writer'; // Import the CSV writer

const app = express();
const port = 3000;

app.use(express.static('public')); // Serve static HTML files

// Route to handle scraping
app.get('/scrape', async (req, res) => {
  const searchQuery = req.query.query;

  if (!searchQuery) {
    return res.status(400).send('No search query provided.');
  }

  // Construct the URL dynamically based on the query input
  const baseUrl = 'https://www.torfs.be/nl/zoekresultaten?q=';
  const url = `${baseUrl}${encodeURIComponent(searchQuery)}&lang=nl_BE`;

  try {
    // Launch Puppeteer in non-headless mode and set a smaller viewport size
    const browser = await puppeteer.launch({ headless: true, defaultViewport: null });
    const page = await browser.newPage();

    // Set a smaller viewport size
    await page.setViewport({ width: 400, height: 800 });

    // Navigate to the dynamically constructed URL
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Click the "Accept Cookies" button
    await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 10000 });
    await page.click('#onetrust-accept-btn-handler');

    let allProducts = [];
    let hasMoreItems = true;

    // Loop to click the "More" button until no more products are found
    while (hasMoreItems) {
      try {
        const moreButtonVisible = await page.$('.px-5');
        if (moreButtonVisible) {
          console.log('Found "More" button, clicking...');
          await moreButtonVisible.click(); // Click the "More" button
          console.log('Waiting for products to load...');
          await new Promise(resolve => setTimeout(resolve, 1000)); // Adjust the timeout if necessary
        } else {
          console.log('No "More" button found.');
          hasMoreItems = false;
        }
      } catch (e) {
        console.log('Error while waiting for "More" button:', e);
        console.log('No more products to load.');
        hasMoreItems = false;
      }
    }

    // After loading all the pages, scrape all the products
    const products = await page.$$eval('.product-tile', items =>
      items.map(item => {
        const name = item.querySelector('.content__name a')?.textContent.trim() || 'Unknown Name';
        const brand = item.querySelector('.brand a')?.textContent.trim() || 'Unknown Brand';
        const link = item.querySelector('.js-product-tile-link')?.getAttribute('href') || '';
        const image = item.querySelector('.tile-image')?.getAttribute('data-src') 
          || item.querySelector('.tile-image')?.getAttribute('src') 
          || "";
        const productPage = "https://www.torfs.be" + link;
    
        // Add price extraction
        const price = item.querySelector('.price__sales .value')?.textContent.trim() || 'Price not available';
    
        return { name, brand, image, productPage, link, price }; // Add price to the returned object
      })
    );
    

    allProducts = allProducts.concat(products);

    // Log the total number of products scraped (for debugging)
    console.log(`Total products scraped: ${allProducts.length}`);

    await browser.close();

    // Save the scraped products to CSV when requested
    const csvWriter = createObjectCsvWriter({
      path: `scraped-products-${Date.now()}.csv`, // Dynamically name the file
      header: [
        { id: 'name', title: 'Name' },
        { id: 'brand', title: 'Brand' },
        { id: 'image', title: 'Image URL' },
        { id: 'productPage', title: 'Product Page' },
      ],
    });

    await csvWriter.writeRecords(allProducts);
    console.log('Data successfully written to CSV');

    res.json(allProducts);
  } catch (error) {
    console.error('Error during scraping:', error);
    res.status(500).send('Error during scraping');
  }
});

// Route to download CSV
app.get('/download-csv', (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).send('No query specified.');
  }

  const fileName = `scraped-products-${Date.now()}.csv`;

  // Serve the file for download
  res.download(`./scraped-products-${fileName}`, fileName, (err) => {
    if (err) {
      console.log('Error in file download:', err);
      res.status(500).send('Error downloading the file');
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
