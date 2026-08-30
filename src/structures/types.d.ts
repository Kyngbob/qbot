import { ActivityType, PresenceStatusData } from 'discord.js';

export interface BotConfig {
    groupId: number;
    discordToken?: string;
    slashCommands: boolean;
    legacyCommands: {
        enabled: boolean;
        prefixes: string[];
    };
    permissions: {
        all: string[];
        ranking: string[];
        users: string[];
        shout: string[];
        join: string[];
        signal: string[];
        admin: string[];
    };
    logChannels: {
        actions: string;
        shout: string;
    };
    api: boolean;
    maximumRank: number;
    verificationChecks: boolean;
    bloxlinkGuildId: string;
    firedRank: number;
    suspendedRank: number;
    recordManualActions: boolean;
    memberCount: {
        enabled: boolean;
        channelId: string;
        milestone: number;
        onlyMilestones: boolean;
    };
    xpSystem: {
        enabled: boolean;
        autoRankup: boolean;
        roles: any[];
    };
    antiAbuse: {
        enabled: boolean;
        clearDuration: number;
        threshold: number;
        demotionRank: number;
    };
    activity: {
        enabled: boolean;
        type: ActivityType | any;
        value: string;
        url?: string;
    };
    status: PresenceStatusData | string;
    deleteWallURLs: boolean;
}

export interface DatabaseUser {
    discordId: string;
    robloxId?: number;
    xp?: number;
    [key: string]: any;
}

export interface BloxlinkResponse {
    status: string;
    primaryAccount?: string;
    robloxId?: string;
    [key: string]: any;
}

export type CommandArgument = {
    name: string;
    description: string;
    type: number;
    required?: boolean;
    [key: string]: any;
};

export type CommandConfig = {
    name: string;
    description: string;
    arguments?: CommandArgument[];
    [key: string]: any;
};

export type CommandPermission = string | string[] | boolean;

export type CommandType = 'slash' | 'legacy' | 'both';

export type CommandExport = {
    command: CommandConfig;
    run: (...args: any[]) => Promise<any>;
};
