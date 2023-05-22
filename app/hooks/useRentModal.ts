// zustand là 1 thư viện state management
import { create } from 'zustand'

interface RentModalStore {
    isOpen: boolean
    onOpen: () => void
    onClose: () => void
}

const useRentModal = create<RentModalStore>((set) => ({
    isOpen: false,
    onOpen: () => set({isOpen: true}),
    onClose: () => set({isOpen: false})
}));

export default useRentModal;