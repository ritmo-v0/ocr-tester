import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types & Interfaces
interface NicknameStoreProps {
	nickname: string;
	setNickname: (nickname: string) => void;
}



export const useNicknameStore = create<NicknameStoreProps>()(
	persist(
		set => ({
			nickname: "",
			setNickname: (nickname: string) => set({ nickname }),
		}),
		{ name: "user-nickname" }
	)
);