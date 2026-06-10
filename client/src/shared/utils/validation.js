export const is = {
  match: (testFn, message = '') => (value, fieldValues) => !testFn(value, fieldValues) && message,

  required: () => value => isNilOrEmptyString(value) && '必須項目です',

  minLength: min => value => !!value && value.length < min && `${min}文字以上で入力してください`,

  maxLength: max => value => !!value && value.length > max && `${max}文字以内で入力してください`,

  notEmptyArray: () => value =>
    Array.isArray(value) && value.length === 0 && '1つ以上選択してください',

  email: () => value =>
    !!value && !/.+@.+\..+/.test(value) && '有効なメールアドレスを入力してください',

  url: () => value =>
    !!value &&
    // eslint-disable-next-line no-useless-escape
    !/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/.test(value) &&
    '有効なURLを入力してください',
};

const isNilOrEmptyString = value => value === undefined || value === null || value === '';

export const generateErrors = (fieldValues, fieldValidators) => {
  const errors = {};

  Object.entries(fieldValidators).forEach(([fieldName, validators]) => {
    [validators].flat().forEach(validator => {
      const errorMessage = validator(fieldValues[fieldName], fieldValues);
      if (errorMessage && !errors[fieldName]) {
        errors[fieldName] = errorMessage;
      }
    });
  });
  return errors;
};
