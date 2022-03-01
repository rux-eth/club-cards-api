/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import { ethers, Signer } from 'ethers';
import { arrayify } from 'ethers/lib/utils';
import { ClaimSigParams, MintSigParams, SigResponse } from './types';

export default function createSig(
    senderAddy: string,
    params: ClaimSigParams | MintSigParams,
    nonce: number,
    signer: Signer,
    contractAddress: string,
    timestamp?: number
): Promise<SigResponse | string> {
    return new Promise((resolve, reject) => {
        const ts = timestamp || Math.round(Date.now() / 1000);
        const message: string = (<ClaimSigParams>params).tokenIds
            ? ethers.utils.defaultAbiCoder.encode(
                  ['address', 'uint256[]', 'uint256[]', 'uint256', 'uint256'],
                  [
                      senderAddy,
                      (<ClaimSigParams>params).tokenIds,
                      (<ClaimSigParams>params).amounts,
                      nonce,
                      ts,
                  ]
              )
            : ethers.utils.defaultAbiCoder.encode(
                  ['address', 'uint256', 'uint256', 'uint256', 'uint256'],
                  [
                      senderAddy,
                      (<MintSigParams>params).numMints,
                      (<MintSigParams>params).editionId,
                      nonce,
                      ts,
                  ]
              );
        const hashed = ethers.utils.keccak256(message);
        signer
            .signMessage(arrayify(hashed))
            .then((sig2) => {
                const recAddress = ethers.utils.recoverAddress(
                    arrayify(ethers.utils.hashMessage(arrayify(hashed))),
                    sig2
                );
                signer.getAddress().then((address) => {
                    if (recAddress === address) {
                        if (senderAddy === contractAddress) {
                            resolve(sig2);
                        } else {
                            createSig(
                                contractAddress,
                                params,
                                nonce,
                                signer,
                                contractAddress,
                                ts
                            ).then((sig) => {
                                resolve(<SigResponse>{
                                    timestamp: ts,
                                    signature1: sig,
                                    signature2: sig2,
                                });
                            });
                        }
                    } else {
                        reject(new Error(`Unable to recover address`));
                    }
                });
            })
            .catch((err) => {
                reject(err);
            });
    });
}
export { ClaimSigParams, MintSigParams, SigResponse };
