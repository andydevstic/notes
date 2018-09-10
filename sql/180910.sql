ALTER TABLE tbl_keys 
  ADD CONSTRAINT tbl_keys_note_id_fkey
  FOREIGN KEY (note_id)
  REFERENCES tbl_notes(id)
  ON DELETE CASCADE
