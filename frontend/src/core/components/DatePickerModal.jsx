// Modal de selección de fecha: calendario de mes propio, sin librerías externas.
import { useState } from 'react';
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
const DatePickerModal = ({ value, onSelect, onClose }) => {
    const initialDate = value ? new Date(`${value}T00:00:00`) : new Date();
    const [viewYear, setViewYear] = useState(initialDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 110; year--) years.push(year);

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

    return (
        <div
            className="DatePickerModal-overlay"
            // Este modal puede abrirse sobre otro modal (ver RegisterForm): sin stopPropagation
            // acá, un click en su fondo también cerraría el modal padre al burbujear.
            onClick={(event) => {
                event.stopPropagation();
                onClose();
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
                        <select value={viewMonth} onChange={(event) => setViewMonth(Number(event.target.value))}>
                            {MONTH_NAMES.map((name, index) => (
                                <option key={name} value={index}>{name}</option>
                            ))}
                        </select>
                        <select value={viewYear} onChange={(event) => setViewYear(Number(event.target.value))}>
                            {years.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="button"
                        className="DatePickerModal-navButton"
                        onClick={handleNextMonth}
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
                        return (
                            <button
                                type="button"
                                key={index}
                                className={`DatePickerModal-day${day ? '' : ' DatePickerModal-day--empty'}${isSelected ? ' DatePickerModal-day--selected' : ''}`}
                                disabled={!day}
                                onClick={() => handleSelectDay(day)}
                            >
                                {day || ''}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DatePickerModal;
