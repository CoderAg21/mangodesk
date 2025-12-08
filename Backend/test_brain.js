require('dotenv').config(); // Load API Key and Proxy URL
// const { setGlobalDispatcher, ProxyAgent } = require("undici");
const { parseUserIntent } = require('./intentclassifier');
async function runTests(prompt) {
    console.log(" Starting Brain Tests...\n");
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