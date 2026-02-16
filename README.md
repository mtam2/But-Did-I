# But Did I?

A timer app for tracking recurring tasks. It answers one question: how long has it been since you last did the thing?

## Philosophy

This app is a single HTML file. No frameworks, no bundlers, no CDN links, no server. Open it in a browser and it works -- even offline.

All data lives in your browser's localStorage. Nothing leaves your machine. There's no account to create, no sync to configure, no privacy policy to read.

Simplicity isn't a limitation. It's the entire point.

## Usage

Open `index.html` in any modern browser, or use the standalone `dist/but-did-i.html`.

**Add a timer** -- type a name, pick an optional category and color, click +.

**Reset a timer** -- click "reset" when you've done the thing. The elapsed time gets logged and the timer restarts.

**Delete a timer** -- click the x in the corner of a timer card.

**Reset log** -- every reset is recorded at the bottom with the timer name, elapsed time, and timestamp. The log keeps the last 200 entries.

## Standalone file

The development version is split into separate files (`index.html`, `style.css`, `app.js`). To produce a single self-contained HTML file:

```sh
./build.sh
```

This outputs `dist/but-did-i.html` -- one file you can drop anywhere and open offline.

## FAQ

**Where is my data stored?**
In your browser's localStorage under the key `but_did_i`. It stays on your machine.

**How do I back up my data?**
Open your browser's dev console and run `localStorage.getItem("but_did_i")`. Save the output. To restore, run `localStorage.setItem("but_did_i", '<your backup>')` and refresh.

**How do I reset everything?**
Simply clear your cookies and site data for this website or open dev
console and run `localStorage.removeItem("but_did_i")`, then refresh.

**What browsers are supported?**
Any modern browser (Chrome, Firefox, Safari, Edge). No IE support.

**Why GPLv3?**
So the app stays free and open. If someone builds on it, their version must be open too.

## Contributing

Contributions are welcome. Please follow these guidelines:

**Zero dependencies.** Every feature must use only HTML5, CSS, and native JavaScript. No third-party libraries, frameworks, or external resources -- not even a CDN link. If a feature can't be done well without a dependency, it doesn't belong here.

**Build tooling stays simple.** The build script uses bash and awk. CI uses only standard GitHub Actions runners. No webpack, vite, rollup, or npm.

**Keep it offline-first.** The app must always work as a single file opened in a browser with no network connection. Run `./build.sh` and verify `dist/but-did-i.html` works standalone before submitting.

**Match the existing style.** Small app, flat file structure, no deep abstractions. Read the code before proposing changes.

## License

GNU General Public License v3.0 -- see [LICENSE](LICENSE).
