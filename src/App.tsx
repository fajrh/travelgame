import { useMemo, useState } from 'react';
import ChatPanel from './components/ChatPanel';
import MapView from './components/MapView';
import PlayerPanel from './components/PlayerPanel';
import { LOCATIONS } from './data/locations';
import type { ChatMessage, GameLocation } from './types';

const formatTimestamp = (date: Date) =>
  new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

const createMessage = (author: ChatMessage['author'], text: string): ChatMessage => ({
  id: `${author}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  author,
  text,
  timestamp: formatTimestamp(new Date()),
});

const AVATAR_OPTIONS = [
  '🧭',
  '🛫',
  '🌍',
  '🗺️',
  '🛳️',
  '🚀',
  '🏝️',
  '🛶',
  '🏕️',
  '🏜️',
  '🏔️',
  '🕌',
  '🕍',
  '🎡',
  '🎢',
  '🛤️',
] as const;

const App = () => {
  if (LOCATIONS.length === 0) {
    throw new Error('No locations configured for Travel Game.');
  }

  const initialLocation = LOCATIONS[0];

  const [playerName, setPlayerName] = useState('Traveler');
  const [score, setScore] = useState(120);
  const [avatar, setAvatar] = useState<string>(AVATAR_OPTIONS[1]);
  const [selectedLocation, setSelectedLocation] = useState<GameLocation>(initialLocation);
  const [visitedLocations, setVisitedLocations] = useState<GameLocation[]>([initialLocation]);
  const [souvenirs, setSouvenirs] = useState<string[]>(() => {
    const firstSouvenir = initialLocation.souvenirs[0];
    return firstSouvenir ? [firstSouvenir] : [];
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => [
    createMessage('guide', 'Welcome aboard! Pick a city to plan your next adventure.'),
  ]);
  const [chatDraft, setChatDraft] = useState('');

  const visitedLocationIds = useMemo(
    () => new Set(visitedLocations.map((location) => location.id)),
    [visitedLocations],
  );

  const handleSelectLocation = (location: GameLocation) => {
    setSelectedLocation(location);

    const alreadyVisited = visitedLocationIds.has(location.id);

    setChatMessages((current) => [
      ...current,
      createMessage('system', `Setting course for ${location.name}.`),
      ...(alreadyVisited
        ? []
        : [createMessage('guide', `Welcome to ${location.name}! Don't miss ${location.cuisine}.`)]),
    ]);

    if (!alreadyVisited) {
      setVisitedLocations((current) => [...current, location]);
      setScore((value) => value + 50);
      setSouvenirs((current) => {
        const souvenir = location.souvenirs.find((item) => !current.includes(item));
        if (!souvenir) {
          return current;
        }
        return [...current, souvenir];
      });
    }
  };

  const handleSendMessage = () => {
    const trimmed = chatDraft.trim();
    if (!trimmed) {
      return;
    }

    setChatMessages((current) => [...current, createMessage('player', trimmed)]);
    setChatDraft('');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Travel Game Control Center</h1>
        <p className="app-header__tagline">
          Plan itineraries, chat with your crew, and collect souvenirs without leaving the dashboard.
        </p>
      </header>
      <main className="app-layout">
        <PlayerPanel
          playerName={playerName}
          score={score}
          avatar={avatar}
          avatarOptions={AVATAR_OPTIONS}
          selectedLocation={selectedLocation}
          visitedLocations={visitedLocations}
          souvenirs={souvenirs}
          onRename={setPlayerName}
          onSelectAvatar={setAvatar}
        />
        <MapView
          locations={LOCATIONS}
          selectedLocationId={selectedLocation.id}
          visitedLocationIds={visitedLocationIds}
          onSelectLocation={handleSelectLocation}
        />
        <ChatPanel
          messages={chatMessages}
          draft={chatDraft}
          onChangeDraft={setChatDraft}
          onSendMessage={handleSendMessage}
        />
      </main>
    </div>
  );
};

export default App;
