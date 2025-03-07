import { useState, useEffect } from 'react'
import { Book } from './services/bookstackApi'
import SpringBootApi from './services/springBootApi'
import './App.css'

// Create a single instance of the Spring Boot API
const springBootApi = new SpringBootApi()

function App() {
  const [books, setBooks] = useState<Book[]>([])
  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<string | null>(null)
  const [syncProgress, setSyncProgress] = useState<{[key: number]: string}>({})

  // Check if the Spring Boot API is available
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        await springBootApi.verifyCredentials()
        setApiStatus('Connected to Spring Boot API')
      } catch (err) {
        setApiStatus('Unable to connect to Spring Boot API. Make sure it is running.')
        console.error(err)
      }
    }
    checkApiStatus()
  }, [])

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

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md md:max-w-3xl mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-3xl font-bold text-center mb-8">BookStack Sync Tool</h1>
                
                {/* API Status */}
                {apiStatus && (
                  <div className={`mt-4 p-4 ${apiStatus.includes('Unable') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'} rounded-md`}>
                    {apiStatus}
                  </div>
                )}

                {/* Load Books Button */}
                <div className="mb-8">
                  <button
                    onClick={loadBooks}
                    disabled={loading || apiStatus?.includes('Unable')}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading && !books.length ? 'Loading...' : 'Load Books'}
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
                    
                    <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-md">
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
                            <span className="block font-medium">{book.name}</span>
                            {book.description && (
                              <span className="block text-sm text-gray-500 truncate">{book.description}</span>
                            )}
                          </div>
                          {syncProgress[book.id] && (
                            <span className={`text-sm px-2 py-1 rounded ${
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
                    disabled={loading || apiStatus?.includes('Unable') || selectedBookIds.length === 0}
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

                {/* Note about Spring Boot Backend */}
                <div className="mt-8 p-4 bg-blue-50 text-blue-700 rounded-md text-sm">
                  <p><strong>Note:</strong> This application uses a Spring Boot backend for API calls. Make sure the Spring Boot application is running on <code>http://localhost:8080</code>.</p>
                  <p className="mt-2">The Spring Boot backend is configured with the following credentials:</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>Source: <code>https://books.faithconnect.us</code></li>
                    <li>Destination: <code>http://172.17.71.2</code></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
