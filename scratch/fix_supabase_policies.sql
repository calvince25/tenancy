-- Allow anyone to upload images to the 'properties' bucket
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'properties' );

-- Allow anyone to read images from the 'properties' bucket
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
USING ( bucket_id = 'properties' );

-- Allow anyone to update their own images (optional but helpful)
CREATE POLICY "Allow public updates"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'properties' );
