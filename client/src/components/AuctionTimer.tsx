import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AuctionTimerProps {
  endTime: string;
  startTime?: string;
  status: string;
}

export function AuctionTimer({ endTime, startTime, status }: AuctionTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isLive: boolean;
  } | null>(null);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const start = startTime ? new Date(startTime).getTime() : null;

      if (status === "ended") {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isLive: false,
        });
        return;
      }

      if (start && now < start) {
        // Auction hasn't started yet
        const diff = start - now;
        setTimeRemaining({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
          isLive: false,
        });
        return;
      }

      if (now >= end) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isLive: false,
        });
        return;
      }

      // Auction is live
      const diff = end - now;
      setTimeRemaining({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        isLive: true,
      });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [endTime, startTime, status]);

  if (!timeRemaining) {
    return null;
  }

  if (timeRemaining.days === 0 && timeRemaining.hours === 0 && timeRemaining.minutes === 0 && timeRemaining.seconds === 0) {
    return (
      <Badge variant="destructive" className="w-fit">
        Ended
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-muted-foreground" />
      {timeRemaining.isLive ? (
        <Badge variant="default" className="bg-green-500">
          Live
        </Badge>
      ) : (
        <Badge variant="outline">Starting Soon</Badge>
      )}
      <span className="text-sm font-mono">
        {timeRemaining.days > 0 && `${timeRemaining.days}d `}
        {String(timeRemaining.hours).padStart(2, "0")}:
        {String(timeRemaining.minutes).padStart(2, "0")}:
        {String(timeRemaining.seconds).padStart(2, "0")}
      </span>
    </div>
  );
}


