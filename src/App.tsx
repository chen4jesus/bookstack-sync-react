import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Book } from './services/bookstackApi'
import SpringBootApi from './services/springBootApi'
import { ConfigForm, CONFIG_UPDATED_EVENT } from './components/ConfigForm'
import './i18n/i18n' // Import i18n configuration
import './App.css'

// Create a single instance of the Spring Boot API
const springBootApi = new SpringBootApi()

// Books per page for pagination
const ITEMS_PER_PAGE = 15;

// Type for view mode
type ViewMode = 'list' | 'grid';

// Type for sort options
type SortOption = 'name' | 'created_at' | 'updated_at';

// Type for sort direction
type SortDirection = 'asc' | 'desc';

// Language switcher component
function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  return (
    <div className="flex space-x-2">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-2 py-1 text-sm rounded ${
          i18n.language === 'en' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'
        }`}
      >
        English
      </button>
      <button
        onClick={() => changeLanguage('zh')}
        className={`px-2 py-1 text-sm rounded ${
          i18n.language === 'zh' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'
        }`}
      >
        中文
      </button>
    </div>
  );
}

// Modal component for displaying book descriptions
function DescriptionModal({ 
  book, 
  onClose 
}: { 
  book: Book | null, 
  onClose: () => void 
}) {
  const { t } = useTranslation();
  
  if (!book) return null;

  // Add keyboard event listener for ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Clean up on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

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
            {t('buttons.close')}
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
  const { t } = useTranslation();
  
  // Add keyboard event listener for ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Clean up on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel]);

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
            {t('buttons.cancel')}
          </button>
          <button 
            onClick={onConfirm}
            className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {t('buttons.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}

// Search bar component
function SearchBar({
  query,
  onChange,
  onClear
}: {
  query: string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onClear: () => void
}) {
  const { t } = useTranslation();

  return (
    <div className="relative w-full mb-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-500" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <input
          type="search"
          className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
          placeholder={t('filters.search')}
          value={query}
          onChange={onChange}
        />
        {query && (
          <button
            onClick={onClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// Filter and sort controls
function FilterControls({
  sortOption,
  sortDirection,
  onSortChange,
  language,
  onLanguageChange,
  syncStatus,
  onSyncStatusChange,
  viewMode,
  onViewModeChange,
  totalBooks,
  inDestinationCount,
  syncingCount,
  notSyncedCount
}: {
  sortOption: SortOption,
  sortDirection: SortDirection,
  onSortChange: (option: SortOption) => void,
  language: string,
  onLanguageChange: (language: string) => void,
  syncStatus: string,
  onSyncStatusChange: (status: string) => void,
  viewMode: ViewMode,
  onViewModeChange: (mode: ViewMode) => void,
  totalBooks: number,
  inDestinationCount?: number,
  syncingCount?: number,
  notSyncedCount?: number
}) {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
      <div className="text-sm text-gray-600">
        {t('status.booksFound', { count: totalBooks })}
      </div>
      
      <div className="flex flex-wrap gap-2 items-center">
        {/* Language filter */}
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
        >
          <option value="all">{t('filters.allLanguages')}</option>
          <option value="english">{t('filters.english')}</option>
          <option value="chinese">{t('filters.chinese')}</option>
        </select>
        
        {/* Sync status filter */}
        <select
          value={syncStatus}
          onChange={(e) => onSyncStatusChange(e.target.value)}
          className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
        >
          <option value="all">{t('filters.allStatus')}</option>
          {inDestinationCount !== undefined && (
            <option value="in-destination">{t('filters.inDestination')} ({inDestinationCount})</option>
          )}
          {syncingCount !== undefined && (
            <option value="syncing">{t('filters.currentlySyncing')} ({syncingCount})</option>
          )}
          {notSyncedCount !== undefined && (
            <option value="not-synced">{t('filters.notSynced')} ({notSyncedCount})</option>
          )}
          {inDestinationCount === undefined && (
            <option value="in-destination">{t('filters.inDestination')}</option>
          )}
          {syncingCount === undefined && (
            <option value="syncing">{t('filters.currentlySyncing')}</option>
          )}
          {notSyncedCount === undefined && (
            <option value="not-synced">{t('filters.notSynced')}</option>
          )}
        </select>
        
        {/* Sort options */}
        <select
          value={`${sortOption}-${sortDirection}`}
          onChange={(e) => {
            const [option, direction] = e.target.value.split('-') as [SortOption, SortDirection];
            onSortChange(option);
            // The onSortChange toggles direction if option is the same, so only set it explicitly if changing option
            if (option !== sortOption) {
              // Additional logic in onSortChange
            }
          }}
          className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
        >
          <option value="name-asc">{t('filters.sortNameAsc')}</option>
          <option value="name-desc">{t('filters.sortNameDesc')}</option>
          <option value="created_at-desc">{t('filters.sortNewest')}</option>
          <option value="created_at-asc">{t('filters.sortOldest')}</option>
          <option value="updated_at-desc">{t('filters.sortRecentlyUpdated')}</option>
          <option value="updated_at-asc">{t('filters.sortLeastRecentlyUpdated')}</option>
        </select>
        
        {/* View mode toggles */}
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700'}`}
            title={t('tooltips.listView')}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700'}`}
            title={t('tooltips.gridView')}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Pagination controls
function PaginationControls({
  currentPage,
  totalPages,
  onPageChange
}: {
  currentPage: number,
  totalPages: number,
  onPageChange: (page: number) => void
}) {
  // Generate page buttons (show max 5 pages with current in the middle when possible)
  const getPageNumbers = (): number[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Current page is close to start
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }
    
    // Current page is close to end
    if (currentPage >= totalPages - 2) {
      return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    
    // Current page is in the middle
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-4">
      <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
        {/* First page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
            currentPage === 1 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
        >
          <span className="sr-only">First</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* Previous page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-2 py-2 border ${
            currentPage === 1 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
        >
          <span className="sr-only">Previous</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* Page numbers */}
        {getPageNumbers().map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`relative inline-flex items-center px-4 py-2 border ${
              currentPage === page
                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            } text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
          >
            {page}
          </button>
        ))}
        
        {/* Next page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center px-2 py-2 border ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
        >
          <span className="sr-only">Next</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* Last page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
        >
          <span className="sr-only">Last</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </nav>
    </div>
  );
}

// Book card for grid view
function BookCard({
  book,
  isSelected,
  onSelect,
  onDetails,
  syncProgress,
  isInDestination
}: {
  book: Book,
  isSelected: boolean,
  onSelect: () => void,
  onDetails: () => void,
  syncProgress?: string,
  isInDestination: boolean
}) {
  const { t } = useTranslation();

  // Truncate description for cards
  const truncateDescription = (text: string, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div 
      className={`border rounded-lg overflow-hidden shadow-sm transition-all duration-200 cursor-pointer ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:shadow-md'
      }`}
      onClick={(e) => {
        // Prevent selection when clicking on buttons or checkbox
        if (e.target instanceof HTMLElement && 
            (e.target.tagName === 'BUTTON' || 
             e.target.tagName === 'INPUT' || 
             e.target.closest('button') || 
             e.target.closest('input'))) {
          return;
        }
        onSelect();
      }}
    >
      <div className="p-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onSelect}
                className="h-4 w-4 mt-1.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
              <h3 className="ml-3 text-lg font-medium break-words pr-2" title={book.name}>
                {book.name}
              </h3>
            </div>
          </div>
          
          {/* Status indicators in their own row */}
          <div className="flex flex-wrap gap-1 ml-7">
            {isInDestination && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800" title={t('tooltips.inDestination')}>
                {t('status.inDestination')}
              </span>
            )}
            {!isInDestination && syncProgress && syncProgress !== 'completed' && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {syncProgress}
              </span>
            )}
            {!isInDestination && !syncProgress && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800" title={t('tooltips.notSynced')}>
                {t('status.notSynced')}
              </span>
            )}
          </div>
        </div>
        
        <p className="mt-2 text-sm text-gray-600">
          {truncateDescription(book.description || t('book.noDescription'))}
        </p>
        
        <div className="mt-4 flex justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDetails();
            }}
            className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            {t('buttons.viewDetails')}
          </button>
          <div className="text-xs text-gray-500">
            {t('book.updated')} {new Date(book.updated_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}

// Grid view for books
function BookGrid({
  books,
  selectedBookIds,
  onSelect,
  onDetails,
  syncProgress,
  destinationBooks,
  isBookInDestination
}: {
  books: Book[],
  selectedBookIds: number[],
  onSelect: (bookId: number) => void,
  onDetails: (book: Book) => void,
  syncProgress: {[key: number]: string},
  destinationBooks: Book[],
  isBookInDestination: (book: Book) => boolean
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {books.map(book => (
        <BookCard
          key={book.id}
          book={book}
          isSelected={selectedBookIds.includes(book.id)}
          onSelect={() => onSelect(book.id)}
          onDetails={() => onDetails(book)}
          syncProgress={syncProgress[book.id]}
          isInDestination={isBookInDestination(book)}
        />
      ))}
    </div>
  );
}

// List view for books
function BookList({
  books,
  selectedBookIds,
  onSelect,
  onDetails,
  syncProgress,
  destinationBooks,
  isBookInDestination
}: {
  books: Book[],
  selectedBookIds: number[],
  onSelect: (bookId: number) => void,
  onDetails: (book: Book) => void,
  syncProgress: {[key: number]: string},
  destinationBooks: Book[],
  isBookInDestination: (book: Book) => boolean
}) {
  const { t } = useTranslation();
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-3 py-3 text-left">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={selectedBookIds.length > 0 && selectedBookIds.length === books.length}
                onChange={() => {
                  // This is handled by the parent component
                }}
              />
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('tableHeaders.name')}
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('tableHeaders.description')}
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('tableHeaders.updated')}
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('tableHeaders.status')}
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('tableHeaders.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {books.map(book => (
            <tr 
              key={book.id} 
              className={`${selectedBookIds.includes(book.id) ? 'bg-blue-50' : ''} cursor-pointer hover:bg-gray-50`}
              onClick={(e) => {
                // Prevent selection when clicking on buttons or checkbox
                if (e.target instanceof HTMLElement && 
                    (e.target.tagName === 'BUTTON' || 
                     e.target.tagName === 'INPUT' || 
                     e.target.closest('button') || 
                     e.target.closest('input'))) {
                  return;
                }
                onSelect(book.id);
              }}
            >
              <td className="px-3 py-4">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={selectedBookIds.includes(book.id)}
                  onChange={() => onSelect(book.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </td>
              <td className="px-3 py-4 text-sm max-w-[200px] break-words">
                {book.name}
              </td>
              <td className="px-3 py-4 text-sm text-gray-600 max-w-[300px] truncate">
                {book.description || t('book.noDescription')}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(book.updated_at).toLocaleDateString()}
              </td>
              <td className="px-3 py-4 whitespace-normal text-sm">
                <div className="flex flex-wrap gap-1">
                  {isBookInDestination(book) && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      {t('status.inDestination')}
                    </span>
                  )}
                  {!isBookInDestination(book) && syncProgress[book.id] && syncProgress[book.id] !== 'completed' && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {syncProgress[book.id]}
                    </span>
                  )}
                  {!isBookInDestination(book) && !syncProgress[book.id] && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {t('status.notSynced')}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDetails(book);
                  }}
                  className="text-blue-600 hover:text-blue-900 mr-3"
                >
                  {t('buttons.details')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function App() {
  const { t } = useTranslation();
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
  
  // New state variables for UI improvements
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [sortOption, setSortOption] = useState<SortOption>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [language, setLanguage] = useState<string>('all')
  const [syncStatus, setSyncStatus] = useState<string>('all')
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth)

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

  // Add window resize listener for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle tab change
  const handleTabChange = (tab: 'books' | 'manage' | 'config') => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset pagination when changing tabs
    setSearchQuery(''); // Clear search when changing tabs
    
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
    if (selectedBookIds.length === currentBooks.length) {
      setSelectedBookIds([])
    } else {
      setSelectedBookIds(currentBooks.map(book => book.id))
    }
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
    if (selectedDestinationBookIds.length === currentDestinationBooks.length) {
      setSelectedDestinationBookIds([])
    } else {
      setSelectedDestinationBookIds(currentDestinationBooks.map(book => book.id))
    }
  }

  // Reset pagination when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOption, sortDirection, language, syncStatus]);

  // Check if book matches language filter
  const matchesLanguage = (book: Book): boolean => {
    if (language === 'all') return true;

    // Simple language detection - you might want to enhance this with proper language detection
    if (language === 'english' && !containsCJK(book.name)) return true;
    if (language === 'chinese' && containsCJK(book.name)) return true;

    return false;
  };

  // Helper to detect Chinese, Japanese, Korean characters
  const containsCJK = (text: string): boolean => {
    const cjkRegex = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;
    return cjkRegex.test(text);
  };

  // Check if book matches sync status filter
  const matchesSyncStatus = (book: Book): boolean => {
    if (syncStatus === 'all') return true;
    
    // Check if the book is in the destination
    const isInDestination = destinationBooks.some(destBook => destBook.name === book.name);
    
    // Check if the book has a sync operation in progress
    const isSyncing = syncProgress[book.id] && syncProgress[book.id] !== 'completed';
    
    // Match based on filter selection
    if (syncStatus === 'in-destination' && isInDestination) return true;
    if (syncStatus === 'syncing' && isSyncing) return true;
    if (syncStatus === 'not-synced' && !isInDestination && !isSyncing) return true;
    
    return false;
  };

  // Sort books based on current sort option and direction
  const sortBooks = (a: Book, b: Book): number => {
    let comparison = 0;
    
    switch (sortOption) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'updated_at':
        comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        break;
      default:
        comparison = a.name.localeCompare(b.name);
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  };

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    return books
      .filter(book => (
        (book.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         book.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
        matchesLanguage(book) &&
        matchesSyncStatus(book)
      ))
      .sort(sortBooks);
  }, [books, searchQuery, sortOption, sortDirection, language, syncStatus, destinationBooks]);

  // Filter and sort destination books
  const filteredDestinationBooks = useMemo(() => {
    return destinationBooks
      .filter(book => (
        (book.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         book.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
        matchesLanguage(book)
      ))
      .sort(sortBooks);
  }, [destinationBooks, searchQuery, sortOption, sortDirection, language]);

  // Calculate total pages for source books
  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / ITEMS_PER_PAGE));

  // Calculate total pages for destination books
  const totalDestinationPages = Math.max(1, Math.ceil(filteredDestinationBooks.length / ITEMS_PER_PAGE));

  // Get current page books
  const currentBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredBooks, currentPage]);

  // Get current page destination books
  const currentDestinationBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDestinationBooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredDestinationBooks, currentPage]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle sort change
  const handleSortChange = (option: SortOption) => {
    if (sortOption === option) {
      // Toggle direction if same option
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortOption(option);
      setSortDirection('asc');
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    // Save preference in localStorage
    localStorage.setItem('bookstack-view-mode', mode);
  };

  // Load saved view mode preference
  useEffect(() => {
    const savedViewMode = localStorage.getItem('bookstack-view-mode') as ViewMode | null;
    if (savedViewMode && (savedViewMode === 'list' || savedViewMode === 'grid')) {
      setViewMode(savedViewMode);
    } else if (windowWidth < 768) {
      // Default to list view on mobile
      setViewMode('list');
    }
  }, []);

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

  // Calculate counts for status badges
  const inDestinationCount = useMemo(() => {
    return books.filter(book => 
      destinationBooks.some(destBook => destBook.name === book.name)
    ).length;
  }, [books, destinationBooks]);

  const syncingCount = useMemo(() => {
    return books.filter(book => 
      syncProgress[book.id] && 
      syncProgress[book.id] !== 'completed' &&
      !destinationBooks.some(destBook => destBook.name === book.name)
    ).length;
  }, [books, destinationBooks, syncProgress]);

  const notSyncedCount = useMemo(() => {
    return books.filter(book => 
      !destinationBooks.some(destBook => destBook.name === book.name) &&
      (!syncProgress[book.id] || syncProgress[book.id] === 'Failed')
    ).length;
  }, [books, destinationBooks, syncProgress]);

  // Helper functions to check book status
  const isBookInDestination = (book: Book): boolean => {
    return destinationBooks.some(destBook => destBook.name === book.name);
  };

  const handleDeleteBook = async (book: Book) => {
    setBookToDelete(book);
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">{t('app.title')}</h1>
      
      <div className="flex flex-col min-h-screen">
        {apiStatus && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <p className="text-green-800 text-center">{apiStatus}</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800 text-center">{error}</p>
            <div className="flex justify-center mt-2">
              <button
                onClick={() => setError(null)}
                className="text-red-800 font-medium text-sm hover:text-red-900 focus:outline-none"
              >
                {t('buttons.dismiss')}
              </button>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <p className="text-green-800 text-center">{success}</p>
            <div className="flex justify-center mt-2">
              <button
                onClick={() => setSuccess(null)}
                className="text-green-800 font-medium text-sm hover:text-green-900 focus:outline-none"
              >
                {t('buttons.dismiss')}
              </button>
            </div>
          </div>
        )}
        
        {destroyStatus && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <p className="text-green-800 text-center">{destroyStatus}</p>
            <div className="flex justify-center mt-2">
              <button
                onClick={() => setDestroyStatus(null)}
                className="text-green-800 font-medium text-sm hover:text-green-900 focus:outline-none"
              >
                {t('buttons.dismiss')}
              </button>
            </div>
          </div>
        )}
        
        <div className="mb-6 flex justify-between items-center">
          <nav className="flex border-b border-gray-200">
            <button
              onClick={() => handleTabChange('books')}
              className={`px-4 py-2 font-medium text-sm focus:outline-none ${
                activeTab === 'books'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('tabs.sourceBooks')}
            </button>
            <button
              onClick={() => handleTabChange('manage')}
              className={`px-4 py-2 font-medium text-sm focus:outline-none ${
                activeTab === 'manage'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('tabs.destinationBooks')}
            </button>
            <button
              onClick={() => handleTabChange('config')}
              className={`px-4 py-2 font-medium text-sm focus:outline-none ${
                activeTab === 'config'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('tabs.configuration')}
            </button>
          </nav>
          
          <LanguageSwitcher />
        </div>
        
        {activeTab === 'books' && (
          <div>
            <button
              onClick={loadBooks}
              className="w-full py-3 px-4 text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-6"
              disabled={loading}
            >
              {loading ? t('app.loading') : t('buttons.loadSourceBooks')}
            </button>
            
            <div className="min-h-[600px]">
              {books.length > 0 && (
                <div>
                  {/* Search Bar */}
                  <SearchBar 
                    query={searchQuery}
                    onChange={handleSearchChange}
                    onClear={() => setSearchQuery('')}
                  />
                  
                  {/* Filtering and View Controls */}
                  <FilterControls
                    sortOption={sortOption}
                    sortDirection={sortDirection}
                    onSortChange={handleSortChange}
                    language={language}
                    onLanguageChange={setLanguage}
                    syncStatus={syncStatus}
                    onSyncStatusChange={setSyncStatus}
                    viewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                    totalBooks={filteredBooks.length}
                    inDestinationCount={inDestinationCount}
                    syncingCount={syncingCount}
                    notSyncedCount={notSyncedCount}
                  />
                  
                  <div className="mb-4 flex justify-between items-center">
                    <div>
                      <button
                        onClick={handleSelectAll}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium focus:outline-none"
                      >
                        {selectedBookIds.length === currentBooks.length && currentBooks.length > 0
                          ? t('selection.deselectAll')
                          : t('selection.selectAll')}
                      </button>
                      <span className="ml-2 text-sm text-gray-600">
                        {t('status.booksSelected', { count: selectedBookIds.length })}
                      </span>
                    </div>
                    
                    <button
                      onClick={handleSync}
                      disabled={selectedBookIds.length === 0 || loading}
                      className={`py-2 px-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        selectedBookIds.length === 0 || loading
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                      }`}
                    >
                      {loading ? t('app.loading') : t('buttons.syncSelected')}
                    </button>
                  </div>
                  
                  <div className="min-h-[400px]">
                    {viewMode === 'grid' ? (
                      <BookGrid
                        books={currentBooks}
                        selectedBookIds={selectedBookIds}
                        onSelect={handleBookSelection}
                        onDetails={setActiveBook}
                        syncProgress={syncProgress}
                        destinationBooks={destinationBooks}
                        isBookInDestination={isBookInDestination}
                      />
                    ) : (
                      <BookList
                        books={currentBooks}
                        selectedBookIds={selectedBookIds}
                        onSelect={handleBookSelection}
                        onDetails={setActiveBook}
                        syncProgress={syncProgress}
                        destinationBooks={destinationBooks}
                        isBookInDestination={isBookInDestination}
                      />
                    )}
                  </div>
                  
                  {/* Pagination Controls */}
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                  
                  <div className="mt-4 text-sm text-gray-600">
                    <span>{t('status.booksSelectedTotal', { count: selectedBookIds.length, total: books.length })}</span>
                  </div>
                </div>
              )}
              
              {books.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                  <p>{t('app.noBooks', { action: t('buttons.loadSourceBooks') })}</p>
                </div>
              )}
              
              {loading && books.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[400px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="mt-4 text-gray-600">{t('app.loading')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div>
            <button
              onClick={loadDestinationBooks}
              className="w-full py-3 px-4 text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-6"
              disabled={loading}
            >
              {loading ? t('app.loading') : t('buttons.loadDestinationBooks')}
            </button>
            
            <div className="min-h-[600px]">
              {destinationBooks.length > 0 && (
                <div>
                  {/* Search Bar */}
                  <SearchBar 
                    query={searchQuery}
                    onChange={handleSearchChange}
                    onClear={() => setSearchQuery('')}
                  />
                  
                  {/* Filtering and View Controls */}
                  <FilterControls
                    sortOption={sortOption}
                    sortDirection={sortDirection}
                    onSortChange={handleSortChange}
                    language={language}
                    onLanguageChange={setLanguage}
                    syncStatus={syncStatus}
                    onSyncStatusChange={setSyncStatus}
                    viewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                    totalBooks={filteredDestinationBooks.length}
                  />
                  
                  <div className="mb-4 flex justify-between items-center">
                    <div>
                      <button
                        onClick={handleSelectAllDestination}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium focus:outline-none"
                      >
                        {selectedDestinationBookIds.length === destinationBooks.length && destinationBooks.length > 0
                          ? t('selection.deselectAll')
                          : t('selection.selectAll')}
                      </button>
                      <span className="ml-2 text-sm text-gray-600">
                        {t('status.booksSelected', { count: selectedDestinationBookIds.length })}
                      </span>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={handleDeleteMultipleBooks}
                        disabled={selectedDestinationBookIds.length === 0 || loading}
                        className={`py-2 px-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          selectedDestinationBookIds.length === 0 || loading
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                        }`}
                      >
                        {t('buttons.deleteSelected')}
                      </button>
                      <button
                        onClick={() => setShowDestroyConfirm(true)}
                        className="py-2 px-4 bg-red-600 text-white hover:bg-red-700 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        {t('buttons.destroyAll')}
                      </button>
                    </div>
                  </div>
                  
                  <div className="min-h-[400px]">
                    {viewMode === 'grid' ? (
                      <BookGrid
                        books={currentDestinationBooks}
                        selectedBookIds={selectedDestinationBookIds}
                        onSelect={handleDestinationBookSelection}
                        onDetails={setActiveBook}
                        syncProgress={syncProgress}
                        destinationBooks={destinationBooks}
                        isBookInDestination={isBookInDestination}
                      />
                    ) : (
                      <BookList
                        books={currentDestinationBooks}
                        selectedBookIds={selectedDestinationBookIds}
                        onSelect={handleDestinationBookSelection}
                        onDetails={setActiveBook}
                        syncProgress={syncProgress}
                        destinationBooks={destinationBooks}
                        isBookInDestination={isBookInDestination}
                      />
                    )}
                  </div>
                  
                  {/* Pagination Controls */}
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalDestinationPages}
                    onPageChange={handlePageChange}
                  />
                  
                  <div className="mt-4 text-sm text-gray-600">
                    <span>{t('status.booksSelectedTotal', { count: selectedDestinationBookIds.length, total: destinationBooks.length })}</span>
                  </div>
                </div>
              )}
              
              {destinationBooks.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                  <p>{t('app.noBooks', { action: t('buttons.loadDestinationBooks') })}</p>
                </div>
              )}
              
              {loading && destinationBooks.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[400px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="mt-4 text-gray-600">{t('app.loading')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="min-h-[600px]">
            <ConfigForm />
          </div>
        )}
      </div>

      {/* Modals - positioned outside the main container for proper z-index layering */}
      {activeBook && (
        <DescriptionModal book={activeBook} onClose={() => setActiveBook(null)} />
      )}
      
      {bookToDelete && (
        <ConfirmationModal
          title={t('modals.confirmDelete')}
          message={t('modals.confirmDeleteMessage', { name: bookToDelete.name })}
          onConfirm={confirmDeleteBook}
          onCancel={cancelDeleteBook}
        />
      )}
      
      {showDestroyConfirm && (
        <ConfirmationModal
          title={t('modals.confirmDestroyAll')}
          message={t('modals.confirmDestroyMessage')}
          onConfirm={handleDestroy}
          onCancel={() => setShowDestroyConfirm(false)}
        />
      )}
    </div>
  )
}

export default App;