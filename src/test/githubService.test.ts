import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { githubService } from '../services/githubService';

describe('GithubService', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should throw "User not found" when fetch response is not ok', async () => {
        // Mock fetch to return a non-ok response
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 404,
            statusText: 'Not Found',
        });

        await expect(githubService.fetchStats('nonexistentuser')).rejects.toThrow('User not found');

        expect(global.fetch).toHaveBeenCalledWith('https://api.github.com/users/nonexistentuser/events/public');
    });
});
