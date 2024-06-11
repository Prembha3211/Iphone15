import React, { useState } from 'react';
import { Button, Space, message } from 'antd';
import { ReactMediaRecorder } from 'react-media-recorder';
import { AudioOutlined, StopOutlined, ClearOutlined } from '@ant-design/icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const InterviewComponent = () => {
  const [stopStatus, setStopStatus] = useState('');
  const [recording, setRecording] = useState(false);

  const handleRecordClick = (startRecording) => {
    setRecording(true);
    setStopStatus('Recording...');
    toast.success('Recording started');
    startRecording();
  };

  const handleStopClick = (stopRecording) => {
    if (recording) {
      stopRecording();
      setRecording(false);
      setStopStatus('Processing...');
      toast.warn('Recording stopped, processing...');
    } else {
      message.error('No recording in progress');
    }
  };

  const handleClearHistoryClick = async () => {
    try {
      await axios.get('http://localhost:8000/clear');
      toast.info('History cleared');
      setStopStatus('History cleared');
    } catch (error) {
      console.error(error);
      toast.error('Failed to clear history');
    }
  };

  const handleStop = async (blobUrl, blob) => {
    const formData = new FormData();
    formData.append('file', blob, 'interview_audio.wav');

    try {
      const response = await axios.post('http://localhost:8000/talk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'arraybuffer',
      });

      const data = response.data;
      const blobMpeg = new Blob([data], { type: 'audio/mpeg' });
      const audioUrl = window.URL.createObjectURL(blobMpeg);
      const audio = new Audio(audioUrl);
      audio.play();
      setStopStatus('Stopped');
    } catch (error) {
      console.error(error);
      toast.error('Error processing audio');
      setStopStatus('Error');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <ToastContainer />
      <ReactMediaRecorder
        audio
        onStop={handleStop}
        render={({ startRecording, stopRecording }) => (
          <>
            <Space>
              <Button
                type="primary"
                icon={<AudioOutlined />}
                onClick={() => handleRecordClick(startRecording)}
                style={{ backgroundColor: 'green', borderColor: 'green' }}
              >
                Record
              </Button>

              <Button
                type="danger"
                icon={<StopOutlined />}
                onClick={() => handleStopClick(stopRecording)}
                style={{ backgroundColor: 'red', borderColor: 'red' }}
              >
                Stop
              </Button>

              <Button
                type="default"
                icon={<ClearOutlined />}
                onClick={handleClearHistoryClick}
                style={{ backgroundColor: 'blue', borderColor: 'blue' }}
              >
                Clear History
              </Button>
            </Space>

            <p className="mt-4" style={{ color: 'white' }}>
              Status: {stopStatus}
            </p>
          </>
        )}
      />
    </div>
  );
};

export default InterviewComponent;