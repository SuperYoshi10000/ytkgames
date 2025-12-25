export function displayValue(v: bigint, max: number = 4, recursive: boolean = false): string {
    const s = v.toString();
    if (v < 10**max) return s;
    const d = s.slice(1, max).replace(/0+$/, '');
    const e = s.length - 1;
    return `${s[0]}${d ? '.' + d : ''}e${recursive ? displayValue(BigInt(e), 4, true) : e}`;
}