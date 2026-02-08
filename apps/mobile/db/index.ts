import { Platform } from 'react-native';
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { schema } from './schema';
import { migrations } from './migrations';
import { Joke } from '../models/Joke';
import { AudioRecording } from '../models/AudioRecording';
import { JokeSet } from '../models/JokeSet';
import { JokeSetItem } from '../models/JokeSetItem';
import { dbLogger } from '@/lib/loggers';

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: Platform.OS === 'ios',
  onSetUpError: (error) => {
    dbLogger.error('[WatermelonDB] Database setup failed:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [Joke, AudioRecording, JokeSet, JokeSetItem],
});

dbLogger.info('[WatermelonDB] Database initialized successfully');
