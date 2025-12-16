import Physics, { PhysicsObject, random, Vector2, type Vector2Like } from "./physics";

const TILE_SIZE = 48;

export type IMAGE_KEY = "brick" | "solid_block" | "spring" | "exploding_block" | "reward_block" | "death_block";

//// future: move to graphics file
export interface Gradient {
    type: "linear" | "radial" | "conic";
    start: Vector2Like;
    end: Vector2Like;
    stops: { offset: number; color: string }[];
}
// export interface Pattern {}
export type CanvasStyle = string | CanvasGradient | CanvasPattern;
export function CanvasStyle(ctx: CanvasRenderingContext2D, style: string | Gradient | CanvasGradient | CanvasPattern): CanvasStyle {
    if (typeof style === "string" || style instanceof CanvasGradient || style instanceof CanvasPattern) return style;
    return createGradient(ctx, style);
}
export function createGradient(ctx: CanvasRenderingContext2D, gradientData: Gradient): CanvasGradient {
    // todo radial and conic gradients
    const gradient = ctx.createLinearGradient(gradientData.start.x, gradientData.start.y, gradientData.end.x, gradientData.end.y);
    gradientData.stops.forEach(stop => gradient.addColorStop(stop.offset, stop.color));
    return gradient;
}
////


function forEachGrid<T>(rows: T[][], fn: (item: T, x: number, y: number, row: T[]) => void): void {
    rows.forEach((row, y) => row.forEach((item, x) => fn(item, x, y, row)));
}
function mapGrid<T, U>(rows: T[][], fn: (item: T, x: number, y: number, row: T[]) => U): U[][] {
    return rows.map((row, y) => row.map((item, x) => fn(item, x, y, row)));
}

function trimArray<T>(a: T[], f: (item: T, i: number, a: T[]) => boolean = item => item ? true : false): T[] {
    let end = a.length;
    while (end && !f(a[end - 1], end - 1, a)) end--;
    return a.splice(end);
}


export class ProjectileGame {
    readonly deathThreshold: number = 50;
    readonly ballCollisionFixStepSize: number = 0.01;
    readonly arrowLengthScale: number = 0.3;
    readonly pageFillOffset: Vector2 = new Vector2(400, 400);

    readonly defaultGravity: Vector2 = Vector2.ofY(300);
    readonly defaultMouseDistanceMultiplier: number = 8;
    readonly defaultStartPoint: Vector2 = new Vector2(96, 500);
    readonly defaultTileOffset: Vector2 = new Vector2(200, 24);
    readonly defaultTileResistance: Vector2 = new Vector2(400, 800);
    readonly defaultSize: Vector2 = new Vector2(800, 600);
    
    readonly bounceVelocityMultiplier: Vector2 = new Vector2(0.9);
    readonly bounceVelocityMultiplierHorizontal: Vector2 = new Vector2(0.9, 0.75);
    readonly bounceVelocityMultiplierVertical: Vector2 = new Vector2(0.9);
    readonly bounceVelocityIncrease: Vector2 = new Vector2(20, 30);
    
    readonly tileScore: number = 10;
    readonly winScore = 1000;
    readonly defaultLives = 10;

    readonly winAnimationSpeed: number = 16;
    readonly winAnimationTime: number = 4;
    readonly winTransitionTime: number = 1.5;

    ctx: CanvasRenderingContext2D;
    levels: LevelList;
    imageData: Record<IMAGE_KEY, HTMLImageElement>;
    props: Record<string, any>;

    gravity: Vector2 = this.defaultGravity.copy();
    mouseDistanceMultiplier: number = this.defaultMouseDistanceMultiplier;
    startPoint: Vector2 = this.defaultStartPoint.copy();
    tileOffset: Vector2 = this.defaultTileOffset.copy();
    tileResistance: Vector2 = this.defaultTileResistance.copy();
    size: Vector2 = this.defaultSize.copy();

    background: CanvasStyle | null = null;
    foreground: CanvasStyle | null = null;

    levelData: LevelData | null = null;
    ball: Ball | null = null;
    tiles: (Tile | null)[][] = [];
    particles: Particle[] = [];
    mousePos: Vector2 = new Vector2();

    lives: number = this.defaultLives;
    attempts: number = 0;
    startScore: number = 0;
    score: number = 0;
    level: number = 0;

    event: string|null = null;
    eventTime: number = 0;
    eventLocation: Vector2 | null = null;


    constructor(ctx: CanvasRenderingContext2D, levels?: LevelList, imageData?: Record<IMAGE_KEY, HTMLImageElement>, props: Record<string, any> = {}) {
        this.ctx = ctx;
        this.levels = levels || { levels: [] };
        this.imageData = imageData || {} as typeof this.imageData;
        this.props = props;
    }

    nextRound(): void {
        this.level++;
        this.lives = this.props.infiniteLives ? Infinity : this.defaultLives;
        this.attempts = 0;

        this.levelData = this.levels.levels[this.level - 1];

        const props = this.levelData.properties;
        if (props) {
            this.gravity.set(props.gravity ?? this.defaultGravity);
            this.mouseDistanceMultiplier = props.mouseDistanceMultiplier ?? this.defaultMouseDistanceMultiplier;
            this.startPoint.set(props.startPoint ?? this.defaultStartPoint);
            this.tileOffset.set(props.tileOffset ?? this.defaultTileOffset);
            this.tileResistance.set(props.tileResistance ?? this.defaultTileResistance);
            this.size.set(props.size ?? this.defaultSize);
        }
        const appearance = this.levelData.appearance;
        if (appearance) {
            this.background = appearance.background ? CanvasStyle(this.ctx, appearance.background) : null;
            this.foreground = appearance.foreground ? CanvasStyle(this.ctx, appearance.foreground) : null;
        }

        this.tiles = mapGrid(this.levelData.tiles, (data, x, y) => {
            if (!data) return null;
            const [type, valueStr] = data.split('#');
            return new Tile(this, new Vector2(x, y), TileType[type as TileTypeKey], valueStr ? Number(valueStr) : 0);
        });
        this.particles.length = 0;

        this.startScore = this.score;

        this.startAttempt();
    }
    startAttempt(): void {
        this.attempts++;
        this.event = null;
        this.eventTime = 0;
        this.eventLocation = null;
        this.ball = new Ball(this).position(this.startPoint);
    }

    
    mouseMove(v: Vector2Like): void {
        this.mousePos.set(v);
    }
    click(v: Vector2Like): void {
        if (!this.ball || this.ball.active) return; // ball has already been launched
        this.launchBall(this.startPoint.minus(v).times(this.mouseDistanceMultiplier));
    }
    launchBall(v: Vector2): void {
        this.ball!
            .position(this.startPoint)
            .velocity(v)
            .acceleration(this.gravity);
        this.ball!.active = true;
    }

    update(dt: number): void {
        if (this.ball?.active) this.ball.update(dt);

        if (this.event) this.eventTime += dt;

        if (this.event === "die") {
            this.ball = null;
            this.lives--;
            if (this.lives <= 0) {
                this.score = this.startScore;
                this.level--; // nextRound increments level, so decrement it here to not start the next level
                this.lives = this.defaultLives;
                this.nextRound();
            } else this.startAttempt();
        }
        if (this.event === "win") {
            this.ball!.active = false;
            const completedAnimation = this.eventTime > this.winAnimationTime || this.tiles.every(row => row.every(tile => tile === null));
            forEachGrid(this.tiles, tile => {
                //console.log(tile?.location.distanceManhattan(this.eventLocation!), this.eventTime * this.winAnimationSpeed);
                if ((tile?.location.distanceManhattan(this.eventLocation!) ?? Infinity) < this.eventTime * this.winAnimationSpeed || completedAnimation) {
                    tile!.destroy();
                }
                
            });
            if (completedAnimation) {
                this.startScore = this.score + this.winScore;
                this.event = "win_transition";
                this.eventTime = 0;
            }
        }
        if (this.event === "win_transition") {
            if (this.level < this.levels.levels.length && this.eventTime > this.winTransitionTime) this.nextRound();
        }

        this.particles.forEach(particle => particle.update(dt));
    }
    draw(ctx: CanvasRenderingContext2D, drawText: DrawTextFunction): void {
        const offset = this.pageFillOffset;
        const max = this.size.plus(offset.times(2));
        if (this.background) {
            ctx.fillStyle = this.background;
            ctx.fillRect(-offset.x, -offset.y, max.x, max.y);
        }

        forEachGrid(this.tiles, tile => tile?.draw(ctx, drawText, this.imageData));
        if (this.ball) this.ball.draw(ctx, drawText);

        this.particles.forEach(particle => particle.draw(ctx));
        ctx.globalAlpha = 1;

        if (this.foreground) {
            ctx.fillStyle = this.foreground;
            ctx.fillRect(-offset.x, -offset.y, max.x, max.y);
        }

        this.drawUi(ctx, drawText);
    }

    drawUi(ctx: CanvasRenderingContext2D, drawText: DrawTextFunction): void {
        const transform = ctx.getTransform();
        ctx.resetTransform(); // Ignore when drawing ui
        
        ctx.fillStyle = "#3F3F3FCF";
        ctx.font = "24px 'Jersey 10', monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(`${this.levelData?.name}`, 5, 5);
        ctx.fillText(`Attempts: ${this.attempts}`, 5, 25);
        ctx.fillText(`Lives: ${this.lives === Infinity ? "∞" : this.lives}`, 5, 45);
        ctx.fillText(`Score: ${this.score}`, 5, 65);

        ctx.setTransform(transform);
    }
}

export interface LevelList {
    levels: LevelData[];
}
export interface LevelData {
    //id: string;
    name: string;
    data?: string[]; // will change in future; currently only used for thank you level
    tiles: TileData[][];
    properties?: {
        gravity?: Vector2Like;
        mouseDistanceMultiplier?: number;
        startPoint?: Vector2Like;
        tileOffset?: Vector2Like;
        tileResistance?: Vector2Like;
        size?: Vector2Like;
    };
    appearance?: {
        background?: CanvasStyle | Gradient;
        foreground?: CanvasStyle | Gradient;
    }
}
export type TileData = `${TileTypeKey}#${number}`;

export const TileType = {
    normal: { id: "normal", style: "", texture: "brick", text: false },
    hard: { id: "hard", style: "#8F30FF", texture: "brick", text: true }, // needs multiple hits
    solid: { id: "solid", style: "#3F3F3F", texture: "solid_block", text: false }, // cannot break
    points: { id: "points", style: "#0FEF6F", texture: "reward_block", text: true },
    life: { id: "life", style: "#FF90C0", texture: "reward_block", text: true },
    kill: { id: "kill", style: "#AF2F00", texture: "death_block", text: false }, // ball instantly destroyed
    goal: { id: "goal", style: "#B8D8F0", texture: "reward_block", text: false },
    bounce: { id: "bounce", style: "#F0DF60", texture: "spring", text: true }, // multiplies ball velocity
    spring: { id: "spring", style: "#20C0FF", texture: "spring", text: true }, // like bounce, but does not break
    exploding: { id: "exploding", style: "#F76027", texture: "exploding_block", text: true }, // destroys nearby tiles
} as const;
export type TileTypeKey = keyof typeof TileType;
export type TileType = typeof TileType[TileTypeKey];

type DrawTextFunction = (ctx: CanvasRenderingContext2D, x: number, y: number, text: string, size: number, color?: string, maxWidth?: number) => void;

export class Tile extends PhysicsObject {
    static readonly particleMinTime = 0.5;
    static readonly particleMaxTime = 1.5;
    static readonly particleMinCount = 16;
    static readonly particleMaxCount = 32;
    static readonly particlePartialBreakMultiplier = 0.25;
    static readonly particleGoalBreakMultiplier = 7;
    static readonly particleMinSize = 2;
    static readonly particleMaxSize = 8;

    readonly game: ProjectileGame;
    location: Vector2;
    type: TileType = TileType.normal;
    value: number = 0; // meaning depends on type

    constructor(game: ProjectileGame, location: Vector2, type: TileType, value: number = 0) {
        super();
        this.game = game;
        this.location = location;
        this.pos.set(this.location.times(TILE_SIZE).add(game.tileOffset));
        this.type = type;
        this.value = value;
    }

    getColor() {
        if (this.type === TileType.normal) return `hsl(${this.value * 30}, 90%, 75%)`;
        return this.type.style;
    }

    draw(ctx: CanvasRenderingContext2D, drawText: DrawTextFunction, imageData: Record<IMAGE_KEY, HTMLImageElement>): void {
        ctx.fillStyle = this.getColor();
        ctx.fillRect(this.pos.x, this.pos.y, TILE_SIZE, TILE_SIZE);
        const image = imageData[this.type.texture];
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(image, this.pos.x, this.pos.y, TILE_SIZE, TILE_SIZE);
        if (this.type.text) drawText(ctx, this.pos.x + TILE_SIZE / 2, this.pos.y + TILE_SIZE / 2, this.value.toString(), TILE_SIZE, "white", TILE_SIZE);
    }

    getCollission(ball: Ball): {x: boolean, y: boolean} {
        return {
            x: ball.pos.x < this.pos.x - 1 || ball.pos.x > this.pos.x + 1 + TILE_SIZE,
            y: ball.pos.y < this.pos.y - 1 || ball.pos.y > this.pos.y + 1 + TILE_SIZE
        };
    }

    hit(ball: Ball, velocityMultiplier: Vector2, velocityIncrease: Vector2, previousActions: {invertX: boolean, invertY: boolean}): void {
        let destroy = false;
        switch (this.type) {
            case TileType.normal:
                destroy = true;
                break;
            case TileType.hard:
                this.value--;
                this.spawnParticles(Tile.particlePartialBreakMultiplier);
                if (this.value <= 0) destroy = true;
                break;
            case TileType.points:
                destroy = true;
                this.game.score += this.value;
                break;
            case TileType.life:
                destroy = true;
                this.game.lives += this.value;
                break;
            case TileType.kill:
                this.game.event = "die";
                this.game.eventLocation = this.location;
                break;
            case TileType.goal:
                this.game.event = "win";
                this.game.eventLocation = this.location;
                this.spawnParticles(Tile.particleGoalBreakMultiplier);
                destroy = true;
                break;
            case TileType.bounce:
                ball.vel.mul(this.value);
                destroy = true;
                break;
            case TileType.spring:
                ball.vel.mul(this.value);
                break;
            case TileType.exploding:
                destroy = true;
                forEachGrid(this.game.tiles, tile => {
                    if (tile && tile.location.distance(this.location) < this.value) tile.destroy();
                });
                break;
        }
        const {x: xCollision, y: yCollision} = this.getCollission(ball);
        const isBouncyTile = this.type === TileType.bounce || this.type === TileType.spring;
        const isHardTile = this.type === TileType.hard || this.type === TileType.solid;
        // !y and !x are there to prevent balls from getting stuck in corners
        if (xCollision || !yCollision) {
            velocityIncrease.subX(ball.vel.signX() * this.game.bounceVelocityIncrease.x);
            if (!previousActions.invertX) {
                //console.log(ball.vel.getAbsX(), this.game.tileResistance.x, ball.vel.getAbsX() > this.game.tileResistance.x && !isBouncyTile, ball.vel.signX() * (this.game.tileResistance.x / ball.vel.getAbsX()));
                if (ball.vel.getAbsX() > this.game.tileResistance.x && !isBouncyTile && !isHardTile) {
                    velocityMultiplier.subX(ball.vel.signX() * (this.game.tileResistance.x / ball.vel.getAbsX()));
                } else {
                    velocityMultiplier.mulX(-1);
                    previousActions.invertX = true;
                }
            }
            if (!isBouncyTile) velocityMultiplier.mul(this.game.bounceVelocityMultiplierHorizontal);
        }
        if (yCollision || !xCollision) {
            velocityIncrease.subY(ball.vel.signY() * this.game.bounceVelocityIncrease.y);
            if (!previousActions.invertY) {
                if (ball.vel.getAbsY() > this.game.tileResistance.y && !isBouncyTile && !isHardTile) {
                    velocityMultiplier.subY(ball.vel.signY() * (this.game.tileResistance.y / ball.vel.getAbsY()));
                } else {
                    velocityMultiplier.mulY(-1);
                    previousActions.invertY = true;
                }
            }
            if (!isBouncyTile) velocityMultiplier.mul(this.game.bounceVelocityMultiplierVertical);
        }
        velocityMultiplier.mul(this.game.bounceVelocityMultiplier);
        if (destroy) this.destroy();

        // fix bugs where the ball gets stuck inside tiles
        ball.pos.add(ball.pos.minus(this.pos).times(this.game.ballCollisionFixStepSize));
    }

    destroy(): void {
        console.log(this.game.levelData);
        const row = this.game.tiles[this.location.y];
        row[this.location.x] = null;
        // remove empty rows and tiles from the grid
        // does not affect gameplay
        trimArray(row);
        trimArray(this.game.tiles);
        if (!this.game.event) this.game.score += this.game.tileScore;
        this.spawnParticles(this.game.levelData?.data?.includes("10xParticles") ? 10 : 1);
    }

    spawnParticles(m: number = 1) {
        const color = this.getColor();
        const minPos = this.pos;
        const maxPos = this.pos.plus(TILE_SIZE);
        const count = Math.floor(random(Tile.particleMinCount, Tile.particleMaxCount) * m); // 4 to 12 particles (max is excluded)
        for (let i = 0; i < count; i++) {
            const pos = Vector2.random(minPos, maxPos);
            const lifetime = random(Tile.particleMinTime, Tile.particleMaxTime);
            const size = random(Tile.particleMinSize, Tile.particleMaxSize);
            const particle = new Particle(this.game, pos, size, lifetime, color);
            this.game.particles.push(particle);
        }
    }
}

export class Ball extends PhysicsObject {
    static readonly COLLISION_DISTANCE = 5;
    readonly game: ProjectileGame;
    active: boolean = false;


    constructor(game: ProjectileGame) {
        super();
        this.game = game;
    }

    update(dt: number): void {
        super.update(dt);
        const velocityMultiplier: Vector2 = new Vector2(1);
        const velocityIncrease: Vector2 = new Vector2(0);

        forEachGrid(this.game.tiles, tile => {
            if (tile) {
                if (this.pos.x > tile.pos.x - Ball.COLLISION_DISTANCE && this.pos.x < tile.pos.x + TILE_SIZE + Ball.COLLISION_DISTANCE && this.pos.y > tile.pos.y - Ball.COLLISION_DISTANCE && this.pos.y < tile.pos.y + TILE_SIZE + Ball.COLLISION_DISTANCE) {
                    tile.hit(this, velocityMultiplier, velocityIncrease, {invertX: false, invertY: false});
                    this.vel.mul(velocityMultiplier).add(velocityIncrease.clamp(this.game.bounceVelocityIncrease.times(-1), this.game.bounceVelocityIncrease));
                }
            }
        });

        if (this.pos.y > this.game.size.y + this.game.deathThreshold || this.pos.x < -this.game.deathThreshold || this.pos.x > this.game.size.x + this.game.deathThreshold) {
            this.game.event = "die";
        }
    }
    draw(ctx: CanvasRenderingContext2D, drawText: DrawTextFunction): void {
        if (!this.active && !this.game.event) {
            const start = this.game.startPoint;
            const end = start.minus(this.game.mousePos).mul(this.game.mouseDistanceMultiplier * this.game.arrowLengthScale).add(start);
            const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
            gradient.addColorStop(0, "#3F3F3F");
            gradient.addColorStop(1, "transparent");
            ctx.strokeStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.lineWidth = 4;
            ctx.stroke();
        }
        
        ctx.fillStyle = "#3FCFFF";
        ctx.strokeStyle = "#F0F8FF";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(this.pos.x, this.pos.y, 10, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.lineWidth = 0;
    }
}

export class Particle extends PhysicsObject {
    readonly color: string;
    readonly game: ProjectileGame;
    lifetime: number;
    timeLeft: number;
    size: number;

    constructor(game: ProjectileGame, pos?: Vector2, size: number = 4, lifetime: number = 1, color: string = "#7F7F7F") {
        super();
        this.game = game;
        if (pos) this.position(pos);
        this.timeLeft = this.lifetime = lifetime;
        this.color = color;
        this.size = size;
    }

    update(dt: number) {
        super.update(dt);
        this.timeLeft -= dt;
        if (this.timeLeft <= 0) this.game.particles.splice(this.game.particles.indexOf(this), 1);
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        const scale = Math.max(this.timeLeft / this.lifetime, 0);
        ctx.globalAlpha = scale;
        ctx.beginPath();
        ctx.ellipse(this.pos.x, this.pos.y, this.size * scale, this.size * scale, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

export default ProjectileGame;