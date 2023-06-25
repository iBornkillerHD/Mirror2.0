import { Message, MessageEmbed, MessageEmbedAuthor, EmbedField, EmbedFooterData } from "discord.js-selfbot-v13";

type StringToString = {[key: string]: string};
type NumberToNumber = {[key: number]: number};
type MessageReplacementsData = {[key: string]: any};

export class MessageReplacements {
   private content: StringToString = {};
   private embedAuthor: StringToString = {};
   private embedAuthorUrl: StringToString = {};
   private embedAuthorIconUrl: StringToString = {};
   private embedTitle: StringToString = {};
   private embedDescription: StringToString = {};
   private embedUrl: StringToString = {};
   private embedColor: NumberToNumber = {};
   private embedFieldName: StringToString = {};
   private embedFieldValue: StringToString = {};
   private embedImageUrl: StringToString = {};
   private embedThumbnailUrl: StringToString = {};
   private embedFooter: StringToString = {};
   private embedFooterIconUrl: StringToString = {};

   public constructor(data: MessageReplacementsData) {
      this.fillMessageReplacementsData(data);
   }

   private fillMessageReplacementsData(data: MessageReplacementsData): void {
      if (data.content) {
         this.fill(this.content, data.content);
      }

      if (data.embed) {
         this.fillEmbedReplacementsData(data.embed);
      }
   }

   private fillEmbedReplacementsData(data: MessageReplacementsData): void {
      if (data.author) {
         this.fill(this.embedAuthor, data.author);
      }

      if (data.author_url) {
         this.fill(this.embedAuthorUrl, data.author_url);
      }

      if (data.author_icon_url) {
         this.fill(this.embedAuthorIconUrl, data.author_icon_url);
      }

      if (data.title) {
         this.fill(this.embedTitle, data.title);
      }

      if (data.description) {
         this.fill(this.embedDescription, data.description);
      }

      if (data.url) {
         this.fill(this.embedUrl, data.url);
      }

      if (data.color) {
         this.fillColor(this.embedColor, data.color);
      }

      if (data.field_name) {
         this.fill(this.embedFieldName, data.field_name);
      }

      if (data.field_value) {
         this.fill(this.embedFieldValue, data.field_value);
      }

      if (data.image_url) {
         this.fill(this.embedImageUrl, data.image_url);
      }

      if (data.thumbnail_url) {
         this.fill(this.embedThumbnailUrl, data.thumbnail_url);
      }

      if (data.footer) {
         this.fill(this.embedFooter, data.footer);
      }

      if (data.footer_icon_url) {
         this.fill(this.embedFooterIconUrl, data.footer_icon_url);
      }
   }

   private fill(object: any, data: any): void {
      for (const pair of data) {
         object[pair.replace] = pair.with; 
      }
   }

   private fillColor(object: any, data: any): void {
      for (const pair of data) {
         const replace = parseInt(pair.replace, 16);

         if (isNaN(replace)) {
            throw new Error(`Invalid color in config: ${pair.replace}. Only hex is allowed (e.g. 0xFF0000).`);
         }

         const w = parseInt(pair.with, 16);

         if (isNaN(w)) {
            throw new Error(`Invalid color in config: ${pair.with}. Only hex is allowed (e.g. 0xFF0000).`);
         }

         object[replace] = w;
      }
   }

   public processMessage(message: Message): void {
      this.replaceString(message, 'content', this.content);

      for (const embed of message.embeds) {
         this.processEmbed(embed);
      }
   }

   private processEmbed(embed: MessageEmbed): void {
      if (embed.author) {
         this.processEmbedAuthor(embed.author);
      }

      if (embed.title) {
         this.replaceString(embed, 'title', this.embedTitle);
      }

      if (embed.description) {
         this.replaceString(embed, 'description', this.embedDescription);
      }

      if (embed.url) {
         this.replaceString(embed, 'url', this.embedUrl);
      }

      if (embed.color) {
         this.replaceColor(embed, 'color', this.embedColor);
      }

      for (const field of embed.fields) {
         this.processEmbedField(field);
      }

      if (embed.image) {
         this.replaceString(embed.image, 'url', this.embedImageUrl);
      }

      if (embed.thumbnail) {
         this.replaceString(embed.thumbnail, 'url', this.embedThumbnailUrl);
      }

      if (embed.footer) {
         this.processEmbedFooter(embed.footer);
      }
   }

   private processEmbedAuthor(author: MessageEmbedAuthor): void {
      this.replaceString(author, 'name', this.embedAuthor);
   
      if (author.url) {
         this.replaceString(author, 'url', this.embedAuthorUrl);
      }

      if (author.iconURL) {
         this.replaceString(author, 'iconURL', this.embedAuthorIconUrl);
      }
   }

   private processEmbedField(field: EmbedField): void {
      const emptyString: string = '\u200b';

      if (field.name != emptyString) {
         this.replaceString(field, 'name', this.embedFieldName);
      }

      if (field.value != emptyString) {
         this.replaceString(field, 'value', this.embedFieldValue);
      }
   }

   private processEmbedFooter(footer: EmbedFooterData): void {
      this.replaceString(footer, 'text', this.embedFooter);

      if (footer.iconURL) {
         this.replaceString(footer, 'iconURL', this.embedFooterIconUrl);
      }
   }

   private replaceString(object: any, attribute: string, replacePairs: StringToString) {
      for (const [replace, w] of Object.entries(replacePairs)) {
         const regex = new RegExp(replace, "i");
         object[attribute] = object[attribute].replace(regex, w);
      }   
   }

   private replaceColor(object: any, attribute: string, replacePairs: NumberToNumber) {
      for (const [replace, w] of Object.entries(replacePairs)) {
         const currentColor = <number>object[attribute];
         const colorToReplace = <number><unknown>replace;
         const offset = 1000;

         // Replace very similar colors too.
         if (currentColor >= colorToReplace - offset && currentColor <= colorToReplace + offset) {
            object[attribute] = w;
         }
      }   
   }
}