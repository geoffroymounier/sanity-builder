import React from 'react';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import { string } from 'yup';
import cn from 'classnames';
import { FORM_ERROR } from 'final-form';
import { Form, Field } from 'react-final-form';

const Textarea = dynamic(() => import('./Textarea'));
const Button = dynamic(() => import('./Button'));
const Input = dynamic(() => import('./Input'));

const WrappedSpan = styled.span`
  ${(props) => props.styled}
`;

const WrappedForm = styled.form`
  position: ${(props) => (props.hasBackground ? 'relative' : 'initial')};
  ${(props) => props.styled}
`;

const WrappedDiv = styled.div`
  position: ${(props) => (props.hasBackground ? 'relative' : 'initial')};
  ${(props) => props.styled}
`;

enum Fields {
  INPUT = 'input',
  TEXTAREA = 'textarea',
  BUTTON = 'button',
}

const validBlocks = {
  [Fields.INPUT]: Input,
  [Fields.TEXTAREA]: Textarea,
  [Fields.BUTTON]: Button,
};

const Blog = (props) => {
  const onSubmit = async (values, { initialize, resetFieldState }) => {
    const options = {
      method: 'POST',
      body: JSON.stringify(values),
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const resp = await fetch('api/sendmail', options);
    if (resp.status !== 200) {
      return { [FORM_ERROR]: resp.statusText };
    }
    initialize({});
    Object.keys(values).forEach((field) => {
      resetFieldState(field);
    });
    return undefined;
  };
  return (
    <Form
      onSubmit={onSubmit}
      render={({
        handleSubmit,
        submitting,
        submitFailed,
        submitError,
        submitSucceeded,
        hasValidationErrors,
      }) => {
        return (
          <WrappedForm
            onSubmit={handleSubmit}
            className={`${props.classes}`}
            styled={`${props.style}`}
          >
            {props.fields.map((field, id) => {
              const Component = validBlocks[field._type];
              if (!Component) return null;
              if (field._type == Fields.BUTTON)
                return (
                  <WrappedDiv styled={field.style} key={id.toString()}>
                    <Component
                      {...field}
                      classes={cn(
                        field.classes,
                        hasValidationErrors ? 'disabled' : '',
                        submitting ? 'submitting' : ''
                      )}
                      type="submit"
                      disabled={hasValidationErrors || submitting}
                    />
                  </WrappedDiv>
                );
              return (
                <Field
                  key={id.toString()}
                  name={field.id}
                  placeholder={field.placeholder}
                  validate={async (value) => {
                    let schema = string();
                    if (field.required) schema = schema.required(props.messages?.requiredErrorMsg);
                    if (field.type === 'email')
                      schema = schema.email(field.errorMsg || 'wrong email');
                    if (field.regex)
                      schema = schema.matches(field.regex, field.errorMsg || 'wrong value');

                    try {
                      await schema.validate(value || '');
                      return undefined;
                    } catch (error) {
                      return error.message;
                    }
                  }}
                  {...field}
                >
                  {({ meta, input }) => {
                    return (
                      <WrappedDiv
                        styled={field.style}
                        className={cn('field', meta.error && meta.touched ? 'error' : '')}
                      >
                        <label>{field.label}</label>
                        <Component input={input} {...field} />
                        {meta.error && meta.touched && (
                          <WrappedSpan
                            className={`errorBanner ${props.errorClasses}`}
                            styled={`${props.errorStyle}`}
                          >
                            {meta.error}
                          </WrappedSpan>
                        )}
                      </WrappedDiv>
                    );
                  }}
                </Field>
              );
            })}
            {submitFailed && <span className={`errorMsg`}>{submitError}</span>}
            {submitSucceeded && <span className={`successMsg`}>{props.messages?.successMsg}</span>}
          </WrappedForm>
        );
      }}
    />
  );
};

export default Blog;
