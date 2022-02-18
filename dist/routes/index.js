"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const dotenv = require("dotenv");
const ClubCards_1 = require("../contract/ClubCards");
const ethers_1 = require("ethers");
const asyncHandler_1 = require("../asyncHandler");
const mongodb_1 = require("mongodb");
const crypto_1 = require("crypto");
dotenv.config();
const network = process.env.NODE_ENV === "production" ? "mainnet" : "kovan";
const collection = process.env.NODE_ENV === "production"
    ? process.env.COLL_MAIN
    : process.env.COLL_TEST;
const router = express.Router();
const node = new ethers_1.ethers.providers.InfuraProvider(network, process.env.INFURA_ID);
const signer = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY_ADMIN, node);
const contract = new ethers_1.ethers.Contract(ClubCards_1.default.address, ClubCards_1.default.abi, signer);
const hiddenMetadata = {
    image: "https://gateway.pinata.cloud/ipfs/QmSrozmfM7BeQVCzpgnHK71SFehgUZoS2Pb3jTYDbPkRoQ",
    description: "Thank you for participating in the public sale! Wen reveal? Soon! CC 👊",
    name: "Club Cards: MetaSharks #2",
};
let currentSupply;
const checkSupply = async () => {
    currentSupply = (await contract.totalSupply()).toNumber();
    console.log(currentSupply);
};
const interval = setInterval(checkSupply, 10000);
// Contract event handlers
contract.on("WaveStartIndexBlockSet", async (waveId, SIB) => {
    try {
        console.log("SIB Set!");
        await contract.setWaveStartIndex(waveId.toNumber());
    }
    catch (_a) { }
});
contract.on("WaveStartIndexSet", async (waveId, startIndex) => {
    try {
        await reIndexMeta(waveId.toNumber(), startIndex.toNumber());
        console.log("reIndex Success");
    }
    catch (_a) { }
});
// functions
async function reIndexMeta(waveId, startIndex) {
    try {
        const client = new mongodb_1.MongoClient(process.env.MONGODB_URL);
        await client.connect();
        const coll = client.db("club-cards").collection(collection);
        let data = await coll.findOne({ waveId: waveId });
        if (data.reIndexed !== true) {
            let shifted = shiftArray(data.metadata, startIndex);
            if (testHash(shifted, data.provHash)) {
                for (let i = 0; i < shifted.length; i++) {
                    let temp = {};
                    temp.animation_url = shifted[i].animation_url;
                    temp.image = shifted[i].image;
                    temp.attributes = shifted[i].attributes;
                    temp.name = `Club Cards: MetaSharks #${i}`;
                    shifted[i] = temp;
                }
                data.reIndexed = true;
                const filter = { waveId: waveId };
                const options = { upsert: false };
                const update = {
                    $set: data,
                };
                await coll.updateOne(filter, update, options);
            }
            else {
                console.error("Prov Hashes dont match!");
            }
        }
    }
    catch (_a) { }
}
function shiftArray(arr, shift) {
    if (arr.length < shift) {
        throw Error("Invalid inputs");
    }
    let left;
    let right;
    arr.reverse();
    left = 0;
    right = shift - 1;
    while (left <= right) {
        [arr[left], arr[right]] = [arr[right], arr[left]];
        left++;
        right--;
    }
    left = shift;
    right = arr.length - 1;
    while (left < right) {
        [arr[left], arr[right]] = [arr[right], arr[left]];
        left++;
        right--;
    }
    return arr;
}
function testHash(arr, provHash) {
    let hashes = Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
        let imageURL = arr[i].image;
        let splits = imageURL.split("/");
        let cid = splits[splits.length - 2];
        hashes[arr[i].tokenId] = hash(cid);
    }
    return provHash == hash(hashes.join(""));
}
function hash(string) {
    return (0, crypto_1.createHash)("sha256").update(string).digest("hex");
}
// API endpoints
router.get("/waves/:waveId/:tokenId", (0, asyncHandler_1.default)(async (req, res, next) => {
    let waveId = parseInt(req.params.waveId);
    let tokenId = parseInt(req.params.tokenId);
    if (waveId !== 3 || tokenId < 0 || tokenId >= currentSupply) {
        console.log(waveId);
        console.log(tokenId);
        next({ message: "Invalid Query", status: 404 });
    }
    else {
        const client = new mongodb_1.MongoClient(process.env.MONGODB_URL);
        await client.connect();
        const coll = client.db("club-cards").collection(collection);
        let data = await coll.findOne({ waveId: waveId });
        if (data.reIndexed !== true) {
            res.json({
                image: "https://gateway.pinata.cloud/ipfs/QmSrozmfM7BeQVCzpgnHK71SFehgUZoS2Pb3jTYDbPkRoQ",
                description: "Thank you for participating in the public sale! Wen reveal? Soon! CC 👊",
                name: `Club Cards: MetaSharks #${tokenId}`,
            });
        }
        else {
            res.json(data.metadata[tokenId]);
        }
    }
}));
exports.default = router;
