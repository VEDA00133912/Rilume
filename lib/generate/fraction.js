function gcd(a, b) {
  while (a !== 0) {
    [a, b] = [b % a, a];
  }
  return b;
}

class Fraction {
  constructor(initVal) {
    if (initVal instanceof Fraction) {
      [this[0], this[1], this[2]] = [initVal[0], initVal[1], initVal[2]];
    } else if (Array.isArray(initVal)) {
      if (initVal.length === 2) {
        [this[0], this[1], this[2]] = [0, initVal[0], initVal[1]];
      } else if (initVal.length >= 3) {
        [this[0], this[1], this[2]] = [initVal[0], initVal[1], initVal[2]];
      } else {
        [this[0], this[1], this[2]] = [0, 0, 1];
      }
      this.reduct();
    } else if (typeof initVal === 'number') {
      const xi = Math.floor(initVal);
      [this[0], this[1], this[2]] = [xi, Math.round((initVal - xi) * 288), 288];
      this.reduct();
    } else {
      [this[0], this[1], this[2]] = [0, 0, 1];
    }
  }

  static gcd = gcd;

  isValid() {
    return isFinite(this[0]) && isFinite(this[1]) && isFinite(this[2]);
  }

  valueOf() {
    return this[0] + this[1] / (this[2] > 0 ? this[2] : 1);
  }

  compare(other) {
    if (typeof other === 'number') {
      const val = this.valueOf();
      return val === other ? 0 : val < other ? -1 : 1;
    }

    const [d1, d2] = [this[2], other[2]];
    const [n1, n2] = [(this[0] * d1 + this[1]) * d2, (other[0] * d2 + other[1]) * d1];
    return n1 === n2 ? 0 : n1 < n2 ? -1 : 1;
  }

  reduct() {
    this[0] += Math.floor(this[1] / this[2]);
    this[1] %= this[2];

    if (this[1] < 0) {
      this[0]--;
      this[1] += this[2];
    }

    const div = gcd(this[1], this[2]);
    if (div > 1) {
      this[1] /= div;
      this[2] /= div;
    }
  }

  time(times) {
    return new Fraction([0, (this[0] * this[2] + this[1]) * times, this[2]]);
  }

  divide(times) {
    return new Fraction([0, this[0] * this[2] + this[1], this[2] * times]);
  }

  normalize(range) {
    const num1 = this[0] * this[2] + this[1];
    const num2 = range[0] * range[2] + range[1];

    [this[0], this[1], this[2]] = [0, num1 * range[2], this[2] * num2];
    this.reduct();
    return this;
  }

  index(range) {
    return range
      ? Math.floor((this[0] + this[1] / this[2]) * range)
      : this[0] * this[2] + this[1];
  }

  inc(beat) {
    if (typeof beat === 'number') {
      this[0] += Math.round(beat);
      return this;
    }

    this[0] += beat[0];
    this[1] = this[1] * beat[2] + beat[1] * this[2];
    this[2] *= beat[2];
    this.reduct();
    return this;
  }

  dec(beat) {
    if (typeof beat === 'number') {
      this[0] -= Math.round(beat);
      return this;
    }

    this[0] -= beat[0];
    this[1] = this[1] * beat[2] - beat[1] * this[2];
    this[2] *= beat[2];
    this.reduct();
    return this;
  }

  add(beat) {
    return new Fraction(this).inc(beat);
  }

  cutoff(beat) {
    return new Fraction(this).dec(beat);
  }
}

Fraction.Infinity = new Fraction([Number.POSITIVE_INFINITY, 0, 1]);
Fraction.MinusInfinity = new Fraction([Number.NEGATIVE_INFINITY, 0, 1]);

module.exports = { Fraction };
