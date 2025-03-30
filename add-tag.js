const fs = require('fs');

// Path to the JSON file
const filePath = '/Users/jellibean/Documents/Github/Reach-Kart/rk-src/setup-data/books.json';

// Read the JSON file
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    try {
        // Parse the JSON data
        const books = JSON.parse(data);

        // Add "books" to the tags field if not already present
        const updatedBooks = books.map(book => {
            if (!book.tags.includes('books')) {
                book.tags.push('books');
            }
            return book;
        });

        // Write the updated JSON back to the file
        fs.writeFile(filePath, JSON.stringify(updatedBooks, null, 4), 'utf8', err => {
            if (err) {
                console.error('Error writing the file:', err);
                return;
            }
            console.log('Successfully added "books" to the tags field.');
        });
    } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
    }
});
