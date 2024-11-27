addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
  });
  
  async function handleRequest(request) {
    const slackWebhookUrl = 'REPLACE WITH A SLACK WEBHOOK SETUP IN THE CHANNEL YOU WANT YOUR ACTIVITY TO BE DISPLAYED IN';
  
    async function postToSlack(message) {
      const slackMessage = { text: message };
      try {
        const response = await fetch(slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slackMessage),
        });
  
        if (!response.ok) {
          console.error(`Failed to post to Slack. Status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error posting to Slack:', error);
      }
    }
  
    try {
      const url = new URL(request.url);
  
      if (request.method === 'POST' && url.pathname === '/slack') {
        const body = await request.text();
        const formData = new URLSearchParams(body);
  
        const token = formData.get('token');
        const command = formData.get('command');
        const text = formData.get('text');
  
        if (token !== 'REPLACE WITH YOUR SLACK APP TOKEN') {
          await postToSlack('Invalid token provided in the request.');
          return new Response('Invalid token', { status: 403 });
        }
  
        if (command === '/ping-tracker') {
          await postToSlack(`LOG: /ping-tracker`);
          await postToSlack(`LOG: Pong!`);
          const responsePayload = {
            response_type: 'ephemeral',
            text: 'Pong!',
          };
  
          return new Response(JSON.stringify(responsePayload), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
          });
        } else if (command === '/hide') {
          await postToSlack(`LOG: /hide ${text}`);
          if (!text) {
            const errorResponse = {
              response_type: 'ephemeral',
              text: 'Please specify a project name. Usage: `/hide <project_name>`',
            };
            return new Response(JSON.stringify(errorResponse), {
              headers: { 'Content-Type': 'application/json' },
              status: 200,
            });
          }
  
          const airtableApiKey = 'REPLACE_WITH_YOUR_AIRTABLE_API_KEY';
          const baseId = 'REPLACE_WITH_YOUR_AIRTABLE_BASE_ID';
          const tableName = 'REPLACE_WITH_YOUR_AIRTABLE_TABLE_NAME';
          const airtableUrl = `https://api.airtable.com/v0/${baseId}/${tableName}`;
  
          try {
            const addResponse = await fetch(airtableUrl, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${airtableApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fields: {
                  Name: text,
                },
              }),
            });
  
            if (!addResponse.ok) {
              await postToSlack(`Failed to add project "${text}" to Airtable. Status: ${addResponse.status}`);
              const failureResponse = {
                response_type: 'ephemeral',
                text: `Failed to hide project "${text}". Please try again later.`,
              };
              return new Response(JSON.stringify(failureResponse), {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
              });
            }
          } catch (error) {
            await postToSlack(`Error adding project "${text}" to Airtable: ${error.message}`);
            const failureResponse = {
              response_type: 'ephemeral',
              text: `An error occurred while hiding the project "${text}". Please contact support.`,
            };
            return new Response(JSON.stringify(failureResponse), {
              headers: { 'Content-Type': 'application/json' },
              status: 200,
            });
          }
  
          const successResponse = {
            response_type: 'ephemeral',
            text: `Project "${text}" hidden successfully.`,
          };
  
          return new Response(JSON.stringify(successResponse), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
          });
        } else if (command === '/unhide') {
          await postToSlack(`LOG: /unhide ${text}`);
          if (!text) {
            const errorResponse = {
              response_type: 'ephemeral',
              text: 'Please specify a project name. Usage: `/unhide <project_name>`',
            };
            return new Response(JSON.stringify(errorResponse), {
              headers: { 'Content-Type': 'application/json' },
              status: 200,
            });
          }
  
          try {
            const searchResponse = await fetch(`${airtableUrl}?filterByFormula={Name}='${text}'`, {
              headers: {
                Authorization: `Bearer ${airtableApiKey}`,
              },
            });
  
            if (!searchResponse.ok) {
              await postToSlack(`Failed to search project "${text}" in Airtable. Status: ${searchResponse.status}`);
              const failureResponse = {
                response_type: 'ephemeral',
                text: `Failed to find project "${text}" in Airtable.`,
              };
              return new Response(JSON.stringify(failureResponse), {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
              });
            }
  
            const searchData = await searchResponse.json();
            if (searchData.records.length === 0) {
              const notFoundResponse = {
                response_type: 'ephemeral',
                text: `Project "${text}" does not exist in Airtable.`,
              };
              return new Response(JSON.stringify(notFoundResponse), {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
              });
            }
  
            const recordId = searchData.records[0].id;
  
            const deleteResponse = await fetch(`${airtableUrl}/${recordId}`, {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${airtableApiKey}`,
              },
            });
  
            if (!deleteResponse.ok) {
              await postToSlack(`Failed to delete project "${text}" from Airtable. Status: ${deleteResponse.status}`);
              const failureResponse = {
                response_type: 'ephemeral',
                text: `Failed to unhide project "${text}". Please try again later.`,
              };
              return new Response(JSON.stringify(failureResponse), {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
              });
            }
          } catch (error) {
            await postToSlack(`Error unhiding project "${text}" from Airtable: ${error.message}`);
            const failureResponse = {
              response_type: 'ephemeral',
              text: `An error occurred while unhiding the project "${text}". Please contact support.`,
            };
            return new Response(JSON.stringify(failureResponse), {
              headers: { 'Content-Type': 'application/json' },
              status: 200,
            });
          }
  
          const successResponse = {
            response_type: 'ephemeral',
            text: `Project "${text}" unhidden successfully.`,
          };
  
          return new Response(JSON.stringify(successResponse), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
          });
        } else {
          const unrecognizedCommandResponse = {
            response_type: 'ephemeral',
            text: 'Command not recognized.',
          };
  
          return new Response(JSON.stringify(unrecognizedCommandResponse), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
          });
        }
      } else if (request.method === 'POST' && url.pathname === '/webhook') {
        const body = await request.json();
        const project = body.project;
  
        if (!project) {
          await postToSlack('Missing project parameter in /webhook request.');
          return new Response('Missing project parameter', { status: 400 });
        }
  
        const slackMessage = {
          text: `@/zrl has spent one hour working on: *${project}*`,
        };
  
        try {
          const slackResponse = await fetch(slackWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(slackMessage),
          });
  
          if (!slackResponse.ok) {
            await postToSlack(`Failed to post Slack message for project "${project}". Status: ${slackResponse.status}`);
            return new Response('Failed to post message to Slack', { status: 500 });
          }
        } catch (error) {
          await postToSlack(`Error posting to Slack for project "${project}": ${error.message}`);
          return new Response('Error posting to Slack', { status: 500 });
        }
  
        return new Response(`Message sent to Slack: ${project}`, { status: 200 });
      } else {
        return new Response('Invalid request', { status: 400 });
      }
    } catch (error) {
      await postToSlack(`Unhandled error in the worker: ${error.message}`);
      return new Response('Internal Server Error', { status: 500 });
    }
  }