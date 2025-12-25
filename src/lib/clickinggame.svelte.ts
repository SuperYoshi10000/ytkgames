export enum UpgradeType {
    AUTO_CLICKER = "AUTO_CLICKER",
    COINS_PER_SECOND = "COINS_PER_SECOND",
    CLICKS_PER_PRESS = "CLICKS_PER_PRESS",
    COINS_PER_CLICK = "COINS_PER_CLICK"
}

const upgradeCostIncreaseBig = [3n, 2n] as const;
const upgradeCountMultiplier = 10n;
const upgradeUnlockMultiplier = 2n;
const maxUpgradeListSize = 20;

const upgradeBaseCost = {
    AUTO_CLICKER: 100n,
    COINS_PER_SECOND: 30n,
    CLICKS_PER_PRESS: 20n,
    COINS_PER_CLICK: 10n,
} as const;
const upgradeCostExponent = {
    AUTO_CLICKER: 2n,
    COINS_PER_SECOND: 1n,
    CLICKS_PER_PRESS: 1n,
    COINS_PER_CLICK: 2n,
};

let coins = $state(0n);

let nextUpgradeUnlock = {
    AUTO_CLICKER: upgradeBaseCost.AUTO_CLICKER * upgradeUnlockMultiplier,
    COINS_PER_SECOND: upgradeBaseCost.COINS_PER_SECOND * upgradeUnlockMultiplier,
    CLICKS_PER_PRESS: upgradeBaseCost.CLICKS_PER_PRESS * upgradeUnlockMultiplier,
    COINS_PER_CLICK: upgradeBaseCost.COINS_PER_CLICK * upgradeUnlockMultiplier
};
let nextUpgradeCount = {
    AUTO_CLICKER: 1n,
    COINS_PER_SECOND: 1n,
    CLICKS_PER_PRESS: 1n,
    COINS_PER_CLICK: 1n
};


let unlockUpgradeFn: () => void;
export function setUnlockUpgradeFn(fn: () => void) {
    unlockUpgradeFn = fn;
}

export function calculateUpgradeCost(type: UpgradeType, count: bigint, level: number) {
    return (10n ** (count - 1n)) * upgradeBaseCost[type] * (upgradeCostIncreaseBig[0] ** (BigInt(level) * upgradeCostExponent[type])) / (upgradeCostIncreaseBig[1] ** BigInt(level) * upgradeCostExponent[type]);
}

export function addCoins(count: bigint) {
    //console.log(coins, count);
    coins += count || 0n;
    //console.log(coins, count);
    for (const type in UpgradeType) {
        if (coins >= nextUpgradeUnlock[type as UpgradeType] ** upgradeCostExponent[type as UpgradeType]) {
            if (Upgrades[type as UpgradeType].length >= maxUpgradeListSize) continue;
            nextUpgradeUnlock[type as UpgradeType] *= upgradeCountMultiplier;
            Upgrades[type as UpgradeType].push({
                cost: calculateUpgradeCost(type as UpgradeType, nextUpgradeCount[type as UpgradeType], 0),
                count: nextUpgradeCount[type as UpgradeType],
                level: 0
            });
            nextUpgradeCount[type as UpgradeType]++;
            unlockUpgradeFn?.();
        }
    }
}

export function pressButton(event: Event) {
    if (event instanceof PointerEvent && event.pointerId < 0) return;
    addCoins(UpgradeValues.CLICKS_PER_PRESS * UpgradeValues.COINS_PER_CLICK);
}
export function getCoins() {
    return coins;
}

export function createUpgradeFunction(type: UpgradeType, count: bigint) {
    return () => {
        const i = Upgrades[type].findIndex(c => c.count === count);
        const item = Upgrades[type][i] ?? (console.log('_'), {cost: upgradeBaseCost[type], count: nextUpgradeCount[type], level: 1});
        const {cost} = item;
        if (coins < cost) return false;
        coins -= BigInt(cost);
        Upgrades[type][i].cost = calculateUpgradeCost(type, count, item.level);
        Upgrades[type][i].level++;
        console.log(Upgrades[type][i].cost, Upgrades[type][i].level);
        UpgradeValues[type] += 10n ** (count - 1n);
        unlockUpgradeFn?.();
        return true;
    }
}

export interface UpgradeButton {
    cost: bigint;
    count: bigint;
    level: number;
}
export interface UpgradeSet extends Array<UpgradeButton> {
    // key: level, value: count
    [key: number]: UpgradeButton;
}


export const UpgradeValues = $state({
    AUTO_CLICKER: 0n,
    COINS_PER_SECOND: 0n,
    CLICKS_PER_PRESS: 1n,
    COINS_PER_CLICK: 1n
});
export const Upgrades = $state({
    AUTO_CLICKER: [] as UpgradeSet,
    COINS_PER_SECOND: [] as UpgradeSet,
    CLICKS_PER_PRESS: [] as UpgradeSet,
    COINS_PER_CLICK: [] as UpgradeSet
});