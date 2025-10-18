const cron = require('node-cron');
const axios = require('axios');
require('dotenv').config();

// Railway API configuration
const RAILWAY_API_URL = 'https://backboard.railway.app/graphql/v1';
const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN;

// Service IDs (you'll need to replace these with your actual service IDs)
const GLYPHS_BOT_GAME_SERVICE_ID = process.env.GLYPHS_BOT_GAME_SERVICE_ID;
const GLYPHS_BOT_1_SERVICE_ID = process.env.GLYPHS_BOT_1_SERVICE_ID;

// GraphQL mutation to restart a service
const RESTART_MUTATION = `
  mutation ServiceRestart($serviceId: String!) {
    serviceRestart(serviceId: $serviceId) {
      id
      name
    }
  }
`;

// Function to restart a Railway service
async function restartService(serviceId, serviceName) {
  try {
    console.log(`🔄 Attempting to restart ${serviceName}...`);
    
    const response = await axios.post(RAILWAY_API_URL, {
      query: RESTART_MUTATION,
      variables: {
        serviceId: serviceId
      }
    }, {
      headers: {
        'Authorization': `Bearer ${RAILWAY_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(response.data.errors)}`);
    }

    if (response.data.data && response.data.data.serviceRestart) {
      console.log(`✅ Successfully restarted ${serviceName} (ID: ${serviceId})`);
      return true;
    } else {
      throw new Error('No restart data returned');
    }
  } catch (error) {
    console.error(`❌ Failed to restart ${serviceName}:`, error.message);
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

// Validate environment variables
function validateConfig() {
  const required = ['RAILWAY_TOKEN', 'GLYPHS_BOT_GAME_SERVICE_ID', 'GLYPHS_BOT_1_SERVICE_ID'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('Please set these in your Railway environment variables or .env file');
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are set');
}

// Main function
async function main() {
  console.log('🚀 Bot Restart Service Starting...');
  logTime();
  
  // Validate configuration
  validateConfig();
  
  console.log('📋 Service Configuration:');
  console.log(`   - Glyphs Bot Game Service ID: ${GLYPHS_BOT_GAME_SERVICE_ID}`);
  console.log(`   - Glyphs Bot 1 Service ID: ${GLYPHS_BOT_1_SERVICE_ID}`);
  
  // Schedule: Restart Glyphs Bot Game every hour (at minute 0)
  cron.schedule('0 * * * *', async () => {
    logTime();
    console.log('🕐 Hourly restart triggered for Glyphs Bot Game');
    await restartService(GLYPHS_BOT_GAME_SERVICE_ID, 'Glyphs Bot Game');
  }, {
    timezone: 'UTC'
  });
  
  // Schedule: Restart Glyphs Bot 1 daily at 5:00 PM UTC
  cron.schedule('0 17 * * *', async () => {
    logTime();
    console.log('🕔 Daily restart triggered for Glyphs Bot 1 (5:00 PM UTC)');
    await restartService(GLYPHS_BOT_1_SERVICE_ID, 'Glyphs Bot 1');
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
