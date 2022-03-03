/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable prettier/prettier */
import { Collection } from 'mongodb';
import {
    assertAuthFuncDoc,
    assertCompressedAddress,
    AuthFuncDoc,
    AuthReq,
    Claim,
    CompressedAddress,
    EditionId,
    getEditionId,
    Whitelist
} from '../../types';

function addAuths(oldDoc: AuthFuncDoc, _newAuths: AuthFuncDoc): AuthFuncDoc {
    let newDoc: AuthFuncDoc;
    if (oldDoc.address !== _newAuths.address) throw Error('Address mismatch');
    newDoc.address = oldDoc.address;
    const ks: string[] = Object.keys(_newAuths.authFuncs);
    for (let i = 0; i < ks.length; i += 1) {
        if (_newAuths.authFuncs[ks[i]] && _newAuths.authFuncs[ks[i]].length > 0) {
            if (!oldDoc.authFuncs[ks[i]] || oldDoc.authFuncs[ks[i]].length === 0) {
                newDoc.authFuncs[ks[i]] = [..._newAuths.authFuncs[ks[i]]];
            } else {
                const m: Map<EditionId, Claim | Whitelist> = new Map();
                oldDoc.authFuncs[ks[i]].forEach((elem: Claim | Whitelist) =>
                    m.set(getEditionId(elem), elem)
                );
                _newAuths.authFuncs[ks[i]].forEach((elem: Claim | Whitelist) => {
                    const eid: EditionId = getEditionId(elem);
                    if (eid in m.keys()) {
                        const t: Claim | Whitelist = elem;
                        t.amount = elem.amount + m.get(eid).amount;
                        m.set(eid, t);
                    } else {
                        m.set(eid, elem);
                    }
                });
                newDoc.authFuncs[ks[i]] = [...m.values()];
            }
        }
    }
    return newDoc;
}
export default async function postNewAuths(newAuths: AuthReq, coll: Collection): Promise<any> {
    const addressMap: Map<CompressedAddress, AuthFuncDoc | number> = new Map();
    const docs: any = await coll.find().toArray();
    for (let i = 0; i < docs.length; i += 1) {
        console.log(docs[i]);

        if (docs[i].address === process.env.ADMIN_PUBLIC_KEY) {
            if (!docs[i].postNonce && docs[i].postNonce !== 0 ) {throw new Error(`Cloudnt get postNonce from DB: ${docs[i].postNonce}`)}
            addressMap.set(docs[i].address, docs[i].postNonce);
        } else {
        assertAuthFuncDoc(docs[i]);
        addressMap.set(docs[i].address, docs[i]);
        }

    }

    const addresses: CompressedAddress[] = [...addressMap.keys()].map((addy) => {
        assertCompressedAddress(addy);
        return addy;
    });
    if (addressMap.get(process.env.ADMIN_PUBLIC_KEY) !== newAuths.content.postNonce)
        throw new Error('Incorrect postNonce');
        console.log([...addressMap.keys()]);
        console.log([...addressMap.values()]);

    const toUpdate: Array<Promise<any>> = newAuths.content.authUsers.map((doc: AuthFuncDoc) => {
        console.log(doc.address)
        if (addresses.includes(doc.address)) {
            if (doc.address === process.env.ADMIN_PUBLIC_KEY) {
                return coll.updateOne(
                    { address: doc.address },
                    { $set: { postNonce: (<number>addressMap.get(doc.address) + 1) } }
                );
            }
            const newDoc: AuthFuncDoc = addAuths(<AuthFuncDoc>addressMap.get(doc.address), doc);
            console.log(newDoc);
            return coll.updateOne(
                { address: doc.address },
                { $set: { authFuncs: newDoc.authFuncs } }
            );
        }
        // eslint-disable-next-line no-param-reassign
        doc.nonce = 0;
        return coll.insertOne(doc);
    }).filter(elem => elem!==null && elem!==undefined);
    const res = await Promise.all(toUpdate);
    return res;
}
