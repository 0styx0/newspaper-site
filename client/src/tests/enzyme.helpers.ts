import casual from './casual.data';
import { ReactWrapper } from 'enzyme';

/**
 * checks a random checkbox
 */
export function randomCheckboxToggle(checkboxList: ReactWrapper<any, any>, indexToToggle?: number) {

    const checkboxIndex = (indexToToggle === undefined) ? casual.integer(0, checkboxList.length - 1) : indexToToggle;

    const oneCheckbox = checkboxList.at(checkboxIndex);
    const checkboxInstance = oneCheckbox.instance() as {} as HTMLInputElement;

    checkboxInstance.checked = !checkboxInstance.checked;
    oneCheckbox.simulate('change');

    return {
        index: checkboxIndex,
        input: oneCheckbox,
    };
}

export function submitForm(wrapper: ReactWrapper<any, any>) {
    wrapper.find('form').first().simulate('submit');
}

/**
 * Sets an input
 *
 * @param wrapper - result of enzyme#mount
 * @param value - what to set the input to
 * @param name - of input to set
 */
export function setInput(wrapper: ReactWrapper<any, any>, value: string = casual.password, name: string = 'password') {

    (wrapper.find(`input[name="${name}"]`).instance() as {} as HTMLInputElement).value = value;

    return value;
}

export function setupComponent(wrapper: ReactWrapper<any, any>, componentToFind: any): typeof componentToFind {

    const component = wrapper.find(componentToFind).instance();

    if (component.componentWillReceiveProps) {
        component.componentWillReceiveProps(component.props, null);
    }

    wrapper.mount();

    return component;
}