import { serialize, deserialize } from "@dao-xyz/borsh";
import { Ed25519Keypair, toBase64, fromBase64 } from "@peerbit/crypto";
import { FastMutex } from "./lockstorage";
import { v4 as uuid } from "uuid";
import sodium from "libsodium-wrappers";
const TAB_ID_KEY = "TAB_ID";
export const cookiesWhereClearedJustNow = () => {
    const lastPersistedAt = localStorage.getItem("lastPersistedAt");
    if (lastPersistedAt) {
        return false;
    }
    localStorage.setItem("lastPersistedAt", Date.now().toString());
    return true;
};
export const getTabId = () => {
    const idFromStorage = sessionStorage.getItem(TAB_ID_KEY);
    if (idFromStorage) {
        return idFromStorage;
    }
    else {
        const id = uuid(); // generate unique UUID
        sessionStorage.setItem(TAB_ID_KEY, id);
        return id;
    }
};
const ID_COUNTER_KEY = "idc/";
const getKeyId = (prefix, id) => prefix + "/" + id;
export const releaseKey = (path, lock = new FastMutex({ clientId: getTabId() })) => {
    lock.release(path);
};
export const getFreeKeypair = async (id = "", lock = new FastMutex({ clientId: getTabId() }), lockCondition = () => true, options) => {
    await sodium.ready;
    const idCounterKey = ID_COUNTER_KEY + id;
    await lock.lock(idCounterKey, () => true);
    let idCounter = JSON.parse(localStorage.getItem(idCounterKey) || "0");
    for (let i = 0; i < 10000; i++) {
        const key = getKeyId(id, i);
        let lockedInfo = lock.getLockedInfo(key);
        console.log("KEY KEY AT", key, id, i, lockedInfo, lockedInfo === lock.clientId, options);
        if (lockedInfo) {
            if ((lockedInfo === lock.clientId &&
                options?.releaseLockIfSameId) ||
                options?.releaseFirstLock) {
                await lock.release(key); // Release lock
            }
            else {
                continue;
            }
        }
        console.log("aquire id at", i);
        await lock.lock(key, lockCondition);
        localStorage.setItem(idCounterKey, JSON.stringify(Math.max(idCounter, i + 1)));
        await lock.release(idCounterKey);
        return {
            path: key,
            key: await getKeypair(key),
        };
    }
    throw new Error("Failed to resolve key");
};
export const getAllKeyPairs = async (id = "") => {
    const idCounterKey = ID_COUNTER_KEY + id;
    const counter = JSON.parse(localStorage.getItem(idCounterKey) || "0");
    let ret = [];
    for (let i = 0; i < counter; i++) {
        const key = getKeyId(id, i);
        const kp = loadKeypair(key);
        if (kp) {
            ret.push(kp);
        }
    }
    return ret;
};
let _getKeypair;
export const getKeypair = async (keyName) => {
    await _getKeypair;
    const fn = async () => {
        let keypair = loadKeypair(keyName);
        if (keypair) {
            return keypair;
        }
        keypair = await Ed25519Keypair.create();
        saveKeypair(keyName, keypair);
        return keypair;
    };
    _getKeypair = fn();
    return _getKeypair;
};
const saveKeypair = (path, key) => {
    const str = toBase64(serialize(key));
    localStorage.setItem("_keys/" + path, str);
};
const loadKeypair = (path) => {
    let item = localStorage.getItem("_keys/" + path);
    if (!item) {
        return;
    }
    return deserialize(fromBase64(item), Ed25519Keypair);
};
export const inIframe = () => {
    try {
        return window.self !== window.top;
    }
    catch (e) {
        return true;
    }
};
//# sourceMappingURL=utils.js.map