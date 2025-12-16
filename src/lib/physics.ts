export interface Vector2Like {
    x: number;
    y: number;
}

export function random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export class Vector2 implements Vector2Like {
    static readonly ZERO = {x: 0, y: 0} as const satisfies Vector2Like;
    static readonly ONE = {x: 1, y: 1} as const satisfies Vector2Like;
    static readonly NEGATIVE_ONE = {x: -1, y: -1} as const satisfies Vector2Like;
    static readonly SIZE = 2;

    x: number;
    y: number;
    readonly size = 2;

    constructor();
    constructor(n: number);
    constructor(x: number, y: number);
    constructor(v: Vector2Like);
    constructor(a1?: number | Vector2Like, a2?: number) {
        if (typeof a1 === 'object') {
            ({ x: this.x, y: this.y } = a1);
            return;
        }
        this.x = a1 ?? 0;
        this.y = a2 ?? a1 ?? 0;
    }

    static zero(): Vector2 {
        return new Vector2(0, 0);
    }
    static one(): Vector2 {
        return new Vector2(1, 1);
    }
    static negativeOne(): Vector2 {
        return new Vector2(-1, -1);
    }
    
    static of(n: number): Vector2;
    static of(x: number, y: number): Vector2;
    static of(x: number, y: number = x): Vector2 {
        return new Vector2(x, y);
    }
    static ofX(x: number): Vector2;
    static ofX(v: Vector2Like): Vector2;
    static ofX(x: number | Vector2Like): Vector2 {
        return new Vector2(typeof x === 'object' ? x.x : x, 0);
    }
    static ofY(y: number): Vector2;
    static ofY(v: Vector2Like): Vector2;
    static ofY(y: number | Vector2Like): Vector2 {
        return new Vector2(0, typeof y === 'object' ? y.y : y);
    }
    static ofAngle(angle: number, length: number = 1): Vector2 {
        return new Vector2(Math.cos(angle) * length, Math.sin(angle) * length);
    }
    static ofAngleDeg(angle: number, length: number = 1): Vector2 {
        return this.ofAngle(angle * Math.PI / 180, length);
    }

    static random(min: Vector2Like, max: Vector2Like): Vector2 {
        return new Vector2(random(min.x, max.x), random(min.y, max.y));
    }

    add(n: number): this;
    add(x: number, y: number): this;
    add(v: Vector2Like): this;
    add(a1: number | Vector2Like, a2?: number): this {
        if (typeof a1 === 'object') return this.add(a1.x, a1.y);
        if (a2 === undefined) a2 = a1;
        this.x += a1;
        this.y += a2;
        return this;
    }
    addX(x: number): this;
    addX(v: Vector2Like): this;
    addX(x: number | Vector2Like): this {
        return this.add(typeof x === 'object' ? x.x : x, 0);
    }
    addY(y: number): this;
    addY(v: Vector2Like): this;
    addY(y: number | Vector2Like): this {
        return this.add(0, typeof y === 'object' ? y.y : y);
    }

    plus(n: number): Vector2;
    plus(x: number, y: number): Vector2;
    plus(v: Vector2Like): Vector2;
    plus(a1: number | Vector2Like, a2?: number): Vector2 {
        return this.copy().add(a1 as any, a2 as any);
    }
    plusX(x: number): Vector2;
    plusX(v: Vector2Like): Vector2;
    plusX(x: number | Vector2Like): Vector2 {
        return this.plus(typeof x === 'object' ? x.x : x, 0);
    }
    plusY(y: number): Vector2;
    plusY(v: Vector2Like): Vector2;
    plusY(y: number | Vector2Like): Vector2 {
        return this.plus(0, typeof y === 'object' ? y.y : y);
    }

    sub(n: number): this;
    sub(x: number, y: number): this;
    sub(v: Vector2Like): this;
    sub(a1: number | Vector2Like, a2?: number): this {
        if (typeof a1 === 'object') return this.sub(a1.x, a1.y);
        if (a2 === undefined) a2 = a1;
        this.x -= a1;
        this.y -= a2;
        return this;
    }
    subX(x: number): this;
    subX(v: Vector2Like): this;
    subX(x: number | Vector2Like): this {
        return this.sub(typeof x === 'object' ? x.x : x, 0);
    }
    subY(y: number): this;
    subY(v: Vector2Like): this;
    subY(y: number | Vector2Like): this {
        return this.sub(0, typeof y === 'object' ? y.y : y);
    }

    minus(n: number): Vector2;
    minus(x: number, y: number): Vector2;
    minus(v: Vector2Like): Vector2;
    minus(a1: number | Vector2Like, a2?: number): Vector2 {
        return this.copy().sub(a1 as any, a2 as any);
    }
    minusX(x: number): Vector2;
    minusX(v: Vector2Like): Vector2;
    minusX(x: number | Vector2Like): Vector2 {
        return this.minus(typeof x === 'object' ? x.x : x, 0);
    }
    minusY(y: number): Vector2;
    minusY(v: Vector2Like): Vector2;
    minusY(y: number | Vector2Like): Vector2 {
        return this.minus(0, typeof y === 'object' ? y.y : y);
    }

    mul(n: number): this;
    mul(x: number, y: number): this;
    mul(v: Vector2Like): this;
    mul(a1: number | Vector2Like, a2?: number): this {
        if (typeof a1 === 'object') return this.mul(a1.x, a1.y);
        if (a2 === undefined) a2 = a1;
        this.x *= a1;
        this.y *= a2;
        return this;
    }
    mulX(x: number): this;
    mulX(v: Vector2Like): this;
    mulX(x: number | Vector2Like): this {
        return this.mul(typeof x === 'object' ? x.x : x, 1);
    }
    mulY(y: number): this;
    mulY(v: Vector2Like): this;
    mulY(y: number | Vector2Like): this {
        return this.mul(1, typeof y === 'object' ? y.y : y);
    }

    times(n: number): Vector2;
    times(x: number, y: number): Vector2;
    times(v: Vector2Like): Vector2;
    times(a1: number | Vector2Like, a2?: number): Vector2 {
        return this.copy().mul(a1 as any, a2 as any);
    }
    timesX(x: number): Vector2;
    timesX(v: Vector2Like): Vector2;
    timesX(x: number | Vector2Like): Vector2 {
        return this.times(typeof x === 'object' ? x.x : x, 1);
    }
    timesY(y: number): Vector2;
    timesY(v: Vector2Like): Vector2;
    timesY(y: number | Vector2Like): Vector2 {
        return this.times(1, typeof y === 'object' ? y.y : y);
    }

    div(n: number): this;
    div(x: number, y: number): this;
    div(v: Vector2Like): this;
    div(a1: number | Vector2Like, a2?: number): this {
        if (typeof a1 === 'object') return this.div(a1.x, a1.y);
        if (a2 === undefined) a2 = a1;
        this.x /= a1;
        this.y /= a2;
        return this;
    }
    divX(x: number): this;
    divX(v: Vector2Like): this;
    divX(x: number | Vector2Like): this {
        return this.div(typeof x === 'object' ? x.x : x, 1);
    }
    divY(y: number): this;
    divY(v: Vector2Like): this;
    divY(y: number | Vector2Like): this {
        return this.div(1, typeof y === 'object' ? y.y : y);
    }

    divBy(n: number): Vector2;
    divBy(x: number, y: number): Vector2;
    divBy(v: Vector2Like): Vector2;
    divBy(a1: number | Vector2Like, a2?: number): Vector2 {
        return this.copy().div(a1 as any, a2 as any);
    }
    divXBy(x: number): Vector2;
    divXBy(v: Vector2Like): Vector2;
    divXBy(x: number | Vector2Like): Vector2 {
        return this.div(typeof x === 'object' ? x.x : x, 1);
    }
    divYBy(y: number): Vector2;
    divYBy(v: Vector2Like): Vector2;
    divYBy(y: number | Vector2Like): Vector2 {
        return this.div(1, typeof y === 'object' ? y.y : y);
    }

    pow(n: number): Vector2 {
        this.x **= n;
        this.y **= n;
        return this;
    }
    powX(x: number): Vector2 {
        this.x **= x;
        return this;
    }
    powY(y: number): Vector2 {
        this.y **= y;
        return this;
    }
    power(n: number): Vector2 {
        return this.copy().pow(n);
    }
    powerX(x: number): Vector2 {
        return this.powX(x);
    }
    powerY(y: number): Vector2 {
        return this.powY(y);
    }
    
    

    negate(): this {
        return this.mul(-1);
    }
    negateX(): this {
        return this.mulX(-1);
    }
    negateY(): this {
        return this.mulY(-1);
    }
    negative(): Vector2 {
        return this.times(-1);
    }
    negativeX(): Vector2 {
        return this.timesX(-1);
    }
    negativeY(): Vector2 {
        return this.timesY(-1);
    }

    toReciprocal(): Vector2 {
        return this.pow(-1);
    }
    toReciprocalX(): Vector2 {
        return this.powX(-1);
    }
    toReciprocalY(): Vector2 {
        return this.powY(-1);
    }
    reciprocal(): Vector2 {
        return this.power(-1);
    }
    reciprocalX(): Vector2 {
        return this.powerX(-1);
    }
    reciprocalY(): Vector2 {
        return this.powerY(-1);
    }

    set(n: number): this;
    set(x: number, y: number): this;
    set(v: Vector2Like): this;
    set(a1: number | Vector2Like, a2?: number): this {
        if (typeof a1 === 'object') return this.set(a1.x, a1.y);
        if (a2 === undefined) a2 = a1;
        this.x = a1;
        this.y = a2;
        return this;
    }
    setX(x: number): this;
    setX(v: Vector2Like): this;
    setX(x: number | Vector2Like): this {
        this.x = typeof x === 'object' ? x.x : x;
        return this;
    }
    setY(y: number): this;
    setY(v: Vector2Like): this;
    setY(y: number | Vector2Like): this;
    setY(v: Vector2Like): this;
    setY(y: number | Vector2Like): this {
        this.y = typeof y === 'object' ? y.y : y;
        return this;
    }

    copy(): Vector2;
    copy<V extends Vector2Like>(v: V): V;
    copy(v?: Vector2Like): Vector2Like {
        if (!v) return new Vector2(this.x, this.y);
        v.x = this.x;
        v.y = this.y;
        return v;
    }
    copyX(): Vector2;
    copyX<V extends Vector2Like>(v: V): V;
    copyX(v?: Vector2Like): Vector2Like {
        if (!v) return new Vector2(this.x, 0);
        v.x = this.x;
        return v;
    }
    copyY(): Vector2;
    copyY<V extends Vector2Like>(v: V): V;
    copyY(v?: Vector2Like): Vector2Like {
        if (!v) return new Vector2(0, this.y);
        v.y = this.y;
        return v;
    }

    withX(x: number): Vector2;
    withX(v: Vector2Like): Vector2;
    withX(x: number | Vector2Like): Vector2 {
        return new Vector2(typeof x === 'object' ? x.x : x, this.y);
    }
    withY(y: number): Vector2;
    withY(v: Vector2Like): Vector2;
    withY(y: number | Vector2Like): Vector2 {
        return new Vector2(this.x, typeof y === 'object' ? y.y : y);
    }

    distanceSq(): number;
    distanceSq(n: number): number;
    distanceSq(x: number, y: number): number;
    distanceSq(v: Vector2Like): number;
    distanceSq(a1: number | Vector2Like = 0, a2?: number): number {
        if (typeof a1 === 'object') return this.distanceSq(a1.x, a1.y);
        const dx = this.x - a1;
        const dy = this.y - (a2 || a1);
        return dx * dx + dy * dy;
    }
    distance(): number;
    distance(n: number): number;
    distance(x: number, y: number): number;
    distance(v: Vector2Like): number;
    distance(a1?: number | Vector2Like, a2?: number): number {
        return Math.sqrt(this.distanceSq(a1 as any, a2 as any));
    }

    distanceManhattan(): number;
    distanceManhattan(n: number): number;
    distanceManhattan(x: number, y: number): number;
    distanceManhattan(v: Vector2Like): number;
    distanceManhattan(a1: number | Vector2Like = 0, a2?: number): number {
        if (typeof a1 === 'object') return this.distanceManhattan(a1.x, a1.y);
        const dx = this.x - a1;
        const dy = this.y - (a2 || a1);
        return Math.abs(dx) + Math.abs(dy);
    }

    distanceX(): number;
    distanceX(x: number): number;
    distanceX(v: Vector2Like): number;
    distanceX(x: number | Vector2Like = 0): number {
        return Math.abs((typeof x === 'object' ? x.x : x) - this.x);
    }
    distanceY(): number;
    distanceY(y: number): number;
    distanceY(v: Vector2Like): number;
    distanceY(y: number | Vector2Like = 0): number {
        return Math.abs((typeof y === 'object' ? y.y : y) - this.y);
    }


    min(v: Vector2Like): this {
        this.x = Math.min(this.x, v.x);
        this.y = Math.min(this.y, v.y);
        return this;
    }
    max(v: Vector2Like): this {
        this.x = Math.max(this.x, v.x);
        this.y = Math.max(this.y, v.y);
        return this;
    }
    clamp(min: Vector2Like, max: Vector2Like): this {
        return this.max(min).min(max);
    }

    absX(): this {
        this.x = Math.abs(this.x);
        return this;
    }
    absY(): this {
        this.y = Math.abs(this.y);
        return this;
    }
    abs(): this {
        return this.absX().absY();
    }

    
    signX(): number {
        return Math.sign(this.x);
    }
    signY(): number {
        return Math.sign(this.y);
    }
    sign(): Vector2 {
        return new Vector2(this.signX(), this.signY());
    }

    getX(): number {
        return this.x;
    }
    getAbsX(): number {
        return Math.abs(this.x);
    }

    getY(): number {
        return this.y;
    }
    getAbsY(): number {
        return Math.abs(this.y);
    }

    toString(): string {
        return `Vector2(${this.x}, ${this.y})`;
    }

    slope(): number {
        return this.y / this.x;
    }
    angle(): number {
        return Math.atan2(this.y, this.x);
    }
    angleDeg(): number {
        return this.angle() * 180 / Math.PI;
    }

    rotate(angle: number): this {
        return this.set(this.rotated(angle));
    }
    rotateDeg(angle: number): this {
        return this.set(this.rotatedDeg(angle));
    }
    rotated(angle: number): Vector2 {
        return Vector2.ofAngle(this.angle() + angle, this.distance());
    }
    rotatedDeg(angle: number): Vector2 {
        return Vector2.ofAngle(this.angle() + angle * Math.PI / 180, this.distance());
    }
}

export class PhysicsObject {
    pos: Vector2 = new Vector2();
    vel: Vector2 = new Vector2();
    acc: Vector2 = new Vector2();

    constructor() {}

    update(dt: number): void {
        this.vel.add(this.acc.times(dt));
        this.pos.add(this.vel.times(dt));
    }

    acceleration(): Vector2;
    acceleration(acc: Vector2Like): this;
    acceleration(acc?: Vector2Like): Vector2 | this {
        if (!acc) return this.acc;
        this.acc.set(acc);
        return this;
    }
    accelerate(vel: Vector2Like): this {
        this.vel.add(vel);
        return this;
    }
    velocity(): Vector2;
    velocity(vel: Vector2Like): this;
    velocity(vel?: Vector2Like): Vector2 | this {
        if (!vel) return this.vel;
        this.vel.set(vel);
        return this;
    }
    move(distance: Vector2Like): this {
        this.pos.add(distance);
        return this;
    }
    position(): Vector2;
    position(pos: Vector2Like): this;
    position(pos?: Vector2Like): Vector2 | this {
        if (!pos) return this.pos;
        this.pos.set(pos);
        return this;
    }
}

export default {
    Vector2,
    PhysicsObject
}