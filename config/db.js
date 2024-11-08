require("dotenv").config();
const { Sequelize } = require("sequelize");

// Set up the database connection
const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || "mysql",
    // timezone: "+00:00", // Force UTC
  }
);

// Test the connection and sync the models
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully!");

    // Sync all models (create tables if they don't exist)
    await sequelize.sync({ alter: true }); // Use `force: true` for development to drop and recreate tables
    // await sequelize.sync({ force: true }); // Use `force: true` for development to drop and recreate tables
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

initializeDatabase();

module.exports = sequelize; // Export the sequelize instance for use in other files
