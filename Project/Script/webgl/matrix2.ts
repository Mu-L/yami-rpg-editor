export class Matrix extends Float32Array {
	constructor() {
		super(9);
		this[0] = 1;
		this[4] = 1;
		this[8] = 1;
	}

	reset(): this {
		this[0] = 1;
		this[1] = 0;
		this[3] = 0;
		this[4] = 1;
		this[6] = 0;
		this[7] = 0;
		return this;
	}

	set(matrix: Matrix | number[] | Float32Array): this {
		this[0] = matrix[0];
		this[1] = matrix[1];
		this[3] = matrix[3];
		this[4] = matrix[4];
		this[6] = matrix[6];
		this[7] = matrix[7];
		return this;
	}

	set6f(a: number, b: number, c: number, d: number, e: number, f: number): this {
		this[0] = a;
		this[1] = b;
		this[3] = c;
		this[4] = d;
		this[6] = e;
		this[7] = f;
		return this;
	}

	multiply(matrix: Matrix | number[] | Float32Array): this {
		const A = this[0];
		const B = this[1];
		const C = this[3];
		const D = this[4];
		const E = this[6];
		const F = this[7];
		const a = matrix[0];
		const b = matrix[1];
		const c = matrix[3];
		const d = matrix[4];
		const e = matrix[6];
		const f = matrix[7];
		this[0] = A * a + C * b;
		this[1] = B * a + D * b;
		this[3] = A * c + C * d;
		this[4] = B * c + D * d;
		this[6] = A * e + C * f + E;
		this[7] = B * e + D * f + F;
		return this;
	}

	rotate(angle: number): this {
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		const a = this[0];
		const b = this[1];
		const c = this[3];
		const d = this[4];
		this[0] = a * cos + c * sin;
		this[1] = b * cos + d * sin;
		this[3] = c * cos - a * sin;
		this[4] = d * cos - b * sin;
		return this;
	}

	rotateAt(x: number, y: number, angle: number): this {
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		const a = this[0];
		const b = this[1];
		const c = this[3];
		const d = this[4];
		this[0] = a * cos + c * sin;
		this[1] = b * cos + d * sin;
		this[3] = c * cos - a * sin;
		this[4] = d * cos - b * sin;
		this[6] += (a - this[0]) * x + (c - this[3]) * y;
		this[7] += (b - this[1]) * x + (d - this[4]) * y;
		return this;
	}

	scale(h: number, v: number): this {
		this[0] *= h;
		this[1] *= h;
		this[3] *= v;
		this[4] *= v;
		return this;
	}

	scaleAt(x: number, y: number, h: number, v: number): this {
		const a = this[0];
		const b = this[1];
		const c = this[3];
		const d = this[4];
		this[0] *= h;
		this[1] *= h;
		this[3] *= v;
		this[4] *= v;
		this[6] += (a - this[0]) * x + (c - this[3]) * y;
		this[7] += (b - this[1]) * x + (d - this[4]) * y;
		return this;
	}

	translate(x: number, y: number): this {
		this[6] += this[0] * x + this[3] * y;
		this[7] += this[1] * x + this[4] * y;
		return this;
	}

	skewAt(x: number, y: number, h: number, v: number): this {
		const a = this[0];
		const b = this[1];
		const c = this[3];
		const d = this[4];
		this[0] = a + c * v;
		this[1] = b + d * v;
		this[3] = a * h + c;
		this[4] = b * h + d;
		this[6] += (a - this[0]) * x + (c - this[3]) * y;
		this[7] += (b - this[1]) * x + (d - this[4]) * y;
		return this;
	}

	mirrorh(): this {
		this[0] = -this[0];
		this[3] = -this[3];
		return this;
	}

	mirrorv(): this {
		this[1] = -this[1];
		this[4] = -this[4];
		return this;
	}

	project(flip: number, width: number, height: number): this {
		this[0] = 2 / width;
		this[1] = 0;
		this[3] = 0;
		this[4] = (2 * flip) / height;
		this[6] = -1;
		this[7] = -flip;
		return this;
	}

	static instance = new Matrix();
}
