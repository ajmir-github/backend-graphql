const mongoose = require("mongoose");
require("dotenv").config();
const createApp = require("./app");

mongoose.set("strictQuery", false);
mongoose.connect(process.env.DATABASE_URL, (error) => {
  if (error) throw error;
  // Create app
  const app = createApp();
  const port = process.env.PORT || 5000;

  app.listen(port, () => console.log(`Server is running on port ${port}`));
});
