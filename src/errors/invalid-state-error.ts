import createCustomError from "../utils/create-custom-error";

const InvalidStateError: ErrorConstructor = createCustomError('InvalidStateError');

export {
    InvalidStateError,
}
