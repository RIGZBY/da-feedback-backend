"use strict";

console.log("Starting Feedback Server...");

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const {
    initializeDatabase,
    saveFeedback
} = require("./database");

const app = express();

// Cloud hosts (Render, Railway, Azure App Service, etc.) assign the port
// dynamically via an environment variable. Falls back to 3001 for local dev.
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "5mb" }));

initializeDatabase();

/**
 * Submit feedback to Google Forms
 */
async function submitToGoogleForms(feedback) {

    const form = new URLSearchParams();

    form.append("entry.911567496", feedback.fullName || "");
    form.append("entry.1974072567", feedback.email || "");
    form.append("entry.1547865169", feedback.dashboard || "");
    form.append("entry.470097147", feedback.suggestion || "");

    form.append("entry.2145959113", feedback.ui || "");
    form.append("entry.1243671929", feedback.ux || "");
    form.append("entry.181596178", feedback.completeness || "");
    form.append("entry.1601095705", feedback.accuracy || "");
    form.append("entry.1847836371", feedback.accessibility || "");

    await axios.post(
        "https://docs.google.com/forms/d/e/1FAIpQLSfWsUQEep8NK39vhUnIdxUT1MkGUI7NMi-17t2O96tEpcToIg/formResponse",
        form,
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }
    );
}

/**
 * Health Check
 */
app.get("/health", (_req, res) => {

    res.json({
        status: "ok",
        message: "Feedback server is running."
    });

});

/**
 * Submit Feedback
 */
app.post("/feedback", async (req, res) => {

    try {

        const feedback = req.body;

        if (!feedback.dashboard || feedback.dashboard.trim() === "") {

            return res.status(400).json({
                success: false,
                message: "Dashboard name is required."
            });

        }

        // Save to the shared SQLite database (one file on this server,
        // written to by every user of the visual, from any machine).
        await saveFeedback(feedback);

        // Also mirror the submission into Google Forms.
        let googleOk = true;

        try {
            await submitToGoogleForms(feedback);
        } catch (googleErr) {
            // Don't fail the whole request just because Google Forms
            // rejected/timed out — the response is still safely in
            // the shared database either way.
            googleOk = false;
            console.error("Google Forms submission failed:", googleErr.message);
        }

        console.log("✓ Saved to shared database");
        console.log(googleOk ? "✓ Submitted to Google Forms" : "✗ Google Forms submission failed (saved locally anyway)");

        res.json({
            success: true,
            google: googleOk,
            sqlite: true,
            message: "Feedback submitted successfully."
        });

    }
    catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

// Bind to 0.0.0.0 so the server accepts connections from other machines,
// not just localhost. Required for anyone besides you to reach it.
app.listen(PORT, "0.0.0.0", () => {

    console.log("==================================");
    console.log("DA Feedback Backend");
    console.log("Running on port:", PORT);
    console.log("POST /feedback");
    console.log("GET  /health");
    console.log("==================================");

});