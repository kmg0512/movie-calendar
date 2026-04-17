const formatDateObj = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

export default function CalendarGrid({ currentDate, watchedMovies, onDayClick }) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = formatDateObj(new Date());

    const emptyCells = Array.from({ length: firstDayOfMonth }, (_, i) => i);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div id="calendarGrid" className="calendar-grid">
            {emptyCells.map(i => (
                <div key={`empty-${i}`} className="calendar-day empty" />
            ))}
            
            {days.map(day => {
                const cellDate = new Date(year, month, day);
                const dateStr = formatDateObj(cellDate);
                const isToday = dateStr === todayStr;
                const movie = watchedMovies[dateStr];

                return (
                    <div 
                        key={dateStr}
                        className={`calendar-day ${isToday ? 'today' : ''} ${movie ? 'has-movie' : ''}`}
                        onClick={() => onDayClick(dateStr, cellDate)}
                    >
                        <span className="day-number">{day}</span>
                        {movie && (
                            <>
                                <img src={movie.poster} alt={movie.title} className="movie-poster" />
                                <div className="day-overlay" />
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
