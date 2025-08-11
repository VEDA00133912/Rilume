const { MCReader } = require('./mcreader.js');
const { TJAWriter, TJAEvent, TJASegment } = require('./tjawriter.js');
const { Fraction } = require('./fraction.js');

class mc2tja {
  constructor() {
    this.generated = null;
    this.standardTja = false;
  }

  getCourseFromName(place, versionText) {
    console.log('getCourseFromName called with:', { place, versionText });

    if (!versionText) {
      const def = place === 'command' ? 'おに' : 'Oni';

      return def;
    }

    const lower = versionText.toLowerCase();

    let key = null;

    if (lower.includes('oni-edit') || lower.includes('edit')) key = 'edit';
    else if (
      lower.includes('oni') ||
      lower.includes('おに') ||
      lower.includes('鬼')
    )
      key = 'oni';
    else if (
      lower.includes('hard') ||
      lower.includes('むずかしい') ||
      lower.includes('muzukashii')
    )
      key = 'hard';
    else if (
      lower.includes('normal') ||
      lower.includes('ふつう') ||
      lower.includes('futsuu')
    )
      key = 'normal';
    else if (
      lower.includes('easy') ||
      lower.includes('かんたん') ||
      lower.includes('kantan')
    )
      key = 'easy';

    const map = {
      command: {
        edit: 'おに(裏)',
        oni: 'おに',
        hard: 'むずかしい',
        normal: 'ふつう',
        easy: 'かんたん',
        default: 'おに',
      },
      mctja: {
        edit: 'Oni-Edit',
        oni: 'Oni',
        hard: 'Hard',
        normal: 'Normal',
        easy: 'Easy',
        default: 'Oni',
      },
    };

    const result =
      map[place]?.[key] ??
      map[place]?.default ??
      (place === 'command' ? 'おに' : 'Oni');

    return result;
  }

  getStarFromVersionText(versionText) {
    if (!versionText) return 0;

    const match = versionText.match(/☆\s*(\d{1,2})/);

    if (match) {
      const num = parseInt(match[1], 10);

      if (num >= 1 && num <= 10) return num;
    }

    return 0;
  }

  getNumFromNoteStyle(style) {
    style += 1;
    if (style == 2 || style == 3) style = 5 - style;

    return style.toString();
  }

  roundDoubleToReadable(x) {
    return x.toFixed(6) * 1;
  }

  convert(mc) {
    if (typeof mc == 'string') {
      const text = mc;

      mc = new MCReader();
      mc.parse(text);
    } else if (!(mc instanceof MCReader)) {
      throw new TypeError('Parameter not supported by mc2tja.convert');
    } else if (mc.text == null) {
      throw new Error('Not chart parsed by parameter MCReader');
    }

    const tja = new TJAWriter();

    if (mc.meta.mode != 5) {
      console.error('Non-taiko MC chart detected. the convertion has failed.');

      return false;
    }

    // Beginning bar property in mc meta
    const barBegin = mc.meta.mode_ext.bar_begin;

    // Get all notes
    const notes = mc.note.slice(0);

    notes.sort((a, b) => a.beat.compare(b.beat));

    // Get all signatures
    const signs = [];

    for (const i in mc.effect) {
      if (mc.effect[i].sign)
        signs.push({ sign: mc.effect[i].sign, beat: mc.effect[i].beat });
    }

    signs.unshift({ sign: 4, beat: Fraction.MinusInfinity });
    signs.sort((a, b) => a.beat.compare(b.beat));

    // Get all bpms
    const bpms = mc.time.slice(0);

    bpms.sort((a, b) => a.beat.compare(b.beat));

    // Get all effects
    const effects = mc.effect ? mc.effect.slice(0) : [];

    effects.sort((a, b) => a.beat.compare(b.beat));

    // Fill out all necessary properties
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
      // Calculate the real offset & preview offset
      let offset = -0.001 * (mc.mainSample.offset || 0);
      let lastBPM = mc.initTime.bpm;
      let lastBeat = mc.mainSample.beat;

      for (const i in bpms) {
        if (bpms[i].beat.compare(barBegin) >= 0) {
          break;
        }

        if (bpms[i].beat.compare(lastBeat) > 0) {
          offset += ((bpms[i].beat - lastBeat) * 60) / lastBPM;
        }

        lastBPM = bpms[i].bpm;
        lastBeat = bpms[i].beat;
      }

      offset += ((barBegin - lastBeat) * 60) / lastBPM;
      tja.prop('OFFSET', (-offset).toFixed(3));
      tja.prop(
        'DEMOSTART',
        (mc.meta.preview ? 0.001 * mc.meta.preview : offset).toFixed(3),
      );
    }

    tja.prop('SONGVOL', 100);
    tja.prop('SEVOL', 100);

    let course = this.getCourseFromName('mctja', mc.meta.version);
    let star = this.getStarFromVersionText(mc.meta.version);

    if (course === null) {
      course = 'Oni';
    }

    if (star === 0) {
      star = 10;
    }

    tja.prop('COURSE', course);
    tja.prop('LEVEL', star);
    tja.prop('SCOREMODE', 2);
    tja.prop('SCOREINIT', '');
    tja.prop('SCOREDIFF', '');

    // Process notes and create segments
    let barBeat = new Fraction(barBegin);

    const findSignIndex = (beat) => {
      let i = 0,
        j = signs.length - 1,
        mid;

      while (i < j) {
        mid = Number.parseInt((i + j + 1) / 2);
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
          const nextSignBeat =
            currSignIndex + 1 < signs.length
              ? signs[currSignIndex + 1].beat
              : Fraction.Infinity;
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
          const prevSignBeat =
            currSignIndex > 0
              ? signs[currSignIndex].beat
              : Fraction.MinusInfinity;
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

    const firstBeat = notes.length == 0 ? barBeat : notes[0].beat;

    while (barBeat.compare(firstBeat) > 0) {
      barBeat = moveBeat(barBeat, -1);
    }

    let noteIndex = 0;
    let bpmIndex = 0;
    let effectIndex = 0;
    let lastBarLength = new Fraction(4);
    let lastLongNote = null;
    const balloons = [];

    while (noteIndex < notes.length || lastLongNote) {
      const nextBarBeat = moveBeat(barBeat, 1);
      const barLength = nextBarBeat.cutoff(barBeat);
      const segmentNotes = [];
      const segmentEvents = [];

      // Process notes in this bar
      for (
        ;
        noteIndex < notes.length &&
        notes[noteIndex].beat.compare(nextBarBeat) < 0;
        ++noteIndex
      ) {
        if (lastLongNote) {
          if (notes[noteIndex].beat.compare(lastLongNote) <= 0) {
            continue;
          }

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
          event: new TJAEvent(
            0,
            'BPMCHANGE',
            this.roundDoubleToReadable(bpm.bpm),
          ),
        });
      }

      // Check measure changes
      if (barLength.compare(lastBarLength) != 0) {
        const measure = barLength.divide(4);
        const times = measure[2] == 1 ? 4 : measure[2] == 2 ? 2 : 1;

        segmentEvents.push({
          beat: new Fraction(0),
          event: new TJAEvent(
            0,
            'MEASURE',
            measure.index() * times + '/' + measure[2] * times,
          ),
        });
      }

      // Process effects
      for (; effectIndex < effects.length; ++effectIndex) {
        const effect = effects[effectIndex];

        if (effect.beat >= nextBarBeat) break;
        const beat = effect.beat.cutoff(barBeat);

        if ('hs' in effect)
          segmentEvents.push({
            beat: beat,
            event: new TJAEvent(
              0,
              'SCROLL',
              this.roundDoubleToReadable(effect.hs),
            ),
          });
        if ('ggt' in effect)
          segmentEvents.push({
            beat: beat,
            event: new TJAEvent(0, 'GOGO' + (effect.ggt ? 'START' : 'END')),
          });
        if ('showbar' in effect)
          segmentEvents.push({
            beat: beat,
            event: new TJAEvent(0, 'BARLINE' + (effect.showbar ? 'ON' : 'OFF')),
          });
      }

      // Calculate unified denominator
      let denom = 1;

      for (const i in segmentNotes) {
        segmentNotes[i].beat.normalize(barLength);
        denom *=
          segmentNotes[i].beat[2] /
          Fraction.gcd(segmentNotes[i].beat[2], denom);
      }

      for (const i in segmentEvents) {
        segmentEvents[i].beat.normalize(barLength);
        if (segmentEvents[i].beat[0] < 0) continue;
        denom *=
          segmentEvents[i].beat[2] /
          Fraction.gcd(segmentEvents[i].beat[2], denom);
      }

      // Create segment
      const segment = new TJASegment(denom);

      for (const i in segmentNotes) {
        segment.notes[segmentNotes[i].beat.index(denom)] = segmentNotes[i].num;
      }

      for (const i in segmentEvents) {
        segmentEvents[i].event.index =
          segmentEvents[i].beat[0] < 0 ? 0 : segmentEvents[i].beat.index(denom);
        segment.addEvent(segmentEvents[i].event);
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
