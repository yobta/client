import { YobtaClientOperation, YobtaRemoteOperation } from '@yobta/protocol';
interface EncoderFactory {
    (): {
        encode: (params: {
            headers?: Record<string, string>;
            operation: YobtaClientOperation;
        }) => string;
        decode: (value: string) => YobtaRemoteOperation;
    };
}
export type YobtaClientEncoder = ReturnType<EncoderFactory>;
export declare const encoderYobta: EncoderFactory;
export {};
//# sourceMappingURL=encoder.d.ts.map