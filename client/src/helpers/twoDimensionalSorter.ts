
/**
 * @param toSort - 2d array (ts is any[] since when using interfaces it thinks it's 1d)
 * @param sortBy - index of array to sort by
 *
 * @example
 * twoDimensionalSorter([[4, 5, 0], [1, 4, 1]], 2) => [[1, 4, 1], [4, 5, 0]]
 *
 * @return toSort sorted by sortBy, descending
 */
export default function twoDimensionalSorter(toSort: any[], sortBy: any) {

    return toSort.sort((a: any[], b: any[]) =>
        // the .slice checks if data is a string or not
        a[sortBy].slice ? a[sortBy].localeCompare(b[sortBy]) : a[sortBy] - b[sortBy]);
}