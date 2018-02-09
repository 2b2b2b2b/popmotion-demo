import { PointerPoint } from './types';
export declare const defaultPointerPos: () => PointerPoint;
export declare const eventToPoint: (e: MouseEvent | Touch, point?: PointerPoint) => PointerPoint;
