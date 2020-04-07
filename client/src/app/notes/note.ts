export interface Note {
  _id: string;
  ownerID: string;
  body: string;
  addDate: string;
  expireDate: string;
  status: NoteStatus;
}

/**
 * When we create a new note, not all of the fields exist yet. Some of
 * them are left for the server to fill in.
 */
export interface NewNote {
  ownerID: string;
  body: string;
  addDate: string;
  expireDate: string;
  status: NoteStatus;
}


export type NoteStatus = 'active' | 'template' | 'draft' | 'deleted';
