document.getElementById('generateBtn').addEventListener('click', async () => {
  const text = document.getElementById('textInput').value;

  if (!text) {
    alert("Please enter some text.");
    return;
  }

  const audioBlob = await textToSpeech(text);
  const videoBlob = await generateVideo(audioBlob);
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(videoBlob);
  downloadLink.download = 'generated-video.mp4';
  downloadLink.innerText = 'Download Video';
  document.getElementById('output').innerHTML = '';
  document.getElementById('output').appendChild(downloadLink);
});

async function textToSpeech(text) {
  try {
    const audio = new Audio();
    const audioBlob = await fetchTTS(text);
    audio.src = URL.createObjectURL(audioBlob);
    audio.play();

    return audioBlob;
  } catch (error) {
    console.error('Error generating audio:', error);
  }
}

async function fetchTTS(text) {
  // Simulating TTS by returning a default mp3 file or real API integration.
  const response = await fetch('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
  return await response.blob();
}

async function generateVideo(audioBlob) {
  const videoBlob = await new Promise((resolve, reject) => {
    const ffmpeg = FFmpeg.createFFmpeg({ log: true });

    ffmpeg.load().then(() => {
      // Create a dummy video (you can replace this with actual content)
      ffmpeg.FS('writeFile', 'input.mp3', new Uint8Array(await audioBlob.arrayBuffer()));
      ffmpeg.FS('writeFile', 'input_image.png', new Uint8Array(await loadImage('image.png')));

      ffmpeg.run('-framerate', '1', '-i', 'input_image.png', '-i', 'input.mp3', '-c:v', 'libx264', '-t', '30', 'output.mp4')
        .then(() => {
          const videoData = ffmpeg.FS('readFile', 'output.mp4');
          const videoBlob = new Blob([videoData.buffer], { type: 'video/mp4' });
          resolve(videoBlob);
        })
        .catch(err => reject(err));
    });
  });

  return videoBlob;
}

async function loadImage(url) {
  const response = await fetch(url);
  return await response.arrayBuffer();
}
