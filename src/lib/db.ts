import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';

// Define the custom element for web
if (typeof customElements !== 'undefined') {
  jeepSqlite(window);
}

export const DB_NAME = 'blitzit_db';

class DatabaseService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initializePlugin(): Promise<void> {
    const platform = Capacitor.getPlatform();
    if (platform === 'web') {
      const jeepSqlite = document.createElement('jeep-sqlite');
      document.body.appendChild(jeepSqlite);
      await customElements.whenDefined('jeep-sqlite');
      await this.sqlite.initWebStore();
    }
  }

  async openConnection(): Promise<void> {
    try {
      const ret = await this.sqlite.checkConnectionsConsistency();
      const isConn = (await this.sqlite.isConnection(DB_NAME, false)).result;

      if (ret.result && isConn) {
        this.db = await this.sqlite.retrieveConnection(DB_NAME, false);
      } else {
        this.db = await this.sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);
      }

      await this.db.open();
    } catch (err) {
      console.error('Error opening database connection:', err);
      throw err;
    }
  }

  async closeConnection(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }

  async executeSql(sql: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.execute(sql);
  }

  async runMigrations(schema: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Split schema into individual statements, removing comments and empty lines
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      try {
        await this.db.execute(statement);
      } catch (e) {
        // If it's a "table already exists" error, that's fine
        // console.log('Migration statement skipped or already run');
      }
    }

    // Safety check for new columns in existing tables
    await this.ensureTableColumns();
  }

  private async ensureTableColumns(): Promise<void> {
    try {
      // Columns added in V2.0.0 Phase 2.1
      const taskColumns = [
        { name: 'size', type: 'TEXT DEFAULT "small"' },
        { name: 'quadrant', type: 'TEXT DEFAULT "q4"' },
        { name: 'estimated_minutes', type: 'INTEGER' },
        { name: 'actual_minutes', type: 'INTEGER' },
        { name: 'scheduled_date', type: 'TEXT' },
        { name: 'scheduled_time', type: 'TEXT' },
        { name: 'due_date', type: 'TEXT' },
        { name: 'is_recurring', type: 'INTEGER DEFAULT 0' },
        { name: 'recurrence_pattern', type: 'TEXT' },
        { name: 'notes', type: 'TEXT' },
        { name: 'external_links', type: 'TEXT' },
        { name: 'attachments', type: 'TEXT' },
        { name: 'tags', type: 'TEXT' },
        { name: 'subtasks', type: 'TEXT' }
      ];

      const existingColumns = await this.query('PRAGMA table_info(tasks)');
      const colNames = existingColumns.map(c => c.name);

      for (const col of taskColumns) {
        if (!colNames.includes(col.name)) {
          await this.executeSql(`ALTER TABLE tasks ADD COLUMN ${col.name} ${col.type}`);
          console.log(`Added column ${col.name} to tasks table`);
        }
      }
    } catch (err) {
      console.error('Error during column ensurance migration:', err);
    }
  }

  async query(statement: string, values?: any[]): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    const result = await this.db.query(statement, values);
    return result.values || [];
  }

  async run(statement: string, values?: any[]): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.run(statement, values);
  }

  getDB(): SQLiteDBConnection | null {
    return this.db;
  }
}

export const dbService = new DatabaseService();
