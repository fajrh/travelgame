import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ChatPanel from './components/ChatPanel';
import MapView from './components/MapView';
import PlayerPanel from './components/PlayerPanel';
import { LOCATIONS } from './data/locations';
import type { ChatMessage, GameLocation } from './types';

const PLAYER_ID_STORAGE_KEY = 'travelgame-player-id';
const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? '';

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

const CHANGE_DEBOUNCE_MS = 1500;
const SAVE_INTERVAL_MS = 60_000;
const ONLINE_POLL_INTERVAL_MS = 30_000;

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

const App = () => {
  if (LOCATIONS.length === 0) {
    throw new Error('No locations configured for Travel Game.');
  }

  const initialLocation = LOCATIONS[0];

  const [playerName, setPlayerName] = useState('Traveler');
  const [balance, setBalance] = useState(120);
  const [avatar, setAvatar] = useState<string>(AVATAR_OPTIONS[1]);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [onlineCount, setOnlineCount] = useState<number | null>(null);

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

  const handleSelectAvatar = useCallback((value: string) => {
    setAvatar(value.slice(0, 16));
  }, []);

  const visitedLocationIdSet = useMemo(
    () => new Set(visitedLocations.map((location) => location.id)),
    [visitedLocations],
  );

  const visitedLocationIdList = useMemo(
    () => visitedLocations.map((location) => location.id),
    [visitedLocations],
  );

  const saveTimeoutRef = useRef<number | null>(null);

  // Initialize / load or create player id
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedId = window.localStorage.getItem(PLAYER_ID_STORAGE_KEY);
    if (storedId) {
      setPlayerId(storedId);
      return;
    }
    const newId =
      typeof window.crypto !== 'undefined' && typeof window.crypto.randomUUID === 'function'
        ? window.crypto.randomUUID()
        : `player-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(PLAYER_ID_STORAGE_KEY, newId);
    setPlayerId(newId);
  }, []);

  // Load profile from API
  useEffect(() => {
    if (!playerId) return;

    let cancelled = false;

    const loadProfile = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/player?id=${encodeURIComponent(playerId)}`);
        if (!response.ok) {
          setProfileLoaded(true);
          return;
        }
        const data = await response.json();
        if (cancelled || !data || typeof data !== 'object' || data === null) {
          setProfileLoaded(true);
          return;
        }

        const profile = (data as any).profile;
        if (profile && typeof profile === 'object') {
          if (typeof profile.name === 'string' && profile.name.trim().length > 0) {
            setPlayerName(profile.name.slice(0, 40));
          }
          if (typeof profile.balance === 'number' && Number.isFinite(profile.balance)) {
            setBalance(Math.max(0, Math.round(profile.balance)));
          }
          if (typeof profile.avatar === 'string' && profile.avatar.trim().length > 0) {
            setAvatar(profile.avatar.slice(0, 16));
          }

          if (Array.isArray(profile.souvenirs)) {
            setSouvenirs(
              profile.souvenirs
                .map((item: unknown) => String(item))
                .filter((item: string, index: number, array: string[]) => array.indexOf(item) === index),
            );
          }

          let locationToSelect: GameLocation | undefined;
          if (typeof profile.locationId === 'string') {
            locationToSelect = LOCATIONS.find((location) => location.id === profile.locationId);
          }
          if (!locationToSelect) {
            locationToSelect = initialLocation;
          }
          setSelectedLocation(locationToSelect);

          if (Array.isArray(profile.visitedLocationIds)) {
            const mapped = profile.visitedLocationIds
              .map((id: string) => LOCATIONS.find((location) => location.id === id))
              .filter((value: GameLocation | undefined): value is GameLocation => Boolean(value));

            const deduped = mapped.reduce<GameLocation[]>((acc, location) => {
              if (acc.some((item) => item.id === location.id)) return acc;
              return [...acc, location];
            }, []);

            if (!deduped.some((location) => location.id === locationToSelect!.id)) {
              deduped.push(locationToSelect);
            }

            setVisitedLocations(deduped);
          } else {
            setVisitedLocations([locationToSelect]);
          }
        }
      } catch (error) {
        console.warn('Failed to load player profile', error);
      } finally {
        if (!cancelled) setProfileLoaded(true);
      }
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [playerId, initialLocation]);

  const pushProfile = useCallback(async () => {
    if (!playerId) return;

    const payload = {
      id: playerId,
      name: playerName,
      avatar,
      balance,
      locationId: selectedLocation.id,
      visitedLocationIds: visitedLocationIdList,
      souvenirs,
    };

    try {
      await fetch(`${API_BASE}/api/player`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.warn('Failed to persist player profile', error);
    }
  }, [playerId, playerName, avatar, balance, selectedLocation.id, visitedLocationIdList, souvenirs]);

  // Periodic autosave
  useEffect(() => {
    if (!playerId || !profileLoaded) return;

    const handle = window.setInterval(() => {
      void pushProfile();
    }, SAVE_INTERVAL_MS);

    return () => {
      window.clearInterval(handle);
    };
  }, [playerId, profileLoaded, pushProfile]);

  // Debounced save on changes
  useEffect(() => {
    if (!playerId || !profileLoaded) return;

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      saveTimeoutRef.current = null;
      void pushProfile();
    }, CHANGE_DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [playerName, avatar, balance, selectedLocation.id, visitedLocationIdList, souvenirs, playerId, profileLoaded, pushProfile]);

  // Initial push after profile load
  useEffect(() => {
    if (!playerId || !profileLoaded) return;
    void pushProfile();
  }, [playerId, profileLoaded, pushProfile]);

  // Online count polling
  useEffect(() => {
    if (!playerId) return;

    let cancelled = false;

    const fetchOnlineCount = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/players/online`);
        if (!response.ok) throw new Error('Failed to fetch online count');
        const data = await response.json();
        if (!cancelled && data && typeof data.count === 'number') {
          setOnlineCount(data.count);
        }
      } catch {
        if (!cancelled) setOnlineCount(null);
      }
    };

    void fetchOnlineCount();
    const interval = window.setInterval(fetchOnlineCount, ONLINE_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [playerId]);

  const handleSelectLocation = (location: GameLocation) => {
    setSelectedLocation(location);

    const alreadyVisited = visitedLocationIdSet.has(location.id);

    setChatMessages((current) => [
      ...current,
      createMessage('system', `Setting course for ${location.name}.`),
      ...(alreadyVisited
        ? []
        : [createMessage('guide', `Welcome to ${location.name}! Don't miss ${location.cuisine}.`)]),
    ]);

    if (!alreadyVisited) {
      setVisitedLocations((current) => [...current, location]);
      setBalance((value) => value + 50);
      setSouvenirs((current) => {
        const souvenir = location.souvenirs.find((item) => !current.includes(item));
        return souvenir ? [...current, souvenir] : current;
      });
    }
  };

  const handleSendMessage = () => {
    const trimmed = chatDraft.trim();
    if (!trimmed) return;

    setChatMessages((current) => [...current, createMessage('player', trimmed)]);
    setChatDraft('');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__title-group">
          <h1>Travel Game Control Center</h1>
          <p className="app-header__tagline">
            Plan itineraries, chat with your crew, and collect souvenirs without leaving the dashboard.
          </p>
        </div>
        <dl className="app-status" aria-label="Session status">
          <div className="app-status__item">
            <dt className="app-status__label">Current city</dt>
            <dd className="app-status__value">{selectedLocation.name}</dd>
          </div>
          <div className="app-status__item">
            <dt className="app-status__label">Players online</dt>
            <dd className="app-status__value">
              {onlineCount === null ? '—' : onlineCount}
            </dd>
          </div>
          <div className="app-status__item">
            <dt className="app-status__label">Souvenirs</dt>
            <dd className="app-status__value">{souvenirs.length}</dd>
          </div>
        </dl>
      </header>

      <main className="app-layout">
        <PlayerPanel
          playerName={playerName}
          balance={balance}
          avatar={avatar}
          avatarOptions={AVATAR_OPTIONS}
          onlineCount={onlineCount}
          selectedLocation={selectedLocation}
          visitedLocations={visitedLocations}
          souvenirs={souvenirs}
          onRename={setPlayerName}
          onSelectAvatar={handleSelectAvatar}
        />

        <MapView
          locations={LOCATIONS}
          selectedLocationId={selectedLocation.id}
          visitedLocationIds={visitedLocationIdSet}
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
