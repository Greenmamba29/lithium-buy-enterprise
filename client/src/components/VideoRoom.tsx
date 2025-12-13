import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Video, VideoOff, Mic, MicOff, Monitor, X, Loader2 } from 'lucide-react';

interface VideoRoomProps {
  meetingUrl: string;
  meetingToken?: string;
  onLeave: () => void;
}

export function VideoRoom({ meetingUrl, meetingToken, onLeave }: VideoRoomProps) {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const callFrameRef = useRef<any>(null);

  useEffect(() => {
    let callFrame: any = null;

    const initDaily = async () => {
      try {
        // Dynamically import Daily.co iframe API
        const { DailyIframe } = await import('@daily-co/daily-js');
        
        if (!videoRef.current) {
          setError('Video container not found');
          return;
        }

        // Create Daily.co call frame
        callFrame = DailyIframe.createFrame(videoRef.current, {
          showLeaveButton: false,
          iframeStyle: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            border: '0',
          },
        });

        callFrameRef.current = callFrame;

        // Set up event listeners
        callFrame.on('loaded', () => {
          setIsLoading(false);
          setError(null);
        });

        callFrame.on('error', (e: any) => {
          setError(e.errorMsg || 'Video call error');
          setIsLoading(false);
        });

        callFrame.on('participant-left', (e: any) => {
          if (e.participant.local) {
            onLeave();
          }
        });

        // Join the call
        const joinConfig: any = {
          url: meetingUrl,
        };

        if (meetingToken) {
          joinConfig.token = meetingToken;
        }

        await callFrame.join(joinConfig);

        // Set initial video/audio state
        await callFrame.setLocalVideo(isVideoOn);
        await callFrame.setLocalAudio(isAudioOn);
      } catch (err) {
        console.error('Failed to initialize Daily.co:', err);
        setError('Failed to initialize video call');
        setIsLoading(false);
      }
    };

    initDaily();

    return () => {
      if (callFrame) {
        callFrame.destroy().catch(console.error);
      }
    };
  }, [meetingUrl, meetingToken, onLeave, isVideoOn, isAudioOn]);

  const toggleVideo = async () => {
    if (callFrameRef.current) {
      const newState = !isVideoOn;
      await callFrameRef.current.setLocalVideo(newState);
      setIsVideoOn(newState);
    }
  };

  const toggleAudio = async () => {
    if (callFrameRef.current) {
      const newState = !isAudioOn;
      await callFrameRef.current.setLocalAudio(newState);
      setIsAudioOn(newState);
    }
  };

  const toggleScreenShare = async () => {
    if (callFrameRef.current) {
      try {
        if (isScreenSharing) {
          await callFrameRef.current.stopScreenShare();
        } else {
          await callFrameRef.current.startScreenShare();
        }
        setIsScreenSharing(!isScreenSharing);
      } catch (err) {
        console.error('Screen share error:', err);
      }
    }
  };

  const handleLeave = async () => {
    if (callFrameRef.current) {
      await callFrameRef.current.leave();
    }
    onLeave();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div ref={videoRef} className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-white z-10">
            <div className="text-center">
              <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin" />
              <p className="text-lg">Connecting to video call...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-white z-10 bg-red-900/50">
            <div className="text-center">
              <p className="text-lg text-red-200">{error}</p>
              <Button onClick={handleLeave} className="mt-4">
                Leave Call
              </Button>
            </div>
          </div>
        )}
      </div>

      <Card className="m-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={isVideoOn ? "default" : "destructive"}
              size="icon"
              onClick={toggleVideo}
              disabled={isLoading}
            >
              {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>

            <Button
              variant={isAudioOn ? "default" : "destructive"}
              size="icon"
              onClick={toggleAudio}
              disabled={isLoading}
            >
              {isAudioOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>

            <Button
              variant={isScreenSharing ? "default" : "outline"}
              size="icon"
              onClick={toggleScreenShare}
              disabled={isLoading}
            >
              <Monitor className="h-4 w-4" />
            </Button>

            <Button
              variant="destructive"
              size="icon"
              onClick={handleLeave}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




