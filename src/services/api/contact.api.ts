import axios from 'axios';

export type ContactPayload = {
  fullName: string;
  email: string;
  subject: string;
  description: string;
  brand: 'orgatry';
};

export type ContactResponse = {
  status: number;
  message: string;
  data: {
    received: boolean;
  };
};

const CONTACT_API_URL = 'https://task-twerp-pandemic.ngrok-free.dev/api/v1/contact';

/**
 * Public marketing endpoint on a separate backend from the authenticated
 * app API (`@/lib/api`), so this uses a plain axios call instead of the
 * shared `httpClient` — avoids attaching the internal auth token and
 * avoids the shared client's 401/403 interceptors (e.g. redirect to /login).
 */
export const contactApi = {
  async submit(payload: ContactPayload): Promise<ContactResponse> {
    const response = await axios.post<ContactResponse>(CONTACT_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }
};

export function getContactErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Unable to reach the server. Please check your connection and try again.';
    }

    const status = error.response.status;
    const serverMessage = (error.response.data as { message?: string } | undefined)?.message;

    if (serverMessage) {
      return serverMessage;
    }

    if (status >= 500) {
      return 'Something went wrong on our end. Please try again later.';
    }

    if (status >= 400) {
      return 'We could not submit your message. Please check your details and try again.';
    }
  }

  return 'Something went wrong. Please try again.';
}
