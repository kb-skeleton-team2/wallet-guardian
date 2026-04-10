<template>
  <div class="mypage-wrapper">
    <div class="card shadow-sm border-0 rounded-4 p-4 p-md-5 mypage-card h-100">
      <h4 class="fw-bold mb-5">Profile</h4>

      <div
        v-if="!isEditing"
        class="view-mode"
      >
        <div class="profile-layout">
          <div class="avatar-circle">
            <img
              :src="userStore.user.avatarUrl"
              alt="프로필 이미지"
              class="w-100 h-100 avatar-img"
            />
          </div>
          <div class="profile-info">
            <div class="d-flex align-items-center gap-3 mb-3">
              <h4 class="fw-bold mb-0">{{ userStore.user.name }}</h4>
              <button
                class="edit-btn"
                @click="startEdit"
                title="수정"
              >
                <i class="bi bi-pencil-fill"></i>
              </button>
            </div>
            <p class="text-secondary small mb-1">
              이메일 : {{ userStore.user.email }}
            </p>
            <p class="text-secondary small mb-0">
              전화번호 : {{ userStore.user.phone }}
            </p>
          </div>
        </div>
      </div>

      <div
        v-else
        class="edit-form"
      >
        <div class="avatar-edit-row">
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
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const isEditing = ref(false);
const fileInput = ref(null);
const editForm = ref({ name: '', email: '', phone: '', avatarUrl: '' });

onMounted(() => {
  userStore.fetchUser();
});

const startEdit = () => {
  editForm.value = { ...userStore.user };
  isEditing.value = true;
};

const saveProfile = async () => {
  await userStore.updateUser(editForm.value);
  isEditing.value = false;
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

@media (max-width: 767.98px) {
  .avatar-circle {
    width: 90px;
    height: 90px;
  }
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
  max-width: 600px;
  width: 100%;
}
@media (max-width: 767.98px) {
  .edit-form {
    max-width: 100%;
  }
}
.avatar-edit-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

@media (max-width: 767.98px) {
  .avatar-edit-row {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
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

/* 반응형 추가코드 */

.name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.profile-layout {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.profile-info {
  padding-top: 8px;
}

@media (max-width: 767.98px) {
  .mypage-wrapper {
    padding: 12px;
    height: auto;
    min-height: calc(100vh - 60px);
  }
  .profile-layout {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
  }
  .profile-info {
    padding-top: 0;
  }
  .name-row {
    justify-content: center;
  }
}
</style>
