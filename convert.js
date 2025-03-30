const fs = require('fs');

// Load the JSON file
const filePath = '/Users/jellibean/Documents/Github/Reach-Kart/rk-src/setup-data/books.json';
const exchangeRate = 1800; // Example: 1 ETH = 1800 USD

fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    try {
        const products = JSON.parse(data);

        // Convert productPrice to ETH
        const updatedProducts = products.map(product => {
            product.productPriceETH = (product.productPrice / exchangeRate).toFixed(4); // Add ETH price
            return product;
        });

        // Save the updated JSON back to the file
        fs.writeFile(filePath, JSON.stringify(updatedProducts, null, 4), 'utf8', err => {
            if (err) {
                console.error('Error writing the file:', err);
                return;
            }
            console.log('Product prices converted to ETH and saved successfully.');
        });
    } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
    }
});
