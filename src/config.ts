import { ActivityType } from 'discord.js';
import { BotConfig } from './structures/types'; 

export const config: BotConfig = {
    groupId: Number(process.env.GROUP_ID) || 1101341299,
    discordToken: process.env.DISCORD_TOKEN || '',
    slashCommands: true,
    legacyCommands: {
        enabled: true,
        prefixes: ['q!'],
    },
    permissions: {
        all: [
            '1255536194159247437',
            '1542927410662604830',
            '1542940284298727546',
            '1542957658133368912',
        ],
        ranking: [
            '1255536194159247437',
            '1542927410662604830',
            '1542940284298727546',
            '1542957658133368912',
        ],
        users: ['1255536194159247437'],
        shout: ['1255536194159247437'],
        join: ['1255536194159247437'],
        signal: ['1255536194159247437'],
        admin: [
            '1255536194159247437',
            '1542927410662604830',
            '1542940284298727546',
            '1542957658133368912',
        ],
    },
    logChannels: {
        actions: '1543388799978049576',
        shout: '',
    },
    api: false,
    maximumRank: 255,
    verificationChecks: false,
    bloxlinkGuildId: '',
    firedRank: 1,
    suspendedRank: 1,
    recordManualActions: true,
    memberCount: {
        enabled: false,
        channelId: '',
        milestone: 100,
        onlyMilestones: false,
    },
    xpSystem: {
        enabled: false,
        autoRankup: false,
        roles: [],
    },
    antiAbuse: {
        enabled: false,
        clearDuration: 1 * 60,
        threshold: 10,
        demotionRank: 1,
    },
    activity: {
        enabled: false,
        type: ActivityType.Watching,
        value: 'for commands.',
    },
    status: 'online',
    deleteWallURLs: false,
};
