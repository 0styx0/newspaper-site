import React from 'react';

/**
 * @prop label, children, abbr, required @see Select
 *
 * @return html label as parent to props.children with text of prop.value concatted with ': ',
   if abbr is given, that's put in too, and if required is given, a red asterisk is put in too
 */
function Label(props) {

    const label = props.value + ": ";

    return (
        <label>{label}
            {props.children}
            {!!props.abbr ? <abbr title={props.abbr}>?</abbr> : ""}
            {!!props.required ? <span className="danger">*</span> : ""}
        </label>
    )
}

/**
 * @prop label, required, name, children - @see Select
 * @prop abbr - optional text for abbr elt if want to give user a hint about the input
 * @prop placeholder = html attr
 * @prop type = html attr
 * @prop title = html attr
 * @prop pattern = html attr
 *
 * @return input elt wrapped in a @see Label
 */
function Input(props) {


    return (
        <Label
          value={props.label}
          required={!!props.required}
          abbr={props.abbr}

          children={

            <input
              name={props.name}
              type={props.type}
              placeholder={props.placeholder}
              pattern={props.pattern}
              required={!!props.required}
              title={props.title}
            />}
        />
    );
}

/**
 * @prop label - string, contents of label element
 * @prop required - if it exists, the select gets `required attribute
 * @prop name - name of select
 * @prop children - option elements
 */
function Select(props) {

    return (
        <Label
            value={props.label}
            required={!!props.required}

            children={
                <select name={props.name} onChange={props.onChange}>
                    {props.children}
                </select>
            }
        />
    );
}

export {
    Input,
    Select
};