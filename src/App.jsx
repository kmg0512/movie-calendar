import { useState, useEffect } from 'react';
import CalendarGrid from './components/CalendarGrid';
import MovieModal from './components/MovieModal';

function App() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  
  const [watchedMovies, setWatchedMovies] = useState(() => {
    const saved = localStorage.getItem('watchedMovies');
    if (!saved) return {};
    
    try {
      const parsed = JSON.parse(saved);
      // Migration: Convert old single object format to an array structure if needed
      const migrated = {};
      for (const [date, data] of Object.entries(parsed)) {
        if (!Array.isArray(data)) {
          migrated[date] = [{ ...data, id: Date.now().toString() + Math.random().toString(36).substr(2, 5) }];
        } else {
          migrated[date] = data;
        }
      }
      return migrated;
    } catch {
      return {};
    }
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
    setWatchedMovies(prev => {
      const dayMovies = prev[dateStr] || [];
      if (movieData.id) {
        // Edit existing movie
        return {
          ...prev,
          [dateStr]: dayMovies.map(m => m.id === movieData.id ? movieData : m)
        };
      } else {
        // Add new movie
        return {
          ...prev,
          [dateStr]: [...dayMovies, { ...movieData, id: Date.now().toString() }]
        };
      }
    });
    // We don't automatically close the modal, as the user might want to see the list again. 
    // We will let the Modal handle navigating back to the list view.
  };

  const removeMovie = (dateStr, movieId) => {
    setWatchedMovies(prev => {
      const dayMovies = prev[dateStr] || [];
      const updated = dayMovies.filter(m => m.id !== movieId);
      const next = { ...prev };
      if (updated.length === 0) {
        delete next[dateStr];
      } else {
        next[dateStr] = updated;
      }
      return next;
    });
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
        existingMovies={modalState.dateStr ? (watchedMovies[modalState.dateStr] || []) : []}
        onClose={closeModal}
        onSave={(data) => saveMovie(modalState.dateStr, data)}
        onRemove={(id) => removeMovie(modalState.dateStr, id)}
      />
    </div>
  );
}

export default App;
