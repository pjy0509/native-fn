import createCustomError from "../../../utils/create-custom-error";

const URLOpenError: ErrorConstructor = createCustomError('URLOpenError');

export {
    URLOpenError,
}
