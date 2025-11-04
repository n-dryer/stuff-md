import React, { useCallback } from 'react';

import { useDarkMode } from '../hooks/useDarkMode';
import { useSidebarCollapse } from '../hooks/useSidebarCollapse';
import {
  NoteManagementProps,
  SearchProps,
  FilterProps,
  ViewProps,
  InputProps,
  InstructionProps,
  MetadataProps,
} from '../types/mainLayout';
import InstructionsButton from './InstructionsButton';
import LogoutButton from './LogoutButton';
import MainLayoutHeader from './MainLayoutHeader';
import MainLayoutFooter from './MainLayoutFooter';
import NoteInputSection from './NoteInputSection';
import NoteList from './NoteList';
import NoteListErrorBoundary from './NoteListErrorBoundary';
import Sidebar from './Sidebar';
import SidebarToggle from './SidebarToggle';

interface MainLayoutProps
  extends NoteManagementProps,
    SearchProps,
    FilterProps,
    ViewProps,
    InputProps,
    InstructionProps,
    MetadataProps {}

const MainLayout: React.FC<MainLayoutProps> = ({
  notes,
  isNotesLoading,
  requestDeleteNote,
  setEditingNote,
  searchQuery,
  setSearchQuery,
  debouncedSearchQuery,
  activeCategory,
  setActiveCategory,
  activeTags,
  handleTagClick,
  handleClearTags,
  dynamicCategories,
  hasLinks,
  viewMode,
  setViewMode,
  draft,
  setDraft,
  handleSaveNote,
  isSaving,
  noteInputRef,
  onRequestClearOrBlur,
  onDraftSaved,
  customInstructions,
  setShowInstructions,
  instructionsButtonRef,
  logout,
}) => {
  const sidebarId = 'primary-sidebar';
  const { isSidebarCollapsed, toggleSidebar } = useSidebarCollapse();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const handleFocusNoteInput = useCallback(() => {
    if (noteInputRef.current) {
      noteInputRef.current.focus();
      noteInputRef.current.scrollIntoView({
        block: 'end',
        behavior: 'smooth',
      });
    }
  }, [noteInputRef]);

  const handleOpenInstructions = useCallback(() => {
    setShowInstructions(true);
  }, [setShowInstructions]);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    handleClearTags();
    setActiveCategory('ALL');
  }, [handleClearTags, setActiveCategory, setSearchQuery]);

  const sidebarToggleContainerClasses = `flex-shrink-0 w-full flex items-center justify-end mt-4 pt-4 pb-6 ${
    isSidebarCollapsed ? 'pl-3 pr-4' : 'pl-6 pr-3'
  }`;

  const instructionsControl = (
    <InstructionsButton
      customInstructions={customInstructions}
      onOpenInstructions={handleOpenInstructions}
      instructionsButtonRef={instructionsButtonRef}
    />
  );

  const footerLogoutButton = <LogoutButton onLogout={logout} />;

  return (
    <div className='flex h-screen font-mono bg-off-white text-off-black dark:bg-off-black dark:text-white overflow-x-hidden'>
      <a
        href='#main-content'
        className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent-black focus:text-off-white focus:border-2 focus:border-off-white focus:font-bold focus:uppercase focus:font-mono focus:ring-2 focus:ring-offset-4 focus:ring-accent-black dark:focus:bg-off-white dark:focus:text-off-black dark:focus:border-accent-black'
      >
        Skip to Content
      </a>
      <aside
        id={sidebarId}
        className={`
        bg-off-white dark:bg-off-black border-r-2 border-accent-black dark:border-off-white/20 flex flex-col flex-shrink-0 overflow-hidden relative z-10
        transition-[width] duration-300 ease-in-out
        ${isSidebarCollapsed ? 'w-[72px] sm:w-[80px]' : 'w-[280px] md:w-[320px]'}
      `}
      >
        <div className='flex-grow overflow-y-auto overflow-x-hidden'>
          <Sidebar
            dynamicCategories={dynamicCategories}
            hasLinks={hasLinks}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            isCollapsed={isSidebarCollapsed}
          />
        </div>

        <div className={sidebarToggleContainerClasses}>
          <SidebarToggle
            isSidebarCollapsed={isSidebarCollapsed}
            onToggle={toggleSidebar}
            sidebarId={sidebarId}
          />
        </div>
      </aside>

      <div className='flex-1 flex flex-col min-w-0'>
        <MainLayoutHeader
          isSidebarCollapsed={isSidebarCollapsed}
          logoutButton={footerLogoutButton}
        />

        <main
          id='main-content'
          className='flex-1 p-8 overflow-y-auto min-h-0'
          tabIndex={-1}
        >
          <NoteListErrorBoundary>
            <NoteList
              notes={notes}
              isLoading={isNotesLoading}
              activeCategory={activeCategory}
              onDeleteNote={requestDeleteNote}
              viewMode={viewMode}
              setViewMode={setViewMode}
              activeTags={activeTags}
              onTagClick={handleTagClick}
              onClearTags={handleClearTags}
              onEditNote={setEditingNote}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              debouncedSearchQuery={debouncedSearchQuery}
              onFocusNoteInput={handleFocusNoteInput}
              onOpenInstructions={handleOpenInstructions}
              onResetFilters={handleResetFilters}
            />
          </NoteListErrorBoundary>
        </main>

        <NoteInputSection
          isSidebarCollapsed={isSidebarCollapsed}
          noteInputRef={noteInputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onSave={handleSaveNote}
          isSaving={isSaving}
          onRequestClearOrBlur={onRequestClearOrBlur}
          onDraftSaved={onDraftSaved}
        />

        <MainLayoutFooter
          isSidebarCollapsed={isSidebarCollapsed}
          notes={notes}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          instructionsControl={instructionsControl}
        />
      </div>
    </div>
  );
};

export default MainLayout;
