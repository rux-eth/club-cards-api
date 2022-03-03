"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recPostSig = void 0;
/* eslint-disable prettier/prettier */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
function createSig(senderAddy, params, nonce, signer, contractAddress, timestamp) {
    return new Promise((resolve, reject) => {
        const ts = timestamp || Math.round(Date.now() / 1000);
        const message = params.tokenIds
            ? ethers_1.ethers.utils.defaultAbiCoder.encode(['address', 'uint256[]', 'uint256[]', 'uint256', 'uint256'], [
                senderAddy,
                params.tokenIds,
                params.amounts,
                nonce,
                ts,
            ])
            : ethers_1.ethers.utils.defaultAbiCoder.encode(['address', 'uint256', 'uint256', 'uint256', 'uint256'], [
                senderAddy,
                params.numMints,
                params.editionId,
                nonce,
                ts,
            ]);
        const hashed = ethers_1.ethers.utils.keccak256(message);
        signer
            .signMessage((0, utils_1.arrayify)(hashed))
            .then((sig2) => {
            const recAddress = ethers_1.ethers.utils.recoverAddress((0, utils_1.arrayify)(ethers_1.ethers.utils.hashMessage((0, utils_1.arrayify)(hashed))), sig2);
            signer.getAddress().then((address) => {
                if (recAddress === address) {
                    if (senderAddy === contractAddress) {
                        resolve(sig2);
                    }
                    else {
                        createSig(contractAddress, params, nonce, signer, contractAddress, ts).then((sig) => {
                            resolve({
                                timestamp: ts,
                                signature1: sig,
                                signature2: sig2,
                            });
                        });
                    }
                }
                else {
                    reject(new Error(`Unable to recover address`));
                }
            });
        })
            .catch((err) => {
            reject(err);
        });
    });
}
exports.default = createSig;
function recPostSig(auth) {
    const nonce = ethers_1.BigNumber.from(auth.content.postNonce);
    const newAuth = JSON.stringify(auth.content);
    const message = ethers_1.ethers.utils.defaultAbiCoder.encode(['uint256', 'string'], [nonce, newAuth]);
    const hashed = ethers_1.ethers.utils.keccak256(message);
    return ethers_1.ethers.utils.recoverAddress((0, utils_1.arrayify)(ethers_1.ethers.utils.hashMessage((0, utils_1.arrayify)(hashed))), auth.signature);
}
exports.recPostSig = recPostSig;
