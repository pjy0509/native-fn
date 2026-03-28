export default function compareVersion(lhs: string, rhs: string): -1 | 0 | 1 {
    const pa: string[] = lhs.split('.');
    const pb: string[] = rhs.split('.');
    const length: number = Math.max(pa.length, pb.length);

    for (let i: number = 0; i < length; i++) {
        let a: number;
        let b: number;

        if (i < pa.length) a = parseInt(pa[i], 10);
        else a = 0;

        if (i < pb.length) b = parseInt(pb[i], 10);
        else b = 0;

        if (a > b) return 1;
        if (a < b) return -1;
    }

    return 0;
}
