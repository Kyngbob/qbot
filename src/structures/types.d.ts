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
        type: any;
        value: string;
    };
    status: string;
    deleteWallURLs: boolean;
}
