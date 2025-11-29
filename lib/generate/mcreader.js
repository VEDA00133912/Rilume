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
    this.content = JSON.parse(text);

    const { meta, time, effect, note, extra } = this.content;
    this.meta = meta;
    this.time = time;
    this.effect = effect;
    this.note = note;
    this.extra = extra;

    // ノート処理（type=1をフィルタリングしながらFractionに変換）
    this.note = note.filter((n) => {
      n.beat = new Fraction(n.beat);
      if (n.endbeat != null) n.endbeat = new Fraction(n.endbeat);

      if (n.type === 1) {
        this.mainSample ??= n;
        return false;
      }
      return true;
    });

    for (const tp of time) {
      tp.beat = new Fraction(tp.beat);
      if (!this.initTime || this.initTime.beat.compare(tp.beat) > 0) {
        this.initTime = tp;
      }
    }

    for (const eff of effect) {
      eff.beat = new Fraction(eff.beat);
      if ('sign' in eff) {
        eff.sign = new Fraction(eff.sign);
        if (!eff.sign.isValid()) eff.sign = null;
      }
    }
  }

  parseFilename(url) {
    if (url instanceof File) {
      this.filename = url.name;
      return;
    }

    const match = url.match(/(?:.*\/)*([^/]*\.mc)/i);
    if (match) this.filename = match[1];
  }
}

module.exports = { MCReader };
