import { SessionHistoryPage } from './pages/SessionHistoryPage';
import type { SessionHistoryPageProps } from './types/history.types';

export function SessionArchivePage(props: SessionHistoryPageProps) {
  return <SessionHistoryPage {...props} />;
}

export default SessionArchivePage;
