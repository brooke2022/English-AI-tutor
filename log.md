# 变更日志（Changelog）

> 记录每次 PRD 更新、功能迭代、架构决策的历史。  
> 格式：`[日期] 标题 - 描述`

---

## [2026-05-11] 初始化日志 & 认证系统 PRD

### 新增
- `prd.md` 初始版本生成（逆向 PRD，基于现有代码库完整分析反推），包含：
  - 产品概述与定位
  - 技术栈说明（React 19 + TypeScript + Vite + Zustand + Tailwind v4 + Motion）
  - 路由结构与数据模型（Teacher / Review / BookedLesson）
  - 5 个页面完整功能说明：首页、外教列表、外教详情+预约、AI匹配、我的课程
  - 时区处理工具函数说明
  - 设计规范（颜色、圆角、阴影、响应式断点）
  - 运行方式

- `prd.md` 追加第十一章「用户认证与角色管理」，包含：
  - 角色体系：Student / Teacher（Admin 列入 V2 Roadmap）
  - 认证方案：Email + Password + JWT 双 Token
  - 11 条新路由规划
  - 登录页、注册角色选择页、学生注册页、外教注册页详细设计
  - 学生端管理界面：StudentDashboard / StudentProfile
  - 外教端管理界面：TeacherDashboard / TeacherProfile / TeacherAvailability / TeacherBookings
  - 数据模型扩展：User / StudentProfile / TeacherProfile
  - Zustand Auth Store 设计（新建 `useAuthStore.ts`）
  - Navbar 改造方案（登录状态感知 + 角色区分下拉菜单）
  - Express 后端 API 接口规划（9 个接口）
  - V2 Roadmap（密码重置、Google OAuth、邮箱验证等）

- `log.md` 创建，开始记录变更历史

### 背景
项目当前完全匿名，用户预约数据仅存于 localStorage，无角色区分。  
本次 PRD 补充为后续实现用户认证系统奠定文档基础，后续开发将严格按 PRD 推进。

### 待下一步
- [x] 与用户 review 认证 PRD，确认角色设计符合预期
- [x] 开始实现登录/注册页面（前端 UI + Auth Store）
- [ ] 搭建 Express 后端认证 API
- [x] 实现 ProtectedRoute 路由守卫
- [x] 实现 Navbar 登录状态感知改造

---

## [2026-05-11] 用户认证系统前端实现

### 新增文件
- `src/store/useAuthStore.ts` — Zustand auth store（login/register/logout/updateProfile），含 2 个 demo 账号，persist key `ai-tutor-auth`
- `src/components/ProtectedRoute.tsx` — 路由守卫，支持 role 级别的重定向
- `src/pages/auth/Login.tsx` — 登录页，邮箱+密码+demo 账号提示卡
- `src/pages/auth/Register.tsx` — 注册角色选择页（Student / Tutor 两张大卡片）
- `src/pages/auth/RegisterStudent.tsx` — 学生注册表单（姓名/邮箱/密码/母语/学习目标）
- `src/pages/auth/RegisterTeacher.tsx` — 外教注册表单（姓名/邮箱/密码/国家/时区/专长/时薪/简介）
- `src/pages/student/StudentDashboard.tsx` — 学生首页（数据卡片+近期课程+快速入口）
- `src/pages/student/StudentProfile.tsx` — 学生个人资料编辑页
- `src/pages/teacher/TeacherDashboard.tsx` — 外教首页（数据看板+预约请求+今日课表）
- `src/pages/teacher/TeacherProfile.tsx` — 外教个人资料编辑页
- `src/pages/teacher/TeacherAvailability.tsx` — 周视图排班日历（7列×14小时格，点击设置可用/不可用）
- `src/pages/teacher/TeacherBookings.tsx` — 预约管理（Upcoming/Completed/Cancelled Tab + 取消确认弹窗）

### 修改文件
- `src/types/index.ts` — 新增 User / StudentProfile / TeacherProfile / RegisterStudentData / RegisterTeacherData 类型
- `src/App.tsx` — 新增 11 条路由（login/register/student/*/teacher/*），ProtectedRoute 包裹受保护页面，保留 `/my-courses` 向前兼容
- `src/components/Navbar.tsx` — 重构：未登录显示 Log in + Sign up，登录后显示头像下拉菜单（角色区分菜单项 + Logout）

### Demo 账号
| 角色 | 邮箱 | 密码 |
|------|------|------|
| 学生 | student@test.com | password123 |
| 外教 | teacher@test.com | password123 |

### 备注
- 当前认证为前端 mock（setTimeout 模拟），无真实后端
- Express 后端 API 为下一阶段工作
- TeacherAvailability 的排班数据存于本地 state，刷新后重置（待后端接入后持久化）

---

## [2026-05-11] 外教动态数据 + 管理员审核流程

### 背景
Teachers 页面此前读取静态 `teachers.json`（4条写死数据），与用户认证系统完全脱钩。  
本次实现完整的「外教注册 → Pending → 管理员审核 → 上线」闭环。

### 新增文件
- `src/store/useTeachersStore.ts` — Zustand teachers store，以 `teachers.json` 4条数据为种子（status: approved），persist key `ai-tutor-teachers`；方法：addTeacher / approveTeacher / rejectTeacher / updateTeacher / getTeacherByUserId / getApproved / getPending
- `src/pages/admin/AdminDashboard.tsx` — 管理员面板（路径 `/admin`，仅 admin 角色访问）；数据统计卡 + Pending/Approved/Rejected Tab + Accept/Reject（含确认弹窗）操作

### 修改文件
- `src/types/index.ts` — User.role 增加 `'admin'`；新增 `TeacherListing` 接口（继承 Teacher，增加 userId / status / submittedAt / approvedAt / rejectedAt）
- `src/store/useAuthStore.ts` — 新增 admin demo 账号（admin@tutorai.com / admin123）
- `src/components/ProtectedRoute.tsx` — role 类型支持 `'admin'`，admin 用户回退重定向到 `/admin`
- `src/pages/auth/RegisterTeacher.tsx` — 注册成功后调用 `useTeachersStore.addTeacher(...)` 写入 pending 状态档案
- `src/pages/Teachers.tsx` — 数据源从静态 JSON 改为 `useTeachersStore.getApproved()`
- `src/pages/Home.tsx` — Featured Tutors 数据源改为 store
- `src/pages/AIMatch.tsx` — 匹配结果数据源改为 store
- `src/pages/TeacherDetail.tsx` — 从 store 查找，status !== 'approved' 时返回 404
- `src/pages/teacher/TeacherDashboard.tsx` — 顶部增加审核状态 Banner（pending/rejected/approved）
- `src/pages/teacher/TeacherProfile.tsx` — 表单初始值从 store 读取，保存时同步更新 store（updateTeacher）
- `src/components/Navbar.tsx` — admin 角色显示「Admin Panel」菜单项和红色「Admin」角色徽章
- `src/App.tsx` — 新增 `/admin` 路由（ProtectedRoute role="admin"）

### Demo 账号（完整）
| 角色 | 邮箱 | 密码 |
|------|------|------|
| 学生 | student@test.com | password123 |
| 外教 | teacher@test.com | password123 |
| 管理员 | admin@tutorai.com | admin123 |

### 验证
- `npm run lint` — 0 errors
- `npm run build` — 构建成功（470KB JS，38KB CSS）

### 备注
- 外教注册后，teacher@test.com 预置账号（来自种子数据）状态为 approved，新注册外教初始为 pending
- Admin 可在 `/admin` 面板一键 Accept（立即上线）或 Reject（确认弹窗防误操作）
- Zustand persist 保证刷新后状态不丢失，后续替换为真实 API 时只需改 store 实现

---

## [2026-05-11] 中英文 i18n 国际化

### 背景
平台此前全部硬编码英文，目标用户中大量中文母语学习者。  
本次引入 react-i18next，实现中文 / English 一键切换，语言偏好持久化至 localStorage。

### 新增文件
- `src/i18n.ts` — i18next 初始化配置（LanguageDetector + localStorage 持久化，fallbackLng: 'en'）
- `src/locales/en.json` — 英文翻译文件，约 250 个 key，按页面分段组织
- `src/locales/zh.json` — 中文翻译文件，与 en.json 结构完全对应
- `src/components/LanguageSwitcher.tsx` — 语言切换按钮（切换时显示 「中」/「EN」）

### 修改文件
- `src/main.tsx` — 首行加 `import './i18n'`
- `src/components/Navbar.tsx` — 加 `<LanguageSwitcher />`（置于右侧认证区左边），所有链接文字改为 `t()`
- `src/components/TeacherCard.tsx` — 「Hourly Rate」「View Profile」「$X Trial」改为 `t()`
- `src/pages/Home.tsx` — Hero 区、信任数据栏、精选外教区全部改为 `t()`
- `src/pages/Teachers.tsx` — 搜索框、筛选、空状态全部改为 `t()`
- `src/pages/TeacherDetail.tsx` — 详情页所有静态文字改为 `t()`
- `src/pages/AIMatch.tsx` — 标题、占位符、步骤文字、结果文字改为 `t()`
- `src/pages/MyCourses.tsx` — 标题、空状态、课程列表操作按钮改为 `t()`
- `src/pages/auth/Login.tsx` — 所有 label、按钮、demo 账号提示改为 `t()`
- `src/pages/auth/Register.tsx` — 角色选择卡片改为 `t()`
- `src/pages/auth/RegisterStudent.tsx` — 表单标签、校验错误改为 `t()`
- `src/pages/auth/RegisterTeacher.tsx` — 表单标签、校验错误改为 `t()`
- `src/pages/student/StudentDashboard.tsx` — 问候语、数据卡片、快速入口改为 `t()`
- `src/pages/student/StudentProfile.tsx` — 所有表单标签、密码区、member since 改为 `t()`
- `src/pages/teacher/TeacherDashboard.tsx` — 状态 Banner、数据看板、预约列表、快速入口改为 `t()`
- `src/pages/teacher/TeacherProfile.tsx` — 视频区、表单标签、保存按钮改为 `t()`
- `src/pages/teacher/TeacherAvailability.tsx` — 标题、图例、按钮、时区提示改为 `t()`
- `src/pages/teacher/TeacherBookings.tsx` — 标题、Tab、空状态、取消确认弹窗改为 `t()`
- `src/pages/admin/AdminDashboard.tsx` — 标题、统计卡、Tab、操作按钮改为 `t()`

### 翻译范围约定
- **翻译**：所有静态 UI 文本（标签、按钮、提示、占位符、空状态）
- **不翻译**：动态内容（外教姓名、自我介绍、学生评价、课程类型等数据库内容）

### Key 分段结构
`nav.*` / `home.*` / `teachers.*` / `teacherDetail.*` / `aiMatch.*` / `myCourses.*` / `auth.*` / `student.*` / `teacher.*` / `admin.*` / `teacherCard.*` / `common.*`

### 验证
- `npm run lint` — 0 TypeScript errors
- `npm run build` — 构建成功（554KB JS，39KB CSS）
- 首页默认显示英文；Navbar 点击「中」按钮后全站切换中文；刷新后中文持久（localStorage `i18nextLng = 'zh'`）
