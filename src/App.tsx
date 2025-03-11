import { useState, useEffect } from 'react'
import { Book } from './services/bookstackApi'
import SpringBootApi from './services/springBootApi'
import { ConfigForm, CONFIG_UPDATED_EVENT } from './components/ConfigForm'
import './App.css'

// Create a single instance of the Spring Boot API
const springBootApi = new SpringBootApi()

// Modal component for displaying book descriptions
function DescriptionModal({ 
  book, 
  onClose 
}: { 
  book: Book | null, 
  onClose: () => void 
}) {
  if (!book) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-left">{book.name}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          <p className="text-gray-700 whitespace-normal break-words text-left">{book.description}</p>
        </div>
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={onClose}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Confirmation modal for delete operations
function ConfirmationModal({ 
  title,
  message,
  onConfirm,
  onCancel
}: { 
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-left">{title}</h3>
          <button 
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <p className="text-gray-700">{message}</p>
        </div>
        <div className="p-4 border-t border-gray-200 flex space-x-3 justify-end">
          <button 
            onClick={onCancel}
            className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [books, setBooks] = useState<Book[]>([])
  const [destinationBooks, setDestinationBooks] = useState<Book[]>([])
  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<string | null>(null)
  const [syncProgress, setSyncProgress] = useState<{[key: number]: string}>({})
  const [activeBook, setActiveBook] = useState<Book | null>(null)
  const [activeTab, setActiveTab] = useState<'books' | 'manage' | 'config'>('books')
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null)
  const [deleteStatus, setDeleteStatus] = useState<{[key: number]: string}>({})
  const [selectedDestinationBookIds, setSelectedDestinationBookIds] = useState<number[]>([])
  const [showDestroyConfirm, setShowDestroyConfirm] = useState(false)
  const [destroyStatus, setDestroyStatus] = useState<string | null>(null)

  // Function to check API status and configuration
  const checkApiStatus = async () => {
    try {
      const config = await springBootApi.getConfig();
      
      if (config) {
        try {
          const result = await springBootApi.verifyCredentials();
          if (result.sourceCredentialsValid) {
            setApiStatus(`Connected to Spring Boot API. Using custom configuration.`);
          } else {
            setApiStatus('Connected to Spring Boot API, but source credentials are invalid.');
          }
        } catch (err) {
          setApiStatus('Connected to Spring Boot API, but credentials verification failed.');
          console.error(err);
        }
      } else {
        setApiStatus('Connected to Spring Boot API. Using default configuration.');
      }
    } catch (err) {
      setApiStatus('Unable to connect to Spring Boot API. Make sure it is running.');
      console.error(err);
    }
  }

  // Check API status on component mount
  useEffect(() => {
    checkApiStatus();
    
    // Add event listener for config updates
    const handleConfigUpdate = () => {
      checkApiStatus();
      // Clear books when config changes to force a reload
      setBooks([]);
      setDestinationBooks([]);
    };
    
    window.addEventListener(CONFIG_UPDATED_EVENT, handleConfigUpdate);
    
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener(CONFIG_UPDATED_EVENT, handleConfigUpdate);
    };
  }, []);

  // Handle tab change
  const handleTabChange = (tab: 'books' | 'manage' | 'config') => {
    setActiveTab(tab);
    if (tab === 'books') {
      // Refresh API status when switching to books tab
      checkApiStatus();
    } else if (tab === 'manage') {
      // Load destination books when switching to manage tab
      loadDestinationBooks();
    }
  };

  const loadBooks = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use the Spring Boot API to load books
      const books = await springBootApi.listBooks()
      setBooks(books)
    } catch (err) {
      setError('Failed to load books. Please check the Spring Boot API.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadDestinationBooks = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use the Spring Boot API to load destination books
      const books = await springBootApi.listDestinationBooks()
      setDestinationBooks(books)
    } catch (err) {
      setError('Failed to load destination books. Please check the Spring Boot API.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleBookSelection = (bookId: number) => {
    setSelectedBookIds(prev => {
      if (prev.includes(bookId)) {
        return prev.filter(id => id !== bookId)
      } else {
        return [...prev, bookId]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedBookIds.length === books.length) {
      setSelectedBookIds([])
    } else {
      setSelectedBookIds(books.map(book => book.id))
    }
  }

  const handleDeleteBook = async (book: Book) => {
    setBookToDelete(book);
  }

  const handleDestinationBookSelection = (bookId: number) => {
    setSelectedDestinationBookIds(prev => {
      if (prev.includes(bookId)) {
        return prev.filter(id => id !== bookId)
      } else {
        return [...prev, bookId]
      }
    })
  }

  const handleSelectAllDestination = () => {
    if (selectedDestinationBookIds.length === destinationBooks.length) {
      setSelectedDestinationBookIds([])
    } else {
      setSelectedDestinationBookIds(destinationBooks.map(book => book.id))
    }
  }

  const handleDeleteMultipleBooks = () => {
    if (selectedDestinationBookIds.length === 0) {
      setError('Please select at least one book to delete')
      return
    }
    
    // Get the selected books
    const booksToDelete = destinationBooks.filter(book => 
      selectedDestinationBookIds.includes(book.id)
    )
    
    // Set the confirmation modal with multiple books info
    setBookToDelete({
      id: -1, // Use -1 to indicate multiple books
      name: `${selectedDestinationBookIds.length} selected books`,
      description: `You are about to delete ${selectedDestinationBookIds.length} books.`,
      slug: '',
      created_at: '',
      updated_at: '',
      created_by: { id: 0, name: '', slug: '' },
      updated_by: { id: 0, name: '', slug: '' },
      contents: [],
      tags: []
    })
  }

  const confirmDeleteMultipleBooks = async () => {
    if (selectedDestinationBookIds.length === 0) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Initialize all selected books as "Pending"
      const initialDeleteStatus = selectedDestinationBookIds.reduce((acc, id) => {
        acc[id] = 'Pending'
        return acc
      }, {} as {[key: number]: string})
      
      setDeleteStatus(initialDeleteStatus);
      
      // Process each book one by one
      let completedCount = 0;
      let failedCount = 0;
      
      for (const bookId of selectedDestinationBookIds) {
        const book = destinationBooks.find(b => b.id === bookId);
        if (book) {
          setDeleteStatus(prev => ({ ...prev, [bookId]: 'Deleting...' }));
          
          try {
            // Delete the book
            await springBootApi.deleteDestinationBook(bookId);
            setDeleteStatus(prev => ({ ...prev, [bookId]: 'Deleted' }));
            completedCount++;
          } catch (err) {
            console.error(`Error deleting destination book ${bookId}:`, err);
            setDeleteStatus(prev => ({ ...prev, [bookId]: 'Failed' }));
            failedCount++;
          }
        }
      }
      
      // Remove successfully deleted books from the list
      setDestinationBooks(prev => 
        prev.filter(book => !selectedDestinationBookIds.includes(book.id) || 
          deleteStatus[book.id] === 'Failed')
      );
      
      // Clear selection
      setSelectedDestinationBookIds([]);
      
      // Set appropriate success message
      if (failedCount === 0) {
        setSuccess(`All ${completedCount} books deleted successfully!`);
      } else {
        setSuccess(`Deletion completed: ${completedCount} succeeded, ${failedCount} failed.`);
      }
      
      setBookToDelete(null);
    } catch (err) {
      setError('Failed to delete books. Please check the Spring Boot API.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const confirmDeleteBook = async () => {
    if (!bookToDelete) return;
    
    // If id is -1, it's a multiple deletion
    if (bookToDelete.id === -1) {
      await confirmDeleteMultipleBooks();
      return;
    }
    
    // Original single book deletion logic
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Update status to "Deleting"
      setDeleteStatus(prev => ({ ...prev, [bookToDelete.id]: 'Deleting...' }));
      
      // Delete the book
      await springBootApi.deleteDestinationBook(bookToDelete.id);
      
      // Update status to "Deleted"
      setDeleteStatus(prev => ({ ...prev, [bookToDelete.id]: 'Deleted' }));
      
      // Remove the book from the list
      setDestinationBooks(prev => prev.filter(book => book.id !== bookToDelete.id));
      
      setSuccess(`Book "${bookToDelete.name}" deleted successfully!`);
      setBookToDelete(null);
    } catch (err) {
      setError(`Failed to delete book "${bookToDelete.name}". Please check the Spring Boot API.`);
      setDeleteStatus(prev => ({ ...prev, [bookToDelete.id]: 'Failed' }));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const cancelDeleteBook = () => {
    setBookToDelete(null);
  }

  const handleSync = async () => {
    if (selectedBookIds.length === 0) {
      setError('Please select at least one book to sync')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      
      // Initialize all selected books as "Pending"
      const initialProgress = selectedBookIds.reduce((acc, id) => {
        acc[id] = 'Pending'
        return acc
      }, {} as {[key: number]: string})
      
      setSyncProgress(initialProgress)

      // Sync each selected book
      let completedCount = 0;
      let failedCount = 0;
      
      for (const bookId of selectedBookIds) {
        const book = books.find(b => b.id === bookId)
        if (book) {
          setSyncProgress(prev => ({ ...prev, [bookId]: 'Syncing...' }))
          
          try {
            // Use the Spring Boot API to sync the book
            await springBootApi.syncBook(bookId)
            setSyncProgress(prev => ({ ...prev, [bookId]: 'Completed' }))
            completedCount++;
          } catch (err) {
            console.error(`Error syncing book ${book.name}:`, err)
            setSyncProgress(prev => ({ ...prev, [bookId]: 'Failed' }))
            failedCount++;
          }
        }
      }
      
      // Set appropriate success message
      if (failedCount === 0) {
        setSuccess(`All ${completedCount} books synchronized successfully!`)
      } else {
        setSuccess(`Synchronization completed: ${completedCount} succeeded, ${failedCount} failed.`)
      }
    } catch (err) {
      setError('Failed to sync books. Please check the Spring Boot API.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDestroy = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setDestroyStatus('Destroying...');
      
      await springBootApi.destroy();
      
      setDestroyStatus('Destroyed');
      setSuccess('All books have been destroyed successfully.');
      setDestinationBooks([]); // Clear the books list
      setSelectedDestinationBookIds([]); // Clear selection
      setShowDestroyConfirm(false);
    } catch (err) {
      setError('Failed to destroy books. Please check the Spring Boot API.');
      setDestroyStatus('Failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">BookStack Sync Tool</h1>
        <p className="text-center text-gray-600">Synchronize books between BookStack instances</p>
      </header>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => handleTabChange('books')}
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'books'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sync Books
            </button>
            <button
              onClick={() => handleTabChange('manage')}
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'manage'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Manage Books
            </button>
            <button
              onClick={() => handleTabChange('config')}
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'config'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Configuration
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'config' ? (
        <ConfigForm />
      ) : activeTab === 'manage' ? (
        // Manage Books tab content
        <>
          <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 px-4 sm:px-6 w-full max-w-5xl mx-auto">
              <div className="relative px-4 py-8 sm:py-10 bg-white shadow-lg rounded-xl sm:rounded-3xl sm:p-12 md:p-16">
                <div className="w-full mx-auto">
                  <div className="divide-y divide-gray-200">
                    <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                      <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold">Manage Destination Books</h1>
                        <div className="flex space-x-4">
                          {destinationBooks.length > 0 && (
                            <button
                              onClick={() => setShowDestroyConfirm(true)}
                              disabled={loading || destroyStatus === 'Destroying...'}
                              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center space-x-2"
                            >
                              {destroyStatus === 'Destroying...' ? (
                                <>
                                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span>Destroying...</span>
                                </>
                              ) : (
                                <>
                                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  <span>Destroy All</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* API Status */}
                      {apiStatus && (
                        <div className={`mt-4 p-4 ${apiStatus.includes('Unable') || apiStatus.includes('invalid') || apiStatus.includes('failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'} rounded-md`}>
                          {apiStatus}
                        </div>
                      )}

                      {/* Load Books Button */}
                      <div className="mb-8">
                        <button
                          onClick={loadDestinationBooks}
                          disabled={loading || apiStatus?.includes('Unable') || apiStatus?.includes('invalid') || apiStatus?.includes('failed')}
                          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                          {loading && !destinationBooks.length ? 'Loading...' : 'Load Destination Books'}
                        </button>
                      </div>

                      {/* Book List */}
                      {destinationBooks.length > 0 ? (
                        <div className="mb-8">
                          <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Destination Books</h2>
                            <button
                              onClick={handleSelectAllDestination}
                              className="text-sm text-indigo-600 hover:text-indigo-800"
                            >
                              {selectedDestinationBookIds.length === destinationBooks.length ? 'Deselect All' : 'Select All'}
                            </button>
                          </div>
                          
                          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                            {destinationBooks.map((book) => (
                              <div 
                                key={book.id} 
                                className={`flex items-center p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                                  selectedDestinationBookIds.includes(book.id) ? 'bg-indigo-50' : ''
                                }`}
                                onClick={() => handleDestinationBookSelection(book.id)}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedDestinationBookIds.includes(book.id)}
                                  onChange={() => {}} // Handled by the div click
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <div className="ml-3 flex-grow">
                                  <span className="block font-medium text-left">{book.name}</span>
                                  {book.description && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-500 truncate text-left mr-2" style={{ maxWidth: 'calc(100% - 70px)' }}>
                                        {book.description.length > 40 
                                          ? book.description.substring(0, 40) + '...' 
                                          : book.description}
                                      </span>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveBook(book);
                                        }}
                                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 focus:outline-none flex-shrink-0"
                                      >
                                        Details
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center ml-4">
                                  {deleteStatus[book.id] ? (
                                    <span className={`text-sm px-2 py-1 rounded whitespace-nowrap ${
                                      deleteStatus[book.id] === 'Deleted' 
                                        ? 'bg-green-100 text-green-800' 
                                        : deleteStatus[book.id] === 'Failed'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {deleteStatus[book.id]}
                                    </span>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteBook(book);
                                      }}
                                      disabled={loading}
                                      className="text-sm text-red-600 hover:text-red-800 font-medium px-3 py-1 rounded-md border border-red-200 hover:bg-red-50 focus:outline-none disabled:opacity-50"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-4 flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              {destinationBooks.length} books found in destination, {selectedDestinationBookIds.length} selected
                            </span>
                            
                            {/* Delete Selected Button */}
                            {selectedDestinationBookIds.length > 0 && (
                              <button
                                onClick={handleDeleteMultipleBooks}
                                disabled={loading}
                                className="flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                              >
                                Delete Selected ({selectedDestinationBookIds.length})
                              </button>
                            )}
                          </div>
                        </div>
                      ) : !loading && (
                        <div className="text-center py-8 text-gray-500">
                          No books found in the destination BookStack instance.
                        </div>
                      )}

                      {/* Status Messages */}
                      {error && (
                        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
                          {error}
                        </div>
                      )}
                      {success && (
                        <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md flex justify-between items-center">
                          <span>{success}</span>
                          <button 
                            onClick={() => {
                              setSuccess(null);
                              setDeleteStatus({});
                            }} 
                            className="text-sm text-green-700 hover:text-green-900 underline"
                          >
                            Clear Status
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        // Books tab content
        <>
          <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 px-4 sm:px-6 w-full max-w-5xl mx-auto">
              <div className="relative px-4 py-8 sm:py-10 bg-white shadow-lg rounded-xl sm:rounded-3xl sm:p-12 md:p-16">
                <div className="w-full mx-auto">
                  <div className="divide-y divide-gray-200">
                    <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                      <h1 className="text-3xl font-bold text-center mb-8">BookStack Sync Books</h1>
                      
                      {/* API Status */}
                      {apiStatus && (
                        <div className={`mt-4 p-4 ${apiStatus.includes('Unable') || apiStatus.includes('invalid') || apiStatus.includes('failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'} rounded-md`}>
                          {apiStatus}
                        </div>
                      )}

                      {/* Load Books Button */}
                      <div className="mb-8">
                        <button
                          onClick={loadBooks}
                          disabled={loading || apiStatus?.includes('Unable') || apiStatus?.includes('invalid') || apiStatus?.includes('failed')}
                          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                          {loading && !books.length ? 'Loading...' : 'Load Source Books'}
                        </button>
                      </div>

                      {/* Book Selection */}
                      {books.length > 0 && (
                        <div className="mb-8">
                          <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Select Books to Sync</h2>
                            <button
                              onClick={handleSelectAll}
                              className="text-sm text-indigo-600 hover:text-indigo-800"
                            >
                              {selectedBookIds.length === books.length ? 'Deselect All' : 'Select All'}
                            </button>
                          </div>
                          
                          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                            {books.map((book) => (
                              <div 
                                key={book.id} 
                                className={`flex items-center p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                                  selectedBookIds.includes(book.id) ? 'bg-indigo-50' : ''
                                }`}
                                onClick={() => handleBookSelection(book.id)}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedBookIds.includes(book.id)}
                                  onChange={() => {}} // Handled by the div click
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <div className="ml-3 flex-grow">
                                  <span className="block font-medium text-left">{book.name}</span>
                                  {book.description && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-500 truncate text-left mr-2" style={{ maxWidth: 'calc(100% - 70px)' }}>
                                        {book.description.length > 40 
                                          ? book.description.substring(0, 40) + '...' 
                                          : book.description}
                                      </span>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveBook(book);
                                        }}
                                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 focus:outline-none flex-shrink-0"
                                      >
                                        Details
                                      </button>
                                    </div>
                                  )}
                                </div>
                                {syncProgress[book.id] && (
                                  <span className={`text-sm px-2 py-1 rounded whitespace-nowrap ml-2 ${
                                    syncProgress[book.id] === 'Completed' 
                                      ? 'bg-green-100 text-green-800' 
                                      : syncProgress[book.id] === 'Failed'
                                        ? 'bg-red-100 text-red-800'
                                        : syncProgress[book.id] === 'Pending'
                                          ? 'bg-gray-100 text-gray-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {syncProgress[book.id]}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-4 text-sm text-gray-600">
                            {selectedBookIds.length} of {books.length} books selected
                          </div>
                        </div>
                      )}

                      {/* Sync Button */}
                      {books.length > 0 && (
                        <button
                          onClick={handleSync}
                          disabled={loading || apiStatus?.includes('Unable') || apiStatus?.includes('invalid') || apiStatus?.includes('failed') || selectedBookIds.length === 0}
                          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          {loading ? 'Syncing...' : `Sync ${selectedBookIds.length} Selected Book${selectedBookIds.length !== 1 ? 's' : ''}`}
                        </button>
                      )}

                      {/* Status Messages */}
                      {error && (
                        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
                          {error}
                        </div>
                      )}
                      {success && (
                        <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md flex justify-between items-center">
                          <span>{success}</span>
                          <button 
                            onClick={() => setSyncProgress({})} 
                            className="text-sm text-green-700 hover:text-green-900 underline"
                          >
                            Clear Status
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeBook && (
        <DescriptionModal book={activeBook} onClose={() => setActiveBook(null)} />
      )}

      {bookToDelete && (
        <ConfirmationModal 
          title="Confirm Delete"
          message={`Are you sure you want to delete the book "${bookToDelete.name}"? This action cannot be undone.`}
          onConfirm={confirmDeleteBook}
          onCancel={cancelDeleteBook}
        />
      )}

      {/* Destroy Confirmation Modal */}
      {showDestroyConfirm && (
        <ConfirmationModal 
          title="Confirm Destroy All Books"
          message="Are you sure you want to destroy ALL books in the destination BookStack instance? This action cannot be undone and will permanently delete all books."
          onConfirm={handleDestroy}
          onCancel={() => setShowDestroyConfirm(false)}
        />
      )}
    </div>
  )
}

export default App
