import { useState, useEffect } from 'react';
import { MOCK_MOVIES } from '../constants';

export default function MovieModal({ isOpen, dateStr, dateObj, existingMovies, onClose, onSave, onRemove }) {
    const [view, setView] = useState('list'); // 'list' | 'search' | 'details'
    const [searchQuery, setSearchQuery] = useState('');
    const [customUrl, setCustomUrl] = useState('');
    
    // For details view
    const [tempMovie, setTempMovie] = useState(null); // { id?, poster, title }
    const [details, setDetails] = useState({ cinema: '', seat: '', memo: '' });

    useEffect(() => {
        if (!isOpen) return;

        setSearchQuery('');
        setCustomUrl('');

        if (existingMovies && existingMovies.length > 0) {
            setView('list');
        } else {
            setView('search');
        }
    }, [isOpen, dateStr, existingMovies.length]);

    if (!isOpen) return null;

    const formattedDate = dateObj 
        ? new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', year: 'numeric' }).format(dateObj)
        : '';

    const searchResults = searchQuery.trim().length > 0 
        ? MOCK_MOVIES.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase().trim()))
        : [];

    const handleSelectNewMovie = (poster, title) => {
        setTempMovie({ poster, title });
        setDetails({ cinema: '', seat: '', memo: '' });
        setView('details');
    };

    const handleEditMovie = (movie) => {
        setTempMovie({ id: movie.id, poster: movie.poster, title: movie.title });
        setDetails({
            cinema: movie.cinema || '',
            seat: movie.seat || '',
            memo: movie.memo || ''
        });
        setView('details');
    };

    const handleSave = () => {
        if (!tempMovie) return;
        onSave({
            id: tempMovie.id,
            poster: tempMovie.poster,
            title: tempMovie.title,
            ...details
        });
        setView('list');
    };

    const handleRemove = () => {
        if (tempMovie && tempMovie.id) {
            onRemove(tempMovie.id);
            setView('list');
        }
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
                <h3 id="modalDateLabel">{formattedDate} 기록</h3>
                
                {/* LIST VIEW */}
                <div id="modalListView" className={view === 'list' ? '' : 'hidden'}>
                    <div className="movie-list-cards">
                        {existingMovies.map(movie => (
                            <div key={movie.id} className="movie-list-card" onClick={() => handleEditMovie(movie)}>
                                <img src={movie.poster} alt={movie.title} />
                                <div className="movie-list-card-info">
                                    <div className="movie-list-card-title">{movie.title}</div>
                                    {movie.cinema && <div className="movie-list-card-meta">{movie.cinema} {movie.seat ? `| ${movie.seat}` : ''}</div>}
                                </div>
                            </div>
                        ))}
                        {existingMovies.length === 0 && (
                            <div style={{color: 'var(--text-muted)', textAlign: 'center', margin: '2rem 0'}}>
                                저장된 영화가 없습니다.
                            </div>
                        )}
                    </div>
                    <button className="primary-btn" onClick={() => setView('search')} style={{width: '100%'}}>
                        + 새로운 영화 추가
                    </button>
                </div>

                {/* SEARCH VIEW */}
                <div id="modalSearchView" className={view === 'search' ? '' : 'hidden'}>
                    {existingMovies.length > 0 && (
                        <button className="text-btn" style={{marginBottom: '1rem'}} onClick={() => setView('list')}>&larr; 목록으로 돌아가기</button>
                    )}
                    <div className="movie-search">
                        <label htmlFor="movieSearchInput" className="sr-only">Search Movie</label>
                        <input 
                            type="text" 
                            id="movieSearchInput" 
                            placeholder="영화 제목 검색..." 
                            autoComplete="off"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div id="searchResults" className={`search-results ${searchResults.length === 0 ? 'hidden' : ''}`}>
                            {searchResults.map((movie, idx) => (
                                <div key={idx} className="search-item" onClick={() => handleSelectNewMovie(movie.poster, movie.title)}>
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
                            placeholder="포스터 이미지 URL (직접 입력)"
                            value={customUrl}
                            onChange={(e) => setCustomUrl(e.target.value)}
                        />
                        <button className="primary-btn" onClick={() => {
                            if (customUrl.trim()) handleSelectNewMovie(customUrl.trim(), '직접 입력한 영화');
                        }}>
                            상세 정보 입력
                        </button>
                    </div>
                </div>

                {/* DETAILS VIEW */}
                <div id="modalDetailsView" className={view === 'details' ? '' : 'hidden'}>
                    {tempMovie && (
                        <>
                            <button className="text-btn" style={{marginBottom: '1rem'}} onClick={() => {
                                if (tempMovie.id) setView('list');
                                else setView('search');
                            }}>
                                &larr; 뒤로가기
                            </button>
                            <div className="details-header">
                                <img id="detailsPoster" src={tempMovie.poster} alt="Movie Poster" />
                                <div className="details-header-info">
                                    <h4 id="detailsTitle">{tempMovie.title}</h4>
                                    {!tempMovie.id && <button className="text-btn" onClick={() => setView('search')}>영화 변경</button>}
                                </div>
                            </div>
                            
                            <div className="details-form">
                                <div className="form-group">
                                    <label htmlFor="cinemaInput">영화관</label>
                                    <input 
                                        type="text" 
                                        id="cinemaInput" 
                                        placeholder="예: CGV 용산아이파크몰"
                                        value={details.cinema}
                                        onChange={e => setDetails({...details, cinema: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="seatInput">좌석</label>
                                    <input 
                                        type="text" 
                                        id="seatInput" 
                                        placeholder="예: G12, G13"
                                        value={details.seat}
                                        onChange={e => setDetails({...details, seat: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="memoInput">기타 메모</label>
                                    <textarea 
                                        id="memoInput" 
                                        rows="3" 
                                        placeholder="어떤 점이 좋았나요?"
                                        value={details.memo}
                                        onChange={e => setDetails({...details, memo: e.target.value})}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="details-actions">
                                <button className="primary-btn" onClick={handleSave}>기록 저장</button>
                                {tempMovie.id && (
                                    <button className="danger-btn" onClick={handleRemove}>기록 삭제</button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
