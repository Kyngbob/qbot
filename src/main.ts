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

// [Ensure Setup]
if (!process.env.ROBLOX_COOKIE && !process.env.ROBLOX_TICKET) {
    console.error('Neither ROBLOX_COOKIE nor ROBLOX_TICKET is set in the environment variables.');
    process.exit(1);
}

require('./database');
require('./api');

// [Clients]
const discordClient = new QbotClient();
discordClient.login(process.env.DISCORD_TOKEN);

const robloxClient = new RobloxClient();
let robloxGroup: Group = null;

(async () => {
    // Authenticate using ticket if present, otherwise fall back to cookie
    if (process.env.ROBLOX_TICKET) {
        await robloxClient.loginWithTicket(process.env.ROBLOX_TICKET).catch(console.error);
    } else {
        await robloxClient.login({ credentials: { cookie: process.env.ROBLOX_COOKIE } }).catch(console.error);
    }

    robloxGroup = await robloxClient.getGroup(config.groupId);
    
    // [Events]
    checkSuspensions();
    checkBans();
    if (config.logChannels.shout) recordShout();
    if (config.recordManualActions) recordAuditLogs();
    if (config.memberCount.enabled) recordMemberCount();
    if (config.antiAbuse.enabled) clearActions();
    if (config.deleteWallURLs) checkWallForAds();
})();

// [Handlers]
discordClient.on('interactionCreate', handleInteraction as any);
discordClient.on('messageCreate', handleLegacyCommand);

// [Module]
export { discordClient, robloxClient, robloxGroup };
