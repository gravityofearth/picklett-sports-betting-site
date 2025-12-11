export const patchConsole = () => {
    if (typeof console !== 'undefined' && !(console as any)._patched) {
        const methodsToPatch = ['log', 'error', 'warn', 'info', 'debug'];
        methodsToPatch.forEach(methodName => {
            const originalMethod = (console as any)[methodName];
            (console as any)[methodName] = (...args: any[]) => {
                const timestamp = `[${new Date().toISOString()}]`;
                originalMethod(timestamp, ...args);
            };
        });
        (console as any)._patched = true;
    }
}