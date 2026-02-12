export interface AudioRecording {
  id: string;
  joke_id?: string;
  file_path: string;
  duration: number;
  size: number;
  description?: string;
  remote_url?: string | null;
  created_at: number;
  updated_at: number;
}

export interface RawAudioRecording {
  id: string;
  joke_id?: string;
  file_path: string;
  duration: number;
  size: number;
  description?: string;
  remote_url?: string | null;
  created_at: number;
  updated_at: number;
}
