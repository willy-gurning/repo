export default async function handler(req, res) {
    const url = req.query.url;
    const format = req.query.format;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // Panggil API YTMP3 untuk mendapatkan URL unduhan
        const response = await fetch(`https://ytmp3.cc/api?url=${encodeURIComponent(url)}&format=${format}`);
        const data = await response.json();

        if (data.success && data.download_url) {
            // Kirim URL unduhan ke klien
            res.status(200).json({ download_url: data.download_url });
        } else {
            res.status(500).json({ error: 'Error processing video or unsupported format' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error connecting to YTMP3 API' });
    }
}
