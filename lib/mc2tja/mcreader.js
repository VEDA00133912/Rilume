const { Fraction } = require('./fraction.js');

class MCReader {
  constructor() {
    this.filename = '';
    this.text = null;
    this.content = {};
    this.meta = null;
    this.time = null;
    this.effect = null;
    this.note = null;
    this.extra = null;
    this.mainSample = null;
    this.initTime = null;
  }

  parse(text) {
    this.text = text;
    this.content = JSON.parse(this.text);
    this.meta = this.content.meta;
    this.time = this.content.time;
    this.effect = this.content.effect;
    this.note = this.content.note;
    this.extra = this.content.extra;

    for (let i = 0; i < this.note.length; ++i) {
      const note = this.note[i];

      note.beat = new Fraction(note.beat);
      if (note.endbeat != null) note.endbeat = new Fraction(note.endbeat);
      if (note.type == 1) {
        if (this.mainSample == null) this.mainSample = note;
        this.note.splice(i, 1);
        --i;
      }
    }

    for (const i in this.time) {
      const tp = this.time[i];

      tp.beat = new Fraction(tp.beat);
      if (this.initTime == null || this.initTime.beat.compare(tp.beat) > 0)
        this.initTime = tp;
    }

    for (const i in this.effect) {
      const eff = this.effect[i];

      eff.beat = new Fraction(eff.beat);
      if ('sign' in eff) {
        eff.sign = new Fraction(eff.sign);
        if (!eff.sign.isValid()) {
          eff.sign = null;
        }
      }
    }
  }

  parseFilename(url) {
    if (url instanceof File) {
      this.filename = url.name;

      return;
    }

    const res = url.match(/(?:.*\/)*([^/]*\.mc)/i);

    if (res) this.filename = res[1];
  }
}

module.exports = { MCReader };
