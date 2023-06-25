"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MirrorClient = void 0;
const discord_js_selfbot_v13_1 = require("discord.js-selfbot-v13");
const messageUtils_1 = require("./messageUtils");
const mirror_1 = require("./mirror");
const config_json_1 = __importDefault(require("../config.json"));
class MirrorClient extends discord_js_selfbot_v13_1.Client {
    constructor(options) {
        super(options);
        this.mirrors = {};
        this.loadConfigMirrors();
    }
    loadConfigMirrors() {
        for (const mirrorData of config_json_1.default.mirrors) {
            const mirror = new mirror_1.Mirror(mirrorData);
            for (const channelId of mirrorData.channel_ids) {
                this.mirrors[channelId] = mirror;
            }
        }
    }
    start() {
        this.on('ready', this['onReady']);
        this.on('messageCreate', this['onMessage']);
    }
    onReady() {
        var _a, _b;
        (_a = this.user) === null || _a === void 0 ? void 0 : _a.setStatus(config_json_1.default.status);
        console.log(`${(_b = this.user) === null || _b === void 0 ? void 0 : _b.tag} is now mirroring! >:)`);
    }
    onMessage(message) {
        if ((0, messageUtils_1.isSystemMessage)(message) || (0, messageUtils_1.isDirectMessage)(message) || (0, messageUtils_1.isVisibleOnlyByClient)(message) || (0, messageUtils_1.containsOnlyStickers)(message)) {
            return;
        }
        const mirror = this.mirrors[message.channelId];
        if (!mirror) {
            return;
        }
        if (!mirror.messageMeetsRequirements(message)) {
            return;
        }
        if (mirror.isIgnoredUser(message.author.id)) {
            return;
        }
        if (mirror.getOptions() & mirror_1.MirrorOptions.RemoveMessageAttachments) {
            if ((0, messageUtils_1.containsOnlyAttachments)(message)) {
                return;
            }
            message.attachments.clear();
        }
        mirror.processMessageReplacements(message);
        mirror.mirrorMessageToWebhooks(message, () => {
            if (config_json_1.default.log_message && config_json_1.default.log_message.length) {
                this.logMessageMirrored(message);
            }
        });
    }
    logMessageMirrored(message) {
        const date = new Date().toUTCString();
        console.log(config_json_1.default.log_message.replace('<date>', date).replace('<author>', message.author.tag).replace('<server>', message.guild.name));
    }
}
exports.MirrorClient = MirrorClient;
