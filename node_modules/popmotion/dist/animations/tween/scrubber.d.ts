import { Action } from '../../action';
export declare type ScrubberSubscription = {
    seek: (progress: number) => any;
};
declare const _default: (props: {
    [key: string]: any;
}) => Action;
export default _default;
