function compareInt(a, b) {
  return a == b ? 0 : a < b ? -1 : 1;
}

function gcd(a, b) {
  let t;
  while (a != 0) {
    t = b % a;
    b = a;
    a = t;
  }
  return b;
}

class Fraction {
  constructor(initVal) {
    if (initVal instanceof Fraction) {
      this[0] = initVal[0];
      this[1] = initVal[1];
      this[2] = initVal[2];
    } else if (Array.isArray(initVal)) {
      if (initVal.length == 2) {
        this[0] = 0;
        this[1] = initVal[0];
        this[2] = initVal[1];
      } else if (initVal.length >= 3) {
        this[0] = initVal[0];
        this[1] = initVal[1];
        this[2] = initVal[2];
      } else {
        this[0] = 0;
        this[1] = 0;
        this[2] = 1;
      }
      this.reduct();
    } else if (typeof initVal == 'number') {
      const x = Number.parseFloat(initVal);
      const xi = Math.floor(x);
      this[0] = xi;
      this[1] = Math.round((x - xi) * 288);
      this[2] = 288;
      this.reduct();
    } else {
      this[0] = 0;
      this[1] = 0;
      this[2] = 1;
    }
  }

  static gcd(a, b) {
    return gcd(a, b);
  }

  isValid() {
    return isFinite(this[0]) && isFinite(this[1]) && isFinite(this[2]);
  }

  valueOf() {
    return this[0] + this[1] / (this[2] > 0 ? this[2] : 1);
  }

  compare(other) {
    if (typeof other == 'number') {
      const val = this.valueOf();
      return val == other ? 0 : val < other ? -1 : 1;
    }
    const den1 = this[2],
      den2 = other[2];
    return compareInt(
      (this[0] * den1 + this[1]) * den2,
      (other[0] * den2 + other[1]) * den1,
    );
  }

  reduct() {
    this[0] += Number.parseInt(this[1] / this[2]);
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
    const den = this[2],
      num = (this[0] * den + this[1]) * times;
    return new Fraction([0, num, den]);
  }

  divide(times) {
    const den = this[2],
      num = this[0] * den + this[1];
    return new Fraction([0, num, den * times]);
  }

  normalize(range) {
    const den1 = this[2],
      num1 = this[0] * den1 + this[1];
    const den2 = range[2],
      num2 = range[0] * den2 + range[1];
    this[0] = 0;
    this[1] = num1 * den2;
    this[2] = den1 * num2;
    this.reduct();
    return this;
  }

  index(range) {
    if (range) return Number.parseInt((this[0] + this[1] / this[2]) * range);
    return this[0] * this[2] + this[1];
  }

  inc(beat) {
    if (typeof beat == 'number') {
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
    if (typeof beat == 'number') {
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
    const result = new Fraction(this);
    return result.inc(beat);
  }

  cutoff(beat) {
    const result = new Fraction(this);
    return result.dec(beat);
  }
}

Fraction.gcd = gcd;
Fraction.Infinity = new Fraction([Number.POSITIVE_INFINITY, 0, 1]);
Fraction.MinusInfinity = new Fraction([Number.NEGATIVE_INFINITY, 0, 1]);

module.exports = { Fraction };
