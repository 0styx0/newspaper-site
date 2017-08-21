
export default function toggler(set: Set<any>, value: any) {

    if (set.has(value)) {
        return set.delete(value);
    }

    return set.add(value);
}