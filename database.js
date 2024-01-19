const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '1234',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function initializeDatabase() {
    const connection = await pool.getConnection();

    try {
        // Create the database if it does not exist
        await connection.query('CREATE DATABASE IF NOT EXISTS TEST648');
        await connection.query('USE TEST648');

        // Create County table if it does not exist
        await connection.query(`
            CREATE TABLE IF NOT EXISTS County
            (
                County_ID   INTEGER PRIMARY KEY AUTO_INCREMENT,
                County_Name VARCHAR(255)  NOT NULL,
                Latitude    DECIMAL(9, 6) NOT NULL,
                Longitude   DECIMAL(9, 6) NOT NULL,
                Image_Path  VARCHAR(255)  NOT NULL
            );
        `);

        // Insert data into County table if it is empty
        const [countyRows] = await connection.query("SELECT * FROM County");
        if (countyRows.length === 0) {
            await connection.query(`
                INSERT INTO County (County_Name, Latitude, Longitude, Image_Path)
                VALUES ('CountyA', 37.058235, 58.27567, './SantaClaraCountyEmblem (1).png'),
                       ('CountyB', 35.77259, 119.41931, './LosAngelesCountyEmblem.png'),
                       ('CountyC', 46.730, -3.935242, './AlamedaCountyEmblem.png');
            `);
        }

        // Create User table if it does not exist
        await connection.query(`
            CREATE TABLE IF NOT EXISTS User
            (
                User_ID       VARCHAR(55) PRIMARY KEY AUTO_INCREMENT,
                Password      VARCHAR(255)                            NOT NULL,
                Email_Address VARCHAR(55) UNIQUE                      NOT NULL,
                Phone_Number  INTEGER,
                Role          TEXT CHECK (Role IN ('P1', 'P2', 'P3')) NOT NULL,
                County_ID     INTEGER,
                Verified      INTEGER                                 NOT NULL DEFAULT 0,
                FOREIGN KEY (County_ID) REFERENCES County (County_ID)
            );
        `);

        // Insert data into User table if it is empty
        const [userRows] = await connection.query("SELECT * FROM User");
        if (userRows.length === 0) {
            await connection.query(`
                INSERT INTO User (Password, Email_Address, Phone_Number, Role, County_ID, Verified)
                VALUES ('password123', 'user1@gmail.com', 1234567890, 'P1', 1, 1),
                       ('password456', 'user2@gmail.com', 1234567891, 'P2', 2, 0),
                       ('password789', 'user3@gmail.com', 1234567892, 'P3', 3, 1);
            `);
        }

        // Create Department table if it does not exist
        await connection.query(`
            CREATE TABLE IF NOT EXISTS Department
            (
                Department_ID   INTEGER PRIMARY KEY AUTO_INCREMENT,
                Department_Name TEXT CHECK (Department_Name IN ('Sheriff/Security', 'Weather', 'Health', 'Fire')) NOT NULL,
                County_ID       INTEGER,
                FOREIGN KEY (County_ID) REFERENCES County (County_ID)
            );
        `);

        // Insert data into Department table if it is empty
        const [departmentRows] = await connection.query("SELECT * FROM Department");
        if (departmentRows.length === 0) {
            await connection.query(`
                INSERT INTO Department (Department_Name, County_ID)
                VALUES ('Sheriff/Security', 1),
                       ('Weather', 1),
                       ('Health', 2),
                       ('Fire', 3);
            `);
        }

        // Create Metrics table if it does not exist
        await connection.query(`
            CREATE TABLE IF NOT EXISTS Metrics
            (
                Metric_ID     INTEGER PRIMARY KEY AUTO_INCREMENT,
                Department_ID INTEGER,
                County_ID     INTEGER,
                Metric_Type   VARCHAR(255)   NOT NULL,
                Metric_Value  DECIMAL(10, 2) NOT NULL,
                Timestamp     DATETIME       NOT NULL,
                FOREIGN KEY (Department_ID) REFERENCES Department (Department_ID),
                FOREIGN KEY (County_ID) REFERENCES County (County_ID)
            );
        `);

        // Insert data into Metrics table if it is empty
        const [metricsRows] = await connection.query("SELECT * FROM Metrics");
        if (metricsRows.length === 0) {
            await connection.query(`
                INSERT INTO Metrics (Department_ID, County_ID, Metric_Type, Metric_Value, Timestamp)
                VALUES (1, 1, 'SecurityMetric1', 95.50, NOW()),
                       (2, 1, 'WeatherMetric1', 72.90, NOW()),
                       (3, 2, 'HealthMetric1', 89.00, NOW()),
                       (4, 3, 'FireMetric1', 45.38, NOW());
            `);
        }

        // Create Alert table if it does not exist
        await connection.query(`
            CREATE TABLE IF NOT EXISTS Alert
            (
                Alert_ID      INTEGER PRIMARY KEY AUTO_INCREMENT,
                Metric_ID     INTEGER,
                Alert_Message TEXT     NOT NULL,
                Triggered_By  INTEGER,
                Timestamp     DATETIME NOT NULL,
                FOREIGN KEY (Metric_ID) REFERENCES Metrics (Metric_ID),
                FOREIGN KEY (Triggered_By) REFERENCES User (User_ID)
            );
        `);

        // Alter Alert table to add County_ID and Department_ID columns
                await connection.query(`
            ALTER TABLE Alert
            ADD COLUMN County_ID INTEGER,
            ADD FOREIGN KEY (County_ID) REFERENCES County(County_ID);
   
        `);

        // Insert data into Alert table if it is empty
        const [alertRows] = await connection.query("SELECT * FROM Alert");
        if (alertRows.length === 0) {
            await connection.query(`
        INSERT INTO Alert (Metric_ID, Alert_Message, Triggered_By, Timestamp, County_ID)
        VALUES (1, 'Security alert for CountyA', 1, NOW(), 4),
               (2, 'Weather alert for CountyA', 2, NOW(), 4),
               (3, 'Health alert for CountyB', 3, NOW(), 5),
               (4, 'Fire alert for CountyC', 1, NOW(), 6);
    `);
        }


        // Create User_Alerts table if it does not exist
        await connection.query(`
            CREATE TABLE IF NOT EXISTS User_Alerts
            (
                User_ID  INTEGER,
                Alert_ID INTEGER,
                PRIMARY KEY (User_ID, Alert_ID),
                FOREIGN KEY (User_ID) REFERENCES User (User_ID),
                FOREIGN KEY (Alert_ID) REFERENCES Alert (Alert_ID)
            );
        `);

        // Insert data into User_Alerts table if it is empty
        const [userAlertsRows] = await connection.query("SELECT * FROM User_Alerts");
        if (userAlertsRows.length === 0) {
            await connection.query(`
                INSERT INTO User_Alerts (User_ID, Alert_ID)
                VALUES (1, 1),
                       (1, 2),
                       (2, 3),
                       (3, 4),
                       (1, 4);
            `);
        }

    } catch (error) {
        console.error('Error initializing the database', error);
    } finally {
        connection.release();
    }
}


initializeDatabase();

module.exports = pool;