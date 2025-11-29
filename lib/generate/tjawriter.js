class TJAWriter {
  constructor() {
    this.segments = [];
    this.properties = {};
    this.startEvent = new TJAEvent(0, 'START');
    this.endEvent = new TJAEvent(0, 'END');
  }

  prop(key, value) {
    this.properties[key.toUpperCase()] = value ?? '[Unknown]';
  }

  generateString() {
    const props = Object.entries(this.properties)
      .map(([k, v]) => `${k}:${v}`)
      .join('\r\n');

    const segments = this.segments.join('\r\n');

    return `${props}\r\n\r\n${this.startEvent}\r\n${segments}\r\n${this.endEvent}\r\n\r\n`;
  }
}

class TJAEvent {
  constructor(index, name, arg) {
    this.index = index;
    this.name = name.toUpperCase();
    this.arg = arg;
    this.line = `#${this.name}${arg !== undefined ? ` ${arg}` : ''}`;
  }

  toString() {
    return this.line;
  }
}

class TJAComment {
  constructor(index, content, breakLine) {
    this.index = index;
    this.content = content;
    this.keepLine = !breakLine;
    this.line = `${breakLine ? '// ' : ' // '}${content}`;
  }

  toString() {
    return this.line;
  }
}

class TJASegment {
  constructor(initSize = 0) {
    this.size = initSize;
    this.notes = Array(initSize).fill('0');
    this.events = [];
    this.endEvents = [];
    this.eventSorted = true;
  }

  toString() {
    let res = this.size === 0 ? '0' : '';

    if (!this.eventSorted) {
      this.events.sort((a, b) => a.index - b.index);
      this.eventSorted = true;
    }

    let eventIdx = 0;
    let event = this.events[0] ?? null;

    while (eventIdx < this.events.length) {
      const currentIndex = event.index;
      let firstInThisIndex = true;

      while (event?.index === currentIndex) {
        if (firstInThisIndex && event instanceof TJAEvent) res += '\r\n';
        res += `${event}\r\n`;
        firstInThisIndex = false;
        event = this.events[++eventIdx] ?? null;
      }
    }

    for (let i = 0; i < this.size; i++) {
      const note = this.notes[i] || '0';
      let firstEventInBatch = true;

      while (event?.index <= i) {
        if (!event.keepLine && firstEventInBatch && i !== 0) res += '\r\n';
        firstEventInBatch = false;
        res += `${event}\r\n`;
        event = this.events[++eventIdx] ?? null;
      }

      res += note;
    }

    res += ',';

    for (const evt of this.endEvents) {
      if (!evt.keepLine) res += '\r\n';
      res += `${evt}\r\n`;
    }

    return res;
  }

  addEvent(event) {
    this.events.push(typeof event === 'string' ? new TJAComment(0, event, false) : event);
    this.eventSorted = false;
  }

  addEndEvent(event) {
    this.endEvents.push(typeof event === 'string' ? new TJAComment(0, event, false) : event);
  }
}

module.exports = { TJAWriter, TJAEvent, TJAComment, TJASegment };
