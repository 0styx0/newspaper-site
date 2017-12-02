// lowest to highest
/**
 * @param toSort - 2d array (ts is any[] since when using interfaces it thinks it's 1d)
 * @param sortBy - index of array to sort by
 *
 * @return toSort sorted by sortBy, descending
 */
// tslint:disable-next-line:no-any
export default function twoDimensionalSorter(toSort: any[], sortBy: string | number) {

    return toSort.sort((a: (string | number)[], b: (string | number)[]) =>
        // the .slice checks if data is a string or not
        a[sortBy].slice ? a[sortBy].localeCompare(b[sortBy]) : a[sortBy] - b[sortBy]);
}