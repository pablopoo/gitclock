(function initGitClock(global) {
  const SECOND = 1000;
  const TWO_DIGITS = Array.from({ length: 61 }, (_, value) =>
    value < 10 ? `0${value}` : `${value}`
  );

  function formatCount(value) {
    return TWO_DIGITS[value];
  }

  function formatClockTime(date) {
    return `${formatCount(date.getHours())}:${formatCount(date.getMinutes())}:${formatCount(date.getSeconds())}`;
  }

  function getHeaderStats(date) {
    const day = date.getDate();
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    return {
      added: `+${formatCount(day)}`,
      removed: `-${formatCount(daysInMonth - day)}`,
    };
  }

  function getDiffRows(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const hourText = formatCount(hours);
    const minuteText = formatCount(minutes);
    const secondText = formatCount(seconds);

    return [
      { file: "clock.now", value: `${hourText}:${minuteText}:${secondText}` },
      { file: "hours.js", added: `+${hourText}`, removed: `-${formatCount(24 - hours)}` },
      { file: "minutes.js", added: `+${minuteText}`, removed: `-${formatCount(60 - minutes)}` },
      { file: "seconds.js", added: `+${secondText}`, removed: `-${formatCount(60 - seconds)}` },
    ];
  }

  function updateClock(elements, date = new Date(), state = elements.state || (elements.state = {})) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const day = date.getDate();
    const hourText = TWO_DIGITS[hours];
    const minuteText = TWO_DIGITS[minutes];
    const secondText = TWO_DIGITS[seconds];
    const clockText = `${hourText}:${minuteText}:${secondText}`;

    if (state.clock !== clockText) {
      elements.clockValue.textContent = clockText;
      elements.clockValue.dateTime = clockText;
      state.clock = clockText;
    }

    if (state.day !== day) {
      const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

      elements.headerAdded.textContent = `+${TWO_DIGITS[day]}`;
      elements.headerRemoved.textContent = `-${TWO_DIGITS[daysInMonth - day]}`;
      state.day = day;
    }

    if (state.hours !== hours) {
      const removedHours = `-${TWO_DIGITS[24 - hours]}`;

      elements.hoursAdded.textContent = `+${hourText}`;
      elements.hoursRemoved.textContent = removedHours;
      state.hours = hours;
    }

    if (state.minutes !== minutes) {
      elements.minutesAdded.textContent = `+${minuteText}`;
      elements.minutesRemoved.textContent = `-${TWO_DIGITS[60 - minutes]}`;
      state.minutes = minutes;
    }

    if (state.seconds !== seconds) {
      elements.secondsAdded.textContent = `+${secondText}`;
      elements.secondsRemoved.textContent = `-${TWO_DIGITS[60 - seconds]}`;
      state.seconds = seconds;
    }
  }

  function scheduleNextTick(tick, now = Date.now()) {
    setTimeout(tick, SECOND - (now % SECOND));
  }

  function startClock() {
    const elements = {
      clockValue: document.querySelector("#clock-value"),
      headerAdded: document.querySelector("#header-added"),
      headerRemoved: document.querySelector("#header-removed"),
      hoursAdded: document.querySelector("#hours-added"),
      hoursRemoved: document.querySelector("#hours-removed"),
      minutesAdded: document.querySelector("#minutes-added"),
      minutesRemoved: document.querySelector("#minutes-removed"),
      secondsAdded: document.querySelector("#seconds-added"),
      secondsRemoved: document.querySelector("#seconds-removed"),
      state: {},
    };

    if (Object.values(elements).some((element) => !element)) return;

    const now = new Date();

    function tick() {
      const timestamp = Date.now();

      now.setTime(timestamp);
      updateClock(elements, now);
      scheduleNextTick(tick, timestamp);
    }

    tick();
  }

  global.GitClock = {
    formatClockTime,
    getHeaderStats,
    getDiffRows,
    updateClock,
    scheduleNextTick,
  };

  if (typeof document !== "undefined") {
    startClock();
  }
})(globalThis);
