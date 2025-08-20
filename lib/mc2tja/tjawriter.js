class TJAWriter {
  constructor() {
    this.segments = [];
    this.properties = {};
    this.startEvent = new TJAEvent(0, 'START');
    this.endEvent = new TJAEvent(0, 'END');
  }

  prop(key, value) {
    this.properties[key.toUpperCase()] =
      typeof value != 'undefined' ? value : '[Unknown]';
  }

  generateString() {
    let res = '';

    for (const prop in this.properties) {
      const value = this.properties[prop];

      res += prop + ':' + value + '\r\n';
    }

    res += '\r\n';
    res += this.startEvent + '\r\n';
    for (const i_seg in this.segments) {
      const segment = this.segments[i_seg];

      res += segment + '\r\n';
    }

    res += this.endEvent + '\r\n';
    res += '\r\n';

    return res;
  }
}

class TJAEvent {
  constructor(index, name, arg) {
    this.index = index;
    this.name = name.toUpperCase();
    this.arg = arg;
    this.line = '#' + this.name + (typeof arg == 'undefined' ? '' : ' ' + arg);
  }

  toString() {
    return this.line;
  }
}

class TJAComment {
  constructor(index, content, breakLine) {
    this.index = index;
    this.content = content;
    if (!breakLine) this.keepLine = true;
    this.line = (breakLine ? '// ' : ' // ') + content;
  }

  toString() {
    return this.line;
  }
}

class TJASegment {
  constructor(initSize) {
    this.size = initSize || 0;
    this.notes = [];
    for (let i = 0; i < this.size; ++i) this.notes.push('0');
    this.events = [];
    this.endEvents = [];
    this.eventSorted = true;
  }

  toString() {
    let res = this.size == 0 ? '0' : '';

    if (!this.eventSorted) {
      this.events.sort((a, b) => a.index - b.index);
      this.eventSorted = true;
    }

    let i_event = 0;
    let event = this.events.length == 0 ? null : this.events[0];

    while (i_event < this.events.length) {
      const currentIndex = event.index;
      let firstInThisIndex = true;

      while (event && event.index === currentIndex) {
        if (firstInThisIndex && event instanceof TJAEvent) {
          res += '\r\n';
        }

        res += event + '\r\n';

        firstInThisIndex = false;
        ++i_event;
        event = i_event < this.events.length ? this.events[i_event] : null;
      }
    }

    for (let index = 0; index < this.size; ++index) {
      const note = this.notes[index] || '0';
      let firstEventInBatch = true;

      while (event && event.index <= index) {
        if (!event.keepLine && firstEventInBatch && index != 0) {
          res += '\r\n';
        }

        firstEventInBatch = false;
        res += event;
        res += '\r\n';
        ++i_event;
        event = i_event < this.events.length ? this.events[i_event] : null;
      }

      res += note;
    }

    res += ',';

    for (const i_event in this.endEvents) {
      const event = this.endEvents[i_event];

      if (!event.keepLine) res += '\r\n';
      res += event;
      res += '\r\n';
    }

    return res;
  }

  addEvent(event) {
    if (typeof event == 'string') event = new TJAComment(0, event, false);
    this.events.push(event);
    this.eventSorted = false;
  }

  addEndEvent(event) {
    if (typeof event == 'string') event = new TJAComment(0, event, false);
    this.endEvents.push(event);
  }
}

module.exports = { TJAWriter, TJAEvent, TJAComment, TJASegment };
