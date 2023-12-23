/**
 * Main and most important code is from other GitHub repositories like github.com/ttop32/MouseTooltipTranslator
 * So, shoutout to them and all the other developers.
 * Author of papago-translate (Discord's username): @legendaryemoji
 */

const { newRequest, generateUUID, generateKeys } = require("./utils.js");

const LANGUAGE_CODES = { ar: "ar", en: "en", fa: "fa", fr: "fr", de: "de", hi: "hi", id: "id", it: "it", ja: "ja", ko: "ko", my: "mm", pt: "pt", ru: "ru", es: "es", th: "th", vi: "vi", "zh-CN": "zh-CN", "zh-TW": "zh-TW" };
const ARRAY_LANGUAGE_CODES = ["ar", "en", "fa", "fr", "de", "hi", "id", "it", "ja", "ko", "mm", "pt", "ru", "es", "th", "vi", "zh-CN", "zh-TW"]
const DECT_URL = "https://papago.naver.com/apis/langs/dect";
const TRANSLATE_URL = "https://papago.naver.com/apis/n2mt/translate";
const SEARCH_DIRECTORY_URL = "https://papago.naver.com/apis/dictionary/search";

class Papago {
    constructor({ save_device_id = true, user_agent = "PapagoTranslate NPM (https://www.npmjs.com)" } = {}) {
        if (save_device_id) this.device_id = generateUUID();

        this.user_agent = user_agent;
        this.version = "";
    }
    static validateLanguageCode(code) {
        if (!code || typeof code != "string") return { error: true, message: "func(validateLanguageCode): Please provide a string code to `validateLanguageCode` function." };
        if (!LANGUAGE_CODES[code]) return { error: false, result: false };
        return { error: false, result: true };
    }
    static getSupportedLanguageCodes() {
        return { error: false, result: { array: ARRAY_LANGUAGE_CODES, object: LANGUAGE_CODES } };
    }
    async detectLanguage(text) {
        if (!text || typeof text != "string") return { error: true, message: "func(detectLanguage): Please provide a string code to `detect_language` function." };

        const keys = await generateKeys(this, DECT_URL);
        if (keys.error) return { error: true, message: keys.message };

        const papago_request = await newRequest({
            keys: keys.result,
            method: "POST",
            url: DECT_URL,
            headers: {
                "User-Agent": this.user_agent
            },
            data: `query=${encodeURIComponent(text)}`
        });

        if (papago_request.error || !papago_request.data?.langCode) return { error: true, message: "func(detectLanguage): Failed to detect the language.", stack: papago_request?.stack };

        return { error: false, result: papago_request.data.langCode, valid: !!LANGUAGE_CODES[papago_request.data.langCode] };
    }
    async translate({ from = "auto", to = "en", text, honorific = false, locale = "en", raw_response = false } = {}) {
        if (typeof from != "string" || typeof to != "string" || typeof locale != "string") return { error: true, message: "func(translate): Please make sure \"from\", \"to\" and \"locale\" are valid and their data type is string." };
        if ((from != "auto" && !LANGUAGE_CODES[from]) || !LANGUAGE_CODES[to]) return { error: true, message: `func(translate): Papago doesn't support this language yet (received from(${from}) to(${to})).` };
        if (!LANGUAGE_CODES[locale]) return { error: true, message: `func(translate): Papago doesn't support this locale yet (received ${locale}).` };
        if (!text || typeof text != "string") return { error: true, message: `func(translate): Please make sure the text data type is string (received ${typeof text}).` }

        const keys = await generateKeys(this, TRANSLATE_URL);
        if (keys.error) return { error: true, message: keys.message };

        if (from == "auto") {
            const detection_result = await this.detectLanguage(text);
            if (detection_result.error) return { error: true, message: `func(translate): Something went wrong while detecting the language.\nOriginal Message: ${detection_result.message}` };
            if (!detection_result.valid) return { error: true, message: "func(translate): The \"from\" language isn't supported according to the automatic detection." };
            from = detection_result.result;
        };

        const papago_request = await newRequest({
            keys: keys.result,
            method: "POST",
            url: TRANSLATE_URL,
            headers: {
                "Accept": "application/json",
                "Cache-Control": "no-cache",
                "Device-Type": "pc",
                "X-Apigw-Partnerid": "papago",
                "User-Agent": this.user_agent
            },
            data: `deviceId=${keys.result.device_id}&locale=${locale}&honorific=${!!honorific}&agree=false&dict=true&dictDisplay=30&instant=false&paging=false&source=${from}&target=${to}&text=${encodeURIComponent(text)}`
        });

        if (papago_request.error || !papago_request.data.translatedText) return { error: true, message: `func(translate): Unable to translate the text (either internal or external error).` };
        if (raw_response) return { error: false, result: papago_request.data };

        const source_words = papago_request.data?.dict?.items ? papago_request.data.dict.items.map((element) => {
            element.entry = element.entry.replace(/<\/?b>/g, "");
            return element;
        }) : [];
        const target_words = papago_request.data?.tarDict?.items ? papago_request.data.tarDict.items.map((element) => {
            element.entry = element.entry.replace(/<\/?b>/g, "");
            return element;
        }) : [];

        return {
            error: false, result: {
                engine_type: papago_request.data.engineType,
                source_language: papago_request.data.srcLangType,
                target_language: papago_request.data.tarLangType,
                translation: papago_request.data.translatedText,
                transliteration: papago_request.data?.tlitSrc?.message?.tlitResult || papago_request.data?.tlit?.message?.tlitResult || [],
                source_words_details: source_words,
                target_words_details: target_words,
                language_detections: papago_request.data?.langDetection?.nbests || []
            }
        };
    }
    async define({ from = "auto", to = "en", locale = "en", text, raw_response = false } = {}) {
        if (typeof from != "string" || typeof to != "string" || typeof locale != "string") return { error: true, message: "func(define): Please make sure \"from\", \"to\" and \"locale\" are valid and their data type is string." };
        if ((from != "auto" && !LANGUAGE_CODES[from]) || !LANGUAGE_CODES[to]) return { error: true, message: `func(define): Papago doesn't support this language yet (received from(${from}) to(${to})).` };
        if (!LANGUAGE_CODES[locale]) return { error: true, message: `func(define): Papago doesn't support this locale yet (received ${locale}).` };
        if (!text || typeof text != "string") return { error: true, message: `func(define): Please make sure the text data type is string (received ${typeof text}).` }

        if (from == "auto") {
            const detection_result = await this.detectLanguage(text);
            if (detection_result.error) return { error: true, message: `func(define): Something went wrong while detecting the language.\nOriginal Message: ${detection_result.message}` };
            if (!detection_result.valid) return { error: true, message: "func(define): The \"from\" language isn't supported according to the automatic detection." };
            from = detection_result.result;
        };

        const papago_request = await newRequest({
            method: "GET",
            url: `${SEARCH_DIRECTORY_URL}?source=${from}&target=${to}&locale=${locale}&text=${encodeURIComponent(text)}`,
            headers: {
                "Accept": "application/json",
                "Cache-Control": "no-cache",
                "Device-Type": "pc",
                "X-Apigw-Partnerid": "papago",
                "Origin": "https://papago.naver.com",
                "Referer": "https://papago.naver.com/",
                "User-Agent": this.user_agent
            }
        });

        if (papago_request.error || !papago_request.data.items) return { error: true, message: `func(define): Unable to define the text (either internal or external error).` };
        if (raw_response) return { error: false, result: papago_request.data };

        return {
            error: false, result: {
                is_word: papago_request.data.isWordType,
                examples: papago_request.data.examples,
                items: papago_request.data.items
            }
        };
    }
};

module.exports = {
    version: "0.1.1",
    Papago: Papago
};