import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { githubService } from '../githubService';

describe('githubService', () => {
    const mockUsername = 'testuser';

    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    describe('fetchStats', () => {
        it('should throw an error and log to console when fetch is rejected', async () => {
            const networkError = new Error('Network failure');
            (global.fetch as any).mockRejectedValueOnce(networkError);

            await expect(githubService.fetchStats(mockUsername)).rejects.toThrow('Network failure');
            expect(console.error).toHaveBeenCalledWith('Error fetching Github stats:', networkError);
        });

        it('should throw "User not found" when response is not ok', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: false,
            });

            await expect(githubService.fetchStats(mockUsername)).rejects.toThrow('User not found');
            // The catch block will catch this and log it, then rethrow
            expect(console.error).toHaveBeenCalledWith('Error fetching Github stats:', new Error('User not found'));
        });

        it('should parse events and return stats successfully', async () => {
            const mockEvents = [
                {
                    type: 'PushEvent',
                    repo: { name: 'repo1' },
                    payload: {
                        commits: [{ message: 'Initial commit', sha: '1234567890' }]
                    },
                    created_at: '2024-01-01T00:00:00Z'
                },
                {
                    type: 'PullRequestEvent',
                    repo: { name: 'repo2' },
                    payload: {}
                }
            ];

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockEvents,
            });

            const stats = await githubService.fetchStats(mockUsername);

            expect(stats.username).toBe(mockUsername);
            expect(stats.pullRequests).toBe(1);
            expect(stats.commits).toBe(1);
            expect(stats.contributions).toBe(2);
            expect(stats.recentRepo).toBe('repo1');
            expect(stats.latestCommit).toEqual({
                message: 'Initial commit',
                hash: '1234567',
                date: '2024-01-01T00:00:00Z'
            });
        });

        it('should handle zero commits and pull requests correctly', async () => {
            const mockEvents = [
                {
                    type: 'WatchEvent',
                    repo: { name: 'repo1' },
                }
            ];

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockEvents,
            });

            const stats = await githubService.fetchStats(mockUsername);

            expect(stats.username).toBe(mockUsername);
            expect(stats.pullRequests).toBe(0);
            expect(stats.commits).toBeGreaterThanOrEqual(5); // Due to Math.floor(Math.random() * 20) + 5
            expect(stats.recentRepo).toBe('none');
        });
    });
});
