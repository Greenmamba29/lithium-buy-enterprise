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
  const [retryCount, setRetryCount] = useState(0);
  const videoRef = useRef<HTMLDivElement>(null);
  const callFrameRef = useRef<any>(null);
  const MAX_RETRIES = 3;

  useEffect(() => {
    let callFrame: any = null;
    let isMounted = true;

    const initDaily = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Dynamically import Daily.co iframe API
        const DailyIframe = (await import('@daily-co/daily-js')).DailyIframe;
        
        if (!videoRef.current || !isMounted) {
          setError('Video container not found');
          setIsLoading(false);
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
          if (isMounted) {
            setIsLoading(false);
            setError(null);
          }
        });

        callFrame.on('error', (e: any) => {
          if (!isMounted) return;
          
          const errorMsg = e.errorMsg || e.error?.message || 'Video call error';
          console.error('Daily.co error:', errorMsg, e);
          
          // Provide user-friendly error messages
          let friendlyError = 'Failed to connect to video call. ';
          if (errorMsg.includes('network') || errorMsg.includes('timeout')) {
            friendlyError += 'Please check your internet connection.';
          } else if (errorMsg.includes('permission')) {
            friendlyError += 'Please allow camera and microphone permissions.';
          } else if (errorMsg.includes('room') || errorMsg.includes('not found')) {
            friendlyError += 'The meeting room may not exist or has expired.';
          } else {
            friendlyError += 'Please try again.';
          }
          
          setError(friendlyError);
          setIsLoading(false);
        });
        
        callFrame.on('network-quality-change', (e: any) => {
          if (e.quality === 'very-bad' || e.quality === 'bad') {
            console.warn('Poor network quality detected:', e.quality);
          }
        });
        
        callFrame.on('app-message', (e: any) => {
          console.log('App message received:', e.data);
        });

        callFrame.on('participant-left', (e: any) => {
          if (e.participant.local && isMounted) {
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

        if (isMounted) {
          // Set initial video/audio state
          await callFrame.setLocalVideo(isVideoOn);
          await callFrame.setLocalAudio(isAudioOn);
        }
      } catch (err: any) {
        if (!isMounted) return;
        
        console.error('Failed to initialize Daily.co:', err);
        
        let friendlyError = 'Failed to initialize video call. ';
        if (err.message?.includes('permission')) {
          friendlyError += 'Please allow camera and microphone access and try again.';
        } else if (err.message?.includes('network')) {
          friendlyError += 'Please check your internet connection and try again.';
        } else {
          friendlyError += 'Please refresh the page and try again.';
        }
        
        setError(friendlyError);
        setIsLoading(false);
      }
    };

    initDaily();

    return () => {
      isMounted = false;
      if (callFrame) {
        callFrame.destroy().catch(console.error);
      }
    };
  }, [meetingUrl, meetingToken, onLeave]);

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
          <div className="absolute inset-0 flex items-center justify-center text-white z-10 bg-red-900/50 backdrop-blur-sm">
            <div className="text-center max-w-md px-4">
              <p className="text-lg text-red-200 mb-4">{error}</p>
              <div className="flex gap-4 justify-center">
                {retryCount < MAX_RETRIES && (
                  <Button 
                    onClick={async () => {
                      setError(null);
                      setIsLoading(true);
                      setRetryCount(prev => prev + 1);
                      
                      // Clean up existing call frame
                      if (callFrameRef.current) {
                        try {
                          await callFrameRef.current.destroy();
                        } catch (err) {
                          console.error('Error destroying call frame:', err);
                        }
                        callFrameRef.current = null;
                      }
                      
                      // Re-initialize by triggering a re-render
                      // The useEffect will run again when we clear the ref
                      setTimeout(() => {
                        if (videoRef.current) {
                          // Force re-initialization by clearing and re-joining
                          window.location.reload();
                        }
                      }, 500);
                    }}
                    variant="outline"
                    className="bg-white/10 border-white/20 hover:bg-white/20"
                    aria-label="Retry connection"
                  >
                    Retry ({MAX_RETRIES - retryCount} left)
                  </Button>
                )}
                <Button 
                  onClick={handleLeave}
                  variant="destructive"
                >
                  Leave Call
                </Button>
              </div>
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
              disabled={isLoading || !!error}
              aria-label={isVideoOn ? "Turn off video" : "Turn on video"}
              title={isVideoOn ? "Turn off video" : "Turn on video"}
            >
              {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>

            <Button
              variant={isAudioOn ? "default" : "destructive"}
              size="icon"
              onClick={toggleAudio}
              disabled={isLoading || !!error}
              aria-label={isAudioOn ? "Mute microphone" : "Unmute microphone"}
              title={isAudioOn ? "Mute microphone" : "Unmute microphone"}
            >
              {isAudioOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>

            <Button
              variant={isScreenSharing ? "default" : "outline"}
              size="icon"
              onClick={toggleScreenShare}
              disabled={isLoading || !!error}
              aria-label={isScreenSharing ? "Stop screen sharing" : "Start screen sharing"}
              title={isScreenSharing ? "Stop screen sharing" : "Start screen sharing"}
            >
              <Monitor className="h-4 w-4" />
            </Button>

            <Button
              variant="destructive"
              size="icon"
              onClick={handleLeave}
              aria-label="Leave call"
              title="Leave call"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




