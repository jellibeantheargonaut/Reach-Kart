// javascript module to interact with MeiliSearch API

const { MeiliSearch } = require('meilisearch');

const client = new MeiliSearch({
    host: 'http://localhost:7700',
    apiKey: 'SuperSecretPasswordForMeilisearch'
});

// Create an index
const index = client.index('movies');

// Add documents to the index
async function addDocument(document) {
    return await index.addDocuments([document]);
}

// Search for documents
async function searchDocument(query) {
    return await index.search(query);
}

// Get all documents
async function getAllDocuments() {
    return await index.getDocuments();
}

// delete a document
async function deleteDocument(id) {
    return await index.deleteDocument(id);
}

// delete all documents
async function deleteAllDocuments() {
    return await index.deleteAllDocuments();
}

module.exports = {
    addDocument,
    searchDocument,
    getAllDocuments,
    deleteDocument,
    deleteAllDocuments
};
