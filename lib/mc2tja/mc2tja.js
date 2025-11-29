const { MCReader } = require('./mcreader.js');
const { TJAWriter, TJAEvent, TJASegment } = require('./tjawriter.js');
const { Fraction } = require('./fraction.js');

const COURSE_MAP = {
  command: { edit: 'おに(裏)', oni: 'おに', hard: 'むずかしい', normal: 'ふつう', easy: 'かんたん', default: 'おに' },
  mctja: { edit: 'Oni-Edit', oni: 'Oni', hard: 'Hard', normal: 'Normal', easy: 'Easy', default: 'Oni' },
};

const DIFFICULTY_PATTERNS = [
  { key: 'edit', patterns: ['oni-edit', 'edit'] },
  { key: 'oni', patterns: ['oni', 'おに', '鬼'] },
  { key: 'hard', patterns: ['hard', 'むずかしい', 'muzukashii'] },
  { key: 'normal', patterns: ['normal', 'ふつう', 'futsuu'] },
  { key: 'easy', patterns: ['easy', 'かんたん', 'kantan'] },
];

class mc2tja {
  constructor() {
    this.generated = null;
    this.standardTja = false;
  }

  getCourseFromName(place, versionText) {
    if (!versionText) return COURSE_MAP[place]?.default ?? (place === 'command' ? 'おに' : 'Oni');

    const lower = versionText.toLowerCase();
    const found = DIFFICULTY_PATTERNS.find((d) => d.patterns.some((p) => lower.includes(p)));

    return COURSE_MAP[place]?.[found?.key] ?? COURSE_MAP[place]?.default ?? (place === 'command' ? 'おに' : 'Oni');
  }

  getStarFromVersionText(versionText) {
    if (!versionText) return 0;

    const match = versionText.match(/☆\s*(\d{1,2})/);
    if (!match) return 0;

    const num = parseInt(match[1], 10);
    return num >= 1 && num <= 10 ? num : 0;
  }

  getNumFromNoteStyle(style) {
    style += 1;
    if (style === 2 || style === 3) style = 5 - style;
    return style.toString();
  }

  roundDoubleToReadable(x) {
    return x.toFixed(6) * 1;
  }

  convert(mc) {
    if (typeof mc === 'string') {
      const text = mc;
      mc = new MCReader();
      mc.parse(text);
    } else if (!(mc instanceof MCReader)) {
      throw new TypeError('Parameter not supported by mc2tja.convert');
    } else if (mc.text == null) {
      throw new Error('Not chart parsed by parameter MCReader');
    }

    const tja = new TJAWriter();

    if (mc.meta.mode !== 5) {
      console.error('Non-taiko MC chart detected. the convertion has failed.');
      return false;
    }

    const barBegin = mc.meta.mode_ext.bar_begin;
    const notes = mc.note.slice().sort((a, b) => a.beat.compare(b.beat));

    const signs = mc.effect
      .filter((e) => e.sign)
      .map((e) => ({ sign: e.sign, beat: e.beat }));
    signs.unshift({ sign: 4, beat: Fraction.MinusInfinity });
    signs.sort((a, b) => a.beat.compare(b.beat));

    const bpms = mc.time.slice().sort((a, b) => a.beat.compare(b.beat));
    const effects = (mc.effect || []).slice().sort((a, b) => a.beat.compare(b.beat));

    // Fill properties
    tja.prop('TITLE', mc.meta.song.title);
    tja.prop('SUBTITLE', '--' + mc.meta.song.artist);

    if (!this.standardTja) {
      tja.prop('ARTIST', mc.meta.song.artist);
      tja.prop('AUTHOR', mc.meta.creator);
      tja.prop('COVER', mc.meta.background);
    }

    if (mc.initTime) {
      tja.prop('BPM', this.roundDoubleToReadable(mc.initTime.bpm));
    }

    if (mc.mainSample) {
      tja.prop('WAVE', mc.mainSample.sound);

      let offset = -0.001 * (mc.mainSample.offset || 0);
      let lastBPM = mc.initTime.bpm;
      let lastBeat = mc.mainSample.beat;

      for (const bpm of bpms) {
        if (bpm.beat.compare(barBegin) >= 0) break;
        if (bpm.beat.compare(lastBeat) > 0) {
          offset += ((bpm.beat - lastBeat) * 60) / lastBPM;
        }
        lastBPM = bpm.bpm;
        lastBeat = bpm.beat;
      }

      offset += ((barBegin - lastBeat) * 60) / lastBPM;
      tja.prop('OFFSET', (-offset).toFixed(3));
      tja.prop('DEMOSTART', (mc.meta.preview ? 0.001 * mc.meta.preview : offset).toFixed(3));
    }

    tja.prop('SONGVOL', 100);
    tja.prop('SEVOL', 100);

    const course = this.getCourseFromName('mctja', mc.meta.version) || 'Oni';
    const star = this.getStarFromVersionText(mc.meta.version) || 10;

    tja.prop('COURSE', course);
    tja.prop('LEVEL', star);
    tja.prop('SCOREMODE', 2);
    tja.prop('SCOREINIT', '');
    tja.prop('SCOREDIFF', '');

    let barBeat = new Fraction(barBegin);

    const findSignIndex = (beat) => {
      let i = 0, j = signs.length - 1;
      while (i < j) {
        const mid = Math.floor((i + j + 1) / 2);
        if (signs[mid].beat.compare(beat) > 0) j = mid - 1;
        else i = mid;
      }
      return i;
    };

    const moveBeat = (beat, deltaBar) => {
      let currSignIndex = findSignIndex(beat);
      let currBeat = new Fraction(beat);
      deltaBar = Math.round(deltaBar);

      if (deltaBar > 0) {
        while (deltaBar > 0) {
          const nextSignBeat = currSignIndex + 1 < signs.length ? signs[currSignIndex + 1].beat : Fraction.Infinity;
          const sign = signs[currSignIndex].sign;
          const nextBeat = currBeat.add(sign);

          if (nextBeat.compare(nextSignBeat) <= 0) {
            currBeat = nextBeat;
            deltaBar--;
            continue;
          }
          deltaBar--;
          currBeat.inc(sign);
          currSignIndex++;
        }
        return currBeat;
      } else if (deltaBar < 0) {
        deltaBar = -deltaBar;
        while (deltaBar > 0) {
          const prevSignBeat = currSignIndex > 0 ? signs[currSignIndex].beat : Fraction.MinusInfinity;
          const sign = signs[currSignIndex].sign;
          const nextBeat = currBeat.cutoff(sign);

          if (nextBeat.compare(prevSignBeat) >= 0) {
            currBeat = nextBeat;
            deltaBar--;
            continue;
          }
          deltaBar--;
          currBeat.dec(sign);
          currSignIndex--;
        }
        return currBeat;
      }
    };

    const firstBeat = notes.length === 0 ? barBeat : notes[0].beat;
    while (barBeat.compare(firstBeat) > 0) {
      barBeat = moveBeat(barBeat, -1);
    }

    let noteIndex = 0, bpmIndex = 0, effectIndex = 0;
    let lastBarLength = new Fraction(4);
    let lastLongNote = null;
    const balloons = [];

    while (noteIndex < notes.length || lastLongNote) {
      const nextBarBeat = moveBeat(barBeat, 1);
      const barLength = nextBarBeat.cutoff(barBeat);
      const segmentNotes = [];
      const segmentEvents = [];

      // Process notes
      for (; noteIndex < notes.length && notes[noteIndex].beat.compare(nextBarBeat) < 0; ++noteIndex) {
        if (lastLongNote) {
          if (notes[noteIndex].beat.compare(lastLongNote) <= 0) continue;
          segmentNotes.push({ beat: lastLongNote.cutoff(barBeat), num: '8' });
          lastLongNote = null;
        }

        segmentNotes.push({
          beat: notes[noteIndex].beat.cutoff(barBeat),
          num: this.getNumFromNoteStyle(notes[noteIndex].style),
        });

        if (notes[noteIndex].endbeat) lastLongNote = notes[noteIndex].endbeat;
        if (notes[noteIndex].hits) balloons.push(notes[noteIndex].hits);
      }

      if (lastLongNote && lastLongNote.compare(nextBarBeat) < 0) {
        segmentNotes.push({ beat: lastLongNote.cutoff(barBeat), num: '8' });
        lastLongNote = null;
      }

      // Process BPM changes
      for (; bpmIndex < bpms.length; ++bpmIndex) {
        const bpm = bpms[bpmIndex];
        if (bpm.beat >= nextBarBeat) break;
        segmentEvents.push({
          beat: bpm.beat.cutoff(barBeat),
          event: new TJAEvent(0, 'BPMCHANGE', this.roundDoubleToReadable(bpm.bpm)),
        });
      }

      // Check measure changes
      if (barLength.compare(lastBarLength) !== 0) {
        const measure = barLength.divide(4);
        const times = measure[2] === 1 ? 4 : measure[2] === 2 ? 2 : 1;
        segmentEvents.push({
          beat: new Fraction(0),
          event: new TJAEvent(0, 'MEASURE', `${measure.index() * times}/${measure[2] * times}`),
        });
      }

      // Process effects
      for (; effectIndex < effects.length; ++effectIndex) {
        const effect = effects[effectIndex];
        if (effect.beat >= nextBarBeat) break;

        const beat = effect.beat.cutoff(barBeat);

        if ('hs' in effect) {
          segmentEvents.push({ beat, event: new TJAEvent(0, 'SCROLL', this.roundDoubleToReadable(effect.hs)) });
        }
        if ('ggt' in effect) {
          segmentEvents.push({ beat, event: new TJAEvent(0, `GOGO${effect.ggt ? 'START' : 'END'}`) });
        }
        if ('showbar' in effect) {
          segmentEvents.push({ beat, event: new TJAEvent(0, `BARLINE${effect.showbar ? 'ON' : 'OFF'}`) });
        }
      }

      // Calculate unified denominator
      let denom = 1;

      for (const n of segmentNotes) {
        n.beat.normalize(barLength);
        denom *= n.beat[2] / Fraction.gcd(n.beat[2], denom);
      }

      for (const e of segmentEvents) {
        e.beat.normalize(barLength);
        if (e.beat[0] >= 0) {
          denom *= e.beat[2] / Fraction.gcd(e.beat[2], denom);
        }
      }

      // Create segment
      const segment = new TJASegment(denom);

      for (const n of segmentNotes) {
        segment.notes[n.beat.index(denom)] = n.num;
      }

      for (const e of segmentEvents) {
        e.event.index = e.beat[0] < 0 ? 0 : e.beat.index(denom);
        segment.addEvent(e.event);
      }

      tja.segments.push(segment);
      barBeat = nextBarBeat;
      lastBarLength = barLength;
    }

    if (balloons.length > 0) tja.prop('BALLOON', balloons.join(','));

    this.generated = tja.generateString();
    return true;
  }
}

module.exports = { mc2tja };
