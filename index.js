import dotenv from "dotenv";
dotenv.config();


import express from "express";
import { App } from "@slack/bolt";
import Airtable from "airtable";

const app = express();

// Initialize Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

// Initialize Slack Bolt
const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  endpoints: { commands: "/slack/commands" },
});

// Slash command: /referral <number>
slackApp.command("/referral", async ({ command, ack, respond }) => {
  await ack();

  const referralNumber = command.text.trim();
  if (!referralNumber) {
    await respond("Please provide a referral number, e.g. `/referral 12345`.");
    return;
  }

  try {
    // Query Airtable
    const records = await base(process.env.AIRTABLE_TABLE_NAME)
      .select({
        fields: [process.env.AIRTABLE_COLUMN_NAME],
        filterByFormula: `{${process.env.AIRTABLE_COLUMN_NAME}} = "${referralNumber}"`,
      })
      .all();

    const count = records.length;
    await respond(`Referral code *${referralNumber}* appears *${count}* time(s) in Airtable.`);
  } catch (error) {
    console.error(error);
    await respond("❌ Something went wrong while checking Airtable.");
  }
});

// Start server
(async () => {
  await slackApp.start(process.env.PORT || 3000);
  console.log("⚡ Slack bot is running!");
})();
