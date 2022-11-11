import Validator from 'validatorjs';
import HttpErrors from 'http-errors';

export default function validate(data, rules, messages) {
  const validation = new Validator(data, rules, messages);
  if (validation.fails()) {
    throw HttpErrors(422, validation.errors);
  }
}
