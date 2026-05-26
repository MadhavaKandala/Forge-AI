export interface ProgramTask {
    day: number;
    title: string;
    topic: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    estimatedMinutes?: number;
}

export interface ProgramTemplate {
    type: string;
    name: string;
    description: string;
    days: number;
    icon: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'extreme';
    category: 'fitness' | 'coding' | 'work' | 'wellness' | 'custom' | 'mental' | 'learning' | 'health' | 'productivity';
    dailyRequirements: string[];
    dailyRequirementTimes?: Record<string, string>;
    totalXpPotential: number;
    isCustom?: boolean;
    isOngoing?: boolean;
    taskList?: ProgramTask[];
    phases?: {
        name: string;
        startDay: number;
        endDay: number;
        description: string;
        xpPerDay: number;
    }[];
}

const makeTasks = (
    startDay: number,
    topic: string,
    titles: string[],
    difficulty: ProgramTask['difficulty'] = 'medium',
    estimatedMinutes = 45,
): ProgramTask[] =>
    titles.map((title, index) => ({
        day: startDay + index,
        title,
        topic,
        difficulty,
        estimatedMinutes,
    }));

const LEETCODE_150_TASKS: ProgramTask[] = [
    ...makeTasks(1, 'Arrays', [
        'Two Sum',
        'Best Time to Buy and Sell Stock',
        'Contains Duplicate',
        'Product of Array Except Self',
        'Maximum Subarray',
        'Maximum Product Subarray',
        'Find Minimum in Rotated Sorted Array',
        'Search in Rotated Sorted Array',
        '3Sum',
        'Container With Most Water',
        'Merge Intervals',
        'Insert Interval',
        'Non-overlapping Intervals',
        'Meeting Rooms',
        'Meeting Rooms II',
        'Sort Colors',
        'Rotate Array',
        'Subarray Sum Equals K',
        'Move Zeroes',
        'Majority Element',
    ], 'easy', 35),
    ...makeTasks(21, 'Binary Search', [
        'Binary Search',
        'Search Insert Position',
        'First Bad Version',
        'Sqrt(x)',
        'Search a 2D Matrix',
        'Koko Eating Bananas',
        'Find Peak Element',
        'Search in Rotated Sorted Array II',
        'Find Minimum in Rotated Sorted Array II',
        'Time Based Key-Value Store',
        'Median of Two Sorted Arrays',
        'Capacity To Ship Packages Within D Days',
        'Split Array Largest Sum',
        'Find First and Last Position',
        'Single Element in a Sorted Array',
    ]),
    ...makeTasks(36, 'Strings', [
        'Valid Anagram',
        'Valid Palindrome',
        'Longest Substring Without Repeating Characters',
        'Longest Repeating Character Replacement',
        'Minimum Window Substring',
        'Group Anagrams',
        'Encode and Decode Strings',
        'Valid Parentheses',
        'Longest Palindromic Substring',
        'Palindromic Substrings',
        'String to Integer',
        'Implement strStr',
        'Ransom Note',
        'Isomorphic Strings',
        'Word Pattern',
        'Reverse Words in a String',
        'Zigzag Conversion',
        'Find All Anagrams in a String',
        'Permutation in String',
        'Repeated Substring Pattern',
    ]),
    ...makeTasks(56, 'Linked Lists', [
        'Reverse Linked List',
        'Merge Two Sorted Lists',
        'Linked List Cycle',
        'Reorder List',
        'Remove Nth Node From End of List',
        'Copy List with Random Pointer',
        'Add Two Numbers',
        'Find the Duplicate Number',
        'LRU Cache',
        'Merge K Sorted Lists',
        'Palindrome Linked List',
        'Intersection of Two Linked Lists',
        'Sort List',
        'Partition List',
        'Rotate List',
    ]),
    ...makeTasks(71, 'Stacks and Queues', [
        'Min Stack',
        'Evaluate Reverse Polish Notation',
        'Generate Parentheses',
        'Daily Temperatures',
        'Car Fleet',
        'Largest Rectangle in Histogram',
        'Implement Queue using Stacks',
        'Implement Stack using Queues',
        'Next Greater Element I',
        'Asteroid Collision',
    ]),
    ...makeTasks(81, 'Trees', [
        'Invert Binary Tree',
        'Maximum Depth of Binary Tree',
        'Diameter of Binary Tree',
        'Balanced Binary Tree',
        'Same Tree',
        'Subtree of Another Tree',
        'Lowest Common Ancestor of a BST',
        'Binary Tree Level Order Traversal',
        'Binary Tree Right Side View',
        'Count Good Nodes in Binary Tree',
        'Validate Binary Search Tree',
        'Kth Smallest Element in a BST',
        'Construct Binary Tree from Preorder and Inorder',
        'Binary Tree Maximum Path Sum',
        'Serialize and Deserialize Binary Tree',
        'Path Sum',
        'Path Sum II',
        'Flatten Binary Tree to Linked List',
        'Populating Next Right Pointers',
        'Trie Implementation',
    ]),
    ...makeTasks(101, 'Graphs', [
        'Number of Islands',
        'Clone Graph',
        'Max Area of Island',
        'Pacific Atlantic Water Flow',
        'Surrounded Regions',
        'Rotting Oranges',
        'Walls and Gates',
        'Course Schedule',
        'Course Schedule II',
        'Graph Valid Tree',
        'Number of Connected Components',
        'Redundant Connection',
        'Word Ladder',
        'Alien Dictionary',
        'Network Delay Time',
        'Cheapest Flights Within K Stops',
        'Reconstruct Itinerary',
        'Min Cost to Connect All Points',
        'Accounts Merge',
        'Evaluate Division',
    ]),
    ...makeTasks(121, 'Dynamic Programming', [
        'Climbing Stairs',
        'Min Cost Climbing Stairs',
        'House Robber',
        'House Robber II',
        'Longest Palindromic Substring DP',
        'Palindromic Substrings DP',
        'Decode Ways',
        'Coin Change',
        'Maximum Product Subarray DP',
        'Word Break',
        'Longest Increasing Subsequence',
        'Partition Equal Subset Sum',
        'Unique Paths',
        'Jump Game',
        'Target Sum',
        'Longest Common Subsequence',
        'Best Time to Buy and Sell Stock with Cooldown',
        'Coin Change II',
        'Interleaving String',
        'Edit Distance',
    ]),
    ...makeTasks(141, 'Heaps and Greedy', [
        'Kth Largest Element in an Array',
        'Top K Frequent Elements',
        'Find Median from Data Stream',
        'Task Scheduler',
        'Merge Triplets to Form Target',
        'Partition Labels',
        'Valid Parenthesis String',
        'Gas Station',
        'Hand of Straights',
        'Minimum Number of Arrows to Burst Balloons',
    ]),
];

const DSA_TOPICS = [
    'Arrays fundamentals',
    'Sorting and searching',
    'Binary search patterns',
    'Strings and hashing',
    'Linked lists',
    'Recursion and backtracking',
    'Stacks and queues',
    'Sliding window and two pointers',
    'Greedy algorithms',
    'Binary trees',
    'BST operations',
    'Heaps',
    'Graphs BFS and DFS',
    'Shortest paths',
    'Dynamic programming basics',
];

const DSA_SHEET_TASKS: ProgramTask[] = Array.from({ length: 90 }, (_, index) => {
    const day = index + 1;
    const topic = DSA_TOPICS[index % DSA_TOPICS.length];
    return {
        day,
        topic,
        title: `Striver A2Z Day ${day}: 3 problems - ${topic}`,
        difficulty: day < 31 ? 'easy' : day < 61 ? 'medium' : 'hard',
        estimatedMinutes: 90,
    };
});

const CORE_SUBJECTS = ['DBMS', 'OS', 'CN', 'OOP'];
const CORE_SUBJECT_TASKS: ProgramTask[] = Array.from({ length: 60 }, (_, index) => {
    const day = index + 1;
    const subject = CORE_SUBJECTS[index % CORE_SUBJECTS.length];
    return {
        day,
        topic: subject,
        title: `${subject} revision block - Day ${day}`,
        difficulty: 'medium',
        estimatedMinutes: 60,
    };
});

export const PROGRAM_TEMPLATES: ProgramTemplate[] = [
    {
        type: 'morning_protocol',
        name: 'Morning Protocol',
        description: 'A 30-day launch routine for meditation, planning, movement, and one focused work block.',
        days: 30,
        icon: '🌅',
        difficulty: 'beginner',
        category: 'productivity',
        dailyRequirements: [
            'Morning Meditation',
            'Plan Daily Ops',
            'One Focus Block',
        ],
        dailyRequirementTimes: {
            'Morning Meditation': '06:00',
            'Plan Daily Ops': '06:20',
            'One Focus Block': '07:00',
        },
        totalXpPotential: 3000,
    },
    {
        type: 'hard_75',
        name: '75 Hard',
        description: '75 days of training, diet discipline, hydration, reading, and daily proof.',
        days: 75,
        icon: '🏆',
        difficulty: 'extreme',
        category: 'fitness',
        dailyRequirements: [
            'Complete workout',
            'Hit water target',
            'Read 10 pages',
            'Take progress proof',
        ],
        dailyRequirementTimes: {
            'Complete workout': '18:00',
            'Hit water target': '20:00',
            'Read 10 pages': '21:30',
            'Take progress proof': '22:00',
        },
        totalXpPotential: 7500,
    },
    {
        type: 'hundred_day_challenge',
        name: '100 Day Challenge',
        description: 'One focused build rep every day for 100 days.',
        days: 100,
        icon: '🎯',
        difficulty: 'intermediate',
        category: 'productivity',
        dailyRequirements: [
            'Complete one 100-day challenge rep',
            'Log proof of work',
        ],
        dailyRequirementTimes: {
            'Complete one 100-day challenge rep': '19:00',
            'Log proof of work': '21:00',
        },
        totalXpPotential: 10000,
    },
    {
        type: 'work_daily_checklist',
        name: 'Daily Office Checklist',
        description: 'Ongoing workday structure for priorities, meetings, deadlines, and reporting.',
        days: 3650,
        icon: '🏢',
        difficulty: 'beginner',
        category: 'productivity',
        dailyRequirements: [
            'Set top 3 work priorities',
            'Prepare meeting notes',
            'Send daily report',
        ],
        dailyRequirementTimes: {
            'Set top 3 work priorities': '09:00',
            'Prepare meeting notes': '11:00',
            'Send daily report': '17:30',
        },
        totalXpPotential: 36500,
        isOngoing: true,
    },
    {
        type: 'leetcode_75',
        name: 'LeetCode 75 Hard',
        description: '75 Days of Code. Master 75 most important problems.',
        days: 75,
        icon: '💻',
        difficulty: 'advanced',
        category: 'learning',
        dailyRequirements: [
            'Complete 1 LeetCode problem',
            'Document solution approach',
        ],
        totalXpPotential: 7500,
        phases: [
            { name: 'Fundamentals', startDay: 1, endDay: 20, description: 'Arrays & Strings (Easy)', xpPerDay: 75 },
            { name: 'Data Structures', startDay: 21, endDay: 60, description: 'Linked Lists, Trees, Graphs (Medium)', xpPerDay: 100 },
            { name: 'Optimization', startDay: 61, endDay: 75, description: 'DP & Hard Problems', xpPerDay: 150 },
        ],
    },
    {
        type: 'gym_progress',
        name: 'Gym Protocol',
        description: '90-day physical transformation journey.',
        days: 90,
        icon: '💪',
        difficulty: 'intermediate',
        category: 'fitness',
        dailyRequirements: [
            'Complete assigned workout',
            'Log sets, reps, weights',
            'Rate form quality',
        ],
        totalXpPotential: 9000,
        phases: [
            { name: 'Foundation', startDay: 1, endDay: 30, description: 'PPL Split (4x/week)', xpPerDay: 80 },
            { name: 'Hypertrophy', startDay: 31, endDay: 60, description: 'Upper/Lower (5x/week)', xpPerDay: 100 },
            { name: 'Power', startDay: 61, endDay: 90, description: 'Arnold Split (6x/week)', xpPerDay: 120 },
        ],
    },
    {
        type: 'leetcode_150',
        name: 'LeetCode 150',
        description: '150-day placement track: one interview problem per day in topic order.',
        days: 150,
        icon: '⚡',
        difficulty: 'advanced',
        category: 'learning',
        dailyRequirements: [
            "Complete today's LeetCode 150 problem",
            'Write approach, complexity, and mistake log',
        ],
        totalXpPotential: 15000,
        taskList: LEETCODE_150_TASKS,
        phases: [
            { name: 'Arrays', startDay: 1, endDay: 20, description: 'Arrays 1-20', xpPerDay: 100 },
            { name: 'Binary Search', startDay: 21, endDay: 35, description: 'Binary Search 21-35', xpPerDay: 100 },
            { name: 'Strings', startDay: 36, endDay: 55, description: 'Strings 36-55', xpPerDay: 100 },
            { name: 'Linked Lists', startDay: 56, endDay: 70, description: 'Linked Lists 56-70', xpPerDay: 100 },
            { name: 'Stacks and Queues', startDay: 71, endDay: 80, description: 'Stacks and Queues 71-80', xpPerDay: 100 },
            { name: 'Trees', startDay: 81, endDay: 100, description: 'Trees 81-100', xpPerDay: 120 },
            { name: 'Graphs', startDay: 101, endDay: 120, description: 'Graphs 101-120', xpPerDay: 120 },
            { name: 'Dynamic Programming', startDay: 121, endDay: 140, description: 'DP 121-140', xpPerDay: 140 },
            { name: 'Heaps and Greedy', startDay: 141, endDay: 150, description: 'Heaps and Greedy 141-150', xpPerDay: 140 },
        ],
    },
    {
        type: 'dsa_sheet',
        name: 'DSA Sheet',
        description: '90 days of Striver A2Z practice. Three problems per day across core topics.',
        days: 90,
        icon: '📚',
        difficulty: 'advanced',
        category: 'learning',
        dailyRequirements: [
            "Complete today's 3 Striver A2Z problems",
            'Review one previous mistake before closing',
        ],
        totalXpPotential: 9000,
        taskList: DSA_SHEET_TASKS,
        phases: [
            { name: 'Foundation', startDay: 1, endDay: 30, description: 'Arrays, sorting, binary search, strings', xpPerDay: 90 },
            { name: 'Data Structures', startDay: 31, endDay: 60, description: 'Linked lists, stacks, queues, trees', xpPerDay: 100 },
            { name: 'Advanced Patterns', startDay: 61, endDay: 90, description: 'Graphs, DP, heaps, greedy', xpPerDay: 120 },
        ],
    },
    {
        type: 'core_subjects',
        name: 'Core Subjects',
        description: '60-day placement revision loop rotating DBMS, OS, CN, and OOP daily.',
        days: 60,
        icon: '🎓',
        difficulty: 'intermediate',
        category: 'learning',
        dailyRequirements: [
            "Complete today's 1-hour core subject block",
            'Mark revised, weak, or needs review',
        ],
        totalXpPotential: 6000,
        taskList: CORE_SUBJECT_TASKS,
        phases: [
            { name: 'Concept Pass', startDay: 1, endDay: 20, description: 'DBMS, OS, CN, OOP basics rotation', xpPerDay: 80 },
            { name: 'Interview Pass', startDay: 21, endDay: 40, description: 'Common placement questions and notes', xpPerDay: 100 },
            { name: 'Revision Pass', startDay: 41, endDay: 60, description: 'Weak topics and exam-style recall', xpPerDay: 120 },
        ],
    },
];
