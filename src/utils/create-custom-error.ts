declare global {
    interface ErrorConstructor {
        captureStackTrace?: (targetObject: object, constructorOpt?: Function) => void;
    }
}

export default function createCustomError(name: string, Base: ErrorConstructor = Error): ErrorConstructor {
    function CustomError(this: Error, message?: string): ErrorConstructor | Error {
        if (!(this instanceof CustomError)) return new (CustomError as unknown as ErrorConstructor)(message);

        const error: Error = (function (): Error {
            if (typeof message === 'undefined') return new Base('');
            return new Base(message);
        })();

        if (typeof Object.setPrototypeOf === 'function') Object.setPrototypeOf(error, CustomError.prototype);
        else (error as any).__proto__ = CustomError.prototype;

        error.name = name;
        if (typeof message !== 'undefined') error.message = message;

        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            try {
                Object.defineProperty(error, Symbol.toStringTag, {
                    value: name,
                    writable: false,
                    enumerable: false,
                    configurable: true
                });
            } catch (_: unknown) {
            }
        }

        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(error, CustomError);
        } else if (Base.captureStackTrace && typeof Base.captureStackTrace === 'function') {
            Base.captureStackTrace(error, CustomError);
        } else {
            try {
                const tempError: Error = new Base();

                if (tempError.stack) error.stack = tempError.stack;
            } catch (_: unknown) {
            }
        }

        return error;
    }

    CustomError.prototype = Object.create(Base.prototype, {
        constructor: {
            value: CustomError,
            writable: true,
            enumerable: false,
            configurable: true
        }
    });

    try {
        Object.defineProperty(CustomError.prototype, 'name', {
            value: name,
            writable: true,
            enumerable: false,
            configurable: true
        });
    } catch (_: unknown) {
        try {
            CustomError.prototype.name = name;
        } catch (_: unknown) {
        }
    }

    try {
        Object.defineProperty(CustomError, 'name', {
            value: name,
            writable: false,
            enumerable: false,
            configurable: true
        });
    } catch (_: unknown) {
    }

    return CustomError as ErrorConstructor;
}
