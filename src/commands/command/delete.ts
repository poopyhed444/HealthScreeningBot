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
import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Op } from "sequelize";

import { Subcommand } from "../../client/command";
import { CommandLog } from "../../orm/commandLog";

export default class CommandDeleteCommand extends Subcommand {
  registerSubcommand(
    subcommand: SlashCommandSubcommandBuilder
  ): SlashCommandSubcommandBuilder {
    return subcommand
      .setName("delete")
      .setDescription("Delete an individual command log entry")
      .addIntegerOption((option) =>
        option
          .setName("id")
          .setDescription("The ID of the command log entry to delete.")
          .setRequired(true)
      )
      .addBooleanOption((option) =>
        option
          .setName("ephemeral")
          .setDescription("Whether the contents are hidden to everyone else")
          .setRequired(false)
      );
  }
  async execute(interaction: CommandInteraction) {
    const id: number = interaction.options.getInteger("id", true);
    const ephemeral =
      interaction.options.getBoolean("ephemeral", false) ?? true;
    const item: CommandLog | null = await CommandLog.findOne({
      where: {
        id: {
          [Op.eq]: id,
        },
      },
    });
    if (!item) {
      return await interaction.reply({
        content: "No command log entry with that ID found.",
        ephemeral,
      });
    }
    await item.destroy();
    return await interaction.reply({
      content: "Deleted command log entry with ID " + id + ".",
      ephemeral,
    });
  }
}
