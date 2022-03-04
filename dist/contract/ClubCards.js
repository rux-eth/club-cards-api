"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = void 0;
const dotenv = require("dotenv");
const ethers_1 = require("ethers");
const CC_Main_1 = require("./CC-Main");
const CCAuth_Main_1 = require("./CCAuth-Main");
dotenv.config();
if (!(process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'production')) {
    throw Error('No NODE_ENV Specified. Configure in environment variables');
}
const node = new ethers_1.ethers.providers.InfuraProvider('mainnet', process.env.INFURA_ID);
exports.admin = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY_ADMIN, node);
const conData = {
    cc: { address: CC_Main_1.default.address, abi: CC_Main_1.default.abi },
    ccat: { address: CCAuth_Main_1.default.address, abi: CCAuth_Main_1.default.abi },
};
const contracts = {
    ClubCards: new ethers_1.ethers.Contract(conData.cc.address, conData.cc.abi, exports.admin),
    CCAuthTx: new ethers_1.ethers.Contract(conData.ccat.address, conData.ccat.abi, exports.admin),
};
exports.default = contracts;
