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
    activity: any;
    status: any;
    deleteWallURLs: boolean;
}

export interface DatabaseUser {
    id?: string;
    discordId?: string;
    robloxId?: string;
    xp?: number;
    suspendedUntil?: Date;
    unsuspendRank?: number;
    isBanned?: boolean;
    [key: string]: any;
}

export interface BloxlinkResponse {
    status: string;
    primaryAccount?: string;
    robloxId?: string;
    [key: string]: any;
}

export type CommandArgument = {
    trigger?: string;
    name?: string;
    description: string;
    type: string | number;
    required?: boolean;
    autocomplete?: boolean;
    isLegacyFlag?: boolean;
    [key: string]: any;
};

export type CommandPermission = any;

export type CommandConfig = {
    trigger?: string;
    name?: string;
    description: string;
    type?: string;
    module?: string;
    arguments?: CommandArgument[];
    args?: CommandArgument[];
    permissions?: CommandPermission[];
    [key: string]: any;
};

export type CommandType = string;

export type CommandExport = {
    trigger?: string;
    generateAPICommand?: (...args: any[]) => any;
    command: CommandConfig;
    default?: CommandExport;
    run: (...args: any[]) => Promise<any>;
    [key: string]: any;
};
