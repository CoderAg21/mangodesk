require('dotenv').config(); // Load API Key and Proxy URL
// const { setGlobalDispatcher, ProxyAgent } = require("undici");
const { parseUserIntent } = require('./intentclassifier');

// // -------- 1. PROXY CONFIGURATION -------
// // We need this here too, otherwise the script cannot talk to the outside world
// if (process.env.PROXY_URL) {
//     console.log(`[System] Configuring Proxy: ${process.env.PROXY_URL}`);
//     const dispatcher = new ProxyAgent(process.env.PROXY_URL);
//     setGlobalDispatcher(dispatcher);
// }

// --- 2. THE TEST RUNNER ---
async function runTests(prompt) {
    console.log("🧠 Starting Brain Tests...\n");

    const testCases = [prompt];

    for (const prompt of testCases) {
        console.log(`------------------------------------------------`);
        console.log(`INPUT: "${prompt}"`);
        
        try {
            const result = await parseUserIntent(prompt);
            console.log("OUTPUT JSON:");
            // return result;
            console.dir(result, { depth: null, colors: true }); // Pretty prints the JSON
        } catch (error) {
            console.error("❌ FAILED:", error.message);
        }
    }
}

module.exports = { runTests };