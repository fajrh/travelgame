import type { GameLocation } from '../types';

type PlayerPanelProps = {
  playerName: string;
  balance: number;
  avatar: string;
  avatarOptions: readonly string[];
  onlineCount: number | null;
  selectedLocation: GameLocation;
  visitedLocations: GameLocation[];
  souvenirs: string[];
  onRename: (value: string) => void;
  onSelectAvatar: (value: string) => void;
};

const PlayerPanel = ({
  playerName,
  balance,
  avatar,
  avatarOptions,
  onlineCount,
  selectedLocation,
  visitedLocations,
  souvenirs,
  onRename,
  onSelectAvatar,
}: PlayerPanelProps) => (
  <aside className="panel player-panel" aria-label="Player profile">
    <header className="panel-header">
      <h2>Travel Log</h2>
      <p>Keep track of your journey, rename your traveler, and browse collected souvenirs.</p>
    </header>

    <div className="player-card">
      <div className="player-card__avatar" aria-hidden>
        {avatar}
      </div>
      <div className="player-card__details">
        <label className="player-card__label" htmlFor="player-name">
          Traveler name
        </label>
        <input
          id="player-name"
          className="player-card__input"
          value={playerName}
          onChange={(event) => onRename(event.target.value)}
          maxLength={32}
        />
        <p className="player-card__balance">
          Funds{' '}
          <span className="player-card__balance-value">
            {new Intl.NumberFormat(undefined, {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0,
            }).format(balance)}
          </span>
          <span className="player-card__online" aria-live="polite">
            {onlineCount === null ? ' syncing…' : ` · ${onlineCount} online`}
          </span>
        </p>
      </div>
    </div>

    <section className="player-section" aria-label="Avatar selection">
      <h3>Choose your avatar</h3>
      <p className="player-section__hint">Pick an emoji to represent you on the map.</p>
      <div className="avatar-grid" role="list">
        {avatarOptions.map((option) => {
          const isSelected = option === avatar;
          return (
            <button
              key={option}
              type="button"
              role="listitem"
              className={`avatar-grid__button${isSelected ? ' is-selected' : ''}`}
              onClick={() => onSelectAvatar(option)}
              aria-pressed={isSelected}
              title={`Select ${option} as your avatar`}
            >
              <span aria-hidden>{option}</span>
              <span className="sr-only">{`Avatar ${option}${isSelected ? ' selected' : ''}`}</span>
            </button>
          );
        })}
      </div>
    </section>

    <section className="player-section">
      <h3>Currently exploring</h3>
      <p>
        <strong>{selectedLocation.name}</strong> · {selectedLocation.country}
      </p>
      <p className="player-section__description">{selectedLocation.description}</p>
      <p className="player-section__cuisine">🍽 {selectedLocation.cuisine}</p>
    </section>

    <section className="player-section">
      <h3>Visited cities</h3>
      <ul className="player-section__list">
        {visitedLocations.map((location) => (
          <li key={location.id}>{location.name}</li>
        ))}
      </ul>
    </section>

    <section className="player-section">
      <h3>Souvenir shelf</h3>
      {souvenirs.length === 0 ? (
        <p className="player-section__empty">Collect souvenirs by exploring new places.</p>
      ) : (
        <ul className="player-section__list player-section__list--souvenirs">
          {souvenirs.map((souvenir) => (
            <li key={souvenir}>{souvenir}</li>
          ))}
        </ul>
      )}
    </section>
  </aside>
);

export default PlayerPanel;
