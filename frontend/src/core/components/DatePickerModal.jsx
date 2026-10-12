// Modal de selección de fecha de nacimiento: calendario de mes propio, sin librerías externas.
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useOverlayClose } from '../hooks/useOverlayClose.js';
import DropdownSelect from './DropdownSelect.jsx';
import './_date-picker-modal.scss';

const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

// Pasa un Date a "YYYY-MM-DD" usando los campos locales (no toISOString(), que pasa
// por UTC y puede correr la fecha un día para atrás según el huso horario).
const toIsoDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Recibe: value (fecha ya elegida en formato ISO "YYYY-MM-DD", o "" si no hay ninguna),
// onSelect(isoDate) y onClose. Muestra selectores de mes/año (en vez de solo flechas
// prev/next) porque para una fecha de nacimiento hay que poder saltar décadas rápido.
// Las fechas futuras se ven pero no se pueden elegir (nadie nació mañana).
const DatePickerModal = ({ value, onSelect, onClose }) => {
    const today = new Date();
    const initialDate = value ? new Date(`${value}T00:00:00`) : today;
    const [viewYear, setViewYear] = useState(initialDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
    const overlayCloseProps = useOverlayClose(onClose);

    const currentYear = today.getFullYear();
    const todayIso = toIsoDate(today);
    // En el mes actual (o después) la flecha "siguiente" no tiene a dónde ir.
    const isCurrentMonthOrLater = viewYear > currentYear
        || (viewYear === currentYear && viewMonth >= today.getMonth());
    // Opciones de los desplegables de mes y año ({ value, label }, ver DropdownSelect).
    const monthOptions = MONTH_NAMES.map((name, index) => ({ value: index, label: name }));
    const yearOptions = [];
    for (let year = currentYear; year >= currentYear - 110; year--) yearOptions.push({ value: year, label: String(year) });

    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    // getDay(): 0 = domingo .. 6 = sábado. Se convierte a offset lunes-primero.
    const leadingBlanks = (firstDayOfMonth.getDay() + 6) % 7;

    const cells = [
        ...Array(leadingBlanks).fill(null),
        ...Array.from({ length: daysInMonth }, (_, index) => index + 1)
    ];

    const handlePrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear((year) => year - 1);
        } else {
            setViewMonth((month) => month - 1);
        }
    };

    const handleNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear((year) => year + 1);
        } else {
            setViewMonth((month) => month + 1);
        }
    };

    const handleSelectDay = (day) => {
        if (!day) return;
        onSelect(toIsoDate(new Date(viewYear, viewMonth, day)));
        onClose();
    };

    // createPortal: se dibuja directo en <body>. Se abre desde adentro de otro modal (el de
    // registro), cuyo fondo tiene backdrop-filter y scroll propio: sin el portal, el
    // position: fixed del calendario queda atado a ese fondo y, si el registro estaba
    // scrolleado (en el celular, para llegar a la fecha), el calendario aparece fuera de vista.
    // Los eventos igual burbujean por el árbol de React, por eso sigue el stopPropagation.
    return createPortal(
        <div
            className="DatePickerModal-overlay"
            onMouseDown={overlayCloseProps.onMouseDown}
            // Este modal puede abrirse sobre otro modal (ver RegisterForm): sin stopPropagation
            // acá, un click en su fondo también llegaría al modal padre al burbujear.
            onClick={(event) => {
                event.stopPropagation();
                overlayCloseProps.onClick(event);
            }}
        >
            <div
                className="DatePickerModal-card"
                role="dialog"
                aria-modal="true"
                aria-label="Elegir fecha de nacimiento"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="DatePickerModal-header">
                    <button
                        type="button"
                        className="DatePickerModal-navButton"
                        onClick={handlePrevMonth}
                        aria-label="Mes anterior"
                    >
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>

                    <div className="DatePickerModal-selectors">
                        <DropdownSelect value={viewMonth} options={monthOptions} onChange={setViewMonth} aria-label="Mes" />
                        <DropdownSelect value={viewYear} options={yearOptions} onChange={setViewYear} aria-label="Año" />
                    </div>

                    <button
                        type="button"
                        className="DatePickerModal-navButton"
                        onClick={handleNextMonth}
                        disabled={isCurrentMonthOrLater}
                        aria-label="Mes siguiente"
                    >
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>

                <div className="DatePickerModal-weekdays">
                    {WEEKDAY_LABELS.map((label, index) => (
                        <span key={`${label}-${index}`}>{label}</span>
                    ))}
                </div>

                <div className="DatePickerModal-days">
                    {cells.map((day, index) => {
                        const iso = day ? toIsoDate(new Date(viewYear, viewMonth, day)) : null;
                        const isSelected = Boolean(iso) && iso === value;
                        // Las fechas ISO se pueden comparar como texto ("2026-10-13" > "2026-10-12").
                        const isFuture = Boolean(iso) && iso > todayIso;
                        return (
                            <button
                                type="button"
                                key={index}
                                className={`DatePickerModal-day${day ? '' : ' DatePickerModal-day--empty'}${isSelected ? ' DatePickerModal-day--selected' : ''}`}
                                disabled={!day || isFuture}
                                onClick={() => handleSelectDay(day)}
                            >
                                {day || ''}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default DatePickerModal;
