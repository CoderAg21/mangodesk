const mongoose = require('mongoose');
// FIX 1: Ensure variable name matches usage (employeeModel)
const employeeModel = require('../models/employeeModel.js'); 

// FIX 2: Load the JSON file directly (assuming it's in the same folder)
// This replaces: const { data } = require('./randomData.js')
const employeeData = require('./randomData.js'); 

const MONGO_URL = "mongodb://127.0.0.1:27017/mangoDesk";

main()
  .then(() => {
    console.log("Mongodb connected");
    return initDB(); 
  })
  .catch(err => {
    console.log("Connection Error:", err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  try {
    // Clear existing data to avoid duplicates
    await employeeModel.deleteMany({});
    console.log("Existing data cleared.");

    // Insert new data
    // Mongoose will automatically cast the date strings from JSON to Date objects
    await employeeModel.insertMany(employeeData);
    console.log("Data Saved Successfully");
    
  } catch (err) {
    console.log("Error inserting data:", err);
  } finally {
    // Optional: Close connection when done so the script exits
    mongoose.connection.close();
  }
};