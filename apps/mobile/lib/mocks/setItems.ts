export interface SetJokeItem {
  id: string;
  type: 'joke' | 'note' | 'add-button';
  jokeId?: string;
  title?: string;
  content?: string;
  description?: string;
  status?: 'draft' | 'published' | 'archived';
}

export const MOCK_SET_ITEMS: SetJokeItem[] = [
  { id: '1', type: 'joke', title: 'Opening Joke', description: 'Why did the developer go broke? Because he used up all his cache!', status: 'published' },
  { id: 'note-1', type: 'note', title: 'Transition to second joke', content: 'Build up the tension before revealing the punchline. Pause for effect.' },
  { id: '2', type: 'joke', title: 'The Setup', description: 'I told my wife she was drawing her eyebrows too high.', status: 'draft' },
  { id: '3', type: 'joke', title: 'Callback', description: 'Why do programmers prefer dark mode?', status: 'published' },
  { id: 'note-2', type: 'note', title: 'Crowd work here', content: 'Ask the audience about their programming experiences for organic engagement.' },
  { id: '4', type: 'joke', title: 'Closer', description: 'I would tell you a UDP joke, but you might not get it.', status: 'draft' }
];
