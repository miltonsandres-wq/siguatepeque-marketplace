-- ============================================
-- SQL SCRIPT PARA CREAR BUCKETS DE STORAGE
-- Y APLICAR POLÍTICAS DE ACCESO
-- ============================================

-- 1. Crear los buckets si no existen (haciéndolos públicos)
insert into storage.buckets (id, name, public) 
values 
  ('business-logos', 'business-logos', true),
  ('business-covers', 'business-covers', true),
  ('business-portfolio', 'business-portfolio', true)
on conflict (id) do nothing;

-- 2. Habilitar RLS en objetos (por si no está habilitado)
alter table storage.objects enable row level security;

-- 3. Políticas para Lectura Pública (Cualquiera puede ver las imágenes)
create policy "Public read logos" on storage.objects for select using (bucket_id = 'business-logos');
create policy "Public read covers" on storage.objects for select using (bucket_id = 'business-covers');
create policy "Public read portfolio" on storage.objects for select using (bucket_id = 'business-portfolio');

-- 4. Políticas para Subida (Sólo usuarios registrados pueden subir imágenes)
create policy "Auth upload logos" on storage.objects for insert with check (bucket_id = 'business-logos' and auth.role() = 'authenticated');
create policy "Auth upload covers" on storage.objects for insert with check (bucket_id = 'business-covers' and auth.role() = 'authenticated');
create policy "Auth upload portfolio" on storage.objects for insert with check (bucket_id = 'business-portfolio' and auth.role() = 'authenticated');

-- 5. Políticas para Actualización de Archivos
create policy "Auth update logos" on storage.objects for update using (bucket_id = 'business-logos' and auth.role() = 'authenticated');
create policy "Auth update covers" on storage.objects for update using (bucket_id = 'business-covers' and auth.role() = 'authenticated');
create policy "Auth update portfolio" on storage.objects for update using (bucket_id = 'business-portfolio' and auth.role() = 'authenticated');

-- 6. Políticas para Eliminación de Archivos
create policy "Auth delete portfolio" on storage.objects for delete using (bucket_id = 'business-portfolio' and auth.role() = 'authenticated');
