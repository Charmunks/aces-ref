import dotenv from "dotenv";
dotenv.config();

import { App } from "@slack/bolt";
import Airtable from "airtable";

// Initialize Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

// Initialize Slack Bolt
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  endpoints: { commands: "/slack/commands" },
});

// Slash command handler
app.command("/referral", async ({ command, ack, respond }) => {
  console.log("✅ Received /referral:", command);
  await ack(); // must respond within 3s
  const referralNumber = command.text.trim();

  if (!referralNumber) {
    await respond("Please provide a referral number. Example: `/referral 12345`");
    return;
  }

  try {
    const columnName = process.env.AIRTABLE_COLUMN_NAME;
    const records = await base(process.env.AIRTABLE_TABLE_NAME)
      .select({
        filterByFormula: `{${columnName}} = "${referralNumber}"`,
      })
      .all();

    const count = records.length;
    await respond(`Referral code *${referralNumber}* appears *${count}* time(s).`);
  } catch (err) {
    console.error("Error querying Airtable:", err);
    await respond("❌ Something went wrong while checking Airtable.");
  }
});

// Start your app
(async () => {
  const port = process.env.PORT || 3131;
  await app.start(port);
  console.log(`⚡ Slack bot running on port ${port}`);
})();
