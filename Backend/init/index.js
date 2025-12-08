const mongoose = require('mongoose');
const Employee = require('../models/Employee'); 

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
    await Employee.deleteMany({});
    console.log("Existing data cleared.");

    await Employee.insertMany(employeeData);
    console.log("Data Saved Successfully");
    
  } catch (err) {
    console.log("Error inserting data:", err);
  } finally {
    mongoose.connection.close();
  }
};