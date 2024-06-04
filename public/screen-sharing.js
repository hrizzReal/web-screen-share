document.getElementById('startButton').addEventListener('click', async () => {
  try {
    const sessionId = Math.random().toString(36).substr(2, 9);
    document.getElementById('sessionId').textContent = `Session ID: ${sessionId}`;

    // Capture the screen
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const videoElement = document.getElementById('screenVideo');
    videoElement.srcObject = screenStream;

    // Set up WebSocket connection
    const ws = new WebSocket(`ws://localhost:3000/?sessionId=${sessionId}`);

    ws.onopen = () => {
      console.log('WebSocket connection opened');
      const mediaRecorder = new MediaRecorder(screenStream, { mimeType: 'video/webm; codecs=vp8' });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('Sending data to WebSocket');
          ws.send(event.data);
        }
      };

      mediaRecorder.start(100); // Send data in chunks of 100ms
    };

    ws.onerror = (error) => {
      console.error('WebSocket error: ', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
  } catch (err) {
    console.error('Error: ' + err);
  }
});
