import { Client, ClientOptions, Message, PresenceStatusData } from 'discord.js-selfbot-v13';
import { isDirectMessage, isSystemMessage, isVisibleOnlyByClient, containsOnlyAttachments, containsOnlyStickers } from './messageUtils';
import { Mirror, MirrorOptions } from './mirror';
import config from '../config.json';

type ChannelId = string;

type ChannelToMirror = {
   [key: ChannelId]: Mirror
};

export class MirrorClient extends Client {
   private mirrors: ChannelToMirror = {};

   public constructor(options: ClientOptions | undefined) {
      super(options);
      this.loadConfigMirrors();
   }

   private loadConfigMirrors() {
      for (const mirrorData of config.mirrors) {
         const mirror = new Mirror(mirrorData);
         
         for (const channelId of mirrorData.channel_ids) {
            this.mirrors[channelId] = mirror;
         }
      }
   }

   public start(): void {
      this.on('ready', this['onReady']);
      this.on('messageCreate', this['onMessage']);
   }

   private onReady(): void {
      this.user?.setStatus(<PresenceStatusData>config.status);
      console.log(`${this.user?.tag} is now mirroring! >:)`);
   }

   private onMessage(message: Message): void {
      if (isSystemMessage(message) || isDirectMessage(message) || isVisibleOnlyByClient(message) || containsOnlyStickers(message)) {
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

      if (mirror.getOptions() & MirrorOptions.RemoveMessageAttachments) {
         if (containsOnlyAttachments(message)) {
            return;
         }

         message.attachments.clear();
      }

      mirror.processMessageReplacements(message);

      mirror.mirrorMessageToWebhooks(message, () => {
         if (config.log_message && config.log_message.length) {
            this.logMessageMirrored(message);
         }
      });
   }

   private logMessageMirrored(message: Message): void {
      const date = new Date().toUTCString();
      console.log(config.log_message.replace('<date>', date).replace('<author>', message.author.tag).replace('<server>', message.guild!.name));
   }
}