import { WebhookClient } from 'discord.js-selfbot-v13';

type WebhookData = {
   [key: string]: any
}

export class MirrorWebhook extends WebhookClient {
   public profileName: string | undefined;
   public profileAvatar: string | undefined;
   public profileAvatarUrl: string | undefined;

   public constructor(webhookUrl: string, useWebhookProfile: boolean = false) {
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

   private fillWebhookProfile(data: WebhookData): void {
      this.profileName = data['name'];
      this.profileAvatar = data['avatar'];
      this.profileAvatarUrl = !this.profileAvatar ? undefined : `https://cdn.discordapp.com/avatars/${this.id}/${this.profileAvatar}.webp`;
   }
}