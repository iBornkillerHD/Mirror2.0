import { MirrorClient } from "./client";
import { Intents } from "discord.js-selfbot-v13";
import config from '../config.json';

const client = new MirrorClient({
    checkUpdate: false,
    intents: [ Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.MESSAGE_CONTENT ]
});

client.start();
client.login(config.token);