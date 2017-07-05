import React from 'react';

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

function Select(props) {

    return (
        <Label
            value={props.label}
            required={!!props.required}

            children={
                <select name={props.name}>
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