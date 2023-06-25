import { Message } from 'discord.js-selfbot-v13';
import { MirrorWebhook } from './webhook';
import { MessageReplacements } from './messageReplacements';

type MirrorData = {
   [key: string]: any
}

export class MirrorRequirements {
   public minEmbedsCount: number = 0;
   public minContentLength: number = 0;
   public minAttachmentsCount: number = 0;
}

export enum MirrorOptions {
   UseWebhookProfile = 1 << 0,
   RemoveMessageAttachments = 1 << 1,
   MirrorMessagesFromBots = 1 << 2,
   MirrorReplyMessages = 1 << 3
}

export class Mirror {
   private webhooks: MirrorWebhook[] = [];
   private ignoredUserIds: Set<string> = new Set();
   private requirements: MirrorRequirements = new MirrorRequirements();
   private options: MirrorOptions = MirrorOptions.MirrorMessagesFromBots;
   private replacements: MessageReplacements | undefined;

   public constructor(data: MirrorData) {
      this.fillMirrorData(data);
   }

   private fillMirrorData(data: MirrorData): void {
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

      this.webhooks = data.webhook_urls.map((webhookUrl: string) => new MirrorWebhook(webhookUrl, <boolean><unknown>(this.options & MirrorOptions.UseWebhookProfile)));

      if (data.ignored_user_ids) {
         this.ignoredUserIds = new Set([...data.ignored_user_ids]);
      }

      if (data.requirements) {
         this.requirements.minAttachmentsCount = data.requirements?.min_attachments_count ?? 0;
         this.requirements.minContentLength = data.requirements?.min_content_length ?? 0;
         this.requirements.minEmbedsCount = data.requirements?.min_embeds_count ?? 0;
      }

      if (data.replacements) {
         this.replacements = new MessageReplacements(data.replacements);
      }
   }

   public isIgnoredUser(userId: string): boolean {
      return this.ignoredUserIds.has(userId);
   }

   public processMessageReplacements(message: Message): void {
      this.replacements?.processMessage(message);
   }

   public mirrorMessageToWebhooks(message: Message, successCallback: () => void): void {
      let mirroredMessagesCount = 0;

      for (const webhook of this.webhooks) {
         const maxContentLengthPerMessage = 2000;
         const partialMessagesCount = Math.floor(message.content.length / (maxContentLengthPerMessage + 1)) + 1;
         let sendFailed = false;

         const sendPartialMessageCallback = (i: number) => {
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
               console.error(`Failed to mirror a message (partial ${i + 1}/${partialMessagesCount}): ${error}`)
               sendFailed = true;
            });
         }

         sendPartialMessageCallback(0);

         for (let i = 1; i < partialMessagesCount; i++) {
            setTimeout(sendPartialMessageCallback, 500, i);
         }
      }
   }
   
   public messageMeetsRequirements(message: Message): boolean {
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

   public getOptions(): MirrorOptions {
      return this.options;
   }
}
