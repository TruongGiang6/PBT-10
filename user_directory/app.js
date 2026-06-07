
const api = {
    baseURL: "https://jsonplaceholder.typicode.com",

    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers: { 'Content-type': 'application/json; charset=UTF-8', ...options.headers }
            });
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    },

    getUsers() { return this.request("/users"); },
    getUser(id) { return this.request(`/users/${id}`); },
    createUser(data) { return this.request("/users", { method: "POST", body: JSON.stringify(data) }); },
    updateUser(id, data) { return this.request(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }); },
    deleteUser(id) { return this.request(`/users/${id}`, { method: "DELETE" }); }
};

const ui = {
    userGrid: document.getElementById('userGrid'),
    toastContainer: document.getElementById('toastContainer'),

    renderUsers(users) {
        if (users.length === 0) {
            this.userGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">Không tìm thấy người dùng nào.</p>`;
            return;
        }

        this.userGrid.innerHTML = users.map(user => `
            <div class="user-card" data-id="${user.id}">
                <h3>${user.name}</h3>
                <p><i class="fa-solid fa-envelope"></i> ${user.email}</p>
                <p><i class="fa-solid fa-phone"></i> ${user.phone}</p>
                <div class="card-actions">
                    <button class="btn-edit" onclick="app.prepareEdit(${user.id})">Edit</button>
                    <button class="btn-danger" onclick="app.handleDelete(${user.id})">Delete</button>
                </div>
            </div>
        `).join('');
    },

    showLoading() {
        this.userGrid.innerHTML = Array(6).fill(`
            <div class="skeleton-card">
                <div class="skeleton-line title"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
            </div>
        `).join('');
    },

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-triangle-exclamation'}"></i> ${message}`;
        
        this.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            toast.addEventListener('animationend', () => toast.remove());
        }, 3000);
    },

    showError(message) { this.showToast(message, 'error'); },
    showSuccess(message) { this.showToast(message, 'success'); }
};

const app = {
    state: {
        users: [], 
        isEditing: false
    },

    async init() {
        this.cacheDOM();
        this.bindEvents();
        
        ui.showLoading();
        try {
            this.state.users = await api.getUsers();
            ui.renderUsers(this.state.users);
        } catch (err) {
            ui.showError("Lỗi khi tải danh sách người dùng.");
            ui.renderUsers([]);
        }
    },

    cacheDOM() {
        this.form = document.getElementById('userForm');
        this.formTitle = document.getElementById('formTitle');
        this.submitBtn = document.getElementById('submitBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.searchInput = document.getElementById('searchInput');
        
        this.idInput = document.getElementById('userId');
        this.nameInput = document.getElementById('name');
        this.emailInput = document.getElementById('email');
        this.phoneInput = document.getElementById('phone');
    },

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.cancelBtn.addEventListener('click', () => this.resetForm());
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
    },

    async handleSubmit(e) {
        e.preventDefault();
        
        const userData = {
            name: this.nameInput.value,
            email: this.emailInput.value,
            phone: this.phoneInput.value
        };

        const currentId = this.idInput.value;

        try {
            this.submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';
            this.submitBtn.disabled = true;

            if (this.state.isEditing) {
                // UPDATE
                const updatedUser = await api.updateUser(currentId, userData);
                this.state.users = this.state.users.map(u => u.id == currentId ? { ...u, ...updatedUser } : u);
                ui.showSuccess("Cập nhật thành công!");
            } else {
                // CREATE
                const newUser = await api.createUser(userData);
                newUser.id = Date.now(); 
                this.state.users.unshift(newUser); // Đưa lên đầu mảng
                ui.showSuccess("Thêm mới thành công!");
            }

            this.resetForm();
            this.handleSearch();

        } catch (err) {
            ui.showError("Thao tác thất bại. Vui lòng thử lại!");
        } finally {
            this.submitBtn.innerHTML = this.state.isEditing ? 'Cập nhật' : 'Tạo mới';
            this.submitBtn.disabled = false;
        }
    },

    prepareEdit(id) {
        const user = this.state.users.find(u => u.id == id);
        if (!user) return;

        this.state.isEditing = true;
        this.formTitle.textContent = "Chỉnh sửa người dùng";
        this.submitBtn.textContent = "Cập nhật";
        this.submitBtn.className = "btn-edit";
        this.cancelBtn.style.display = "block";

        this.idInput.value = user.id;
        this.nameInput.value = user.name;
        this.emailInput.value = user.email;
        this.phoneInput.value = user.phone;

        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    },

    async handleDelete(id) {
        if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;

        try {
            await api.deleteUser(id);
            this.state.users = this.state.users.filter(u => u.id != id);
            
            this.handleSearch(); 
            ui.showSuccess("Xóa thành công!");
        } catch (err) {
            ui.showError("Xóa thất bại!");
        }
    },

    handleSearch() {
        const term = this.searchInput.value.toLowerCase();
        const filtered = this.state.users.filter(u => 
            u.name.toLowerCase().includes(term) || 
            u.email.toLowerCase().includes(term)
        );
        ui.renderUsers(filtered);
    },

    resetForm() {
        this.form.reset();
        this.state.isEditing = false;
        this.idInput.value = '';
        this.formTitle.textContent = "Thêm người dùng mới";
        this.submitBtn.textContent = "Tạo mới";
        this.submitBtn.className = "btn-primary";
        this.cancelBtn.style.display = "none";
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});