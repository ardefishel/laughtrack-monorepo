import { appSchema, tableSchema } from '@nozbe/watermelondb/Schema';

export const schema = appSchema({
  version: 6,
  tables: [
    tableSchema({
      name: 'jokes',
      columns: [
        { name: 'content_html', type: 'string', isIndexed: false },
        { name: 'content_text', type: 'string', isIndexed: false },
        { name: 'status', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number', isIndexed: false },
        { name: 'updated_at', type: 'number', isIndexed: false },
        { name: 'draft_updated_at', type: 'number', isIndexed: false },
        { name: 'tags', type: 'string', isIndexed: false },
      ],
    }),
    tableSchema({
      name: 'audio_recordings',
      columns: [
        { name: 'joke_id', type: 'string', isIndexed: true },
        { name: 'file_path', type: 'string' },
        { name: 'duration', type: 'number' },
        { name: 'size', type: 'number' },
        { name: 'description', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'remote_url', type: 'string', isOptional: true },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
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
    tableSchema({
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
});
