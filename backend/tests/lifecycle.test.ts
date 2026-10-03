import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shutdown, registerCleanup } from '../src/core/lifecycle';

describe('lifecycle', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('executes cleanup in order and exits', async () => {
        // Need to isolate the lifecycle module state to test properly
        const lifecycle = await import('../src/core/lifecycle');
        const cleanup1 = vi.fn().mockResolvedValue(undefined);
        const cleanup2 = vi.fn().mockResolvedValue(undefined);
        
        lifecycle.registerCleanup(cleanup1);
        lifecycle.registerCleanup(cleanup2);

        const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

        await lifecycle.shutdown('SIGINT');

        expect(cleanup1).toHaveBeenCalled();
        expect(cleanup2).toHaveBeenCalled();
        expect(exitSpy).toHaveBeenCalledWith(0);
        
        exitSpy.mockRestore();
    });

    it('is idempotent and ignores repeated signals', async () => {
        const lifecycle = await import('../src/core/lifecycle');
        const cleanup = vi.fn().mockResolvedValue(undefined);
        
        lifecycle.registerCleanup(cleanup);
        const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

        await lifecycle.shutdown('SIGINT');
        await lifecycle.shutdown('SIGTERM');

        expect(cleanup).toHaveBeenCalledTimes(1);
        expect(exitSpy).toHaveBeenCalledTimes(1);

        exitSpy.mockRestore();
    });

    it('handles cleanup errors gracefully and still exits with 0 unless fatal', async () => {
        const lifecycle = await import('../src/core/lifecycle');
        const cleanupError = vi.fn().mockRejectedValue(new Error('Cleanup failed'));
        const cleanupSuccess = vi.fn().mockResolvedValue(undefined);
        
        lifecycle.registerCleanup(cleanupError);
        lifecycle.registerCleanup(cleanupSuccess);

        const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

        await lifecycle.shutdown('SIGINT');

        expect(cleanupError).toHaveBeenCalled();
        expect(cleanupSuccess).toHaveBeenCalled();
        expect(exitSpy).toHaveBeenCalledWith(0); // Assuming we catch and log individual cleanup errors

        exitSpy.mockRestore();
    });
});
