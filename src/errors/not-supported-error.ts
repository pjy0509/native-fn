import createCustomError from "../utils/create-custom-error";

const NotSupportedError: ErrorConstructor = createCustomError('NotSupportedError');

export {
    NotSupportedError,
}
