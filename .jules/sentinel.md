## 2025-05-24 - [Fix Hardcoded Encryption Key]
**Vulnerability:** A hardcoded symmetric encryption key (`HABIT_TRACKER_SECURE_BACKUP_KEY`) was used for at-rest data encryption (backups).
**Learning:** Removing a hardcoded encryption key used for data-at-rest requires retaining the legacy key as a fallback to prevent catastrophic data loss for existing users.
**Prevention:** Future key migrations must ensure backward compatibility by implementing sequential key fallback attempts.
