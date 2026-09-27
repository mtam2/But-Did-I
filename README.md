# But Did I?

A timer app for tracking recurring tasks. It answers one question: how long has it been since you last did the thing?

## Philosophy

**Add less. Ship less. Worry less.**

Websites start fast until you make them slow. This app is a single HTML file -- no frameworks, no bundlers, no CDN links, no server, no build step you didn't ask for. Open it in a browser and it works, even offline. The first website ever made still runs today on plain HTML; that's the lineage this app belongs to.

All data lives in your browser's localStorage. Nothing leaves your machine. There's no account to create, no sync to configure, no privacy policy to read.

A plain page isn't bland -- it's honest. Simplicity isn't a limitation. It's the entire point.

Inspired by [HTML is all you need to make a website](https://whitep4nth3r.com/blog/html-is-all-you-need-to-make-a-website/).

## Usage

Open `index.html` in any modern browser, or use the standalone `dist/but-did-i.html`.

**Add a timer** -- type a name, pick an optional category and color, optionally set an "alarm after" duration, click +.

**Get alerted when overdue** -- if you set an alarm duration on a timer, the card pulses and shows "overdue by …" once the elapsed time crosses it. The browser tab title shows the overdue count, and a system notification fires once per overdue cycle (if you grant the browser permission).

**Reset a timer** -- click "reset" when you've done the thing. The elapsed time gets logged and the timer restarts.

**Backdate a reset** -- forgot to hit reset right when you did the thing? Tap the calendar icon in the corner of the card. A picker opens with big day, hour, and minute steppers (hold one to scrub) and shortcuts like "1 hr ago". Pick the time and tap "save". The reset is recorded at that time. Picking a time before the last reset just moves that reset back instead of logging a new one.

**Streak parties** -- a timer with an alarm keeps count of how long it has gone without an overdue reset. Every 30 days of resetting on time, the next reset throws confetti. Resetting while overdue starts the count over.

**Delete a timer** -- click the x in the corner of a timer card.

**Reset log** -- every reset is recorded at the bottom with the timer name, elapsed time, and timestamp. The log keeps the last 200 entries.

**Restore a deleted timer** -- if you delete a timer, its log entries stick around. Click "restore" on any of those rows to recreate the timer with the same name, category, and color, picking up from that reset's timestamp.

**Export / import** -- click "export" in the header and the app shows your timers and log as a single line of text. Copy it, then on the other machine click "import", paste it in, and click "import". The pasted data is merged into what's already there: timers with names that already exist are skipped, and log entries are de-duplicated by timestamp. Nothing is uploaded anywhere -- the string travels however you send it to yourself.

The string is your whole state as JSON, deflated and base64'd, tagged with a `BDI1Z:` prefix (or `BDI1:` when the browser can't compress). Line breaks picked up along the way are ignored on import, so it survives being pasted into a note, a chat, or an email. Import also accepts the contents of a JSON export from an older version.

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
Click "export" and save the string somewhere you trust -- a note, a password manager, a text file. Paste it into "import" to merge it back in (timers with existing names and log entries with matching timestamps are skipped). For a manual backup you can also run `localStorage.getItem("but_did_i")` in the dev console.

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
