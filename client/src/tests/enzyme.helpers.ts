import casual from './casual.data';

/**
 * checks a random checkbox
 */
export function randomCheckboxToggle(component: any, checkboxList: any, indexToToggle?: number) {

    const checkboxIndex = (indexToToggle === undefined) ? casual.integer(0, checkboxList.length - 1) : indexToToggle;

    const oneCheckbox = checkboxList.at(checkboxIndex);
    oneCheckbox.nodes[0].checked = !oneCheckbox.nodes[0].checked;
    oneCheckbox.simulate('change');

    return {
        index: checkboxIndex,
        input: oneCheckbox,
    };
}