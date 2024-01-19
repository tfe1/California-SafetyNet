const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const admin = require("firebase-admin");
const firebase = require("firebase/app")
const firebaseAuth = require("firebase/auth")

const serviceAccount = require("../../firebase-key.json");

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });
const config = {
    apiKey: "AIzaSyC_yH2wBgmWrpx0I7MPoQ51uwK6id-0JM0",
    authDomain: "california-safetynet.firebaseapp.com",
    projectId:"california-safetynet",
}
const fbapp = firebase.initializeApp(config)
const auth = firebaseAuth.getAuth(fbapp)

//firebase.initializeApp({
//    credential: admin.credential.cert(serviceAccount)
//})
/*admin.auth().signInWithEmailAndPassword(email, password)
    .then(userCredential => {
        // User is authenticated
        const user = userCredential.user;
        console.log(`User ${user.email} is authenticated`);
    })
    .catch(error => {
        // Authentication failed
        console.error('Authentication failed:', error);
    });


admin.auth().createUser({
    email: 'user@example.com',
    emailVerified: false,
    phoneNumber: '+11234567890',
    password: 'secretPassword',
    displayName: 'John Doe',
    photoURL: 'http://www.example.com/12345678/photo.png',
    disabled: false,
}).then((userRecord) => {
    // See the UserRecord reference doc for the contents of userRecord.
    console.log('Successfully created new user:', userRecord.uid);
})
    .catch((error) => {
        console.log('Error creating new user:', error);
    });

*/

    const mysqlConfig = JSON.parse(fs.readFileSync('database_config.json'));

let connection; // connection is now a global variable

async function checkConnection() {
    try {
        await connection.execute('SELECT 1');
        console.log('MySQL connection is up.');
        return true;
    } catch (error) {
        console.error('MySQL connection is down:', error);
        return false;
    }
}

async function startServer() {
    try {
        connection = await mysql.createConnection(mysqlConfig);
        console.log('Connected to MySQL');

        // Check if the connection is up
        if (!(await checkConnection())) {
            throw new Error('MySQL connection failed');
        }

        app.get('/api/countyById', async (req, res) => {
            const countyId = req.query.countyID;
            const [rows, fields] = await connection.execute('SELECT * FROM County WHERE County_ID LIKE ?', [`%${countyId}%`]);
            res.status(200).json(rows);
        });

        app.get('/api/county', async (req, res) => {
            const searchTerm = req.query.searchTerm;
            const searchParam = req.query.searchParam;
            let searchParamID
            switch (searchParam){
                case "health":
                    searchParamID = 3
                    break;
                case "weather":
                    searchParamID = 2
                    break;
                case "fire":
                    searchParamID = 4
                    break;
            }
            console.log(req.query);
            try {
                const [rows, fields] = await connection.execute('SELECT * FROM County WHERE County_Name LIKE ?', [`%${searchTerm}%`]);
                const County_ID = rows[0].County_ID
                let param1
                let param2
                if (searchParamID){
                    param1 = 'SELECT * FROM Alert WHERE County_ID LIKE ? AND Alert_ID LIKE ?'
                    param2 = [`${County_ID}`, `${searchParamID}`]
                } else{
                    param1 = 'SELECT * FROM Alert WHERE County_ID LIKE ?'
                    param2 = [`${County_ID}`]
                }
                const [rows2, fields2] = await connection.execute(param1, param2);



                const formattedAlerts = rows2.map((alert) => {
                    const newAlert = { ...alert }
                    switch (alert.Metric_ID){
                        case "3":
                            newAlert.Alert_Type = "Weather"
                            break;
                        case "2":
                            newAlert.Alert_Type = "Health"
                            break;
                        case "4":
                            newAlert.Alert_Type = "Fire"
                            break;
                        default:
                            newAlert.Alert_Type = "General"
                            break;
                    }
                    return newAlert
                })

                const response = {
                    county_information:rows[0],
                    alerts: formattedAlerts,
                }
                res.status(200).json(response);
            }catch (error) {
                console.error('Error fetching county:', error);
                res.status(500).json({error: 'Failed to fetch county'});
            }
        });

        app.get('/api/alert', async (req, res) => {
            const searchTerm = req.query.searchTerm;
            try {
                const [rows, fields] = await connection.execute('SELECT * FROM Alert WHERE Alert_Message LIKE ?', [`%${searchTerm}%`]);
                console.log(rows);
                res.status(200).json(rows);
            } catch (error) {
                console.error('Error fetching alert:', error);
                res.status(500).json({error: 'Failed to fetch alert'});
            }
        });

// This sets up a POST route at '/api/alert'. When a POST request is made to this route, the following callback function will be executed.
        app.post('/api/alert', async (req, res) => {
            const alert = req.body.alert;
            const Timestamp = new Date(); // Get the current date and time
            try {
                const [result] = await connection.execute(
                    'INSERT INTO Alert (Metric_ID, Alert_Message, Triggered_By, Timestamp, County_ID) VALUES (?,?,?,?,?)',
                    [alert.Metric_ID, alert.Alert_Message, alert.Triggered_By, Timestamp, alert.County_ID]
                );
                res.status(200).json(result);
            } catch (error) {
                console.error('Error inserting alert:', error);
                res.status(500).json({ error: 'Failed to insert alert' });
            }
        });

        app.post('/api/submit-registration', async (req, res) => {
            const {email, password, role, county} = req.body
            console.log(req.body)
            const userRecord = await firebaseAuth.createUserWithEmailAndPassword(auth, email, password).catch((error) => {
                console.log('Error creating new user:', error);
                res.status(401).json(error);
            });
            try {
                const [CountyID] = await connection.execute(
                'SELECT County_ID FROM test648.county WHERE County_Name LIKE ?',[county]);
                const [result] = await connection.execute(
                    'INSERT INTO User (User_ID, Password, Email_Address, Phone_Number, Role, County_ID, Verified) VALUES (?,?,?,?,?,?,?)',
                    [userRecord.user.uid, userRecord.user.reloadUserInfo.passwordHash, email, 1234, role,CountyID[0].County_ID, 1]
                );
                res.status(200).json({...result, ...userRecord})
            } catch (error) {
                console.error('Error inserting alert:', error);
                res.status(500).json({ error: 'Failed to insert alert' });
            }
        });

        app.post('/api/user', async (req, res) => {

            const { email, password } = req.body
            console.log(req.body);

            const userCredential = await firebaseAuth.signInWithEmailAndPassword(auth, email, password).catch(error => {
                res.status(401).json(error);
            });

            try {
                const [rows, fields] = await connection.execute('SELECT * FROM User WHERE User_ID LIKE ?', [`${userCredential.user.uid}`]);
                console.log(rows);

                res.status(200).json({ role: rows[0].Role, county: rows[0].County_ID, ...userCredential });

            } catch (error) {
                console.error('Error fetching alert:', error);
                res.status(500).json({ error: 'Failed to fetch alert' });
            }
        });

        app.get('/api/department', async (req, res) => {
            const searchTerm = req.query.searchTerm;
            try {
                const [rows, fields] = await connection.execute('SELECT * FROM Department WHERE Department_Name LIKE ?', [`%${searchTerm}%`]);
                res.status(200).json(rows);
            } catch (error) {
                console.error('Error fetching department:', error);
                res.status(500).json({error: 'Failed to fetch department'});
            }
        });

        app.get('/api/metrics', async (req, res) => {
            const searchTerm = req.query.searchTerm;
            try {
                const [rows, fields] = await connection.execute('SELECT * FROM Metrics WHERE Metric_Type LIKE ?', [`%${searchTerm}%`]);
                res.status(200).json(rows);
            } catch (error) {
                console.error('Error fetching metrics:', error);
                res.status(500).json({error: 'Failed to fetch metrics'});
            }
        });

        app.get('/api/user_alerts', async (req, res) => {
            const searchTerm = req.query.searchTerm;
            try {
                const [rows, fields] = await connection.execute('SELECT * FROM User_Alerts');
                res.status(200).json(rows);
            } catch (error) {
                console.error('Error fetching user alerts:', error);
                res.status(500).json({error: 'Failed to fetch user alerts'});
            }
        });

        // Default route handler for the root path
        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'index.html'));
        });

        const port = 3000;
        const server = app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });

        // Function to handle server shutdown
        const handleShutdown = async () => {
            console.log('Server shutting down...');

            // Close server
            server.close(async (err) => {
                if (err) {
                    console.error('Server shutdown error:', err);
                }
                // Close MySQL connection if it's still up
                if (connection) {
                    try {
                        await connection.end();
                        console.log('MySQL connection closed.');
                    } catch (error) {
                        console.error('Error closing MySQL connection:', error);
                    }
                }
                process.exit(err ? 1 : 0);
            });
        };

        // Capture termination and interrupt signals
        process.on('SIGTERM', handleShutdown);
        process.on('SIGINT', handleShutdown);

    } catch (error) {
        console.error('Failed to start the server:', error);
        if (connection) {
            try {
                await connection.end();
            } catch (error) {
                console.error('Error closing MySQL connection:', error);
            }
        }
        process.exit(1);
    }
}

startServer();