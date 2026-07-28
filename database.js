"use strict";

const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");

const file = "./feedback.json";
const adapter = new JSONFile(file);
const defaultData = { feedback: [] };
const db = new Low(adapter, defaultData);

async function initializeDatabase() {

    await db.read();

    db.data ||= defaultData;

    await db.write();

    console.log("Feedback store ready (feedback.json).");

}

function saveFeedback(feedback) {

    return new Promise(async (resolve, reject) => {

        try {

            await db.read();

            const newEntry = {
                id: db.data.feedback.length + 1,
                fullName: feedback.fullName,
                email: feedback.email,
                dashboard: feedback.dashboard,
                ui: feedback.ui,
                ux: feedback.ux,
                completeness: feedback.completeness,
                accuracy: feedback.accuracy,
                accessibility: feedback.accessibility,
                suggestion: feedback.suggestion,
                datasetRows: feedback.datasetRows,
                columns: JSON.stringify(feedback.columns),
                submittedAt: new Date().toISOString()
            };

            db.data.feedback.push(newEntry);

            await db.write();

            resolve({ id: newEntry.id });

        } catch (err) {

            reject(err);

        }

    });

}

mod