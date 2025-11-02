import { useEffect, useState } from "react";
import { Button } from "../components/Button";

interface PublicRoom {
  id: string;
  room_code: string;
  room_name: string;
  created_at: string;
  status: string;
}

interface WaitingRoomProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinRoom: (roomCode: string) => void;
}

export function WaitingRoom({ isOpen, onClose, onJoinRoom }: WaitingRoomProps) {
  const [rooms, setRooms] = useState<PublicRoom[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;

    const fetchRooms = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/webrtc/list-rooms");

        if (!response.ok) {
          throw new Error("Failed to fetch rooms");
        }

        const data = await response.json();
        setRooms(data.rooms || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load rooms. Please try again.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();

    // Refresh room list every 5 seconds
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    return `${diffHours} hours ago`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Join a Public Room
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded">
            {error}
          </div>
        )}

        {isLoading && rooms.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <div className="animate-pulse flex justify-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full" />
              <div className="w-3 h-3 bg-blue-600 rounded-full" />
              <div className="w-3 h-3 bg-blue-600 rounded-full" />
            </div>
            Loading rooms...
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎮</div>
            <p className="text-gray-600 text-lg mb-2">
              No public rooms available
            </p>
            <p className="text-gray-500 text-sm">
              Create a public room or check back later!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {room.room_name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                        {room.room_code}
                      </span>
                      <span>•</span>
                      <span>{formatTime(room.created_at)}</span>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => onJoinRoom(room.room_code)}
                    className="ml-4"
                  >
                    Join
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
