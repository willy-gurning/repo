const express = require('express');
const cors = require('cors'); // Impor cors
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.static('public'));

app.get('/download', (req, res) => {
    const url = req.query.url;
    const format = req.query.format;

    if (!url) {
        return res.status(400).send('URL is required');
    }

    const downloadDir = path.join(__dirname, 'Downloads');
    if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir);
    }

    const outputTemplate = path.join(downloadDir, '%(title)s.%(ext)s');
    const args = format === 'mp3' ? [
        '-f', 'bestaudio',
        '--extract-audio',
        '--audio-format', 'mp3',
        '--no-continue',
        '-o', outputTemplate,
        url
    ] : [
        '-f', 'bestvideo[ext=mp4][height<=720]+bestaudio[ext=m4a]/best[ext=mp4][height<=720]',
        '--merge-output-format', 'mp4',
        '--no-continue',
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
            // Cari file di direktori Downloads
            fs.readdir(downloadDir, (err, files) => {
                if (err) {
                    return res.status(500).send('Error reading download directory');
                }

                // Cari file berdasarkan format yang diunduh
                const downloadedFile = files.find(file => file.endsWith(`.${format}`));
                if (downloadedFile) {
                    const filePath = path.join(downloadDir, downloadedFile);
                    res.download(filePath, (err) => {
                        if (err) {
                            console.error('Error during download:', err);
                        }
                        // Hapus file setelah diunduh
                        fs.unlinkSync(filePath);
                    });
                } else {
                    res.status(404).send('File not found');
                }
            });
        } else {
            res.status(500).send('Error downloading video');
        }
    });
});

app.listen(port, (err) => {
    if (err) {
        console.error('Failed to start server:', err);
    } else {
        console.log(`Server running on port ${port}`);
    }
});
