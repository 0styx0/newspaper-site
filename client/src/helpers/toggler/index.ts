
/**
 * Toggles value in a Set
 */
export default function toggler(set: Set<any>, value: any) {

    if (set.has(value)) {
        set.delete(value);
    }

    set.add(value);
}