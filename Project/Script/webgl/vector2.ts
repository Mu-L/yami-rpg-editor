export class Vector {
	x: number;
	y: number;
	constructor(x: any = 0, y: any = 0) {
		this.x = x;
		this.y = y;
	}

	get length() {
		const { x, y } = this;
		return Math.sqrt(x * x + y * y);
	}

	set length(value: any) {
		const { length } = this;
		if (length !== 0) {
			const ratio = value / length;
			this.x *= ratio;
			this.y *= ratio;
		}
	}

	set(x: any, y: any) {
		this.x = x;
		this.y = y;
		return this;
	}

	add(vector: any) {
		this.x += vector.x;
		this.y += vector.y;
		return this;
	}

	// 叉乘 cross(vector) { return this.x * vector.y - this.y * vector.x }

	cos(vector: any) {
		const a = this.x * vector.x + this.y * vector.y;
		const b = Math.sqrt(this.x ** 2 + this.y ** 2);
		const c = Math.sqrt(vector.x ** 2 + vector.y ** 2);
		return a / (b * c);
	}

	sin(vector: any) {
		const cos = this.cos(vector);
		return Math.sqrt(1 - cos ** 2);
	}

	normalize() {
		this.length = 1;
		return this;
	}

	static instances = [
		new Vector(),
		new Vector(),
		new Vector(),
		new Vector(),
		new Vector(),
		new Vector(),
		new Vector(),
		new Vector()
	];
}
