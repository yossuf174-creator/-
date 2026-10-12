/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  auth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged,
  User 
} from './firebase';

export const GOOGLE_CHAT_SCOPES = [
  'https://www.googleapis.com/auth/chat.spaces',
  'https://www.googleapis.com/auth/chat.spaces.readonly',
  'https://www.googleapis.com/auth/chat.spaces.create',
  'https://www.googleapis.com/auth/chat.messages',
  'https://www.googleapis.com/auth/chat.messages.create',
  'https://www.googleapis.com/auth/chat.messages.readonly',
  'https://www.googleapis.com/auth/chat.memberships',
  'https://www.googleapis.com/auth/chat.memberships.readonly',
];

export interface ChatSpace {
  name: string; // e.g. "spaces/AAAAAAAAAAA"
  displayName?: string;
  type?: 'SPACE' | 'ROOM' | 'DM' | 'GROUP_CHAT';
  spaceType?: string;
  spaceThreadingState?: string;
}

export interface ChatMessage {
  name: string;
  text?: string;
  createTime?: string;
  sender?: {
    name?: string;
    displayName?: string;
    avatarUrl?: string;
    type?: string;
  };
}

// In-memory token cache (never stored in localStorage/sessionStorage as required by Workspace integration guidelines)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Clear cached token on sign-out
onAuthStateChanged(auth, (user) => {
  if (!user) {
    cachedAccessToken = null;
  }
});

/**
 * Sign in using Google Auth with Google Chat scopes.
 * Caches the OAuth access token strictly in memory.
 */
export async function signInWithGoogleChat(): Promise<{ user: User; accessToken: string }> {
  try {
    isSigningIn = true;
    const provider = new GoogleAuthProvider();
    GOOGLE_CHAT_SCOPES.forEach((scope) => provider.addScope(scope));

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;

    if (!token) {
      throw new Error('Failed to obtain Google Chat OAuth access token from authentication.');
    }

    cachedAccessToken = token;
    return { user: result.user, accessToken: token };
  } catch (error) {
    console.error('Google Chat Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
}

/**
 * Retrieve the active in-memory Google Chat access token.
 */
export function getChatAccessToken(): string | null {
  return cachedAccessToken;
}

/**
 * Clear in-memory token.
 */
export function clearChatAccessToken(): void {
  cachedAccessToken = null;
}

/**
 * List Google Chat Spaces for the authenticated user.
 */
export async function listChatSpaces(token: string): Promise<ChatSpace[]> {
  const response = await fetch('https://chat.googleapis.com/v1/spaces?pageSize=50', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch spaces (HTTP ${response.status})`);
  }

  const data = await response.json();
  return (data.spaces as ChatSpace[]) || [];
}

/**
 * Create a new Google Chat Space.
 * IMPORTANT: Calling code must present an explicit user confirmation dialog first.
 */
export async function createChatSpace(token: string, displayName: string): Promise<ChatSpace> {
  const response = await fetch('https://chat.googleapis.com/v1/spaces', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      displayName,
      spaceType: 'SPACE',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to create space (HTTP ${response.status})`);
  }

  return await response.json();
}

/**
 * List recent messages from a Google Chat Space.
 */
export async function listChatMessages(token: string, spaceName: string): Promise<ChatMessage[]> {
  const response = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages?pageSize=20`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to list messages (HTTP ${response.status})`);
  }

  const data = await response.json();
  return (data.messages as ChatMessage[]) || [];
}

/**
 * Post a message or video card to a Google Chat Space.
 * IMPORTANT: Calling code must present an explicit user confirmation dialog first.
 */
export async function sendChatMessage(
  token: string,
  spaceName: string,
  content: {
    text: string;
    videoDetails?: {
      title: string;
      url: string;
      platform: string;
      format: string;
    };
  }
): Promise<ChatMessage> {
  let bodyPayload: any = {
    text: content.text,
  };

  // If video details are present, format a rich CardV2 widget for Google Chat
  if (content.videoDetails) {
    const v = content.videoDetails;
    bodyPayload = {
      text: content.text,
      cardsV2: [
        {
          cardId: `video-${Date.now()}`,
          card: {
            header: {
              title: v.title,
              subtitle: `${v.platform} • ${v.format} • Extracted via VideoBot Pro`,
              imageUrl: 'https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/video_library/default/48px.svg',
              imageType: 'CIRCLE',
            },
            sections: [
              {
                header: '🎬 Video Details',
                widgets: [
                  {
                    decoratedText: {
                      topLabel: 'Source Platform',
                      text: `<b>${v.platform}</b>`,
                      startIcon: { knownIcon: 'VIDEO_CAMERA' },
                    },
                  },
                  {
                    decoratedText: {
                      topLabel: 'Extraction Format',
                      text: `<b>${v.format}</b>`,
                      startIcon: { knownIcon: 'DESCRIPTION' },
                    },
                  },
                  {
                    buttonList: {
                      buttons: [
                        {
                          text: '▶ Watch & Download',
                          onClick: {
                            openLink: {
                              url: v.url,
                            },
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    };
  }

  const response = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyPayload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to send message (HTTP ${response.status})`);
  }

  return await response.json();
}
