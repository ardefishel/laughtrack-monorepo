import { schemaMigrations, addColumns, createTable } from '@nozbe/watermelondb/Schema/migrations';

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [],
    },
    {
      toVersion: 3,
      steps: [
        addColumns({
          table: 'jokes',
          columns: [
            { name: 'content_text', type: 'string', isIndexed: false },
          ],
        }),
        addColumns({
          table: 'jokes',
          columns: [
            { name: 'draft_updated_at', type: 'number', isIndexed: false },
          ],
        }),
      ],
    },
    {
      toVersion: 4,
      steps: [
        createTable({
          name: 'audio_recordings',
          columns: [
            { name: 'joke_id', type: 'string', isIndexed: true },
            { name: 'file_path', type: 'string' },
            { name: 'duration', type: 'number' },
            { name: 'size', type: 'number' },
            { name: 'description', type: 'string' },
            { name: 'created_at', type: 'number' },
          ],
        }),
      ],
    },
    {
      toVersion: 5,
      steps: [
        createTable({
          name: 'joke_sets',
          columns: [
            { name: 'title', type: 'string', isIndexed: true },
            { name: 'description', type: 'string', isIndexed: false },
            { name: 'duration', type: 'number', isIndexed: false },
            { name: 'place', type: 'string', isIndexed: true },
            { name: 'status', type: 'string', isIndexed: true },
            { name: 'created_at', type: 'number', isIndexed: false },
            { name: 'updated_at', type: 'number', isIndexed: false },
          ],
        }),
        createTable({
          name: 'joke_set_items',
          columns: [
            { name: 'set_id', type: 'string', isIndexed: true },
            { name: 'item_type', type: 'string', isIndexed: true },
            { name: 'joke_id', type: 'string', isIndexed: true },
            { name: 'content', type: 'string', isIndexed: false },
            { name: 'position', type: 'number', isIndexed: true },
            { name: 'created_at', type: 'number', isIndexed: false },
            { name: 'updated_at', type: 'number', isIndexed: false },
          ],
        }),
      ],
    },
    {
      toVersion: 6,
      steps: [
        addColumns({
          table: 'audio_recordings',
          columns: [
            { name: 'remote_url', type: 'string', isOptional: true },
            { name: 'updated_at', type: 'number' },
          ],
        }),
      ],
    },
  ],
});
