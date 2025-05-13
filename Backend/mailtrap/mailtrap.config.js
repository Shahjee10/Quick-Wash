const { MailtrapClient } = require("mailtrap");
const dotenv = require('dotenv');
dotenv.config();

// Add this console log to check if the token is loaded properly
console.log("Mailtrap Token: ", process.env.MAILTRAP_TOKEN); // Check if the token is being loaded

const mailtrapClient = new MailtrapClient({
  token: process.env.MAILTRAP_TOKEN,  // Ensure your Mailtrap API token is in .env
});

const sender = {
  email: "hello@quickwash.cloud",
  name: "QuickWash",
};

module.exports = {
  mailtrapClient,
  sender,
};