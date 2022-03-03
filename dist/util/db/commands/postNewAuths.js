"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../types");
function addAuths(oldDoc, _newAuths) {
    let newDoc;
    if (oldDoc.address !== _newAuths.address)
        throw Error('Address mismatch');
    newDoc.address = oldDoc.address;
    const ks = Object.keys(_newAuths.authFuncs);
    for (let i = 0; i < ks.length; i += 1) {
        if (_newAuths.authFuncs[ks[i]] && _newAuths.authFuncs[ks[i]].length > 0) {
            if (!oldDoc.authFuncs[ks[i]] || oldDoc.authFuncs[ks[i]].length === 0) {
                newDoc.authFuncs[ks[i]] = [..._newAuths.authFuncs[ks[i]]];
            }
            else {
                const m = new Map();
                oldDoc.authFuncs[ks[i]].forEach((elem) => m.set((0, types_1.getEditionId)(elem), elem));
                _newAuths.authFuncs[ks[i]].forEach((elem) => {
                    const eid = (0, types_1.getEditionId)(elem);
                    if (eid in m.keys()) {
                        const t = elem;
                        t.amount = elem.amount + m.get(eid).amount;
                        m.set(eid, t);
                    }
                    else {
                        m.set(eid, elem);
                    }
                });
                newDoc.authFuncs[ks[i]] = [...m.values()];
            }
        }
    }
    return newDoc;
}
async function postNewAuths(newAuths, coll) {
    const addressMap = new Map();
    const docs = await coll.find().toArray();
    for (let i = 0; i < docs.length; i += 1) {
        console.log(docs[i]);
        if (docs[i].address === process.env.ADMIN_PUBLIC_KEY) {
            if (!docs[i].postNonce && docs[i].postNonce !== 0) {
                throw new Error(`Cloudnt get postNonce from DB: ${docs[i].postNonce}`);
            }
            addressMap.set(docs[i].address, docs[i].postNonce);
        }
        else {
            (0, types_1.assertAuthFuncDoc)(docs[i]);
            addressMap.set(docs[i].address, docs[i]);
        }
    }
    const addresses = [...addressMap.keys()].map((addy) => {
        (0, types_1.assertCompressedAddress)(addy);
        return addy;
    });
    if (addressMap.get(process.env.ADMIN_PUBLIC_KEY) !== newAuths.content.postNonce)
        throw new Error('Incorrect postNonce');
    console.log([...addressMap.keys()]);
    console.log([...addressMap.values()]);
    const toUpdate = newAuths.content.authUsers.map((doc) => {
        console.log(doc.address);
        if (addresses.includes(doc.address)) {
            if (doc.address === process.env.ADMIN_PUBLIC_KEY) {
                return coll.updateOne({ address: doc.address }, { $set: { postNonce: (addressMap.get(doc.address) + 1) } });
            }
            const newDoc = addAuths(addressMap.get(doc.address), doc);
            console.log(newDoc);
            return coll.updateOne({ address: doc.address }, { $set: { authFuncs: newDoc.authFuncs } });
        }
        // eslint-disable-next-line no-param-reassign
        doc.nonce = 0;
        return coll.insertOne(doc);
    }).filter(elem => elem !== null && elem !== undefined);
    const res = await Promise.all(toUpdate);
    return res;
}
exports.default = postNewAuths;
