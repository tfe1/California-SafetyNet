const mysql = require('mysql2/promise');
const fs = require("fs");

const mysqlConfig = JSON.parse(fs.readFileSync("database_config.json"));

async function searchDatabase(searchTerm, searchParam) {
    const connection = await mysql.createConnection(mysqlConfig);
    try {
        let query;
        let values;

        switch (searchParam) {
            case 'county':
                query = 'SELECT * FROM County WHERE County_Name LIKE ?';
                values = [`%${searchTerm}%`];
                break;
            case 'metrics':
                query = 'SELECT * FROM Metrics WHERE Metric_Type LIKE ?';
                values = [`%${searchTerm}%`];
                break;
            default:
                throw new Error(`Unknown search parameter: ${searchParam}`);
        }

        console.log(query); // For debugging

        const [rows, fields] = await connection.execute(query, values);
        return rows;
    } catch (error) {
        console.error('Error searching database:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

const searchTerm = process.argv[2]; // Retrieve search term from command line arguments
const searchParam = process.argv[3]; // Retrieve search parameter from command line arguments

searchDatabase(searchTerm, searchParam)
    .then((results) => {
        console.log(results);
    })
    .catch((error) => {
        console.error('Error occurred:', error);
    });

module.exports = searchDatabase;
