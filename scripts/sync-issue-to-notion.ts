import { Client } from '@notionhq/client';

interface NotionPage {
  id: string;
  properties: {
    'Issue Number': {
      number: number;
    };
  };
}

async function syncIssueToNotion() {
  // Get environment variables
  const notionApiKey = process.env.NOTION_API_KEY;
  const notionDatabaseId = process.env.NOTION_DATABASE_ID;
  const issueNumber = process.env.ISSUE_NUMBER;
  const issueTitle = process.env.ISSUE_TITLE;
  const issueState = process.env.ISSUE_STATE;
  const issueUrl = process.env.ISSUE_URL;

  // Validate required environment variables
  if (!notionApiKey || !notionDatabaseId) {
    console.error('Missing required environment variables: NOTION_API_KEY or NOTION_DATABASE_ID');
    process.exit(1);
  }

  if (!issueNumber || !issueTitle || !issueState || !issueUrl) {
    console.error('Missing required issue information');
    process.exit(1);
  }

  // Initialize Notion client
  const notion = new Client({ auth: notionApiKey });

  try {
    // Check if issue already exists in Notion
    const existingPages = await notion.databases.query({
      database_id: notionDatabaseId,
      filter: {
        property: 'Issue Number',
        number: {
          equals: parseInt(issueNumber),
        },
      },
    });

    const status = issueState === 'open' ? 'open' : 'closed';

    if (existingPages.results.length > 0) {
      // Update existing page
      const pageId = existingPages.results[0].id;
      await notion.pages.update({
        page_id: pageId,
        properties: {
          Title: {
            title: [
              {
                text: {
                  content: issueTitle,
                },
              },
            ],
          },
          Status: {
            select: {
              name: status,
            },
          },
          'GitHub URL': {
            url: issueUrl,
          },
          'Issue Number': {
            number: parseInt(issueNumber),
          },
          'Synced to GitHub': {
            checkbox: true,
          },
        },
      });
      console.log(`✅ Updated issue #${issueNumber} in Notion database`);
    } else {
      // Create new page
      await notion.pages.create({
        parent: {
          database_id: notionDatabaseId,
        },
        properties: {
          Title: {
            title: [
              {
                text: {
                  content: issueTitle,
                },
              },
            ],
          },
          Status: {
            select: {
              name: status,
            },
          },
          'GitHub URL': {
            url: issueUrl,
          },
          'Issue Number': {
            number: parseInt(issueNumber),
          },
          'Synced to GitHub': {
            checkbox: true,
          },
        },
      });
      console.log(`✅ Created new page for issue #${issueNumber} in Notion database`);
    }
  } catch (error) {
    console.error('Error syncing to Notion:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    process.exit(1);
  }
}

syncIssueToNotion();
