const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");

// const mongoose = require('mongoose');
// const DB = process.env.DATABASE.replace(
//   "<password>",
//   process.env.DATABASE_PASSWORD
// );

// mongoose
//   .connect(DB, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log('DB connection successful!'));

const server = app.listen(process.env.PORT, () => {
  console.log("listening.. port :", process.env.PORT);
});
// handle the REJECTION Error golbly and exit the app
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
