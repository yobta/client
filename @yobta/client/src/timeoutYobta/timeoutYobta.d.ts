interface CallBack {
    (...args: any[]): void;
}
interface TimeoutFactory {
    (): {
        start(callback: CallBack, timeout: number, ...overloads: any[]): void;
        stop(callback: CallBack): void;
        stopAll: VoidFunction;
    };
}
export declare const timeoutYobta: TimeoutFactory;
export {};
//# sourceMappingURL=timeoutYobta.d.ts.map