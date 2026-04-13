import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DEFAULT_IMAGE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/158.png';

export const useUserStore = defineStore('user', () => {
  const user = ref({
    id: '',
    name: '',
    email: '',
    phone: '',
    avatarUrl: '',
    createdAt: '',
  });

  async function fetchUser() {
    if (user.value.id) return; // 이미 불러왔으면 스킵
    try {
      const res = await axios.get(`${BASE_URL}/users/1`);
      const u = res.data;
      user.value = {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        avatarUrl: u.profileImage?.startsWith('data:')
          ? u.profileImage
          : DEFAULT_IMAGE,
        createdAt: u.createdAt,
      };
    } catch (e) {
      console.error('유저 데이터 로드 실패:', e);
    }
  }

  async function updateUser(form) {
    try {
      await axios.put(`${BASE_URL}/users/1`, {
        id: '1',
        name: form.name,
        email: form.email,
        phone: form.phone,
        profileImage: form.avatarUrl,
        createdAt: user.value.createdAt,
      });
      user.value = { ...user.value, ...form };
    } catch (e) {
      console.error('저장 실패:', e);
    }
  }

  return { user, fetchUser, updateUser };
});