import { useEffect, useRef } from 'react';

const CHANNEL_NAME = 'admin-sync';
let channel = null;

function getChannel() {
  if (typeof BroadcastChannel === 'undefined') return null;
  if (!channel) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
    } catch {
      return null;
    }
  }
  return channel;
}

export const SYNC_EVENTS = {
  PROJECT_CREATED: 'project-created',
  PROJECT_UPDATED: 'project-updated',
  PROJECT_DELETED: 'project-deleted',
  TEAM_UPDATED: 'team-updated',
  SETTINGS_UPDATED: 'settings-updated',
  DOCUMENTS_UPDATED: 'documents-updated',
  VOLUNTEERS_UPDATED: 'volunteers-updated',
  COMMENTS_UPDATED: 'comments-updated',
};

export function broadcast(eventType, payload = {}) {
  const message = JSON.stringify({ type: eventType, ...payload, timestamp: Date.now() });
  const bc = getChannel();
  if (bc) {
    bc.postMessage(message);
  }
  try {
    localStorage.setItem(CHANNEL_NAME, message);
    localStorage.removeItem(CHANNEL_NAME);
  } catch {
  }
}

export function useSyncListener(eventTypes, callback) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (eventTypes.includes(data.type)) {
          callbackRef.current(data);
        }
      } catch {
      }
    };

    const bc = getChannel();
    if (bc) {
      bc.addEventListener('message', handleMessage);
    }

    const handleStorage = (event) => {
      if (event.key !== CHANNEL_NAME || !event.newValue) return;
      handleMessage({ data: event.newValue });
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (bc) {
        bc.removeEventListener('message', handleMessage);
      }
      window.removeEventListener('storage', handleStorage);
    };
  }, [eventTypes]);
}
