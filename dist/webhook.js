"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MirrorWebhook = void 0;
const discord_js_selfbot_v13_1 = require("discord.js-selfbot-v13");
class MirrorWebhook extends discord_js_selfbot_v13_1.WebhookClient {
    constructor(webhookUrl, useWebhookProfile = false) {
        super({ url: webhookUrl });
        if (!useWebhookProfile) {
            return;
        }
        fetch(webhookUrl)
            .then(response => {
            if (!response.ok) {
                console.error(`Unable to use custom profile for webhook ${webhookUrl}, an error occurred: ${response.statusText} (${response.status}).`);
                return undefined;
            }
            return response.json();
        })
            .then(data => {
            if (data) {
                this['fillWebhookProfile'](data);
            }
        })
            .catch((error) => console.error(`Unable to use custom profile for webhook ${webhookUrl}: ${error}`));
    }
    fillWebhookProfile(data) {
        this.profileName = data['name'];
        this.profileAvatar = data['avatar'];
        this.profileAvatarUrl = !this.profileAvatar ? undefined : `https://cdn.discordapp.com/avatars/${this.id}/${this.profileAvatar}.webp`;
    }
}
exports.MirrorWebhook = MirrorWebhook;
