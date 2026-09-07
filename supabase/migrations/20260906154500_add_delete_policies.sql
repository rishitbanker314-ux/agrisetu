CREATE POLICY "Users can delete their own field notes"
ON field_notes FOR DELETE
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own fields"
ON fields FOR DELETE
USING (auth.uid() = owner_id);
