"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.network = exports.conABI = exports.conAddress = void 0;
const dotenv = require("dotenv");
const CC_Main_1 = require("./CC-Main");
const CC_Rink_1 = require("./CC-Rink");
dotenv.config();
if (!(process.env.NODE_ENV === "test" || "development" || "production")) {
    throw Error("No NODE_ENV Specified. Configure in environment variables");
}
let conAddress, conABI, network;
exports.conAddress = conAddress;
exports.conABI = conABI;
exports.network = network;
if (process.env.NODE_ENV === "production") {
    exports.conAddress = conAddress = CC_Main_1.default.address;
    exports.conABI = conABI = CC_Main_1.default.abi;
    exports.network = network = "mainnet";
}
else {
    exports.conAddress = conAddress = CC_Rink_1.default.address;
    exports.conABI = conABI = CC_Rink_1.default.abi;
    exports.network = network = "rinkeby";
}
