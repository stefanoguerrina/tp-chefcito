// Modal con las listas de seguidores y seguidos de un perfil, en dos pestañas. Se abre
// tocando esos contadores en las métricas del perfil (ProfileMetrics).
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import FollowList from './FollowList.jsx';
import { useOverlayClose } from '../../../core/hooks/useOverlayClose.js';
import { FOLLOW_LISTS } from '../models/followModel.js';
import '../styles/_follow-list-modal.scss';

// Recibe: userId del perfil, initialKind (pestaña con la que abre: 'followers' |
// 'following') y onClose.
function FollowListModal({ userId, initialKind, onClose }) {
  const [kind, setKind] = useState(initialKind);
  const overlayCloseProps = useOverlayClose(onClose);

  // Escape cierra el modal, como cualquier diálogo.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Se monta en <body> con un portal: las métricas del perfil están dentro de ScrollReveal
  // (con transform), que haría que el overlay no cubra toda la pantalla.
  return createPortal(
    <div className="FollowListModal-overlay" {...overlayCloseProps}>
      <div
        className="FollowListModal-card"
        role="dialog"
        aria-modal="true"
        aria-label={FOLLOW_LISTS[kind].label}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="FollowListModal-header">
          <div className="FollowListModal-tabs" role="tablist">
            {Object.entries(FOLLOW_LISTS).map(([listKind, { label }]) => (
              <button
                key={listKind}
                type="button"
                role="tab"
                aria-selected={kind === listKind}
                className={`FollowListModal-tab${kind === listKind ? ' FollowListModal-tab--active' : ''}`}
                onClick={() => setKind(listKind)}
              >
                {label}
              </button>
            ))}
          </div>
          <button type="button" className="FollowListModal-close" onClick={onClose} aria-label="Cerrar">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* key: al cambiar de pestaña se monta una lista nueva, que arranca cargando. */}
        <div className="FollowListModal-body">
          <FollowList key={kind} userId={userId} kind={kind} onUserClick={onClose} />
        </div>
      </div>
    </div>,
    document.body
  );
}

export default FollowListModal;
