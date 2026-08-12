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

// const apiUrl = NEXT_PUBLIC_API_URL
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

/**
 * Public marketing endpoint on a separate backend from the authenticated
 * app API (`@/lib/api`), so this uses a plain axios call instead of the
 * shared `httpClient` — avoids attaching the internal auth token and
 * avoids the shared client's 401/403 interceptors (e.g. redirect to /login).
 */
export const contactApi = {
  async submit(payload: ContactPayload): Promise<ContactResponse> {
    const response = await axios.post<ContactResponse>(apiUrl, payload, {
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
