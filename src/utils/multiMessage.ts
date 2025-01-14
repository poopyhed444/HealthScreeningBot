/**
 * Copyright (C) 2021 PythonCoderAS
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { Embed } from "@discordjs/builders";
import { APIMessage } from "discord-api-types";
import {
  CommandInteraction,
  HTTPAttachmentData,
  Message,
  MessageActionRow,
  MessageComponentInteraction,
  MessageEmbed,
  User,
} from "discord.js";

/**
 * The type of a given item. This is used in favor of comparing the output of typeof because
 * it is more reliable, as it will continue working even if the underlying type name changes.
 *
 * @enum {number}
 */

// eslint-disable-next-line no-shadow
export enum ItemType {
  interaction,
  user,
  message,
}

/**
 * Options that are shared by all target types.
 * At least one of {@link BaseMessageOptions.content} or {@link BaseMessageOptions.embeds} must be provided.
 */
interface BaseMessageOptions {
  /**
   * The text to send.
   */
  content?: string;
  /**
   * The embeds to send.
   */
  embeds?: (Embed | MessageEmbed)[];
  files?: HTTPAttachmentData[];
  replyMessage?: Message;
  /**
   * Whether to send the message if the message being replied to is deleted.
   *
   * If {@link BaseMessageOptions.replyMessage} is not provided, this will be ignored.
   */
  failIfNotExists?: boolean;
  /**
   * Whether to send the message as an ephemeral message. An ephemeral message is a message that can only be seen by
   * the user who created the interaction, but also vanishes if the client is restarted.
   */
  ephemeral?: boolean;
  components?: MessageActionRow[];
}

/**
 * Options that are used by interaction target types.
 * @extends {BaseMessageOptions}
 */
export interface InteractionMessageOptions extends BaseMessageOptions {
  itemType: ItemType.interaction;
  item: CommandInteraction | MessageComponentInteraction;
}

/**
 * Options that are used by user target types.
 * @extends {BaseMessageOptions}
 */
export interface UserMessageOptions extends BaseMessageOptions {
  itemType: ItemType.user;
  item: User;
}

/**
 * Options that are used by message target types.
 * @extends {BaseMessageOptions}
 */
export interface MessageMessageOptions extends BaseMessageOptions {
  itemType: ItemType.message;
  item: Message;
}

/**
 * A union type consisting of all possible message options.
 */
export type MessageOptions =
  | InteractionMessageOptions
  | UserMessageOptions
  | MessageMessageOptions;

export function serializeMessageOptions(options: MessageOptions): object {
  let itemOptions: [string, string | null];
  switch (options.itemType) {
    case ItemType.interaction:
      itemOptions = ["interaction", null];
      break;
    case ItemType.user:
      itemOptions = ["user", options.item.id];
      break;
    case ItemType.message:
      itemOptions = ["message", options.item.id];
      break;
  }
  return {
    item: {
      type: itemOptions[0],
      id: itemOptions[1],
    },
    text: {
      content: options.content || null,
      embeds: (options.embeds || []).map((embed) => embed.toJSON()),
      fileCount: (options.files || []).map((file) => file.name),
    },
    ephemeral: options.ephemeral || false,
    reply: {
      message: options.replyMessage ? options.replyMessage.id : null,
      failIfNotExists: options.failIfNotExists || false,
    },
  };
}

/**
 * The default options for fields in {@link MessageOptions} that are optional boolean fields.
 */
const defaultOptions = {
  ephemeral: false,
  failIfNotExists: false,
  files: [],
};

export function getUserID(options: MessageOptions): string {
  switch (options.itemType) {
    case ItemType.interaction:
      return options.item.user.id;
    case ItemType.user:
      return options.item.id;
    case ItemType.message:
      return options.item.author.id;
  }
}

export function sendMessage(
  options: MessageOptions
): Promise<Message | APIMessage> {
  const trueOptions: MessageOptions = { ...defaultOptions, ...options };
  switch (trueOptions.itemType) {
    case ItemType.user:
      return trueOptions.item.send({
        content: trueOptions.content,
        embeds: trueOptions.embeds,
        reply: {
          messageReference: trueOptions.replyMessage as Message<boolean>,
          failIfNotExists: trueOptions.failIfNotExists,
        },
        files: trueOptions.files,
        components: trueOptions.components,
      });
    case ItemType.message:
      return trueOptions.item.channel.send({
        content: trueOptions.content,
        embeds: trueOptions.embeds,
        reply: {
          messageReference: trueOptions.replyMessage as Message<boolean>,
          failIfNotExists: trueOptions.failIfNotExists,
        },
        files: trueOptions.files,
        components: trueOptions.components,
      });
    case ItemType.interaction:
      if (trueOptions.item.deferred || trueOptions.item.replied) {
        return trueOptions.item.followUp({
          content: trueOptions.content,
          embeds: trueOptions.embeds,
          ephemeral: trueOptions.ephemeral,
          files: trueOptions.files,
          components: trueOptions.components,
        });
      } else {
        return trueOptions.item.reply({
          content: trueOptions.content,
          embeds: trueOptions.embeds,
          ephemeral: trueOptions.ephemeral,
          files: trueOptions.files,
          components: trueOptions.components,
          fetchReply: true,
        });
      }
  }
}
