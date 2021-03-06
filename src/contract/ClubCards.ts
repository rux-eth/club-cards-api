/* eslint-disable camelcase */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import { Provider } from '@ethersproject/abstract-provider';
import * as dotenv from 'dotenv';
import { Contract, ethers, Signer } from 'ethers';
import cc_m from './CC-Main';
import cc_r from './CC-Rink';
import ccat_m from './CCAuth-Main';
import ccat_r from './CCAuth-Rink';

dotenv.config();

export interface Contracts {
    ClubCards: Contract;
    CCAuthTx: Contract;
}
const currNetwork: string = <string>process.env.NETWORK;
const node: Provider = new ethers.providers.InfuraProvider(currNetwork, process.env.INFURA_ID);
export const admin: Signer = new ethers.Wallet(
    currNetwork === 'mainnet' ? process.env.PRIVATE_KEY_ADMIN : process.env.PRIVATE_KEY_ADMIN_TEST,
    node
);
const conData: { cc: { address: string; abi: any }; ccat: { address: string; abi: any } } =
    currNetwork === 'mainnet'
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

export default contracts;
