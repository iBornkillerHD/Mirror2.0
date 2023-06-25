"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.containsOnlyStickers = exports.containsOnlyAttachments = exports.isVisibleOnlyByClient = exports.isDirectMessage = exports.isSystemMessage = void 0;
const discord_js_selfbot_v13_1 = require("discord.js-selfbot-v13");
function isSystemMessage(message) {
    return message.system;
}
exports.isSystemMessage = isSystemMessage;
function isDirectMessage(message) {
    return !message.guild;
}
exports.isDirectMessage = isDirectMessage;
function isVisibleOnlyByClient(message) {
    return message.flags.has(discord_js_selfbot_v13_1.MessageFlags.FLAGS.EPHEMERAL);
}
exports.isVisibleOnlyByClient = isVisibleOnlyByClient;
function containsOnlyAttachments(message) {
    return message.attachments.size > 0 && !message.content.length && !message.embeds.length;
}
exports.containsOnlyAttachments = containsOnlyAttachments;
function containsOnlyStickers(message) {
    return message.stickers.size > 0 && !message.attachments.size && !message.content.length && !message.embeds.length;
}
exports.containsOnlyStickers = containsOnlyStickers;
