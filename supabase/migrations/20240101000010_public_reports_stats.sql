-- Public statistics function for Reports Filed section
-- Returns total reports and top 3 contributors
-- Accessible to both anonymous and authenticated users

create or replace function public.get_public_reports_stats()
returns json as $$
begin
  return json_build_object(
    'totalReports', coalesce((select count(*) from public.complaints), 0),
    'topContributors', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json) from (
        select 
          p.full_name, 
          count(c.id) as report_count
        from public.complaints c
        join public.profiles p on c.user_id = p.id
        group by p.id, p.full_name
        order by report_count desc, p.full_name asc
        limit 3
      ) t
    )
  );
end;
$$ language plpgsql security definer;

grant execute on function public.get_public_reports_stats() to anon;
grant execute on function public.get_public_reports_stats() to authenticated;
