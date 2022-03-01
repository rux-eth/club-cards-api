"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const ethers_1 = require("ethers");
const CC_Main_1 = require("./CC-Main");
const CC_Rink_1 = require("./CC-Rink");
const CCAuth_Main_1 = require("./CCAuth-Main");
const CCAuth_Rink_1 = require("./CCAuth-Rink");
dotenv.config();
if (!(process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'production')) {
    throw Error('No NODE_ENV Specified. Configure in environment variables');
}
const node = new ethers_1.ethers.providers.InfuraProvider(process.env.NODE_ENV === 'production' ? 'mainnet' : 'rinkeby', process.env.INFURA_ID);
const admin = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY_ADMIN, node);
const conData = process.env.NODE_ENV === 'production'
    ? {
        cc: { address: CC_Main_1.default.address, abi: CC_Main_1.default.abi },
        ccat: { address: CCAuth_Main_1.default.address, abi: CCAuth_Main_1.default.abi },
    }
    : {
        cc: { address: CC_Rink_1.default.address, abi: CC_Rink_1.default.abi },
        ccat: { address: CCAuth_Rink_1.default.address, abi: CCAuth_Rink_1.default.abi },
    };
const contracts = {
    ClubCards: new ethers_1.ethers.Contract(conData.cc.address, conData.cc.abi, admin),
    CCAuthTx: new ethers_1.ethers.Contract(conData.ccat.address, conData.ccat.abi, admin),
};
exports.default = contracts;
