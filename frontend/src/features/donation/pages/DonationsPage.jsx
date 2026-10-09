// Página "Donaciones" (ruta /donaciones). Arriba, un selector entre lo recibido y lo
// donado; abajo, tres tarjetas del lado elegido: el resumen (total, promedio y cantidad),
// la dona con las 5 personas que más donaron (o a las que más se donó) y la actividad
// reciente. El lado elegido va en la URL (?tipo=realizadas), así se puede volver a él con
// el botón "atrás" o compartir el link.
import { useSearchParams } from 'react-router-dom';
import { useDonationHistory } from '../hooks/useDonationHistory.js';
import DonationModeToggle from '../components/DonationModeToggle.jsx';
import DonationStatsCard from '../components/DonationStatsCard.jsx';
import DonationTopUsersChart from '../components/DonationTopUsersChart.jsx';
import DonationActivityList from '../components/DonationActivityList.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import SwirlingLoader from '../../../core/components/SwirlingLoader.jsx';
import '../styles/_donations-page.scss';

// Textos de cada lado. El primero es el que se muestra si la URL no dice otra cosa.
const MODES = [
  {
    id: 'recibidas',
    label: 'Recibidas',
    icon: 'savings',
    statsTitle: 'Total recibido',
    countLabel: 'Donaciones recibidas',
    chartTitle: 'Quiénes más te donaron',
    chartDescription: 'Las 5 personas que más te donaron, en total.',
    chartEmpty: 'Cuando alguien te done, vas a ver acá quiénes más te apoyan.',
    activityEmpty: 'Todavía no recibiste donaciones. Cuando alguien te invite algo, va a aparecer acá.',
  },
  {
    id: 'realizadas',
    label: 'Realizadas',
    icon: 'volunteer_activism',
    statsTitle: 'Total donado',
    countLabel: 'Donaciones realizadas',
    chartTitle: 'A quiénes más donaste',
    chartDescription: 'Los 5 creadores a los que más donaste, en total.',
    chartEmpty: 'Cuando dones, vas a ver acá a qué creadores más apoyaste.',
    activityEmpty: 'Todavía no donaste. Podés invitarle algo a un creador desde su perfil o desde una de sus recetas.',
  },
];

function DonationsPage() {
  const { history, isLoading, loadError, reload } = useDonationHistory();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeMode = MODES.find((mode) => mode.id === searchParams.get('tipo')) ?? MODES[0];
  const isReceived = activeMode.id === MODES[0].id;
  const side = history ? (isReceived ? history.received : history.sent) : null;

  const handleModeChange = (modeId) => setSearchParams(modeId === MODES[0].id ? {} : { tipo: modeId });

  return (
    <div className="DonationsPage">
      <header className="DonationsPage-header">
        <h1 className="DonationsPage-title">Donaciones</h1>
        <p className="DonationsPage-subtitle">El apoyo que recibiste de la comunidad y el que le diste a otros cocineros.</p>
      </header>

      <DonationModeToggle modes={MODES} activeId={activeMode.id} onChange={handleModeChange} />

      {isLoading && (
        <div className="DonationsPage-loading" role="status" aria-label="Cargando donaciones">
          <SwirlingLoader className="DonationsPage-spinner" />
        </div>
      )}

      {loadError && <ErrorState message={loadError} onRetry={reload} title="No pudimos cargar tus donaciones" />}

      {side && (
        <div className="DonationsPage-grid" role="tabpanel">
          <div className="DonationsPage-column">
            <DonationStatsCard title={activeMode.statsTitle} stats={side.stats} countLabel={activeMode.countLabel} />
            <DonationTopUsersChart
              topUsers={side.topUsers}
              title={activeMode.chartTitle}
              description={activeMode.chartDescription}
              emptyMessage={activeMode.chartEmpty}
            />
          </div>

          <div className="DonationsPage-activity">
            <DonationActivityList items={side.items} isReceived={isReceived} emptyMessage={activeMode.activityEmpty} />
          </div>
        </div>
      )}
    </div>
  );
}

export default DonationsPage;
