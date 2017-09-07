import casual from './casual.data';

/**
 * checks a random checkbox
 */
export function randomCheckboxToggle(checkboxList: any, indexToToggle?: number) {

    const checkboxIndex = (indexToToggle === undefined) ? casual.integer(0, checkboxList.length - 1) : indexToToggle;

    const oneCheckbox = checkboxList.at(checkboxIndex);
    oneCheckbox.nodes[0].checked = !oneCheckbox.nodes[0].checked;
    oneCheckbox.simulate('change');

    return {
        index: checkboxIndex,
        input: oneCheckbox,
    };
}

export function submitForm(wrapper: any) {
    wrapper.find('form').first().simulate('submit');
}

/**
 * Sets an input
 *
 * @param wrapper - result of enzyme#mount
 * @param value - what to set the input to
 * @param name - of input to set
 */
export function setInput(wrapper: any, value: string = casual.password, name = 'password') {

    (wrapper.find(`input[name="${name}"]`) as any).node.value = value;

    return value;
}

