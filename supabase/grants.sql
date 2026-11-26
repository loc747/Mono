grant usage on schema public to anon, authenticated;
grant select on public.studies, public.archive_items, public.submissions to anon;
grant insert on public.inquiries to anon;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.studies, public.archive_items,
  public.submissions, public.inquiries to authenticdated;
grant execute on function public.is_admin() to anon, authenticated;
