// test_brain.js
require('dotenv').config();
const { classifyIntent } = require('./intentClassifier');

async function test() {
    console.log("--- Testing AI Intent Classifier ---");

    // Test Case 1: Simple Read
    console.log("\n1. Prompt: 'Find all users who are active'");
    const result1 = await classifyIntent("Find all users who are active");
    console.log("AI Output:", JSON.stringify(result1, null, 2));

    // Test Case 2: Complex Update (Testing MongoDB Syntax)
    console.log("\n2. Prompt: 'Update the price of the iPhone 15 to 1200'");
    const result2 = await classifyIntent("Update the price of the iPhone 15 to 1200");
    console.log("AI Output:", JSON.stringify(result2, null, 2));
}

test();