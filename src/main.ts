import { QbotClient } from './structures/QbotClient';
import { handleInteraction } from './handlers/handleInteraction';
import { handleLegacyCommand } from './handlers/handleLegacyCommand';
import { config } from './config';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.ROBLOX_OPENCLOUD_KEY) {
    console.error('❌ CRITICAL ERROR: ROBLOX_OPENCLOUD_KEY is missing from environment variables.');
    process.exit(1);
}

require('./database');
try { require('./api'); } catch {}

const discordClient = new QbotClient();
const apiKey = process.env.ROBLOX_OPENCLOUD_KEY;
const groupId = config.groupId;

async function getRoleIdFromRank(rankNumber: number): Promise<string> {
    try {
        const res = await axios.get(`https://groups.roblox.com/v1/groups/${groupId}/roles`);
        const role = res.data.roles.find((r: any) => r.rank === rankNumber);
        return role ? role.id.toString() : '';
    } catch {
        return '';
    }
}

async function getRankNumberFromRoleId(roleId: string): Promise<number> {
    try {
        const res = await axios.get(`https://groups.roblox.com/v1/groups/${groupId}/roles`);
        const role = res.data.roles.find((r: any) => r.id.toString() === roleId.toString());
        return role ? role.rank : 0;
    } catch {
        return 0;
    }
}

export const robloxGroup: any = {
    id: groupId,
    name: 'Group',
    async getRank(userId: number): Promise<number> {
        try {
            const res = await axios.get(`https://apis.roblox.com/cloud/v1/groups/${groupId}/users/${userId}`, {
                headers: { 'x-api-key': apiKey }
            });
            const roleId = res.data.role.split('/').pop();
            return await getRankNumberFromRoleId(roleId);
        } catch {
            return 1;
        }
    },
    async setRank(userId: number, rankOrRoleId: number): Promise<any> {
        let roleId = rankOrRoleId.toString();
        if (rankOrRoleId <= 255) {
            const mappedId = await getRoleIdFromRank(rankOrRoleId);
            if (mappedId) roleId = mappedId;
        }
        const res = await axios.patch(
            `https://apis.roblox.com/cloud/v1/groups/${groupId}/users/${userId}`,
            { roleId },
            { headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' } }
        );
        return res.data;
    },
    async promote(userId: number): Promise<any> {
        const currentRank = await this.getRank(userId);
        const res = await axios.get(`https://groups.roblox.com/v1/groups/${groupId}/roles`);
        const roles = res.data.roles.sort((a: any, b: any) => a.rank - b.rank);
        const currentIndex = roles.findIndex((r: any) => r.rank === currentRank);
        if (currentIndex < roles.length - 1) {
            return await this.setRank(userId, roles[currentIndex + 1].rank);
        }
        throw new Error('User is already at the highest rank.');
    },
    async demote(userId: number): Promise<any> {
        const currentRank = await this.getRank(userId);
        const res = await axios.get(`https://groups.roblox.com/v1/groups/${groupId}/roles`);
        const roles = res.data.roles.sort((a: any, b: any) => a.rank - b.rank);
        const currentIndex = roles.findIndex((r: any) => r.rank === currentRank);
        if (currentIndex > 0) {
            return await this.setRank(userId, roles[currentIndex - 1].rank);
        }
        throw new Error('User is already at the lowest rank.');
    },
    async getMember(userId: number): Promise<any> {
        const rank = await this.getRank(userId);
        const res = await axios.get(`https://groups.roblox.com/v1/groups/${groupId}/roles`);
        const role = res.data.roles.find((r: any) => r.rank === rank) || { id: 0, name: 'Guest', rank: 0 };
        return {
            id: userId,
            role: {
                id: role.id,
                name: role.name,
                rank: role.rank
            }
        };
    },
    async updateMember(userId: number, options: { role: number }): Promise<any> {
        return await this.setRank(userId, options.role);
    },
    async kickMember(userId: number): Promise<any> {
        const res = await axios.delete(
            `https://apis.roblox.com/cloud/v1/groups/${groupId}/users/${userId}`,
            { headers: { 'x-api-key': apiKey } }
        );
        return res.data;
    },
    async getRoles() {
        const res = await axios.get(`https://groups.roblox.com/v1/groups/${groupId}/roles`);
        return res.data.roles;
    },
    async getShout() {
        const res = await axios.get(`https://groups.roblox.com/v1/groups/${groupId}`);
        return res.data.shout;
    },
    async updateShout(message: string) {
        const res = await axios.patch(
            `https://apis.roblox.com/cloud/v1/groups/${groupId}`,
            { shout: message },
            { headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' } }
        );
        return res.data;
    },
    async setShout(message: string) {
        return await this.updateShout(message);
    },
    async getJoinRequests() {
        const res = await axios.get(`https://groups.roblox.com/v1/groups/${groupId}/join-requests`);
        return res.data;
    },
    async acceptJoinRequest(userId: number) {
        const res = await axios.post(`https://groups.roblox.com/v1/groups/${groupId}/join-requests/users/${userId}`);
        return res.data;
    },
    async declineJoinRequest(userId: number) {
        const res = await axios.delete(`https://groups.roblox.com/v1/groups/${groupId}/join-requests/users/${userId}`);
        return res.data;
    }
};

export const robloxClient: any = {
    async getUser(userId: number) {
        const res = await axios.get(`https://users.roblox.com/v1/users/${userId}`);
        return res.data;
    },
    async getUsersByUsernames(usernames: string[]) {
        const res = await axios.post(`https://users.roblox.com/v1/usernames/users`, { usernames });
        return res.data.data;
    },
    async getGroup() {
        return robloxGroup;
    },
    apis: {
        user: {
            async getUserInfo(userId: number) {
                const res = await axios.get(`https://users.roblox.com/v1/users/${userId}`);
                return res.data;
            },
            async getUsersByUsernames(usernames: string[]) {
                const res = await axios.post(`https://users.roblox.com/v1/usernames/users`, { usernames });
                return res.data.data;
            }
        }
    }
};

discordClient.on('interactionCreate', handleInteraction as any);
discordClient.on('messageCreate', handleLegacyCommand);

discordClient.login(config.discordToken).then(() => {
    console.log('✓ Qbot started successfully with Open Cloud compatibility layer!');
}).catch((err) => {
    console.error('Failed to log into Discord:', err);
});

export { discordClient };
