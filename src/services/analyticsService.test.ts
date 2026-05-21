import { describe, it, expect } from "vitest";
import { analyticsService } from "./analyticsService";
import { Task } from "../types/schema";

const mockTasks: Task[] = [
    {
        id: "1",
        user_id: "user1",
        title: "Coding session",
        category: "coding",
        status: "completed",
        estimated_minutes: 60,
        actual_minutes: 75,
        completed_at: "2023-10-15T14:00:00Z",
        created_at: "2023-10-15T10:00:00Z",
        updated_at: "2023-10-15T14:00:00Z",
        priority: "high",
        has_subtasks: 0,
        completed_subtasks: 0,
        total_subtasks: 0,
        xp_value: 10,
        difficulty_multiplier: 1
    },
    {
        id: "2",
        user_id: "user1",
        title: "Gym workout",
        category: "gym",
        status: "completed",
        estimated_minutes: 45,
        actual_minutes: 40,
        completed_at: "2023-10-16T18:00:00Z",
        created_at: "2023-10-16T10:00:00Z",
        updated_at: "2023-10-16T18:00:00Z",
        priority: "medium",
        has_subtasks: 0,
        completed_subtasks: 0,
        total_subtasks: 0,
        xp_value: 10,
        difficulty_multiplier: 1
    },
    {
        id: "3",
        user_id: "user1",
        title: "Read book",
        category: "personal",
        status: "todo",
        estimated_minutes: 30,
        actual_minutes: 0,
        completed_at: undefined,
        created_at: "2023-10-15T10:00:00Z",
        updated_at: "2023-10-15T10:00:00Z",
        priority: "low",
        has_subtasks: 0,
        completed_subtasks: 0,
        total_subtasks: 0,
        xp_value: 5,
        difficulty_multiplier: 1
    },
    {
        id: "4",
        user_id: "user1",
        title: "More coding",
        category: "coding",
        status: "done",
        estimated_minutes: 30,
        actual_minutes: 30,
        completed_at: "2023-10-15T16:00:00Z",
        created_at: "2023-10-15T15:00:00Z",
        updated_at: "2023-10-15T16:00:00Z",
        priority: "high",
        has_subtasks: 0,
        completed_subtasks: 0,
        total_subtasks: 0,
        xp_value: 10,
        difficulty_multiplier: 1
    },
    {
        id: "5",
        user_id: "user1",
        title: "Task out of range",
        category: "coding",
        status: "completed",
        estimated_minutes: 100,
        actual_minutes: 100,
        completed_at: "2023-11-01T10:00:00Z",
        created_at: "2023-11-01T10:00:00Z",
        updated_at: "2023-11-01T10:00:00Z",
        priority: "high",
        has_subtasks: 0,
        completed_subtasks: 0,
        total_subtasks: 0,
        xp_value: 10,
        difficulty_multiplier: 1
    }
];

describe("analyticsService", () => {
  describe("getTimeBreakdown", () => {
    it("should return empty array when no tasks are provided", async () => {
      const result = await analyticsService.getTimeBreakdown("2023-10-01", "2023-10-31", []);
      expect(result).toEqual([]);
    });

    it("should aggregate minutes by category for completed tasks within date range", async () => {
      const result = await analyticsService.getTimeBreakdown("2023-10-15", "2023-10-20", mockTasks);

      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          { category: "coding", totalMinutes: 105 },
          { category: "gym", totalMinutes: 40 }
        ])
      );
    });

    it("should handle tasks with missing actual_minutes by falling back to estimated_minutes", async () => {
      const fallbackTask: Task = {
        ...mockTasks[0],
        id: "6",
        actual_minutes: undefined,
        estimated_minutes: 50,
        completed_at: "2023-10-15T10:00:00Z",
        category: "writing"
      };

      const result = await analyticsService.getTimeBreakdown("2023-10-10", "2023-10-20", [fallbackTask]);
      expect(result).toEqual([{ category: "writing", totalMinutes: 50 }]);
    });

    it("should gracefully ignore tasks with invalid dates", async () => {
      const invalidDateTask: Task = {
        ...mockTasks[0],
        id: "7",
        completed_at: "not-a-valid-date"
      };

      const result = await analyticsService.getTimeBreakdown("2023-10-10", "2023-10-20", [invalidDateTask]);
      expect(result).toEqual([]);
    });

    it("should gracefully ignore tasks without any date fields", async () => {
      const noDateTask: Task = {
        ...mockTasks[0],
        id: "8",
        completed_at: undefined,
        updated_at: "",
        created_at: ""
      };

      const result = await analyticsService.getTimeBreakdown("2023-10-10", "2023-10-20", [noDateTask]);
      expect(result).toEqual([]);
    });
  });

  describe("getPunctualityStats", () => {
    it("should aggregate estimated and actual times for completed tasks", async () => {
      const result = await analyticsService.getPunctualityStats(mockTasks);

      expect(result).toEqual({ estimated: 235, actual: 245 });
    });

    it("should return zeros for empty task list", async () => {
      const result = await analyticsService.getPunctualityStats([]);
      expect(result).toEqual({ estimated: 0, actual: 0 });
    });
  });
});
