import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuthContext';
import { FaHeart, FaRegHeart, FaComment, FaSearch, FaSort } from 'react-icons/fa';

const UserJournals = () => {
    const { username } = useParams();
    const { user } = useAuthContext();
    const [journals, setJournals] = useState([]);
    const [exploreJournals, setExploreJournals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('latest');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Fetch user's journals
    useEffect(() => {
        const fetchUserJournals = async () => {
            try {
                const response = await fetch(`http://localhost:8000/${username}/journals`);
                const data = await response.json();
                if (response.ok) {
                    setJournals(data);
                } else {
                    setError(data.error);
                }
            } catch (err) {
                setError('Failed to fetch journals');
            }
        };

        if (username) {
            fetchUserJournals();
        }
    }, [username]);

    // Fetch explore journals
    useEffect(() => {
        const fetchExploreJournals = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `http://localhost:8000/api/journals/explore?` +
                    `search=${searchQuery}&sort=${sortBy}&page=${currentPage}&limit=9`
                );
                const data = await response.json();
                if (response.ok) {
                    setExploreJournals(data.journals);
                    setTotalPages(data.totalPages);
                } else {
                    setError(data.error);
                }
            } catch (err) {
                setError('Failed to fetch explore journals');
            } finally {
                setLoading(false);
            }
        };

        fetchExploreJournals();
    }, [searchQuery, sortBy, currentPage]);

    // Handle like/unlike
    const handleLike = async (journalId) => {
        if (!user) return;

        try {
            const response = await fetch(`http://localhost:8000/api/journals/${journalId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const data = await response.json();
            
            if (response.ok) {
                // Update journals state
                setExploreJournals(prevJournals => 
                    prevJournals.map(journal => 
                        journal._id === journalId ? data : journal
                    )
                );
            }
        } catch (err) {
            console.error('Error toggling like:', err);
        }
    };

    // Render journal card
    const JournalCard = ({ journal }) => {
        const isLiked = user && journal.likes.includes(user._id);
        
        return (
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {journal.coverPicture && (
                    <img 
                        src={journal.coverPicture} 
                        alt={journal.title} 
                        className="w-full h-48 object-cover"
                    />
                )}
                <div className="p-4">
                    <div className="flex items-center mb-2">
                        <img 
                            src={journal.author.profilePicture || '/default-avatar.png'} 
                            alt={journal.author.username}
                            className="w-8 h-8 rounded-full mr-2"
                        />
                        <Link to={`/profile/${journal.author.username}`} className="text-gray-700 hover:text-indigo-600">
                            {journal.author.username}
                        </Link>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{journal.title}</h3>
                    <p className="text-gray-600 mb-4">
                        {journal.article.substring(0, 150)}...
                    </p>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => handleLike(journal._id)}
                                className="flex items-center space-x-1 text-gray-600 hover:text-red-500"
                            >
                                {isLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                                <span>{journal.likes.length}</span>
                            </button>
                            <div className="flex items-center space-x-1 text-gray-600">
                                <FaComment />
                                <span>{journal.comments.length}</span>
                            </div>
                        </div>
                        <Link 
                            to={`/journal/${journal._id}`}
                            className="text-indigo-600 hover:text-indigo-800"
                        >
                            Read More
                        </Link>
                    </div>
                </div>
            </div>
        );
    };

    // Render explore section
    const ExploreSection = () => (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative flex-1 w-full">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search journals..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <FaSort className="text-gray-400" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="latest">Latest</option>
                        <option value="popular">Popular</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
            ) : error ? (
                <div className="text-red-500 text-center">{error}</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exploreJournals.map(journal => (
                            <JournalCard key={journal._id} journal={journal} />
                        ))}
                    </div>
                    
                    {/* Pagination */}
                    <div className="flex justify-center space-x-2 mt-8">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-4 py-2 rounded ${
                                    currentPage === page
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-8">
                {username ? (
                    <>
                        <h2 className="text-2xl font-bold mb-6">{username}'s Journals</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {journals.map(journal => (
                                <JournalCard key={journal._id} journal={journal} />
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold mb-6">Explore Journals</h2>
                        <ExploreSection />
                    </>
                )}
            </div>
        </div>
    );
};

export default UserJournals; 