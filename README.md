# Product Scraping Project

This project scrapes product data from the Torfs website based on a user-specified search query. The server uses **Puppeteer** to automate the process of navigating the website, accepting cookies, loading products, and collecting relevant information. The scraped data is then presented to the user through a simple frontend interface and can be downloaded as a CSV file.

## Features

- **Search and Scrape**: Users can input a search query (e.g., product name, brand) to fetch product details from the Torfs website.
- **Product Information**: Scraped product data includes the product name, brand, price, image URL, and product page link.
- **CSV Download**: Once the data is scraped, users can download the results as a CSV file for further analysis.
- **Timer**: A timer shows the elapsed time during the scraping process for better feedback.
  
## Installation

1. Clone the repository:
   ```bash
   git clone JochenSunaert/scraper-tests
   cd scraper-tests
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the server:
   ```bash
   node server.js
   ```

   The server will run at `http://localhost:3000`.

## Usage

1. Open the application in your web browser at `http://localhost:3000`.
2. Enter a search query (e.g., "Vans" or a brand name) in the input field and click the **Ophalen** button to start the scraping process.
3. The scraped products will be displayed on the page with images, names, brands, prices, and links to the product pages.
4. After the scraping is completed, you will have the option to **Download CSV** which will provide you with a CSV file containing all the scraped product details.

## Code Overview

### `server.js`

- This file sets up the **Express.js** server and handles the scraping logic with **Puppeteer**.
- When the user submits a search query, the server fetches data by visiting the Torfs website, accepts cookies, clicks the "More" button to load additional products, and scrapes the relevant details (product name, brand, image, price).
- The data is saved to a CSV file using the `csv-writer` module and returned to the frontend for display.

### `index.html`

- The frontend consists of a basic HTML interface where the user can enter a search query.
- Once the scraping process is completed, the results are displayed dynamically, and a **Download CSV** button is shown to allow users to download the scraped data.
- JavaScript on the page handles interaction, starting the scraping, showing the timer, and downloading the CSV file.

## Dependencies

- **express**: Web framework for Node.js.
- **puppeteer**: Headless browser automation to interact with the Torfs website.
- **csv-writer**: Module to write data into CSV format.
- **Node.js**: JavaScript runtime.

