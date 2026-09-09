create policy "users can delete own reports" on reports for delete using (auth.uid() = owner_id);
