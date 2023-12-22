const axios = require("axios").default, crypto = require("crypto");
const MAIN_URL = "https://papago.naver.com/";

function newRequest(options = {}) {
    return new Promise((resolve) => {
        if (options.keys) options.headers = {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            Origin: "https://papago.naver.com",
            Referer: "https://papago.naver.com/",
            ...options.headers,
            Authorization: `PPG ${options.keys.device_id}:${options.keys.hash}`,
            Timestamp: options.keys.time
        };
        axios(options).then((data) => {
            return resolve({ error: false, data: data.data, raw: data });
        }).catch((error) => {
            console.error(error);
            return resolve({ error: true, stack: error });
        })
    });
};

async function getVersion({ user_agent = "PapagoTranslate NPM (https://www.npmjs.com)" }) {
    let page_value = (await newRequest({ url: MAIN_URL, headers: { "User-Agent": user_agent } })).data?.match?.(/"\/main.([^"]+)"/)?.[1];
    if (!page_value) return { error: true, message: "Regex failed to get script url's value." };
    page_value = (await newRequest({ url: MAIN_URL + "main." + page_value, headers: { "User-Agent": user_agent } })).data?.match?.(/"v1.([^"]+)"/)?.[1];
    if (!page_value) return { error: true, message: "Regex failed to get script value." };
    return { error: false, result: `v1.${page_value}` };
};

// Code taken from NPM package, uuid4
function generateUUID() {
    let rnd = crypto.randomBytes(16);
    rnd[6] = (rnd[6] & 0x0f) | 0x40;
    rnd[8] = (rnd[8] & 0x3f) | 0x80;
    rnd = rnd.toString("hex").match(/(.{8})(.{4})(.{4})(.{4})(.{12})/);
    rnd.shift();
    return rnd.join("-");
};

async function generateKeys(papago, request_page_url) {
    if (!papago.version) {
        const version = await getVersion({ user_agent: papago.user_agent });
        if (version.error) return { error: true, message: version.message };
        papago.version = version.result;
    };

    const time = Date.now(), device_id = papago.device_id || generateUUID();

    return {
        error: false,
        result: {
            hash: crypto.createHmac("md5", papago.version)
                .update(`${device_id}\n${request_page_url}\n${time}`)
                .digest("base64"),
            device_id,
            time
        }
    }
};

module.exports = { newRequest, getVersion, generateUUID, generateKeys };