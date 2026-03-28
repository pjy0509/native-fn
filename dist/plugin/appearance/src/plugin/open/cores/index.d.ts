import { Contact, OpenInstance } from "../types";
declare global {
    interface Document {
        webkitVisibilityState?: 'hidden' | 'visible';
        mozVisibilityState?: 'hidden' | 'visible';
        msVisibilityState?: 'hidden' | 'visible';
        webkitHidden?: boolean;
        mozHidden?: boolean;
        msHidden?: boolean;
    }
    interface Navigator {
        contacts?: ContactsManager;
    }
    interface FileSystemDirectoryHandle {
        entries(): AsyncIterator<[string, FileSystemHandle]>;
    }
    var showOpenFilePicker: (options?: OpenFilePickerOptions) => Promise<FileSystemFileHandle[]>;
    var showDirectoryPicker: (options?: OpenDirectoryPickerOptions) => Promise<FileSystemDirectoryHandle>;
    var cordova: object | undefined;
}
interface AsyncIterator<T, TReturn = any, TNext = undefined> {
    next(...args: [] | [TNext]): Promise<IteratorResult<T, TReturn>>;
    return?(value?: TReturn | PromiseLike<TReturn>): Promise<IteratorResult<T, TReturn>>;
    throw?(e?: any): Promise<IteratorResult<T, TReturn>>;
}
type IteratorResult<T, TReturn = any> = IteratorYieldResult<T> | IteratorReturnResult<TReturn>;
interface IteratorYieldResult<TYield> {
    done?: false;
    value: TYield;
}
interface IteratorReturnResult<TReturn> {
    done: true;
    value: TReturn;
}
interface OpenFilePickerOptions {
    excludeAcceptAllOption?: boolean;
    id?: string;
    multiple?: boolean;
    startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
    types?: {
        description?: string;
        accept: Record<string, string[]>;
    }[];
}
interface OpenDirectoryPickerOptions {
    id?: string;
    mode?: 'read' | 'readwrite';
    startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
}
interface ContactsManager {
    select(properties: string[], options?: Record<string, any>): Promise<Contact[]>;
    getProperties(): Promise<string[]>;
}
declare const Open: OpenInstance;
export default Open;
