async function downloadVideo() {
    const videoUrl = document.getElementById('videoUrl').value;
    const thumbnailElement = document.getElementById('thumbnail');
    const titleElement = document.getElementById('videoTitle');
    const mp3 = document.getElementById('mp-3');
    const mp4 = document.getElementById('mp-4');

    if (videoUrl) {
        thumbnailElement.style.display = 'block';
        titleElement.style.display = 'block';
        mp3.style.display = 'flex';
        mp4.style.display = 'flex';

        const videoIdMatch = videoUrl.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&?\/]+)/);
        if (videoIdMatch && videoIdMatch[1]) {
            const videoId = videoIdMatch[1];
            const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

            thumbnailElement.src = thumbnailUrl;
            thumbnailElement.alt = 'Thumbnail Video YouTube';

            const apiKey = 'AIzaSyAucAbUrXkDmfy5jMgN63sAtYot6oeWvKw';
            const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`;

            try {
                const response = await fetch(apiUrl);
                const data = await response.json();
                if (data.items.length > 0) {
                    const videoTitle = data.items[0].snippet.title;
                    titleElement.textContent = `${videoTitle}`;
                } else {
                    titleElement.textContent = 'Judul tidak ditemukan';
                }
            } catch (error) {
                console.error('Error fetching video data:', error);
                alert('Terjadi kesalahan saat mengambil data video');
            }
        } else {
            alert('URL YouTube tidak valid');
        }
    } else {
        alert('Silakan masukkan URL video YouTube');
    }
}


function download(format) {
    const videoUrl = document.getElementById('videoUrl').value;

    if (!videoUrl) {
        alert('Harap masukkan URL video YouTube.');
        return;
    }

    const apiUrl = `http://localhost:3000/download?url=${encodeURIComponent(videoUrl)}&format=${format}`;
    window.location.href = apiUrl; // Memulai unduhan
}

