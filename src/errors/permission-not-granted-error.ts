import createCustomError from "../utils/create-custom-error";

const PermissionNotGrantedError: ErrorConstructor = createCustomError('PermissionNotGrantedError');

export {
    PermissionNotGrantedError,
}
