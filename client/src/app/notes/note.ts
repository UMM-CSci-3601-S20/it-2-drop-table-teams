export interface Note extends NewNote {
  _id: string;
  addDate: Date;
}

/**
 * When we create a new note, not all of the fields exist yet. Some of
 * them are left for the server to fill in.
 */
export interface NewNote {
  doorBoardID: string;
  body: string;
  expireDate: string;
  status: NoteStatus;
}


export type NoteStatus = 'active' | 'template' | 'draft' | 'deleted';
