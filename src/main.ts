import { QbotClient } from './structures/QbotClient';
import { handleInteraction } from './handlers/handleInteraction';
import { handleLegacyCommand } from './handlers/handleLegacyCommand';
import { config } from './config'; 
import { recordShout } from './events/shout';
import { checkSuspensions } from './events/suspensions';
import { recordAuditLogs } from './events/audit';
import { recordMemberCount } from './events/member';
import { clearActions } from './handlers/abuseDetection';
import { checkBans } from './events/bans';
import { checkWallForAds } from './events/wall';
import axios from 'axios';

require('dotenv').config();

// Verify Open Cloud Key setup
if (!process.env.ROBLOX_OPENCLOUD_KEY) {
    console.error('CRITICAL: ROBLOX_OPENCLOUD_KEY is not set in environment variables.');
    process.exit(1);
}

require('./database');
require('./api');

// Initialize Discord Client
const discordClient = new QbotClient();
discordClient.login(process.env.DISCORD_TOKEN);

/**
 * Updates a user's rank in the Roblox group using Open Cloud API
 */
export async function setUserRankOpenCloud(userId: number, roleId: number) {
    try {
        const url = `https://apis.roblox.com/cloud/v1/groups/${config.groupId}/users/${userId}`;
        
        const response = await axios.patch(
            url,
            { roleId: roleId },
            {
                headers: {
                    'x-api-key': process.env.ROBLOX_OPENCLOUD_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error: any) {
        console.error('Open Cloud API Error:', error.response?.data || error.message);
        throw error;
    }
}

// Startup execution (Replaces Bloxy login check)
(async () => {
    try {
        console.log('✓ Bot initialized successfully using Roblox Open Cloud API!');
        console.log(`✓ Target Group ID: ${config.groupId}`);
        
        // [Events] - Background jobs
        checkSuspensions();
        checkBans();
        if (config.logChannels.shout) recordShout();
        if (config.recordManualActions) recordAuditLogs();
        if (config.memberCount.enabled) recordMemberCount();
        if (config.antiAbuse.enabled) clearActions();
        if (config.deleteWallURLs) checkWallForAds();
    } catch (err) {
        console.error('Failed to initialize background events:', err);
    }
})();

// [Handlers]
discordClient.on('interactionCreate', handleInteraction as any);
discordClient.on('messageCreate', handleLegacyCommand);

// [Module Exports]
export { discordClient };
