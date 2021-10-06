"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var builders_1 = require("@discordjs/builders");
var orm_1 = require("../orm");
function createOrDelete(values, condition) {
    return orm_1.Config
        .findOne({ where: condition })
        .then(function (obj) {
        // update
        if (obj)
            return obj.update(values);
        // insert
        return orm_1.Config.create(values);
    });
}
module.exports = {
    data: new builders_1.SlashCommandBuilder()
        .setName('set_auto')
        .setDescription('Set data for the automatic screening generator')
        .addStringOption(function (option) {
        return option.setName('first_name')
            .setDescription('The first name to specify')
            .setRequired(true);
    })
        .addStringOption(function (option) {
        return option.setName('last_name')
            .setDescription('The last name to specify')
            .setRequired(true);
    })
        .addStringOption(function (option) {
        return option.setName('email')
            .setDescription('The email to specify')
            .setRequired(true);
    })
        .addBooleanOption(function (option) {
        return option.setName("vaccinated")
            .setDescription("Whether or not you are vaccinated.")
            .setRequired(true);
    }),
    execute: function (interaction) {
        return __awaiter(this, void 0, void 0, function () {
            var firstName, lastName, email, isVaxxed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        firstName = interaction.options.getString("first_name");
                        lastName = interaction.options.getString("last_name");
                        email = interaction.options.getString("email");
                        if (!!email.match(/^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/)) return [3 /*break*/, 2];
                        return [4 /*yield*/, interaction.reply("Invalid email! Please enter a valid email.")];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        isVaxxed = interaction.options.getBoolean("vaccinated");
                        return [4 /*yield*/, createOrDelete({
                                firstName: firstName,
                                lastName: lastName,
                                email: email,
                                isVaxxed: isVaxxed,
                                userId: String(interaction.user.id)
                            }, { userId: String(interaction.user.id) })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, interaction.reply("Updated!")];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    },
};
