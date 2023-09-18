import { create } from 'zustand';
import {
  type Event,
  type PublishedEventsProps,
  type CreateEventsProps,
  type UpdateEventsProps
} from '../interfaces/events';

import {
  createEventRequest,
  deleteEventsRequest,
  getEventsRequest,
  publishedEventsRequest,
  updateEventsRequest
} from '../api/events';

interface MessageEventProps {
  ok: boolean;
  msg: Array<Record<'message', string>>;
}

interface State {
  events: Event[];
  activeEvent: Event | null;
  messageEvent: MessageEventProps | undefined;
}
interface Actions {
  startLoadingEvents: () => Promise<void>;
  startSavingEvents: (value: CreateEventsProps) => Promise<void>;
  startPublishEvents: ({
    dataVideo,
    idVideo
  }: PublishedEventsProps) => Promise<void>;
  setActiveEvents: (value: Event) => void;
  startUpdateEvents: ({ id, dataVideo }: UpdateEventsProps) => Promise<void>;
  startDeleteEvents: (value: number) => Promise<void>;
}

export const useVideoBoxStore = create<State & Actions>((set, get) => {
  return {
    events: [],
    messageEvent: undefined,
    activeEvent: null,
    setActiveEvents: (valueEvent) => {
      set({ activeEvent: valueEvent });
    },
    startLoadingEvents: async () => {
      try {
        const { data } = await getEventsRequest();
        set({ events: data.events });
      } catch (error) {
        console.log(error);
        console.log('Error al cargar los eventos');
      }
    },
    startSavingEvents: async (videoEvent) => {
      try {
        const { data } = await createEventRequest({
          url: videoEvent.url,
          title: videoEvent.title
        });
        set((state) => ({
          events: state.events.concat(data.event)
        }));
        set({ messageEvent: data });
      } catch (error: any) {
        set({ messageEvent: error.response.data });
      } finally {
        setTimeout(() => {
          set({ messageEvent: undefined });
        }, 3000);
      }
    },
    startPublishEvents: async ({ idVideo, dataVideo }) => {
      const { events } = get();
      try {
        const { data } = await publishedEventsRequest({
          idVideo,
          dataVideo
        });
        const newEvents = events.map((event) => {
          if (event.id_video === idVideo) {
            return { ...data.video };
          }
          return event;
        });
        set({ messageEvent: data, events: newEvents });
      } catch (error) {
        console.log(error);
      } finally {
        setTimeout(() => {
          set({ messageEvent: undefined });
        }, 3000);
      }
    },
    startUpdateEvents: async ({ id, dataVideo }) => {
      const { events } = get();
      try {
        const { data } = await updateEventsRequest({ id, dataVideo });
        const newEvents = events.map((event) => {
          if (event.id_video === id) {
            return { ...data.video };
          }
          return event;
        });
        set({ messageEvent: data, events: newEvents });
      } catch (error: any) {
        set({ messageEvent: error.response.data });
        console.log(error);
      } finally {
        setTimeout(() => {
          set({ messageEvent: undefined });
        }, 3000);
      }
    },
    startDeleteEvents: async (id: number) => {
      const { events } = get();
      try {
        const { data } = await deleteEventsRequest(id);
        const newEvents = events.filter((event) => event.id_video !== id);
        set({ events: newEvents, messageEvent: data });
      } catch (error: any) {
        console.log(error);
      } finally {
        setTimeout(() => {
          set({ messageEvent: undefined });
        }, 3000);
      }
    }
  };
});
