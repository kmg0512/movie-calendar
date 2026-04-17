import { useState, useEffect } from 'react';
import { MOCK_MOVIES } from '../constants';

export default function MovieModal({ isOpen, dateStr, dateObj, existingMovie, onClose, onSave, onRemove }) {
    const [view, setView] = useState('search'); // 'search' | 'details'
    const [searchQuery, setSearchQuery] = useState('');
    const [customUrl, setCustomUrl] = useState('');
    
    const [tempMovie, setTempMovie] = useState(null); // { poster, title }
    const [details, setDetails] = useState({ cinema: '', seat: '', memo: '' });

    useEffect(() => {
        if (!isOpen) return;

        setSearchQuery('');
        setCustomUrl('');

        if (existingMovie) {
            setTempMovie({ poster: existingMovie.poster, title: existingMovie.title });
            setDetails({
                cinema: existingMovie.cinema || '',
                seat: existingMovie.seat || '',
                memo: existingMovie.memo || ''
            });
            setView('details');
        } else {
            setTempMovie(null);
            setDetails({ cinema: '', seat: '', memo: '' });
            setView('search');
        }
    }, [isOpen, existingMovie]);

    if (!isOpen) return null;

    const formattedDate = dateObj 
        ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(dateObj)
        : '';

    const searchResults = searchQuery.trim().length > 0 
        ? MOCK_MOVIES.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase().trim()))
        : [];

    const handleSelectMovie = (poster, title) => {
        setTempMovie({ poster, title });
        setView('details');
    };

    const handleSave = () => {
        if (!tempMovie) return;
        onSave({
            poster: tempMovie.poster,
            title: tempMovie.title,
            ...details
        });
    };

    const handleOverlayClick = (e) => {
        if (e.target.className.includes('modal-overlay')) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content">
                <button className="close-btn" aria-label="Close Modal" onClick={onClose}>&times;</button>
                <h3 id="modalDateLabel">Log movie for {formattedDate}</h3>
                
                <div id="modalSearchView" className={view === 'search' ? '' : 'hidden'}>
                    <div className="movie-search">
                        <label htmlFor="movieSearchInput" className="sr-only">Search Movie</label>
                        <input 
                            type="text" 
                            id="movieSearchInput" 
                            placeholder="Search a popular movie..." 
                            autoComplete="off"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div id="searchResults" className={`search-results ${searchResults.length === 0 ? 'hidden' : ''}`}>
                            {searchResults.map((movie, idx) => (
                                <div key={idx} className="search-item" onClick={() => handleSelectMovie(movie.poster, movie.title)}>
                                    <img src={movie.poster} alt={movie.title} />
                                    <div className="search-item-info">
                                        <span className="search-item-title">{movie.title}</span>
                                        <span className="search-item-year">{movie.year}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="divider"><span>OR</span></div>
                    
                    <div className="custom-url-section">
                        <label htmlFor="customUrlInput" className="sr-only">Custom Image URL</label>
                        <input 
                            type="text" 
                            id="customUrlInput" 
                            placeholder="Paste custom image URL (e.g. poster.jpg)"
                            value={customUrl}
                            onChange={(e) => setCustomUrl(e.target.value)}
                        />
                        <button className="primary-btn" onClick={() => {
                            if (customUrl.trim()) handleSelectMovie(customUrl.trim(), 'Custom Entry');
                        }}>
                            Enter Details
                        </button>
                    </div>
                </div>

                <div id="modalDetailsView" className={view === 'details' ? '' : 'hidden'}>
                    {tempMovie && (
                        <>
                            <div className="details-header">
                                <img id="detailsPoster" src={tempMovie.poster} alt="Movie Poster" />
                                <div className="details-header-info">
                                    <h4 id="detailsTitle">{tempMovie.title}</h4>
                                    <button className="text-btn" onClick={() => setView('search')}>Change Movie</button>
                                </div>
                            </div>
                            
                            <div className="details-form">
                                <div className="form-group">
                                    <label htmlFor="cinemaInput">영화관 (Cinema)</label>
                                    <input 
                                        type="text" 
                                        id="cinemaInput" 
                                        placeholder="e.g. CGV 용산아이파크몰"
                                        value={details.cinema}
                                        onChange={e => setDetails({...details, cinema: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="seatInput">좌석 (Seat)</label>
                                    <input 
                                        type="text" 
                                        id="seatInput" 
                                        placeholder="e.g. G12, G13"
                                        value={details.seat}
                                        onChange={e => setDetails({...details, seat: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="memoInput">기타 메모 (Memo)</label>
                                    <textarea 
                                        id="memoInput" 
                                        rows="3" 
                                        placeholder="How was the movie?"
                                        value={details.memo}
                                        onChange={e => setDetails({...details, memo: e.target.value})}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="details-actions">
                                <button className="primary-btn" onClick={handleSave}>Save Entry</button>
                                {existingMovie && (
                                    <button className="danger-btn" onClick={onRemove}>Remove Movie</button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
