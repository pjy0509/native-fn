import Platform from "../../platform/cores";

export const IS_IE_MOBILE: boolean = /iemobile/i.test(Platform.userAgent);
export const IS_WINDOWS_PHONE: boolean = /windows phone/i.test(Platform.userAgent);
