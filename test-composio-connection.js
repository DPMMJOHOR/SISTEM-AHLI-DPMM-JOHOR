require('dotenv').config({ path: '.env.local' });
const { Composio } = require('@composio/core');

console.log('Testing Composio connection...');
console.log('API Key:', process.env.COMPOSIO_API_KEY ? 'Present' : 'Missing');
console.log('Project ID:', process.env.COMPOSIO_PROJECT_ID);
console.log('Org ID:', process.env.COMPOSIO_ORG_ID);

const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });

composio.create('cascade-user', { mcp: true })
  .then(session => {
    console.log('\n✅ Composio connection successful!');
    console.log('MCP URL:', session.mcp.url);
    console.log('Headers:', JSON.stringify(session.mcp.headers, null, 2));
  })
  .catch(error => {
    console.error('\n❌ Composio connection failed:');
    console.error(error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  });
