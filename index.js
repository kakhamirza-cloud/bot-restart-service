const cron = require('node-cron');
const { exec } = require('child_process');
const { promisify } = require('util');
require('dotenv').config();
const axios = require('axios');

const execAsync = promisify(exec);

// Service names (using service names instead of IDs for Railway CLI)
const GLYPHS_BOT_GAME_SERVICE_NAME = process.env.GLYPHS_BOT_GAME_SERVICE_NAME || 'glyphs-bot-game';
const GLYPHS_BOT_1_SERVICE_NAME = process.env.GLYPHS_BOT_1_SERVICE_NAME || 'glyphs-bot-1';

const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN;
const PROJECT_ID = process.env.RAILWAY_PROJECT_ID;
const GLYPHS_BOT_GAME_SERVICE_ID = process.env.GLYPHS_BOT_GAME_SERVICE_ID;
const GLYPHS_BOT_1_SERVICE_ID = process.env.GLYPHS_BOT_1_SERVICE_ID;

const TRIGGER_REDEPLOY_MUTATION = `
  mutation deploymentTrigger($input: DeploymentTriggerInput!) {
    deploymentTrigger(input: $input) {
      id
      url
      createdAt
    }
  }
`;

async function redeployService(projectId, serviceId, serviceName) {
  try {
    console.log(`🔄 Attempting to redeploy ${serviceName}...`);
    const response = await axios.post(
      'https://backboard.railway.app/graphql/v2',
      {
        query: TRIGGER_REDEPLOY_MUTATION,
        variables: { input: { projectId, serviceId } },
      },
      {
        headers: {
          'Authorization': `Bearer ${RAILWAY_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    if (response.data.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(response.data.errors)}`);
    }
    const deployment = response.data.data?.deploymentTrigger;
    if (deployment && deployment.url) {
      console.log(`✅ Redeployed ${serviceName}. Deployment URL: ${deployment.url}`);
      return true;
    } else {
      throw new Error('No deployment info returned');
    }
  } catch (error) {
    console.error(`❌ Failed to redeploy ${serviceName}:`, error.message);
    return false;
  }
}

// Function to log current time
function logTime() {
  const now = new Date();
  const utcTime = now.toISOString();
  const localTime = now.toLocaleString();
  console.log(`\n⏰ Current Time - UTC: ${utcTime} | Local: ${localTime}`);
}

// Validate configuration
async function validateConfig() {
  try {
    // Check if Railway CLI is available and user is logged in
    const { stdout } = await execAsync('railway whoami');
    console.log('✅ Railway CLI is available and user is logged in');
    console.log(`👤 Logged in as: ${stdout.trim()}`);
    
    // Check if services exist
    const { stdout: listOutput } = await execAsync('railway list');
    console.log('📋 Available projects:');
    console.log(listOutput);
    
    console.log('✅ Configuration validated successfully');
  } catch (error) {
    console.error('❌ Railway CLI validation failed:', error.message);
    console.error('Please ensure Railway CLI is installed and you are logged in');
    process.exit(1);
  }
}

// Main function
async function main() {
  console.log('🚀 Bot Restart Service Starting...');
  logTime();
  
  // Validate configuration
  await validateConfig();
  
  console.log('📋 Service Configuration:');
  console.log(`   - Glyphs Bot Game Service: ${GLYPHS_BOT_GAME_SERVICE_NAME}`);
  console.log(`   - Glyphs Bot 1 Service: ${GLYPHS_BOT_1_SERVICE_NAME}`);
  
  // Schedule: Restart Glyphs Bot Game every hour (at minute 0)
  cron.schedule('0 * * * *', async () => {
    logTime();
    console.log('🕐 Hourly restart triggered for Glyphs Bot Game');
    await redeployService(PROJECT_ID, GLYPHS_BOT_GAME_SERVICE_ID, GLYPHS_BOT_GAME_SERVICE_NAME);
  }, {
    timezone: 'UTC'
  });
  
  // Schedule: Restart Glyphs Bot 1 daily at 5:00 PM UTC
  cron.schedule('0 17 * * *', async () => {
    logTime();
    console.log('🕔 Daily restart triggered for Glyphs Bot 1 (5:00 PM UTC)');
    await redeployService(PROJECT_ID, GLYPHS_BOT_1_SERVICE_ID, GLYPHS_BOT_1_SERVICE_NAME);
  }, {
    timezone: 'UTC'
  });
  
  console.log('⏰ Scheduled tasks configured:');
  console.log('   - Glyphs Bot Game: Every hour at :00 minutes');
  console.log('   - Glyphs Bot 1: Daily at 17:00 UTC (5:00 PM)');
  console.log('🔄 Service is running and monitoring schedules...');
  
  // Keep the process alive
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Bot Restart Service...');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down Bot Restart Service...');
    process.exit(0);
  });
}

// Start the service
main().catch(error => {
  console.error('❌ Fatal error starting service:', error);
  process.exit(1);
});


