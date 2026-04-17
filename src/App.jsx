import { useState, useEffect } from 'react';
import CalendarGrid from './components/CalendarGrid';
import MovieModal from './components/MovieModal';

function App() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  
  const [watchedMovies, setWatchedMovies] = useState(() => {
    const saved = localStorage.getItem('watchedMovies');
    return saved ? JSON.parse(saved) : {};
  });

  const [modalState, setModalState] = useState({
    isOpen: false,
    dateStr: null,
    dateObj: null
  });

  useEffect(() => {
    localStorage.setItem('watchedMovies', JSON.stringify(watchedMovies));
  }, [watchedMovies]);

  const formatYearMonth = (date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const openModal = (dateStr, dateObj) => {
    setModalState({ isOpen: true, dateStr, dateObj });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, dateStr: null, dateObj: null });
  };

  const saveMovie = (dateStr, movieData) => {
    setWatchedMovies(prev => ({
      ...prev,
      [dateStr]: movieData
    }));
    closeModal();
  };

  const removeMovie = (dateStr) => {
    setWatchedMovies(prev => {
      const next = { ...prev };
      delete next[dateStr];
      return next;
    });
    closeModal();
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">CineLens</h1>
        <div className="month-navigation">
          <button onClick={handlePrevMonth} className="nav-btn" aria-label="Previous Month">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <h2>{formatYearMonth(currentDate)}</h2>
          <button onClick={handleNextMonth} className="nav-btn" aria-label="Next Month">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </header>

      <main className="calendar-container">
        <div className="calendar-week-headers">
          <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
        </div>
        <CalendarGrid 
          currentDate={currentDate} 
          watchedMovies={watchedMovies} 
          onDayClick={openModal} 
        />
      </main>

      <MovieModal 
        isOpen={modalState.isOpen}
        dateStr={modalState.dateStr}
        dateObj={modalState.dateObj}
        existingMovie={modalState.dateStr ? watchedMovies[modalState.dateStr] : null}
        onClose={closeModal}
        onSave={(data) => saveMovie(modalState.dateStr, data)}
        onRemove={() => removeMovie(modalState.dateStr)}
      />
    </div>
  );
}

export default App;
