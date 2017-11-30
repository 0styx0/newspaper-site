import casual from './casual.data';
import { ReactWrapper } from 'enzyme';

/**
 * checks a random checkbox
 */
export function randomCheckboxToggle(checkboxList: any, indexToToggle?: number) {

    const checkboxIndex = (indexToToggle === undefined) ? casual.integer(0, checkboxList.length - 1) : indexToToggle;

    const oneCheckbox = checkboxList.at(checkboxIndex);
    oneCheckbox.instance().checked = !oneCheckbox.instance().checked;
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
export function setInput(wrapper: any, value: string = casual.password, name = 'password') {

    wrapper.find(`input[name="${name}"]`).instance().value = value;

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