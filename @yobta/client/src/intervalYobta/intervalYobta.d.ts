interface CallBack {
    (...args: any[]): void;
}
interface IntervalFactory {
    (): {
        start(callback: CallBack, timeout: number, ...overloads: any[]): void;
        stop(callback: CallBack): void;
        stopAll: VoidFunction;
    };
}
export declare const intervalYobta: IntervalFactory;
export {};
//# sourceMappingURL=intervalYobta.d.ts.map