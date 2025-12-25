<script lang="ts">
    import * as Physics from "$lib/physics";
    import ProjectileGame, { type IMAGE_KEY, type LevelList } from "$lib/projectilegame";

    import Levels from "$lib/data/projectilegame/levels/levels.json";
    
    
    // does not work when run in another file
    function loadImage(src: string): HTMLImageElement {
        const image = new Image();
        image.src = src;
        return image;
    }
    export let IMAGE_DATA: Record<IMAGE_KEY, HTMLImageElement>;

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null = null;
    let game: ProjectileGame;    
    let offset: Physics.Vector2;
    
    function drawText(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, size: number, color: string = "white", maxWidth?: number) {
        ctx.font = `${size}px 'Jersey 10', monospace`;
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, x, y, maxWidth);
    }

    function load(element: HTMLCanvasElement) {
        let level = 1;
        let infiniteLives = false;
        if (location.hash) {
            let hashParams = new URLSearchParams(location.hash.slice(1));
            let levelParam = hashParams.get("_dev_level");
            if (levelParam) level = parseInt(levelParam);
            let infiniteLivesParam = hashParams.get("_dev_infiniteLives");
            if (infiniteLivesParam === "true") infiniteLives = true;
            console.log(infiniteLives)
        }
            console.log(infiniteLives)

        canvas = element;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        offset = new Physics.Vector2((window.innerWidth - 800) / 2, (window.innerHeight - 600) / 2);
        // console.log("loaded")
        IMAGE_DATA = {
            brick: loadImage("/images/projectilegame/textures/brick_overlay.png"),
            solid_block: loadImage("/images/projectilegame/textures/solid_block_overlay.png"),
            spring: loadImage("/images/projectilegame/textures/spring_overlay.png"),
            exploding_block: loadImage("/images/projectilegame/textures/exploding_block_overlay.png"),
            reward_block: loadImage("/images/projectilegame/textures/reward_block_overlay.png"),
            death_block: loadImage("/images/projectilegame/textures/death_block_overlay.png")
        };
        ctx = canvas.getContext("2d");
        ctx!.translate(offset.x, offset.y);
        game = new ProjectileGame(ctx!, Levels as LevelList, IMAGE_DATA, { infiniteLives });
        if (level > 1) { game.level = level - 1; };
        if (infiniteLives) { game.lives = Infinity; }
        game.nextRound();
        console.log(game)
        loop();
    }
    
    function mouseMove(event: MouseEvent) {
        game.mouseMove(getMousePos(canvas, event));
    }
    function click(event: MouseEvent) {
        game.click(getMousePos(canvas, event));
    }
    // Copied from Stack Overflow
    function getMousePos(canvas: HTMLCanvasElement, event: MouseEvent): Physics.Vector2Like {
        let rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left - offset.x,
            y: event.clientY - rect.top - offset.y
        };
    }
    
    function update(dt: number = 0) {
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        game.update(dt);
        game.draw(ctx!, drawText);
    }

    function loop(startTime: number = performance.now()) {
        let lastTime = startTime;
        function step(time: number) {
            let dt = (time - lastTime) / 1000;
            lastTime = time;
            update(dt);
            requestAnimationFrame(step);
        }
        requestAnimationFrame(step);

    }
</script>
<div id="canvas-container">
    <canvas
        on:mousemove={mouseMove} on:click={click}
        use:load
    ></canvas>
</div>


<style>
    @import url('https://fonts.googleapis.com/css2?family=Jersey+10&display=swap');
    :global(body) {
        margin: 0;
        overflow: hidden;
    }
    .canvas-container {
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>