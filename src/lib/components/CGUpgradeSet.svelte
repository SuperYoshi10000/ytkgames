<script lang="ts">
    import { Upgrades, UpgradeType, type UpgradeSet } from "$lib/clickinggame.svelte";
    import Upgrade from "./CGUpgrade.svelte";

    let {title, type, upgradeItems, coins, createUpgradeFunction}: {
        title: string;
        type: UpgradeType;
        upgradeItems: UpgradeSet;
        coins: bigint;
        createUpgradeFunction: (type: UpgradeType, count: bigint) => () => boolean;
    } = $props();


    // export let u: number;
    //export let calculateUpgradeCost: (count: number, level: number) => number
</script>

<div class="panel">
    <h2>{title}</h2>
    <div class="content">
        {#each upgradeItems as upgrade}
            <Upgrade cost={upgrade.cost} value={10n ** (upgrade.count - 1n)} available={coins >= upgrade.cost} upgradeFn={createUpgradeFunction(type, upgrade.count)}/>
        {/each}
    </div>
</div>

<style>
    .panel h2 {
        margin: 0;
    }
</style>