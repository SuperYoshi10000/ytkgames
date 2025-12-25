<script lang="ts">
    import UpgradeSet from "$lib/components/CGUpgradeSet.svelte";

    import {Upgrades, getCoins, createUpgradeFunction, UpgradeValues, pressButton, addCoins, UpgradeType} from "$lib/clickinggame.svelte";
  import { displayValue } from "$lib/number";
  
    let u = 0;
    let s = $state(0);

    setInterval(() => {
        addCoins(UpgradeValues.COINS_PER_SECOND + UpgradeValues.AUTO_CLICKER * UpgradeValues.COINS_PER_CLICK);
    }, 1000);
    setInterval(() => {
        if (s > 0) s *= 0.95;
    }, 100);

    // setUnlockUpgradeFn(() => u++);

    // setInterval(() => g++, 500);

    let coins = $derived(getCoins());

    const MAX_DIGITS = 7

    function pressAndDecorate(event: Event) {
        event.preventDefault();
        pressButton(event);
        s += 20;
    }


    function getScoreText(): string {
        return "Coins: " + displayValue(coins, MAX_DIGITS)
            + "Auto clickers: " + displayValue(UpgradeValues.AUTO_CLICKER, MAX_DIGITS)
            + "Coins/sec: " + displayValue(UpgradeValues.COINS_PER_SECOND, MAX_DIGITS)
            + "Clicks/press: " + displayValue(UpgradeValues.CLICKS_PER_PRESS, MAX_DIGITS)
            + "Coins/click: " + displayValue(UpgradeValues.COINS_PER_CLICK, MAX_DIGITS)

    }
    function copyScore() {
        const text = getScoreText();
        navigator.clipboard.writeText(text);
    }
    function shareScore() {
        const text = getScoreText();
        navigator.share({title: "My Button Clicker Game Score", text});
    }
</script>

<title>Button Clicker</title>
<button onclick={pressAndDecorate} oncontextmenu={pressAndDecorate} style="box-shadow: 0 0 {3 * Math.sqrt(s)}px {Math.sqrt(s)}px #bbb;">BUTTON</button>


<div class="ui">
    <div class="score">
        <h2>Score</h2>
        <p>
            <span class="coins">Coins: {displayValue(coins, MAX_DIGITS)}</span><br/>
            Auto clickers: {displayValue(UpgradeValues.AUTO_CLICKER, MAX_DIGITS)}<br/>
            Coins/sec: {displayValue(UpgradeValues.COINS_PER_SECOND, MAX_DIGITS)}<br/>
            Clicks/press: {displayValue(UpgradeValues.CLICKS_PER_PRESS, MAX_DIGITS)}<br/>
            Coins/click: {displayValue(UpgradeValues.COINS_PER_CLICK, MAX_DIGITS)}<br/>
        </p>

        <span id="actions">
            <a id="copy" href="javascript:void(0)" onclick={copyScore}>Copy</a>
            <a id="share" href="javascript:void(0)" onclick={shareScore}>Share</a>
        </span>
    </div>

    <div class="upgrades">
        {#key u}
        <UpgradeSet title="Auto Clicker" upgradeItems={Upgrades.AUTO_CLICKER} type={UpgradeType.AUTO_CLICKER} {coins} {createUpgradeFunction} ></UpgradeSet>
        <UpgradeSet title="Coins per Second" upgradeItems={Upgrades.COINS_PER_SECOND} type={UpgradeType.COINS_PER_SECOND} {coins} {createUpgradeFunction} ></UpgradeSet>
        <UpgradeSet title="Clicks per Press" upgradeItems={Upgrades.CLICKS_PER_PRESS} type={UpgradeType.CLICKS_PER_PRESS} {coins} {createUpgradeFunction} ></UpgradeSet>
        <UpgradeSet title="Coins per Click" upgradeItems={Upgrades.COINS_PER_CLICK} type={UpgradeType.COINS_PER_CLICK} {coins} {createUpgradeFunction} ></UpgradeSet>
        {/key}
    </div>
</div>

<style>
    :global(*) {
        font-family: sans-serif;
        box-sizing: border-box;
        user-select: none;
    }
    :global(h2) {
        color: white;
    }

    :root {
        background-color: #111;
    }

    button {
        display: block;
        position: absolute;
        width: 300px;
        height: 300px;
        top: calc(50% - 150px);
        left: calc(50% - 150px);
        border-radius: 50%;
        border: none;
        background-color: #eee;
        cursor: grab;
    }
    button:hover {
        background-color: #ddd;
    }
    button:active {
        background-color: #ccc;
        cursor: grabbing;
    }

    .ui {
        display: flex;
    }

    .score {
        position: absolute;
        left: 0;
        top: 0;
        width: 40%;
        max-width: 300px;
        height: 200px;
        padding: 5px;
        border-bottom-right-radius: 15px;
        color: white;
    }
    .score h2 {
        margin: 0;
    }
    .score p {
        line-height: 1.25em;
    }
    .coins {
        font-weight: bold;
        color: yellow;
    }

    .actions {
        display: flex;
        flex-direction: row;
    }
    a {
        display: inline-block;
        color: white;
        text-decoration: none;
        margin-right: 10px;
        width: 50px;
        text-align: center;
        background: green;
    }

    .upgrades {
        display: flex;
        position: absolute;
        right: 0;
        top: 0;
        width: 60%;
        max-width: 300px;
        height: 100%;
        padding: 5px;
        flex-direction: column;
        overflow: auto;
    }
    :global(.upgrades > .panel) {
        flex: 1;
    }

    .score, .upgrades {
        background-color: #444c;
        box-shadow: 0 0 20px #444c;
    }
</style>