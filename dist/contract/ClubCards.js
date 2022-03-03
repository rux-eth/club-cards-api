"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const ethers_1 = require("ethers");
// import cc_m from './CC-Main';
const CC_Rink_1 = require("./CC-Rink");
// import ccat_m from './CCAuth-Main';
const CCAuth_Rink_1 = require("./CCAuth-Rink");
dotenv.config();
const node = new ethers_1.ethers.providers.InfuraProvider('rinkeby', process.env.INFURA_ID);
const admin = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY_ADMIN_TEST, node);
const contracts = {
    ClubCards: new ethers_1.ethers.Contract(CC_Rink_1.default.address, CC_Rink_1.default.abi, admin),
    CCAuthTx: new ethers_1.ethers.Contract(CCAuth_Rink_1.default.address, CCAuth_Rink_1.default.abi, admin),
};
/*
if (!(process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'production')) {
    throw Error('No NODE_ENV Specified. Configure in environment variables');
}
const node: Provider = new ethers.providers.InfuraProvider(
    process.env.NODE_ENV === 'production' ? 'mainnet' : 'rinkeby',
    process.env.INFURA_ID
);
const admin: Signer = new ethers.Wallet(process.env.PRIVATE_KEY_ADMIN, node);
const conData: { cc: { address: string; abi: any }; ccat: { address: string; abi: any } } =
    process.env.NODE_ENV === 'production'
        ? {
              cc: { address: cc_m.address, abi: cc_m.abi },
              ccat: { address: ccat_m.address, abi: ccat_m.abi },
          }
        : {
              cc: { address: cc_r.address, abi: cc_r.abi },
              ccat: { address: ccat_r.address, abi: ccat_r.abi },
          };
const contracts: Contracts = {
    ClubCards: new ethers.Contract(conData.cc.address, conData.cc.abi, admin),
    CCAuthTx: new ethers.Contract(conData.ccat.address, conData.ccat.abi, admin),
};
 */
exports.default = contracts;
