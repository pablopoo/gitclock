import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const sandbox = {
  console,
  document: undefined,
  setInterval: () => undefined,
};

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../styles.css", import.meta.url), "utf8");

assert.match(html, /<span class="file">clock\.now<\/span>/);
assert.doesNotMatch(html, /3 archivos modificados/);
assert.match(css, /\.stats\s*{[^}]*align-items:\s*baseline;/s);
assert.match(css, /\.added,\s*\.removed\s*{[^}]*line-height:\s*1;/s);

vm.runInNewContext(fs.readFileSync(new URL("../app.js", import.meta.url), "utf8"), sandbox);

const {
  formatClockTime,
  getDiffRows,
  getHeaderStats,
  updateClock,
} = sandbox.GitClock;

const sample = new Date(2026, 4, 9, 14, 38, 9);

assert.equal(formatClockTime(sample), "14:38:09");
assert.deepEqual(JSON.parse(JSON.stringify(getHeaderStats(sample))), {
  added: "+09",
  removed: "-22",
});
assert.deepEqual(JSON.parse(JSON.stringify(getDiffRows(sample))), [
  { file: "clock.now", value: "14:38:09" },
  { file: "hours.js", added: "+14", removed: "-10" },
  { file: "minutes.js", added: "+38", removed: "-22" },
  { file: "seconds.js", added: "+09", removed: "-51" },
]);

const target = () => ({ textContent: "", dateTime: "" });
const countedTarget = () => {
  let value = "";
  return {
    writes: 0,
    dateTime: "",
    get textContent() {
      return value;
    },
    set textContent(nextValue) {
      value = nextValue;
      this.writes += 1;
    },
  };
};

const elements = {
  clockValue: target(),
  headerAdded: target(),
  headerRemoved: target(),
  hoursAdded: target(),
  hoursRemoved: target(),
  minutesAdded: target(),
  minutesRemoved: target(),
  secondsAdded: target(),
  secondsRemoved: target(),
};

updateClock(elements, sample);

assert.equal(elements.clockValue.textContent, "14:38:09");
assert.equal(elements.clockValue.dateTime, "14:38:09");
assert.equal(elements.headerAdded.textContent, "+09");
assert.equal(elements.headerRemoved.textContent, "-22");
assert.equal(elements.hoursAdded.textContent, "+14");
assert.equal(elements.hoursRemoved.textContent, "-10");
assert.equal(elements.minutesAdded.textContent, "+38");
assert.equal(elements.minutesRemoved.textContent, "-22");
assert.equal(elements.secondsAdded.textContent, "+09");
assert.equal(elements.secondsRemoved.textContent, "-51");

const counted = {
  clockValue: countedTarget(),
  headerAdded: countedTarget(),
  headerRemoved: countedTarget(),
  hoursAdded: countedTarget(),
  hoursRemoved: countedTarget(),
  minutesAdded: countedTarget(),
  minutesRemoved: countedTarget(),
  secondsAdded: countedTarget(),
  secondsRemoved: countedTarget(),
};
const state = {};

updateClock(counted, new Date(2026, 4, 9, 14, 38, 9), state);
updateClock(counted, new Date(2026, 4, 9, 14, 38, 10), state);

assert.equal(counted.clockValue.writes, 2);
assert.equal(counted.headerAdded.writes, 1);
assert.equal(counted.headerRemoved.writes, 1);
assert.equal(counted.hoursAdded.writes, 1);
assert.equal(counted.hoursRemoved.writes, 1);
assert.equal(counted.minutesAdded.writes, 1);
assert.equal(counted.minutesRemoved.writes, 1);
assert.equal(counted.secondsAdded.writes, 2);
assert.equal(counted.secondsRemoved.writes, 2);

updateClock(counted, new Date(2026, 4, 9, 15, 0, 0), state);

assert.equal(counted.headerAdded.writes, 1);
assert.equal(counted.headerRemoved.writes, 1);
assert.equal(counted.hoursAdded.writes, 2);
assert.equal(counted.hoursRemoved.writes, 2);

updateClock(counted, new Date(2026, 4, 9, 15, 0, 0), state);

assert.equal(counted.clockValue.writes, 3);
assert.equal(counted.secondsAdded.writes, 3);

updateClock(counted, new Date(2026, 4, 10, 0, 0, 0), state);

assert.equal(counted.headerAdded.writes, 2);
assert.equal(counted.headerRemoved.writes, 2);

console.log("clock tests passed");
