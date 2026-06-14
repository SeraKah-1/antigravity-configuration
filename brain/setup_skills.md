# Setup Fase: Pemasangan Skill Workspace (Pragmatis & Lengkap)

Kami telah menyempurnakan alur kerja pengembangan dengan menambahkan peran penjamin mutu (**QA**) yang sebelumnya kurang. Ini melengkapi siklus hidup pengembangan perangkat lunak (SDLC) di workspace Anda secara profesional dan terstruktur.

Semua berkas konfigurasi utama telah diperbarui:
*   [CLAUDE.md](file:///home/ayintaput/CLAUDE.md)
*   [agent_research.md](file:///home/ayintaput/.gemini/antigravity-cli/brain/297b024a-4cb8-4361-b73a-be1ab3490127/agent_research.md)

---

## 🛠️ Alur Kerja Hybrid Lengkap

1.  **Antigravity (Agen Utama) sebagai Eksekutor Utama:**
    Menangani pembuatan kode, pengetesan langsung di terminal, dan modifikasi kecil secara mandiri agar proses berjalan cepat.
2.  **Pendelegasian Spesialis (On-Demand):**
    *   **🎨 `ui-designer`**: Dipanggil untuk membuat blueprint estetika visual baru (warna, font, layout) sebelum coding dimulai.
    *   **🧪 `qa-engineer`**: Dipanggil untuk menyusun rencana pengujian (*test plans*), membuat tes unit/integrasi secara objektif, dan mendiagnosis bug dari tes yang gagal.
    *   **🧹 `code-simplifier`**: Dipanggil setelah kode berfungsi dan tes lolos untuk menyederhanakan logika dan merapikan file.

---

## 🎨 Skill 1: `frontend-design` (Melalui `ui-designer`)
Mencegah desain generik bergaya "startup bangkrut tahun 2021" dengan menentukan estetika yang berani.

---

## 🧪 Skill 2: `test-qa` (Melalui `qa-engineer`)
Melakukan pengetesan objektif untuk menemukan *edge cases*, *empty states*, dan penanganan error secara mendalam tanpa bias implementasi.

---

## 🧹 Skill 3: `simplify` (Melalui `code-simplifier`)
Dicuatkan pasca-implementasi untuk memastikan kode tetap mudah dibaca dan dirawat oleh manusia di masa mendatang.
