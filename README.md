# Bot Restart Service

Automated restart service for Glyphs Bot 1 and Glyphs Bot Game running on Railway.

## 🎯 Features

- **Glyphs Bot Game**: Restarts every hour (at :00 minutes)
- **Glyphs Bot 1**: Restarts daily at 5:00 PM UTC
- **Automatic scheduling** using node-cron
- **Railway API integration** for service restarts
- **Comprehensive logging** for monitoring
- **Error handling** and recovery

## 🚀 Quick Start

### 1. Environment Variables

Set these environment variables in Railway:

```bash
RAILWAY_TOKEN=your_railway_api_token_here
GLYPHS_BOT_GAME_SERVICE_ID=your_glyphs_bot_game_service_id_here
GLYPHS_BOT_1_SERVICE_ID=your_glyphs_bot_1_service_id_here
```

### 2. Deploy to Railway

1. Connect this repository to Railway
2. Set the environment variables
3. Deploy automatically

### 3. Verify Deployment

Check the logs to ensure:
- ✅ All environment variables are set
- ✅ Scheduled tasks are configured
- ✅ Service is running and monitoring

## 📋 Schedule Details

### Glyphs Bot Game
- **Frequency**: Every hour
- **Time**: At minute 0 of each hour
- **Timezone**: UTC
- **Example**: 12:00, 13:00, 14:00, etc.

### Glyphs Bot 1
- **Frequency**: Daily
- **Time**: 17:00 UTC (5:00 PM UTC)
- **Timezone**: UTC
- **Example**: Every day at 5:00 PM UTC

## 🔧 Configuration

### Getting Service IDs

1. Go to your Railway project
2. Click on the specific service
3. Go to Settings → General
4. Copy the Service ID

### Getting Railway API Token

1. Go to Railway dashboard
2. Click your profile → Account Settings
3. Go to API Tokens section
4. Create a new token
5. Copy the token

## 📊 Monitoring

The service logs all activities:

```
🕐 Hourly restart triggered for Glyphs Bot Game
✅ Successfully restarted Glyphs Bot Game (ID: service-id)
```

## 🛠️ Development

### Local Testing

```bash
# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env with your values
# Then run
npm start
```

### Manual Restart

You can manually trigger restarts by calling the Railway API directly:

```bash
curl -X POST https://backboard.railway.app/graphql/v1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { serviceRestart(serviceId: \"SERVICE_ID\") { id } }"
  }'
```

## 🚨 Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Check all required variables are set
   - Verify variable names are correct

2. **Invalid Service IDs**
   - Double-check Service IDs from Railway dashboard
   - Ensure IDs are for the correct services

3. **API Token Issues**
   - Verify token has proper permissions
   - Check token hasn't expired

### Logs

Check Railway logs for detailed error messages and restart confirmations.

## 📝 License

MIT License - Feel free to modify and use as needed.


