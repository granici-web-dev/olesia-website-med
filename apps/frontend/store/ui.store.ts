import { create } from 'zustand';

interface UIStore {
  isMobileMenuOpen: boolean;
  isBookingModalOpen: boolean;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  openBookingModal: () => void;
  closeBookingModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isMobileMenuOpen: false,
  isBookingModalOpen: false,
  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  openBookingModal: () => set({ isBookingModalOpen: true }),
  closeBookingModal: () => set({ isBookingModalOpen: false }),
}));