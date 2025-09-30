import { create } from 'zustand';
import { Platform, platformService } from '../services/platform.service';

interface PlatformState {
  platforms: Platform[];
  loading: boolean;
  error: string | null;
  fetchPlatforms: () => Promise<void>;
  addPlatform: (platform: Partial<Platform>) => Promise<void>;
  updatePlatform: (id: string, platform: Partial<Platform>) => Promise<void>;
  removePlatform: (id: string) => Promise<void>;
}

const usePlatformStore = create<PlatformState>((set, get) => ({
  platforms: [],
  loading: false,
  error: null,
  
  fetchPlatforms: async () => {
    set({ loading: true, error: null });
    try {
      const platforms = await platformService.getAll();
      set({ platforms, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch platforms', loading: false });
    }
  },
  
  addPlatform: async (platform) => {
    try {
      const newPlatform = await platformService.create(platform);
      set(state => ({
        platforms: [...state.platforms, newPlatform]
      }));
    } catch (error) {
      set({ error: 'Failed to add platform' });
    }
  },
  
  updatePlatform: async (id, platform) => {
    try {
      const updatedPlatform = await platformService.update(id, platform);
      set(state => ({
        platforms: state.platforms.map(p => p.id === id ? updatedPlatform : p)
      }));
    } catch (error) {
      set({ error: 'Failed to update platform' });
    }
  },
  
  removePlatform: async (id) => {
    try {
      await platformService.delete(id);
      set(state => ({
        platforms: state.platforms.filter(p => p.id !== id)
      }));
    } catch (error) {
      set({ error: 'Failed to remove platform' });
    }
  },
}));

export default usePlatformStore;