const cron = require('node-cron');
const { exec } = require('child_process');
const { promisify } = require('util');
require('dotenv').config();

const execAsync = promisify(exec);

// Service names (using service names instead of IDs for Railway CLI)
const GLYPHS_BOT_GAME_SERVICE_NAME = process.env.GLYPHS_BOT_GAME_SERVICE_NAME || 'glyphs-bot-game';
const GLYPHS_BOT_1_SERVICE_NAME = process.env.GLYPHS_BOT_1_SERVICE_NAME || 'glyphs-bot-1';

// Function to restart a Railway service using CLI
async function restartService(serviceName, displayName) {
  try {
    console.log(`🔄 Attempting to restart ${displayName}...`);
    
    // Use Railway CLI to redeploy the service
    const { stdout, stderr } = await execAsync(`railway redeploy -s ${serviceName} -y`);
    
    if (stderr && !stderr.includes('Warning')) {
      throw new Error(`CLI Error: ${stderr}`);
    }

    console.log(`✅ Successfully restarted ${displayName} (Service: ${serviceName})`);
    console.log(`📋 CLI Output: ${stdout.trim()}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to restart ${displayName}:`, error.message);
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
    await restartService(GLYPHS_BOT_GAME_SERVICE_NAME, 'Glyphs Bot Game');
  }, {
    timezone: 'UTC'
  });
  
  // Schedule: Restart Glyphs Bot 1 daily at 5:00 PM UTC
  cron.schedule('0 17 * * *', async () => {
    logTime();
    console.log('🕔 Daily restart triggered for Glyphs Bot 1 (5:00 PM UTC)');
    await restartService(GLYPHS_BOT_1_SERVICE_NAME, 'Glyphs Bot 1');
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


