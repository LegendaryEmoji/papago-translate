# About

Papago-translate is an efficient easy-to-use translator using Naver Papago.
- Quick to learn
- Highly maintained and Great support
- Detailed [documentation](https://github.com/LegendaryEmoji/papago-translate/wiki)

### Installation
Node.js 16.11.x or higher is recommended.  
_(Made on Node.js v18.10.0)_
```bash
npm i discord.js
```

## Example Usage
_Importing library_
```js
const { Papago } = require("papago-translate");
const client = new Papago();
```

Example: [Translate](https://github.com/LegendaryEmoji/papago-translate/wiki/Papago-Class#translate) from Korean to English:
```js
client.translate({
    from: "ko",
    to: "en",
    text: "빈민가에 사는 쓸모없는 골칫덩이, 그라티아."
}).then((response) => {
    console.log(response.result.translation);
}).catch(console.error);
// -> Gratia, a useless nuisance living in a slum.
```
Example: [Detect Language](https://github.com/LegendaryEmoji/papago-translate/wiki/Papago-Class#detectlanguage) of the text:
```js
client.detectLanguage("빈민가에 사는 쓸모없는 골칫덩이, 그라티아.")
.then(console.log).catch(console.error);
// -> { error: false, result: "ko", valid: true }
```
Example: [Get information](https://github.com/LegendaryEmoji/papago-translate/wiki/Papago-Class#define) about single word or multiple words.
```js
client.define({
    from: "ko",
    to: "en",
    text: "줄거리"
}).then(console.log).catch(console.error);
// -> { error: false, result: { is_word: true, examples: [...], items: [ {...} ] } };

client.define({
    from: "en",
    to: "ko",
    text: "Organic Plot"
}).then(console.log).catch(console.error);
// -> { error: false, result: { is_word: false, examples: [], items: [ {...}, {...} ] } }
```

## Documentation

You can find documentation [here](https://github.com/LegendaryEmoji/papago-translate/wiki)!

For any issue or contribution, please check the GitHub repository [here](https://github.com/LegendaryEmoji/papago-translate)!