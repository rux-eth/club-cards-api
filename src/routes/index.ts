/* eslint-disable prettier/prettier */
/* eslint-disable no-throw-literal */
/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
import * as dotenv from 'dotenv';
import * as express from 'express';
import contracts from '../contract/ClubCards';
import asyncHandler from '../util/asyncHandler';
import mongoClient, { DBClient } from '../util/db/database';
import createSig from '../util/sigs';
import {
  assertSigReq,
  ClaimId,
  ClaimSigParams,
  ExpressError,
  GetClaimsRes,
  SigReq,
  SigRes,
  SigResponse
} from '../util/types';

dotenv.config();
const router = express.Router();
const client: DBClient = mongoClient(
    'club-cards',
    process.env.NODE_ENV === 'production' ? 'auth-funcs' : 'auth-funcs-test'
);

/**
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
router.get(
    '/claims',
    // eslint-disable-next-line no-unused-vars
    asyncHandler(async (req, res, next) => {
        /*     let query =
      process.env.NODE_ENV === "production"
        ? req.query
        : JSON.parse(<string>req.query.query);
    let params: ClaimReq = <ClaimReq>query;
    let address: string = <string>params.address;

    if (!address || !address.startsWith("0x") || address.length !== 42) {
      res.status(400).send("Invalid Address");
    } else {
      let claimRes: ClaimDBResponse = await getClaims(address);
      if (claimRes.canClaim) {
        let claimDoc: ClaimDoc = claimRes.claimDoc;
        if (params.claimIds) {
        } else {
        }
      } else {
        res.status(444).send(`No Claims for Address: ${address}`);
      }
    } */
    })
);
router.get(
    '/signature',
    // eslint-disable-next-line no-unused-vars
    asyncHandler(async (req, res, next) => {
        const params: any | SigReq =
            process.env.NODE_ENV === 'production' ? req.query : JSON.parse(<string>req.query.query);
        assertSigReq(params);
        params.claimIds.filter((val: ClaimId, index) => params.claimIds.indexOf(val) === index);
        const claimRes: GetClaimsRes = await client.getClaims(params.address);
        const claimKeys: number[] = Array.from(claimRes.claimMap.keys());
        if (!params.claimIds.every((id: ClaimId) => claimKeys.includes(id))) {
            throw <ExpressError>{
                status: 403,
                message: 'Requested a claimId that the address is not authorized to access',
            };
        }
        const ids: number[] = params.claimIds.map(
            (id: ClaimId) => claimRes.claimMap.get(id).tokenId
        );
        const amts: number[] = params.claimIds.map(
            (id: ClaimId) => claimRes.claimMap.get(id).amount
        );
        const sigParams: ClaimSigParams = {
            tokenIds: ids,
            amounts: amts,
        };
        const sigRes: SigResponse = <SigResponse>(
            await createSig(
                params.address,
                sigParams,
                claimRes.nonce,
                contracts.CCAuthTx.signer,
                contracts.CCAuthTx.address
            )
        );
        res.status(200).json(<SigRes>{
            tokenIds: ids,
            amounts: amts,
            nonce: claimRes.nonce,
            timestamp: sigRes.timestamp,
            sig1: sigRes.signature1,
            sig2: sigRes.signature2,
        });
    })
);
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

export default router;
