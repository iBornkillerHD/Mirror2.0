"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./client");
const discord_js_selfbot_v13_1 = require("discord.js-selfbot-v13");
const config_json_1 = __importDefault(require("../config.json"));
const client = new client_1.MirrorClient({
    checkUpdate: false,
    intents: [discord_js_selfbot_v13_1.Intents.FLAGS.GUILD_MESSAGES, discord_js_selfbot_v13_1.Intents.FLAGS.MESSAGE_CONTENT]
});
client.start();
client.login(config_json_1.default.token);
