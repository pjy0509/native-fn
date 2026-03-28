import createCustomError from "../../../utils/create-custom-error";

const UserCancelledError: ErrorConstructor = createCustomError('UserCancelledError');

export {
    UserCancelledError,
}
