"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = void 0;
const dotenv = require("dotenv");
const ethers_1 = require("ethers");
const CC_Main_1 = require("./CC-Main");
const CC_Rink_1 = require("./CC-Rink");
const CCAuth_Main_1 = require("./CCAuth-Main");
const CCAuth_Rink_1 = require("./CCAuth-Rink");
dotenv.config();
const currNetwork = process.env.NETWORK;
const node = new ethers_1.ethers.providers.InfuraProvider(currNetwork, process.env.INFURA_ID);
exports.admin = new ethers_1.ethers.Wallet(currNetwork === 'mainnet' ? process.env.PRIVATE_KEY_ADMIN : process.env.PRIVATE_KEY_ADMIN_TEST, node);
const conData = currNetwork === 'mainnet'
    ? {
        cc: { address: CC_Main_1.default.address, abi: CC_Main_1.default.abi },
        ccat: { address: CCAuth_Main_1.default.address, abi: CCAuth_Main_1.default.abi },
    }
    : {
        cc: { address: CC_Rink_1.default.address, abi: CC_Rink_1.default.abi },
        ccat: { address: CCAuth_Rink_1.default.address, abi: CCAuth_Rink_1.default.abi },
    };
const contracts = {
    ClubCards: new ethers_1.ethers.Contract(conData.cc.address, conData.cc.abi, exports.admin),
    CCAuthTx: new ethers_1.ethers.Contract(conData.ccat.address, conData.ccat.abi, exports.admin),
};
exports.default = contracts;
