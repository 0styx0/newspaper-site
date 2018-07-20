import casual from './casual.data';
import { ReactWrapper, HTMLAttributes } from 'enzyme';
import { Component } from 'react';
const wait = require('waait');

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

export async function submitForm(wrapper: ReactWrapper<any, any>) {
    wrapper.find('form').first().simulate('submit');
    await wait(0);
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

export function setSelectByElt(selectElt: ReactWrapper<any, any>, values: Set<string>) {

    const selectedOptions: ReactWrapper<HTMLAttributes, any, Component<{}, {}, any>>[] = [];

    for (const value of values) {
        const opt = selectElt.find(`option[value="${value}"]`);
        opt.simulate('change', { currentTarget: { name, value }, target: { name, value } });
        selectedOptions.push(opt);
    }

    return selectedOptions;
}

export function setSelectByName(wrapper: ReactWrapper<any, any>, name: string, values: Set<string>) {

    const selectElt = wrapper.find(`select[name="${name}"]`);
    setSelectByElt(selectElt, values);
}

export function setupComponent(wrapper: ReactWrapper<any, any>, componentToFind: any): typeof componentToFind {

    const component = wrapper.find(componentToFind).instance();

    if (component.componentWillReceiveProps) {
        component.componentWillReceiveProps(component.props, null);
    }

    wrapper.mount();

    return component;
}
