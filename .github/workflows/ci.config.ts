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

import { Options } from "sequelize";

// This is a sample config.ts file so that typescript compilation succeeds on
// continuous integration.

export const database: Options = {
  dialect: "postgres",
  username: "user",
  password: "user",
  database: "user",
  host: "localhost",
  port: 5432,
};

export const discord = {
  token: "token",
  clientId: "id",
  guildId: "id",
};

export const github = {
  token: "token",
  owner: "HealthScreening",
  repo: "HealthScreeningBot",
};