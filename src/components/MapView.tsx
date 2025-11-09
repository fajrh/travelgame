import type { GameLocation } from '../types';

type MapViewProps = {
  locations: GameLocation[];
  selectedLocationId: string;
  visitedLocationIds: ReadonlySet<string>;
  onSelectLocation: (location: GameLocation) => void;
};

const MapView = ({
  locations,
  selectedLocationId,
  visitedLocationIds,
  onSelectLocation,
}: MapViewProps) => {
  return (
    <section className="panel map-panel" aria-label="Travel destinations">
      <header className="panel-header">
        <h2>Pick your next city</h2>
        <p>
          Each destination you visit earns points and unlocks unique souvenirs. Hover to preview, click to travel.
        </p>
      </header>
      <div className="location-grid">
        {locations.map((location) => {
          const isSelected = location.id === selectedLocationId;
          const isVisited = visitedLocationIds.has(location.id);

          return (
            <button
              key={location.id}
              type="button"
              className={`location-card${isSelected ? ' is-selected' : ''}${isVisited ? ' is-visited' : ''}`}
              onClick={() => onSelectLocation(location)}
              aria-pressed={isSelected}
              title={`Travel to ${location.name}`}
            >
              <img src={location.image} alt={location.name} loading="lazy" />
              <div className="location-card__content">
                <div className="location-card__title">
                  <span className="location-card__name">{location.name}</span>
                  <span className="location-card__country">{location.country}</span>
                </div>
                <p className="location-card__description">{location.description}</p>
                <div className="location-card__footer">
                  <span className="location-card__cuisine" aria-label="Signature dish">
                    🍽 {location.cuisine}
                  </span>
                  {isVisited && <span className="location-card__visited-tag">Visited</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default MapView;
