# hakatime-tracker-slack-bot
A very complex Hakatime tracker, that requires a main server ( no public IP required ) and a Cloudflare server-less Worker.

It monitors your Hackatime activity and posts a message in your channel of choice for every one hour you work on your projects, with the ability to hide projects from being broadcasted if they are private or personal.

# Instructions for use

## Setting up Slack Webhooks

1. Go to your Slack workspace and create a new app.
2. Navigate to the "Incoming Webhooks" section and activate it.
3. Create a new webhook and select the channel where you want the activity to be displayed.
4. Copy the webhook URL and replace the placeholder in `worker.js` with this URL.

## Setting up Airtable's API

1. Sign up for an Airtable account if you don't have one.
2. Create a new base and table in Airtable.
3. Go to the "API" section in your Airtable account and generate an API key.
4. Copy the API key, base ID, and table name.
5. Replace the placeholders in `monitor.py`, `track.py`, and `worker.js` with the actual values.

## Setting up the Cloudflare Worker

1. Sign up for a Cloudflare account if you don't have one.
2. Go to the "Workers" section and create a new worker.
3. Copy the code from `worker.js` and paste it into the Cloudflare Worker script editor.
4. Deploy the worker and note the worker URL.
5. Replace the placeholder in `monitor.py` with the worker URL.

## Creating a Slack Bot

1. Go to your Slack workspace and create a new app.
2. Navigate to the "OAuth & Permissions" section and add the necessary scopes for your bot.
3. Install the app to your workspace and copy the OAuth token.
4. Replace the placeholder in `worker.js` with the OAuth token.
5. Navigate to the "Event Subscriptions" section and enable events.
6. Add the necessary bot events and provide the request URL for your Cloudflare Worker.

## Replacing Placeholder Variables

1. Open `monitor.py`, `track.py`, and `worker.js`.
2. Replace the placeholder variables with the actual values obtained from the steps above.
3. Save the changes and deploy the scripts as needed.
