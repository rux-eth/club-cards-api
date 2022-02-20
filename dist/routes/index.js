"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const express = require("express");
const dotenv = require("dotenv");
const ClubCards_1 = require("../contract/ClubCards");
const asyncHandler_1 = require("../asyncHandler");
const mongodb_1 = require("mongodb");
dotenv.config();
const router = express.Router();
const collClaims = process.env.NODE_ENV === "production" ? "claims" : "claims-test";
const node = new ethers_1.ethers.providers.InfuraProvider(ClubCards_1.network, process.env.INFURA_ID);
const contract = new ethers_1.ethers.Contract(ClubCards_1.conAddress, ClubCards_1.conABI, node);
function createMintSig(sender, numMints, waveId, nonce, signer, signerAddy) {
    let ts = Math.round(Date.now() / 1000);
    const message = ethers_1.ethers.utils.defaultAbiCoder.encode(["address", "uint256", "uint256", "uint256", "uint256"], [sender, numMints, waveId, nonce, ts]);
    let hashed = ethers_1.ethers.utils.keccak256(message);
    return signer
        .signMessage((0, utils_1.arrayify)(hashed))
        .then((sig) => {
        let recAddress = ethers_1.ethers.utils.recoverAddress((0, utils_1.arrayify)(ethers_1.ethers.utils.hashMessage((0, utils_1.arrayify)(hashed))), sig);
        if (recAddress == signerAddy.toString()) {
            return {
                sender: sender,
                numMints: numMints,
                waveId: waveId,
                nonce: nonce,
                timestamp: ts,
                signature: sig,
            };
        }
        else {
            throw new Error("COULDNT RECOVER ADDRESS FROM SIGNATURE");
        }
    })
        .catch((err) => {
        return err;
    });
}
// create signed message
function createClaimSig(ids, amts, claims, sender, signer, signerAddy, callback) {
    let ts = Math.round(Date.now() / 1000);
    const message = ethers_1.ethers.utils.defaultAbiCoder.encode(["address", "uint256[]", "uint256[]", "uint256", "uint256"], [sender, ids, amts, claims, ts]);
    let hashed = ethers_1.ethers.utils.keccak256(message);
    return signer
        .signMessage((0, utils_1.arrayify)(hashed))
        .then((sig) => {
        let recAddress = ethers_1.ethers.utils.recoverAddress((0, utils_1.arrayify)(ethers_1.ethers.utils.hashMessage((0, utils_1.arrayify)(hashed))), sig);
        if (recAddress == signerAddy.toString()) {
            callback({
                tokens: ids,
                amounts: amts,
                claimNum: claims,
                signature: sig,
                recAddy: recAddress,
                timestamp: ts,
            });
        }
        else {
            throw new Error("COULDNT RECOVER ADDRESS FROM SIGNATURE");
        }
    })
        .catch((err) => {
        return err;
    });
}
function filterNums(arr) {
    return arr.filter((val) => !isNaN(val)).map((elem) => parseInt(elem));
}
/*
 * Endpoint for claims. Query params:
 *
 * address(REQUIRED)
 * claimIds(OPTIONAL)
 *
 * If claimIds are not provided, the API will respond with the claimIds the address
 * qualifies for along with the amounts.
 * If claimIds are provided and the address qualifies for each claimId, the API
 * will respond with all parameters required by the contract to claim including the signature.
 *
 */
router.get("/claims", (0, asyncHandler_1.default)(async (req, res, next) => {
    async function getClaims(addy) {
        const client = new mongodb_1.MongoClient(process.env.MONGODB_URL);
        await client.connect();
        const coll = client.db("club-cards").collection(collClaims);
        let data = await coll.findOne({ address: addy });
        await client.close();
        return data;
    }
    let address = typeof req.query.address === "string" ? req.query.address : null;
    let claimIds = Array.isArray(req.query.claimIds)
        ? filterNums(req.query.claimIds)
        : null;
    if (ethers_1.ethers.utils.isAddress(address)) {
        let data = await getClaims(address);
        if (data !== null) {
        }
        else {
            let claimMap = new Map();
            console.log(claimMap.get(1));
            res.status(404).send(`No Claims for Address: ${address}`);
        }
    }
    else {
        res.status(400).send(`Invalid Address: ${address}`);
    }
}));
/*
let currentSupply: number;
const checkSupply = async () => {
  currentSupply = (await contract.totalSupply()).toNumber();
};

setInterval(checkSupply, 5000);
 */
/*
// Contract event handlers
contract.on(
  "WaveStartIndexBlockSet",
  async (waveId: BigNumber, SIB: BigNumber) => {
    try {
      console.log("SIB Set!");
      await contract.setWaveStartIndex(waveId.toNumber());
    } catch {}
  }
);

contract.on(
  "WaveStartIndexSet",
  async (waveId: BigNumber, startIndex: BigNumber) => {
    try {
      await reIndexMeta(waveId.toNumber(), startIndex.toNumber());
      console.log("reIndex Success");
    } catch {}
  }
);
 */
/*
// functions
async function reIndexMeta(waveId: number, startIndex: number) {
  try {
    const client = new MongoClient(process.env.MONGODB_URL);
    await client.connect();
    const coll = client.db("club-cards").collection(collection);
    let data = await coll.findOne({ waveId: waveId });
    if (data.reIndexed !== true) {
      let shifted = shiftArray(data.metadata, startIndex);
      if (testHash(shifted, data.provHash)) {
        for (let i = 0; i < shifted.length; i++) {
          let temp: any = {};
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
      } else {
        console.error("Prov Hashes dont match!");
      }
    }
  } catch {}
}
function shiftArray(arr: Array<any>, shift: number): Array<any> {
  if (arr.length < shift) {
    throw Error("Invalid inputs");
  }
  let left: number;
  let right: number;
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
function testHash(arr: Array<any>, provHash: string): boolean {
  let hashes: Array<string> = Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    let imageURL: string = arr[i].image;
    let splits = imageURL.split("/");
    let cid = splits[splits.length - 2];

    hashes[arr[i].tokenId] = hash(cid);
  }
  return provHash == hash(hashes.join(""));
}
function hash(string) {
  return createHash("sha256").update(string).digest("hex");
}
 */
// API endpoints
/*
router.get(
  "/waves/:waveId/:tokenId",
  asyncHandler(async (req, res, next) => {
    let waveId = parseInt(req.params.waveId);
    let tokenId = parseInt(req.params.tokenId);
    if (waveId !== 3 || tokenId < 0 || tokenId >= currentSupply) {
      next({ message: "Invalid Query", status: 404 });
    } else {
      if (data.reIndexed !== true) {
        res.json({
          image:
            "https://gateway.pinata.cloud/ipfs/QmSrozmfM7BeQVCzpgnHK71SFehgUZoS2Pb3jTYDbPkRoQ",
          description:
            "Thank you for participating in the public sale! Wen reveal? Soon! CC 👊",
          name: `Club Cards: MetaSharks #${tokenId}`,
        });
      } else {
        res.json(data.metadata[tokenId]);
      }
    }
  })
);
 */
exports.default = router;
