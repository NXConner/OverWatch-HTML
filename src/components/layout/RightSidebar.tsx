import { useStore } from '@/store/useStore';
import { ScorchedCard, TacticalBadge } from '@/components/design-system';
import { Search, Pause, Play, Bookmark, BookmarkCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const RightSidebar = () => {
  const { events, feedPaused, toggleFeedPause, feedFilter, setFeedFilter, activeThreatFilters, markedEvents, toggleEventMark } = useStore();

  const filteredEvents = events
    .filter((e) => activeThreatFilters.includes(e.category))
    .filter((e) =>
      !feedFilter || e.title.toLowerCase().includes(feedFilter.toLowerCase()) ||
      e.platform.toLowerCase().includes(feedFilter.toLowerCase())
    )
    .slice(0, 50);

  const markedCount = markedEvents.length;

  return (
    <aside className="h-full overflow-hidden border-l border-border bg-card flex flex-col">
      {/* Feed header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <span className="text-[9px] font-mono text-muted-foreground tracking-widest">◆ EVENT FEED</span>
        <div className="flex items-center gap-2">
          {markedCount > 0 && (
            <span className="text-[8px] font-mono text-destructive">{markedCount} MARKED</span>
          )}
          <button onClick={toggleFeedPause} className="text-muted-foreground hover:text-foreground transition-colors">
            {feedPaused ? <Play size={12} /> : <Pause size={12} />}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2 bg-secondary px-2 py-1">
          <Search size={10} className="text-muted-foreground" />
          <input
            type="text"
            value={feedFilter}
            onChange={(e) => setFeedFilter(e.target.value)}
            placeholder="Filter events..."
            className="bg-transparent text-[10px] font-mono text-foreground w-full outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filteredEvents.length === 0 ? (
          <div className="text-[10px] font-mono text-muted-foreground text-center py-8">
            {events.length === 0 ? 'AWAITING DATA INGESTION...' : 'NO MATCHING EVENTS'}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filteredEvents.map((event, index) => {
              const isMarked = markedEvents.includes(event.id);
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.02, duration: 0.2 }}
                >
                  <ScorchedCard className={`p-2 ${isMarked ? 'border-destructive' : ''}`} glow>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <TacticalBadge category={event.category} label={`CAT-${event.category}`} />
                          <span className="text-[9px] font-mono text-muted-foreground uppercase">{event.platform}</span>
                          {event.flagged && <span className="text-[8px] text-destructive">⚑</span>}
                        </div>
                        <div className="text-[10px] font-mono text-foreground truncate">{event.title}</div>
                        <div className="text-[8px] font-mono text-ash mt-0.5 line-clamp-1">{event.description}</div>
                        <div className="text-[9px] font-mono text-muted-foreground mt-0.5">
                          {new Date(event.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                          {event.coordinates && (
                            <span className="ml-1 text-ash">
                              [{event.coordinates.lat.toFixed(3)}, {event.coordinates.lng.toFixed(3)}]
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <button onClick={() => toggleEventMark(event.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                          {isMarked ? <BookmarkCheck size={12} className="text-destructive" /> : <Bookmark size={12} />}
                        </button>
                        <div className="w-1.5 h-8 bg-secondary relative overflow-hidden">
                          <div className="absolute bottom-0 w-full bg-primary transition-all" style={{ height: `${event.intensity}%` }} />
                        </div>
                        <span className="text-[7px] font-mono text-muted-foreground">{event.intensity}</span>
                      </div>
                    </div>
                  </ScorchedCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Feed status */}
      <div className="p-2 border-t border-border text-[9px] font-mono text-muted-foreground text-center">
        {filteredEvents.length}/{events.length} EVENTS {feedPaused ? '⏸ PAUSED' : '● LIVE'}
      </div>
    </aside>
  );
};
