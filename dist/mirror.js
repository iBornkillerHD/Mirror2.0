"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mirror = exports.MirrorOptions = exports.MirrorRequirements = void 0;
const webhook_1 = require("./webhook");
const messageReplacements_1 = require("./messageReplacements");
class MirrorRequirements {
    constructor() {
        this.minEmbedsCount = 0;
        this.minContentLength = 0;
        this.minAttachmentsCount = 0;
    }
}
exports.MirrorRequirements = MirrorRequirements;
var MirrorOptions;
(function (MirrorOptions) {
    MirrorOptions[MirrorOptions["UseWebhookProfile"] = 1] = "UseWebhookProfile";
    MirrorOptions[MirrorOptions["RemoveMessageAttachments"] = 2] = "RemoveMessageAttachments";
    MirrorOptions[MirrorOptions["MirrorMessagesFromBots"] = 4] = "MirrorMessagesFromBots";
    MirrorOptions[MirrorOptions["MirrorReplyMessages"] = 8] = "MirrorReplyMessages";
})(MirrorOptions = exports.MirrorOptions || (exports.MirrorOptions = {}));
class Mirror {
    constructor(data) {
        this.webhooks = [];
        this.ignoredUserIds = new Set();
        this.requirements = new MirrorRequirements();
        this.options = MirrorOptions.MirrorMessagesFromBots;
        this.fillMirrorData(data);
    }
    fillMirrorData(data) {
        var _a, _b, _c, _d, _e, _f;
        if (data.options) {
            if (data.options.use_webhook_profile) {
                this.options |= MirrorOptions.UseWebhookProfile;
            }
            if (data.options.remove_attachments) {
                this.options |= MirrorOptions.RemoveMessageAttachments;
            }
            if (data.options.mirror_messages_from_bots) {
                this.options |= MirrorOptions.MirrorMessagesFromBots;
            }
            if (data.options.mirror_reply_messages) {
                this.options |= MirrorOptions.MirrorReplyMessages;
            }
        }
        if (!data.webhook_urls || !data.webhook_urls.length) {
            throw new Error("A mirror in the config does not have webhooks. A mirror must have at least one webhook.");
        }
        this.webhooks = data.webhook_urls.map((webhookUrl) => new webhook_1.MirrorWebhook(webhookUrl, (this.options & MirrorOptions.UseWebhookProfile)));
        if (data.ignored_user_ids) {
            this.ignoredUserIds = new Set([...data.ignored_user_ids]);
        }
        if (data.requirements) {
            this.requirements.minAttachmentsCount = (_b = (_a = data.requirements) === null || _a === void 0 ? void 0 : _a.min_attachments_count) !== null && _b !== void 0 ? _b : 0;
            this.requirements.minContentLength = (_d = (_c = data.requirements) === null || _c === void 0 ? void 0 : _c.min_content_length) !== null && _d !== void 0 ? _d : 0;
            this.requirements.minEmbedsCount = (_f = (_e = data.requirements) === null || _e === void 0 ? void 0 : _e.min_embeds_count) !== null && _f !== void 0 ? _f : 0;
        }
        if (data.replacements) {
            this.replacements = new messageReplacements_1.MessageReplacements(data.replacements);
        }
    }
    isIgnoredUser(userId) {
        return this.ignoredUserIds.has(userId);
    }
    processMessageReplacements(message) {
        var _a;
        (_a = this.replacements) === null || _a === void 0 ? void 0 : _a.processMessage(message);
    }
    mirrorMessageToWebhooks(message, successCallback) {
        let mirroredMessagesCount = 0;
        for (const webhook of this.webhooks) {
            const maxContentLengthPerMessage = 2000;
            const partialMessagesCount = Math.floor(message.content.length / (maxContentLengthPerMessage + 1)) + 1;
            let sendFailed = false;
            const sendPartialMessageCallback = (i) => {
                if (sendFailed) {
                    return;
                }
                const start = i * maxContentLengthPerMessage;
                const end = start + maxContentLengthPerMessage;
                webhook.send({
                    content: message.content.length ? message.content.substring(start, end) : null,
                    username: (this.options & MirrorOptions.UseWebhookProfile) ? webhook.profileName : message.author.username,
                    avatarURL: (this.options & MirrorOptions.UseWebhookProfile) ? webhook.profileAvatarUrl : message.author.displayAvatarURL(),
                    files: !i ? [...message.attachments.values()] : [],
                    embeds: !i ? message.embeds : undefined
                })
                    .then(() => {
                    if (!i && ++mirroredMessagesCount == this.webhooks.length) {
                        successCallback();
                    }
                })
                    .catch(error => {
                    console.error(`Failed to mirror a message (partial ${i + 1}/${partialMessagesCount}): ${error}`);
                    sendFailed = true;
                });
            };
            sendPartialMessageCallback(0);
            for (let i = 1; i < partialMessagesCount; i++) {
                setTimeout(sendPartialMessageCallback, 500, i);
            }
        }
    }
    messageMeetsRequirements(message) {
        if (!(this.options & MirrorOptions.MirrorMessagesFromBots) && message.author.bot) {
            return false;
        }
        if (!(this.options & MirrorOptions.MirrorReplyMessages) && message.reference) {
            return false;
        }
        if (message.content.length < this.requirements.minContentLength) {
            return false;
        }
        if (message.embeds.length < this.requirements.minEmbedsCount) {
            return false;
        }
        return message.attachments.size >= this.requirements.minAttachmentsCount;
    }
    getOptions() {
        return this.options;
    }
}
exports.Mirror = Mirror;
