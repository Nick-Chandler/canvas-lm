import './Dashboard.css';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { createWorkspaceAction } from '@/app/lib/actions';
import { getAllWorkspaces } from '@/app/lib/db';
import { timeAgo } from '@/app/lib/utils';
import WorkspaceCardActions from './WorkspaceCardActions';

export default async function DashboardPage() {
  const { userId } = await auth();
  const workspaces = userId ? await getAllWorkspaces(userId) : [];

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <form action={createWorkspaceAction}>
          <button type="submit" className="new-diagram-btn">New diagram</button>
        </form>
        <UserButton />
      </header>

      <h2 className="dashboard-section-title">Recent files</h2>

      <div className="workspace-grid">
        {workspaces.map(ws => (
          <div key={ws.id} className="workspace-card">
            <Link href={`/canvas/${ws.id}`} className="workspace-card-link">
              <div className="workspace-card-preview" />
              <div className="workspace-card-footer">
                <span className="workspace-card-name">{ws.ws_name ?? 'Untitled diagram'}</span>
                <span className="workspace-card-updated">{timeAgo(ws.updated_at)}</span>
              </div>
            </Link>
            <WorkspaceCardActions id={ws.id} name={ws.ws_name ?? 'Untitled diagram'} />
          </div>
        ))}
      </div>
    </main>
  );
}
