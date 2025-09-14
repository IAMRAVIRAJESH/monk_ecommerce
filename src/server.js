const app = require("./app");
const { sequelize } = require("./config/database");

const PORT = process.env.PORT;

async function startServer() {
  try {
    console.log("Starting server");

    await sequelize.authenticate();

    //await sequelize.sync({ alter: true }); uncomment this create models in database
    console.log("Database models synced successfully.");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error.message);
  }
}

startServer();
