CREATE DATABASE IF NOT EXISTS `TEST648`;
USE `TEST648`;

CREATE TABLE County
(
    County_ID   INTEGER PRIMARY KEY AUTO_INCREMENT,
    County_Name VARCHAR(255)  NOT NULL,
    Latitude    DECIMAL(9, 6) NOT NULL,
    Longitude   DECIMAL(9, 6) NOT NULL,
    Image_Path  VARCHAR(255)  NOT NULL
);

CREATE TABLE User
(
    User_ID       VARCHAR(55) PRIMARY KEY AUTO_INCREMENT,
    Password      VARCHAR(255)                            NOT NULL,
    Email_Address VARCHAR(55) UNIQUE                      NOT NULL,
    Phone_Number  BIGINT,
    Role          TEXT CHECK (Role IN ('P1', 'P2', 'P3')) NOT NULL,
    County_ID     INTEGER,
    Verified      INTEGER                                 NOT NULL DEFAULT 0, -- 0 is false, 1 is true
    FOREIGN KEY (County_ID) REFERENCES County (County_ID)
);

CREATE TABLE Department
(
    Department_ID   INTEGER PRIMARY KEY AUTO_INCREMENT,
    Department_Name TEXT CHECK (Department_Name
        IN ('Sheriff/Security', 'Weather', 'Health', 'Fire')) NOT NULL,
    County_ID       INTEGER,
    FOREIGN KEY (County_ID) REFERENCES County (County_ID)
);

CREATE TABLE Metrics
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

CREATE TABLE Alert
(
    Alert_ID      INTEGER PRIMARY KEY AUTO_INCREMENT,
    Metric_ID     INTEGER,
    Alert_Message TEXT     NOT NULL,
    Triggered_By  INTEGER,
    Timestamp     DATETIME NOT NULL,
    FOREIGN KEY (Metric_ID) REFERENCES Metrics (Metric_ID),
    FOREIGN KEY (Triggered_By) REFERENCES User (User_ID)
);

CREATE TABLE User_Alerts
(
    User_ID  INTEGER,
    Alert_ID INTEGER,
    PRIMARY KEY (User_ID, Alert_ID),
    FOREIGN KEY (User_ID) REFERENCES User (User_ID),
    FOREIGN KEY (Alert_ID) REFERENCES Alert (Alert_ID)
);

INSERT INTO County (County_Name, Latitude, Longitude, Image_Path)
VALUES ('CountyA', 37.058235, 58.27567, 'sc.png'),
       ('CountyB', 35.77259, 119.41931, 'sc.png'),
       ('CountyC', 46.730, -3.935242, 'sc.png');


INSERT INTO User (Password, Email_Address, Phone_Number, Role, County_ID, Verified)
VALUES ('password123', 'user1@gmail.com', 1234567890, 'P1', 1, 1),
       ('password456', 'user2@gmail.com', 1234567891, 'P2', 2, 0),
       ('password789', 'user3@gmail.com', 1234567892, 'P3', 3, 1);


INSERT INTO Department (Department_Name, County_ID)
VALUES ('Sheriff/Security', 1),
       ('Weather', 1),
       ('Health', 2),
       ('Fire', 3);

INSERT INTO Metrics (Department_ID, County_ID, Metric_Type, Metric_Value, Timestamp)
VALUES (1, 1, 'SecurityMetric1', 95.50, NOW()),
       (2, 1, 'WeatherMetric1', 72.90, NOW()),
       (3, 2, 'HealthMetric1', 89.00, NOW()),
       (4, 3, 'FireMetric1', 45.38, NOW());

INSERT INTO Alert (Metric_ID, Alert_Message, Triggered_By, Timestamp)
VALUES (1, 'Security alert for CountyA', 1, NOW()),
       (2, 'Weather alert for CountyA', 2, NOW()),
       (3, 'Health alert for CountyB', 3, NOW()),
       (4, 'Fire alert for CountyC', 1, NOW());

INSERT INTO User_Alerts (User_ID, Alert_ID)
VALUES (1, 1),
       (1, 2),
       (2, 3),
       (3, 4),
       (1, 4);
