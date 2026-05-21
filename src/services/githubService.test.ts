import { describe, it, expect, vi, beforeEach } from 'vitest';
import { githubService } from './githubService';

// Mock the global fetch
global.fetch = vi.fn();

describe('GithubService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Clear spy if any
        vi.restoreAllMocks();
    });

    it('should fetch and parse GitHub events successfully', async () => {
        // Mock successful response
        const mockEvents = [
            {
                type: 'PushEvent',
                repo: { name: 'test/repo1' },
                created_at: '2024-01-01T12:00:00Z',
                payload: {
                    commits: [
                        {
                            message: 'Initial commit',
                            sha: '1234567890abcdef',
                        },
                        {
                            message: 'Second commit',
                            sha: 'abcdef1234567890',
                        }
                    ]
                }
            },
            {
                type: 'PullRequestEvent',
                repo: { name: 'test/repo2' },
                created_at: '2024-01-02T12:00:00Z',
                payload: {}
            }
        ];

        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockEvents,
        });

        const stats = await githubService.fetchStats('testuser');

        expect(global.fetch).toHaveBeenCalledWith('https://api.github.com/users/testuser/events/public');

        expect(stats).toEqual({
            username: 'testuser',
            commits: 2,
            pullRequests: 1,
            contributions: 3,
            streak: 5,
            recentRepo: 'test/repo1',
            isConnected: true,
            latestCommit: {
                message: 'Initial commit',
                hash: '1234567',
                date: '2024-01-01T12:00:00Z',
            }
        });
    });

    it('should throw "User not found" error if response is not ok', async () => {
        // Suppress console.error expected to be thrown during this test
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        (global.fetch as any).mockResolvedValueOnce({
            ok: false,
        });

        await expect(githubService.fetchStats('unknownuser')).rejects.toThrow('User not found');
        expect(global.fetch).toHaveBeenCalledWith('https://api.github.com/users/unknownuser/events/public');

        consoleSpy.mockRestore();
    });

    it('should fallback to random commits when no commits found', async () => {
        // We will mock Math.random to ensure deterministic tests
        const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);

        const mockEvents = [
            {
                type: 'WatchEvent',
                repo: { name: 'test/other-repo' },
                created_at: '2024-01-01T12:00:00Z',
                payload: {}
            }
        ];

        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockEvents,
        });

        const stats = await githubService.fetchStats('testuser');

        // commits || Math.floor(Math.random() * 20) + 5
        // with Math.random() = 0.5, Math.floor(0.5 * 20) + 5 = 15
        expect(stats.commits).toBe(15);
        expect(stats.pullRequests).toBe(0);

        // Note: contribution logic is `commits + prs` where `commits` is the variable (which is 0)
        expect(stats.contributions).toBe(0);
        expect(stats.recentRepo).toBe('none');
        expect(stats.latestCommit).toBeUndefined();

        randomSpy.mockRestore();
    });
});
