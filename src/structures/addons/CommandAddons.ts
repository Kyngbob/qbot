import {
    Message,
    InteractionReplyOptions,
    CommandInteraction,
    User,
    Guild,
    GuildMember,
    BaseInteraction,
    MessageCreateOptions,
} from 'discord.js';
import { Command } from '../Command';
import { Args } from 'lexure';
import { getMissingArgumentsEmbed } from '../../handlers/locale';
import { config } from '../../config';

export class CommandContext  {
    type: 'interaction' | 'message';
    subject?: CommandInteraction | Message;
    user?: User;
    member?: GuildMember;
    guild?: Guild;
    args?: { [key: string]: any };
    replied: boolean;
    deferred: boolean;
    command: Command;

    /**
     * Command context for getting usage information and replying.
     * 
     * @param payload
     */
    constructor(payload: BaseInteraction | CommandInteraction | Message, command: any, args?: Args) {
        this.type = payload instanceof Message ? 'message' : 'interaction';
        this.subject = payload instanceof BaseInteraction ? payload as CommandInteraction : payload as Message;
        this.user = payload instanceof Message ? payload.author : (payload as any).user;
        this.member = payload.member as GuildMember;
        this.guild = payload.guild;
        this.command = new command();
        this.replied = false;
        this.deferred = false;

        this.args = {};
        if(payload instanceof BaseInteraction) {
            const interaction = payload as any;
            if (interaction.options && 'data' in interaction.options) {
                interaction.options.data.forEach(async (arg: any) => {
                    this.args[arg.name] = interaction.options.get(arg.name)?.value;
                });
            }
        } else {
            if (this.subject && 'channel' in this.subject && this.subject.channel && 'sendTyping' in this.subject.channel) {
                (this.subject.channel as any).sendTyping();
            }
            this.command.args?.forEach((arg: any) => { if(!arg.isLegacyFlag) this.args[arg.trigger] = args?.single() });
            const filledOutArgs = Object.keys(Object.fromEntries(Object.entries(this.args).filter(([_, v]) => v !== null)));
            const requiredArgs = this.command.args?.filter((arg: any) => (arg.required === undefined || arg.required === null ? true : arg.required) && !arg.isLegacyFlag) || [];
            if(filledOutArgs.length < requiredArgs.length) {
                this.reply({ embeds: [ getMissingArgumentsEmbed(this.command.trigger, this.command.args) ] });
                throw new Error('INVALID_USAGE');
            } else {
                if(args && args.length > requiredArgs.length) {
                    const extraArgs = args.many(1000, requiredArgs.length);
                    const lastKey = Object.keys(this.args).filter((key) => !this.command.args?.find((arg: any) => arg.trigger === key)?.isLegacyFlag).at(-1);
                    if (lastKey) {
                        this.args[lastKey] = [ this.args[lastKey], ...extraArgs.map((arg: any) => arg.value)].join(' ');
                    }
                }
                let areAllRequiredFlagsEntered = true;
                this.command.args?.filter((arg: any) => arg.isLegacyFlag).forEach((arg: any) => {
                    const flagValue = args?.option(arg.trigger);
                    if(!flagValue && arg.required) areAllRequiredFlagsEntered = false;
                    this.args[arg.trigger] = flagValue;
                });
                if(!areAllRequiredFlagsEntered) {
                    this.reply({ embeds: [ getMissingArgumentsEmbed(this.command.trigger, this.command.args) ] });
                    throw new Error('INVALID_USAGE');
                }
            }
        }
    }

    checkPermissions() {
        if(!this.command.permissions || this.command.permissions.length === 0) {
            return true;
        } else {
            let hasPermission: boolean | null = null;
            let permissions: any[] = [];
            this.command.permissions.map((permission: any) => {
                permission.ids.forEach((id: string) => {
                    permissions.push({
                        type: permission.type,
                        id,
                        value: permission.value,
                    });
                });
            });
            permissions.forEach((permission: any) => {
                let fitsCriteria: boolean = false;
                if(!hasPermission) {
                    if(config.permissions?.all && this.member?.roles?.cache?.some((role: any) => config.permissions.all.includes(role.id))) {
                        fitsCriteria = true;
                    } else {
                        if(permission.type === 'role') fitsCriteria = this.member?.roles?.cache?.has(permission.id) || false;
                        if(permission.type === 'user') fitsCriteria = this.member?.id === permission.id;
                    }
                    if(fitsCriteria) hasPermission = true;
                }
            });
            return hasPermission || false;
        }
    }

    /**
     * Send a message in the channel of the command message, or directly reply to a command interaction.
     * 
     * @param payload
     */
    async reply(payload: any) {
        this.replied = true;
        if(this.subject instanceof CommandInteraction) {
            try {
                const subject = this.subject as CommandInteraction;
                if(this.deferred) {
                    return await subject.editReply(payload as any);
                } else {
                    return await subject.reply(payload as any);
                }
            } catch (err) {
                const subject = this.subject as CommandInteraction;
                try {
                    if(this.deferred) {
                        return await subject.editReply(payload as any);
                    } else {
                        return await subject.reply(payload as any);
                    }
                } catch (err) {};
            }
        } else {
            if (this.subject && 'channel' in this.subject && this.subject.channel && 'send' in this.subject.channel) {
                return await (this.subject.channel as any).send(payload);
            }
        }
    }

    /**
     * Defers a reply.
     */
    async defer() {
        try {
            if(this.subject instanceof CommandInteraction) {
                const interaction = this.subject as CommandInteraction;
                if(!interaction.deferred && !interaction.replied) await interaction.deferReply();
            } else {
                if (this.subject && 'channel' in this.subject && this.subject.channel && 'sendTyping' in this.subject.channel) {
                    await (this.subject.channel as any).sendTyping();
                }
            }
            this.deferred = true;
        } catch (err) {};
    }
}
