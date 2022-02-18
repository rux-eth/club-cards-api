"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const CC_Main_1 = require("./CC-Main");
const CC_Kovan_1 = require("./CC-Kovan");
dotenv.config();
if (!(process.env.NODE_ENV === "test" || "development" || "production")) {
    throw Error("No NODE_ENV Specified. Configure in environment variables");
}
const contractData = process.env.NODE_ENV === "production" ? CC_Main_1.default : CC_Kovan_1.default;
exports.default = contractData;
