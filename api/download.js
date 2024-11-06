// api/download.js
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

export default async function handler(req, res) {
    const url = req.query.url;
    const format = req.query.format;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    const downloadDir = '/tmp'; // Gunakan direktori /tmp karena Vercel hanya mendukung /tmp untuk penyimpanan sementara
    const outputTemplate = path.join(downloadDir, '%(title)s.%(ext)s');
    
    const args = format === 'mp3' ? [
        '-f', 'bestaudio',
        '--extract-audio',
        '--audio-format', 'mp3',
        '-o', outputTemplate,
        url
    ] : [
        '-f', 'bestvideo[ext=mp4][height<=720]+bestaudio[ext=m4a]/best[ext=mp4][height<=720]',
        '--merge-output-format', 'mp4',
        '-o', outputTemplate,
        url
    ];

    const ytDlpProcess = spawn('yt-dlp', args);

    ytDlpProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    ytDlpProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    ytDlpProcess.on('close', (code) => {
        console.log(`Child process exited with code ${code}`);
        if (code === 0) {
            // Cari file unduhan di direktori /tmp
            fs.readdir(downloadDir, (err, files) => {
                if (err) {
                    return res.status(500).json({ error: 'Error reading download directory' });
                }

                const downloadedFile = files.find(file => file.endsWith(`.${format}`));
                if (downloadedFile) {
                    const filePath = path.join(downloadDir, downloadedFile);
                    res.setHeader('Content-Disposition', `attachment; filename="${downloadedFile}"`);
                    res.sendFile(filePath, (err) => {
                        if (err) {
                            console.error('Error during download:', err);
                        }
                        // Hapus file setelah diunduh
                        fs.unlinkSync(filePath);
                    });
                } else {
                    res.status(404).json({ error: 'File not found' });
                }
            });
        } else {
            res.status(500).json({ error: 'Error downloading video' });
        }
    });
}
