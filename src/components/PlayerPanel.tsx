import type { GameLocation } from '../types';

type PlayerPanelProps = {
  playerName: string;
  score: number;
  selectedLocation: GameLocation;
  visitedLocations: GameLocation[];
  souvenirs: string[];
  onRename: (value: string) => void;
};

const PlayerPanel = ({
  playerName,
  score,
  selectedLocation,
  visitedLocations,
  souvenirs,
  onRename,
}: PlayerPanelProps) => (
  <aside className="panel player-panel" aria-label="Player profile">
    <header className="panel-header">
      <h2>Travel Log</h2>
      <p>Keep track of your journey, rename your traveler, and browse collected souvenirs.</p>
    </header>
    <div className="player-card">
      <div className="player-card__avatar" aria-hidden>
        ✈️
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
        <p className="player-card__score">Score: {score}</p>
      </div>
    </div>
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
