<template>
  <div class="mypage-wrapper">
    <div class="card shadow-sm border-0 rounded-4 p-4 p-md-5 mypage-card h-100">
      <h4 class="fw-bold mb-5">Profile</h4>

      <div
        v-if="!isEditing"
        class="view-mode"
      >
        <div class="d-flex align-items-start gap-4">
          <div class="avatar-circle">
            <img
              :src="profile.avatarUrl"
              alt="프로필 이미지"
              class="w-100 h-100 avatar-img"
            />
          </div>

          <div class="pt-2">
            <div class="d-flex align-items-center gap-3 mb-3">
              <h4 class="fw-bold mb-0">{{ profile.name }}</h4>
              <button
                class="edit-btn"
                @click="startEdit"
                title="수정"
              >
                <i class="bi bi-pencil-fill"></i>
              </button>
            </div>
            <p class="text-secondary small mb-1">
              이메일 : {{ profile.email }}
            </p>
            <p class="text-secondary small mb-0">
              전화번호 : {{ profile.phone }}
            </p>
          </div>
        </div>
      </div>

      <div
        v-else
        class="edit-form"
      >
        <div class="d-flex align-items-center gap-4 mb-5">
          <div class="avatar-circle">
            <img
              :src="editForm.avatarUrl"
              alt="프로필 이미지"
              class="w-100 h-100 avatar-img"
            />
          </div>
          <button
            class="btn photo-btn rounded-pill px-4 py-2"
            @click="triggerFileInput"
          >
            사진 선택
          </button>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="d-none"
            @change="onFileChange"
          />
        </div>

        <div class="mb-4">
          <label class="form-label fw-bold">이름</label>
          <input
            v-model="editForm.name"
            type="text"
            class="form-control py-2 text-secondary"
            placeholder="이름을 입력하세요"
          />
        </div>

        <div class="mb-4">
          <label class="form-label fw-bold">이메일</label>
          <input
            v-model="editForm.email"
            type="email"
            class="form-control py-2 text-secondary"
            placeholder="이메일을 입력하세요"
          />
        </div>

        <div class="mb-5">
          <label class="form-label fw-bold">전화번호</label>
          <input
            v-model="editForm.phone"
            type="tel"
            class="form-control py-2 text-secondary"
            placeholder="전화번호를 입력하세요"
          />
        </div>

        <div class="d-flex justify-content-start">
          <button
            class="btn save-btn rounded-pill fw-bold"
            @click="saveProfile"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';

const DEFAULT_IMAGE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/158.png';

const isEditing = ref(false);
const fileInput = ref(null);

const profile = ref({
  name: '',
  email: '',
  phone: '',
  avatarUrl: '',
  createdAt: '',
});
const editForm = ref({ name: '', email: '', phone: '', avatarUrl: '' });

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:3000/users/1');
    const user = res.data;
    profile.value = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.profileImage?.startsWith('data:')
        ? user.profileImage
        : DEFAULT_IMAGE,
      createdAt: user.createdAt,
    };
  } catch (e) {
    console.error('데이터 로드 실패:', e);
  }
});

const startEdit = () => {
  editForm.value = { ...profile.value };
  isEditing.value = true;
};

const saveProfile = async () => {
  try {
    await axios.put('http://localhost:3000/users/1', {
      id: '1',
      name: editForm.value.name,
      email: editForm.value.email,
      phone: editForm.value.phone,
      profileImage: editForm.value.avatarUrl,
      createdAt: profile.value.createdAt,
    });
    profile.value = { ...editForm.value };
    isEditing.value = false;
  } catch (e) {
    console.error('저장 실패:', e);
  }
};

const triggerFileInput = () => fileInput.value.click();

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    editForm.value.avatarUrl = event.target.result;
  };
  reader.readAsDataURL(file);
};
</script>

<style scoped>
.mypage-wrapper {
  padding: 24px;
  background-color: #f0f0f0;
  height: calc(100vh - 60px);
  box-sizing: border-box;
}

.mypage-card {
  height: 100% !important;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.avatar-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid #dee2e6;
  flex-shrink: 0;
  background-color: #fff;
}

.avatar-img {
  object-fit: cover;
}

.edit-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #ffbc39;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.edit-form {
  max-width: 600px; /* 입력창 너비 제한 */
}

.photo-btn {
  background-color: #ffbc39;
  border: none;
  color: white;
  font-size: 0.9rem;
}

.save-btn {
  background-color: #ffbc39;
  border: none;
  color: white;
  width: 200px;
  padding: 12px 0;
}

.form-control:focus {
  border-color: #ffbc39;
  box-shadow: 0 0 0 0.25rem rgba(255, 188, 57, 0.25);
}
</style>
