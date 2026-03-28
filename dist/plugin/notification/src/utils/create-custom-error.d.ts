declare global {
    interface ErrorConstructor {
        captureStackTrace?: (targetObject: object, constructorOpt?: Function) => void;
    }
}
export default function createCustomError(name: string, Base?: ErrorConstructor): ErrorConstructor;
