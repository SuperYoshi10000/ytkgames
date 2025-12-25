<script lang="ts">
    import { displayValue } from "$lib/number";


    let {value, cost, available, upgradeFn}: {
        value: bigint;
        cost: bigint;
        available: boolean;
        upgradeFn: () => boolean;
    } = $props();

    function upgradeAll(event: Event) {
        event.preventDefault();
        while (available) upgradeFn();
    }

    const MAX_DIGITS = 4;
</script>

<button class="upgrade" onclick={upgradeFn} oncontextmenu={upgradeAll} disabled={!available}>
    <span>{displayValue(value, MAX_DIGITS)}</span>
    <span>${displayValue(cost, MAX_DIGITS)}</span>
</button>

<style>
    .upgrade {
        display: flex;
        width: 100%;
        height: 40px;
        margin-bottom: 2px;
        border-radius: 10px;
        border: 0;
        padding: 0;
        background-color: #adf;
        font-size: 16px;
        cursor: pointer;
    }
    .upgrade:disabled {
        opacity: 75%;
        cursor: not-allowed;
    }
    .upgrade:not(:disabled):hover {
        background-color: #9ce;
    }
    .upgrade:not(:disabled):active {
        background-color: #8bd;
    }

    span {
        display: block;
        text-align: center;
        align-content: center;
        margin: 0;
        flex: 1;
    }
</style>