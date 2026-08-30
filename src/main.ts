import { QbotClient } from './structures/QbotClient';
import { Client as RobloxClient } from 'bloxy';
import { handleInteraction } from './handlers/handleInteraction';
import { handleLegacyCommand } from './handlers/handleLegacyCommand';
import { config } from './config'; 
import { Group } from 'bloxy/dist/structures';
import { recordShout } from './events/shout';
import { checkSuspensions } from './events/suspensions';
import { recordAuditLogs } from './events/audit';
import { recordMemberCount } from './events/member';
import { clearActions } from './handlers/abuseDetection';
import { checkBans } from './events/bans';
import { checkWallForAds } from './events/wall';
require('dotenv').config();

if (!process.env.ROBLOX_COOKIE) {
    console.error('ROBLOX_COOKIE is not set in environment variables.');
    process.exit(1);
}

require('./database');
require('./api');

const discordClient = new QbotClient();
discordClient.login(process.env.DISCORD_TOKEN);

const proxyUrl = process.env.PROXY_URL;
const robloxClient = new RobloxClient();

// Configure Bloxy REST controller to route through Cloudflare proxy if PROXY_URL is defined
if (proxyUrl) {
    const originalRequest = robloxClient.rest.request.bind(robloxClient.rest);
    robloxClient.rest.request = async (options: any) => {
        if (options && options.url) {
            const originalUrl = new URL(options.url.toString());
            const robloxHost = originalUrl.hostname;
            // Rewrite destination to your Cloudflare Worker URL with target host parameter
            options.url = `${proxyUrl}${originalUrl.pathname}${originalUrl.search}${originalUrl.search ? '&' : '?'}robloxHost=${robloxHost}`;
        }
        return originalRequest(options);
    };
}

let robloxGroup: Group = null;

(async () => {
    try {
        await robloxClient.login(process.env.ROBLOX_COOKIE);
        console.log('Successfully authenticated with Roblox via proxy!');

        robloxGroup = await robloxClient.getGroup(config.groupId);
        
        // [Events] - Only run after successful authentication
        checkSuspensions();
        checkBans();
        if (config.logChannels.shout) recordShout();
        if (config.recordManualActions) recordAuditLogs();
        if (config.memberCount.enabled) recordMemberCount();
        if (config.antiAbuse.enabled) clearActions();
        if (config.deleteWallURLs) checkWallForAds();
    } catch (err) {
        console.error('Failed to authenticate with Roblox:', err);
    }
})();

// [Handlers]
discordClient.on('interactionCreate', handleInteraction as any);
discordClient.on('messageCreate', handleLegacyCommand);

// [Module]
export { discordClient, robloxClient, robloxGroup };
