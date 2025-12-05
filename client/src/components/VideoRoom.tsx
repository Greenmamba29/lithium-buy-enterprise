import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Video, VideoOff, Mic, MicOff, Monitor, X } from 'lucide-react';

interface VideoRoomProps {
  meetingUrl: string;
  meetingToken?: string;
  onLeave: () => void;
}

export function VideoRoom({ meetingUrl, meetingToken, onLeave }: VideoRoomProps) {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Daily.co video call
    // This is a placeholder - actual implementation would use Daily.co React hooks
    // import { useDaily, useParticipant } from '@daily-co/react';
    
    return () => {
      // Cleanup
    };
  }, [meetingUrl, meetingToken]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div ref={videoRef} className="flex-1 relative">
        {/* Video container - Daily.co would render here */}
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center">
            <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Video call will appear here</p>
            <p className="text-sm opacity-75 mt-2">
              Daily.co integration required
            </p>
          </div>
        </div>
      </div>

      <Card className="m-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={isVideoOn ? "default" : "destructive"}
              size="icon"
              onClick={() => setIsVideoOn(!isVideoOn)}
            >
              {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>

            <Button
              variant={isAudioOn ? "default" : "destructive"}
              size="icon"
              onClick={() => setIsAudioOn(!isAudioOn)}
            >
              {isAudioOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>

            <Button
              variant={isScreenSharing ? "default" : "outline"}
              size="icon"
              onClick={() => setIsScreenSharing(!isScreenSharing)}
            >
              <Monitor className="h-4 w-4" />
            </Button>

            <Button
              variant="destructive"
              size="icon"
              onClick={onLeave}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



