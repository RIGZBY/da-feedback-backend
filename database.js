"use strict";

const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./feedback.db", (err) => {

    if (err) {

        console.error("Unable to open database:", err.message);

    } else {

        console.log("Connected to feedback.db");

    }

});

function initializeDatabase() {

    db.run(
        `
        CREATE TABLE IF NOT EXISTS feedback (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            fullName TEXT,

            email TEXT,

            dashboard TEXT NOT NULL,

            ui INTEGER,

            ux INTEGER,

            completeness INTEGER,

            accuracy INTEGER,

            accessibility INTEGER,

            suggestion TEXT,

            datasetRows INTEGER,

            columns TEXT,

            submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP

        )
        `,
        (err) => {

            if (err) {

                console.error("Table creation failed:", err.message);

            } else {

                console.log("Feedback table ready.");

            }

        }
    );

}

function saveFeedback(feedback) {

    return new Promise((resolve, reject) => {

        db.run(
            `
            INSERT INTO feedback (

                fullName,
                email,
                dashboard,
                ui,
                ux,
                completeness,
                accuracy,
                accessibility,
                suggestion,
                datasetRows,
                columns

            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [

                feedback.fullName,
                feedback.email,
                feedback.dashboard,
                feedback.ui,
                feedback.ux,
                feedback.completeness,
                feedback.accuracy,
                feedback.accessibility,
                feedback.suggestion,
                feedback.datasetRows,
                JSON.stringify(feedback.columns)

            ],

            function (err) {

                if (err) {

                    reject(err);
                    return;

                }

                resolve({
                    id: this.lastID
                });

            }

        );

    });

}

module.exports = {
    initializeDatabase,
    saveFeedback
};