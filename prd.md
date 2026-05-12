# TutorAI — 产品需求文档（PRD）

> **文档类型**：逆向 PRD（Reverse PRD）  
> **生成方式**：基于现有代码库完整分析反推  
> **生成日期**：2026-05-11  
> **代码路径**：`/English-AI-tutor/src/`

---

## 一、产品概述

### 1.1 产品名称

**TutorAI**

### 1.2 产品定位

TutorAI 是一个面向英语学习者的在线 1v1 外教预约平台，核心差异化在于集成 AI 智能匹配引擎，帮助学生快速找到最适合自己需求的外教。平台主打菲律宾和尼泊尔的高性价比外教资源，课时费低至 $8/小时。

### 1.3 目标用户

- 备考 IELTS / 托福的学生
- 需要提升商务英语能力的职场人
- 想学英语的儿童及初学者
- 需要练习口语/面试英语的求职者

### 1.4 核心价值主张

- AI 驱动的外教匹配，降低选择成本
- 菲律宾 + 尼泊尔教师资源，价格亲民（$8–$15/hr）
- 试课价格极低（$1–$3），降低决策门槛
- 全球时区智能转换，无缝跨时区约课

---

## 二、技术栈

### 2.1 前端

| 层级 | 技术 | 版本 |
|------|------|------|
| UI 框架 | React | 19.0.0 |
| 语言 | TypeScript | ~5.8.2 |
| 构建工具 | Vite | 6.2.0 |
| 路由 | React Router DOM | 7.13.2 |
| 状态管理 | Zustand | 5.0.12 |
| 样式 | Tailwind CSS | 4.1.14 |
| 动画 | Motion（Framer Motion） | 12.23.24 |
| 图标 | Lucide React | 0.546.0 |

### 2.2 AI & 后端

| 层级 | 技术 | 备注 |
|------|------|------|
| AI SDK | @google/genai | 1.29.0，Gemini API，已集成至 vite.config 但 UI 层尚未接入 |
| 服务端 | Express | 4.21.2，已引入但未见完整 server 代码 |
| 环境变量 | dotenv | GEMINI_API_KEY 已通过 vite.config define 注入前端 |

### 2.3 数据持久化

- **Zustand + persist 中间件**：将用户已预约课程存入 `localStorage`，key 为 `ai-english-tutor-storage`
- **静态 JSON 数据**：外教数据来自 `src/data/teachers.json`，当前共 4 位外教

---

## 三、信息架构 & 路由

```
/                   首页（Home）
/teachers           外教列表页（Teachers）
/teachers/:id       外教详情 & 预约页（TeacherDetail）
/ai-match           AI 智能匹配页（AIMatch）
/my-courses         我的课程页（MyCourses）
```

全局布局：顶部固定 Navbar（`sticky top-0 z-50`）+ 主内容区。

---

## 四、数据模型

### 4.1 Teacher（外教）

```typescript
interface Teacher {
  id: string;           // 唯一标识，如 "tutor-1"
  name: string;         // 外教姓名
  country: string;      // 国籍，如 "Philippines"
  countryCode: string;  // ISO 2位国家码，用于生成国旗 emoji
  avatar: string;       // 头像 URL
  tags: string[];       // 专长标签，如 ["IELTS", "Business"]
  price: number;        // 正课时薪（美元）
  trialPrice: number;   // 试课价格（美元）
  rating: number;       // 评分，0–5
  reviewCount: number;  // 评价总数
  timezone: string;     // 外教所在时区（IANA 格式）
  intro: string;        // 自我介绍文本
  videoUrl: string;     // 介绍视频 URL（YouTube embed）
  availableSlots: string[]; // 可预约时间段（UTC ISO 8601 字符串数组）
  reviews?: Review[];   // 学生评价列表
}
```

### 4.2 Review（评价）

```typescript
interface Review {
  id: string;
  studentName: string;
  rating: number;       // 1–5
  comment: string;
  date: string;         // UTC ISO 8601
}
```

### 4.3 BookedLesson（已预约课程）

```typescript
interface BookedLesson {
  id: string;           // 格式 "lesson-{timestamp}"
  tutorId: string;      // 关联 Teacher.id
  time: string;         // 课程时间（UTC ISO 8601）
  type: string;         // 课程类型，当前固定为 "Trial Lesson"
  status: 'upcoming' | 'completed' | 'cancelled';
}
```

---

## 五、功能模块详细说明

### 5.1 首页（Home）

**路径**：`/`  
**文件**：`src/pages/Home.tsx`

#### Hero 区域
- 渐变背景（蓝色 → 白色）
- 徽章标签：「AI-Powered Matching Engine」
- 主标题：「Master English with AI-Matched Tutors.」（大字渐变色）
- 副标题：平台简介 + 起步价 $8/hr
- 双 CTA 按钮：
  - **Find your tutor** → `/teachers`
  - **Try AI Match** → `/ai-match`（带 Sparkles 图标）

#### 信任数据栏（Trust Bar）
展示三项关键数据，提升转化信心：

| 指标 | 数值 |
|------|------|
| 全球外教 | 50+ |
| 满意学员 | 10,000+ |
| 可约时段 | 24/7 |

#### 精选外教区（Featured Tutors）
- 展示前 3 位外教卡片（取 teachers.json 前 3 条）
- 小屏底部 / 大屏右上角有「View all tutors →」链接

---

### 5.2 外教列表页（Teachers）

**路径**：`/teachers`  
**文件**：`src/pages/Teachers.tsx`

#### 吸顶过滤栏
始终固定在顶部（`sticky top-16 z-40`），包含：

1. **关键词搜索框**：支持按外教姓名或自我介绍文字模糊搜索
2. **时区切换按钮**：在「Local Time（本地时间）」和「Tutor Time（外教时间）」之间切换
3. **专长标签筛选器**（横向滚动胶囊按钮）：
   - All / IELTS / Business / Kids / Conversational / Beginners / Job Interview

#### 过滤逻辑
```
结果 = 外教标签 includes 当前 activeTag（All 时跳过）
    AND 外教姓名或介绍 includes 搜索关键词（不区分大小写）
```

#### 外教卡片网格
- 响应式布局：1列（移动端）→ 2列（平板）→ 3列（桌面）
- 无结果时显示 Empty State + 清除筛选按钮

---

### 5.3 外教详情 & 预约页（TeacherDetail）

**路径**：`/teachers/:id`  
**文件**：`src/pages/TeacherDetail.tsx`

#### 左栏（2/3 宽）

**视频区**：
- 外教头像作为视频封面背景（半透明叠加）
- 中央播放按钮图标（点击交互预留）
- `videoUrl` 字段已存储 YouTube embed 链接，当前为视觉占位

**基本信息卡**：
- 外教姓名、国家、评分 + 评价数
- 右上角显示时薪
- 「About Me」段落介绍
- 「Specialties」专长标签（蓝底蓝字胶囊）

**学生评价列表**：
- 学生姓名 + 日期（自动转换为本地时间）
- 星级评分（5星可视化）
- 评价内容（引用格式）

#### 右栏（1/3 宽，sticky 粘性布局）

**预约 Widget**：
1. 显示用户本地时区（自动识别）
2. 日期选择器（横向滚动）：按本地日期将 availableSlots 分组
3. 时间格子（2列）：显示本地时间，选中态突出显示
4. 预约按钮：
   - 未选时间时禁用
   - 点击触发模拟预约流程（800ms 后写入 store）
   - 加载中显示 spinner
5. 预约成功后：全屏蒙层弹窗 + 绿色勾图标 + 2秒后跳转 `/my-courses`

**时区处理逻辑**（`src/utils/time.ts`）：
- 所有 slot 以 UTC ISO 8601 存储
- 前端使用 `Intl.DateTimeFormat` API 自动转换为用户本地时间
- `groupSlotsByDay`：将 UTC slot 数组按本地日期分组，支持跨时区正确分组

---

### 5.4 AI 智能匹配页（AIMatch）

**路径**：`/ai-match`  
**文件**：`src/pages/AIMatch.tsx`

#### 设计意图
用户描述自己的学习目标，AI 分析后返回最匹配的外教列表，附带匹配度百分比。

#### 交互流程

**第一阶段：输入**
- 多行文本框（placeholder：「E.g., I need to practice for my IELTS speaking test next month...」）
- 快速填充 Chips（点击直接填充文本框）：
  - IELTS Speaking / Job Interview / Business English / Kids Beginner
- 「Find My Tutor」按钮（输入为空时禁用）

**第二阶段：匹配动画**（3步，总耗时 3秒）
- 0s：「Analyzing goals...」
- 1s：「Filtering 50+ tutors...」
- 2s：「Found the best match!」
- 每步切换使用 Framer Motion `AnimatePresence`，带渐入/渐出动画
- 文字使用蓝色→紫色渐变

**第三阶段：结果**
- 展示前 2 位外教（当前为 mock 数据，取 teachers.json 前 2 条）
- 每张卡片右上角叠加「匹配度」徽章（98% / 95%，gradient 紫蓝渐变）
- 结果卡片使用 stagger 动画依次出现

> **当前实现说明**：AI 匹配逻辑为前端模拟（setTimeout），`@google/genai` SDK 已安装且 `GEMINI_API_KEY` 已注入 vite.config，但实际 Gemini API 调用尚未接入 UI 层，为后续接入预留了完整的交互框架。

---

### 5.5 我的课程页（MyCourses）

**路径**：`/my-courses`  
**文件**：`src/pages/MyCourses.tsx`

#### Empty State（无课程时）
- 日历图标 + 提示文案
- 双 CTA：「Browse Tutors」+ 「Try AI Match」

#### 课程列表
每条课程卡片展示：
- 左侧日期方块（蓝底，显示星期 + 日期数字）
- 外教姓名 + 课程类型标签（绿色「Trial Lesson」）
- 时间 + 外教第一专长标签
- 右侧操作：「Join Lesson」蓝色按钮（视频入口占位）+ 详情箭头按钮

**数据来源**：Zustand store `bookedLessons` 数组，通过 `persist` 写入 localStorage，页面刷新后数据保留。

---

### 5.6 外教卡片组件（TeacherCard）

**文件**：`src/components/TeacherCard.tsx`  
**使用场景**：首页精选区、外教列表页、AI 匹配结果页

**卡片结构**：
- 4:3 比例封面图（hover 时轻微放大）
- 试课价格徽章（左上角绿色）
- 外教姓名 + 国旗 emoji（由 ISO 国家码转换）
- 评分 + 评价数
- 介绍文字（2行截断）
- 专长标签（最多显示 3 个）
- 底部：时薪 + 「View Profile」按钮

**国旗 Emoji 生成逻辑**：
```typescript
function getFlagEmoji(countryCode: string) {
  return String.fromCodePoint(
    ...countryCode.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0))
  );
}
```

---

### 5.7 导航栏（Navbar）

**文件**：`src/components/Navbar.tsx`

- 毛玻璃效果（`bg-white/80 backdrop-blur-md`），`sticky top-0 z-50`
- Logo：蓝底 GraduationCap 图标 + 「TutorAI」文字
- 桌面导航链接：Find Tutors / ✨ AI Match（渐变色高亮）/ My Courses
- 移动端：汉堡菜单图标（已渲染，展开菜单逻辑待实现）

---

## 六、状态管理

**文件**：`src/store/useStore.ts`  
**方案**：Zustand + persist middleware

```typescript
AppState {
  bookedLessons: BookedLesson[]        // 已预约课程列表
  userTimezone: string                 // 用户时区（自动识别）
  addLesson(lesson): void              // 添加课程
  removeLesson(id): void               // 移除课程
  setUserTimezone(timezone): void      // 设置时区
}
```

持久化 key：`ai-english-tutor-storage`（localStorage）

---

## 七、当前已知局限 & 待开发项

| 模块 | 当前状态 | 待实现 |
|------|----------|--------|
| AI 匹配 | setTimeout 模拟，固定返回前2位 | 接入 Gemini API，基于用户输入语义匹配 |
| 外教数据 | 静态 JSON，仅4位外教 | 后端数据库 + 动态 API |
| 视频介绍 | YouTube embed 占位，点击无播放 | 接入真实 iframe 播放逻辑 |
| 预约系统 | setTimeout 模拟，无真实后端 | 后端预约 API + 防重复预约 |
| 支付 | 价格展示，无支付流程 | 集成 Stripe 等支付网关 |
| 用户认证 | 无登录/注册 | 用户系统（OAuth / Email） |
| 移动端菜单 | 汉堡图标已渲染，无展开逻辑 | 实现移动端 Drawer/弹出菜单 |
| 课程状态 | 仅 upcoming，无 completed/cancelled | 课程状态流转逻辑 |
| 视频课堂 | 「Join Lesson」按钮无功能 | 接入 Zoom / Agora 等音视频 SDK |
| 时区切换 | 外教列表页有切换按钮，但逻辑未传递到卡片 | 将 showLocalTime 状态传入 TeacherCard |
| Express 服务端 | 已在 dependencies，无 server 代码 | 实现 BFF 或 API 路由层 |

---

## 八、页面流转图

```
首页（/）
  ├─ [Find your tutor] ──────────────→ 外教列表（/teachers）
  │                                        └─ [View Profile] → 外教详情（/teachers/:id）
  │                                                               └─ [Book] → 我的课程（/my-courses）
  └─ [Try AI Match] ─────────────────→ AI 匹配（/ai-match）
                                           └─ [View Profile] → 外教详情（/teachers/:id）

Navbar（全局）
  ├─ Find Tutors → /teachers
  ├─ AI Match   → /ai-match
  └─ My Courses → /my-courses
```

---

## 九、设计规范（从代码反推）

### 颜色
| Token | 值 | 用途 |
|-------|-----|------|
| 主色 | `#2563eb`（blue-600） | CTA 按钮、强调色 |
| 深色 | `#111827`（gray-900） | 主要文字、次级 CTA |
| 背景 | `#F8FAFC` | 页面底色 |
| 白 | `#FFFFFF` | 卡片背景 |
| 渐变 | `from-blue-600 to-violet-600` | AI Match 特色元素 |
| 成功 | `emerald-500/600` | 预约成功、试课徽章 |
| 警告/评分 | `amber-400` | 星级评分 |

### 圆角
- 卡片：`rounded-xl` / `rounded-2xl`
- 按钮：`rounded-lg` / `rounded-xl`
- 标签：`rounded-full` / `rounded-md`

### 阴影
- 卡片默认：`shadow-sm`，hover：`shadow-xl`
- 预约 Widget：`shadow-xl`

### 响应式断点
- 移动优先，主要断点：`sm`（640px）、`md`（768px）、`lg`（1024px）
- 最大内容宽：`max-w-7xl`（1280px）

---

## 十、运行方式

```bash
# 安装依赖
npm install

# 本地开发（端口 3000）
npm run dev

# 构建生产包
npm run build

# 预览生产包
npm run preview

# 类型检查
npm run lint
```

环境变量配置（`.env`）：
```
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 十一、用户认证与角色管理

> **新增日期**：2026-05-11  
> **需求背景**：项目当前完全匿名，用户预约数据仅存于 localStorage，无角色区分。本章节规划完整的用户认证体系，支持学生与外教两种角色，各自拥有独立的管理界面。

---

### 11.1 角色体系

| 角色 | 英文标识 | 核心权限 |
|------|----------|----------|
| 学生 | `student` | 浏览外教、预约课程、管理我的课程、写评价 |
| 外教 | `teacher` | 管理个人档案、设置可用时间、查看/处理预约、查看收益 |
| 管理员 | `admin` | 暂列为 V2 Roadmap，V1 不实现 |

---

### 11.2 认证方式

- **方案**：Email + Password，JWT 双 Token 机制
  - Access Token：有效期 1 小时
  - Refresh Token：有效期 7 天，存于 HttpOnly Cookie（或 localStorage）
- **前端状态**：新建 Zustand auth store（`useAuthStore`），持久化 key `ai-tutor-auth`，与现有 `ai-english-tutor-storage` 分离管理
- **未来扩展**：预留 Google OAuth 接口

**路由权限控制原则：**
- `<ProtectedRoute role="student">` 包裹学生专属页面
- `<ProtectedRoute role="teacher">` 包裹外教专属页面
- 未登录访问受保护路由时重定向到 `/login?redirect=原始路径`

---

### 11.3 新增路由一览

| 路径 | 组件 | 权限 |
|------|------|------|
| `/login` | Login | 公开 |
| `/register` | Register（角色选择） | 公开 |
| `/register/student` | RegisterStudent | 公开 |
| `/register/teacher` | RegisterTeacher | 公开 |
| `/student/dashboard` | StudentDashboard | 仅 student |
| `/student/courses` | MyCourses（迁移现有页面） | 仅 student |
| `/student/profile` | StudentProfile | 仅 student |
| `/teacher/dashboard` | TeacherDashboard | 仅 teacher |
| `/teacher/profile` | TeacherProfile | 仅 teacher |
| `/teacher/availability` | TeacherAvailability | 仅 teacher |
| `/teacher/bookings` | TeacherBookings | 仅 teacher |

---

### 11.4 页面详细设计

#### 登录页 `/login`

- 标题：「Welcome back to TutorAI」
- 字段：Email 输入框 + Password 输入框（带显示/隐藏切换）
- 「Remember me」checkbox
- 「Forgot password?」链接（V2 Roadmap）
- 登录按钮（含 loading spinner）
- 页面底部：「Don't have an account? Sign up」→ `/register`
- **成功跳转**：student → `/student/dashboard`，teacher → `/teacher/dashboard`
- **错误处理**：邮箱/密码不匹配时在表单上方显示行内错误提示

#### 注册角色选择页 `/register`

- 标题：「Join TutorAI」
- 两张大卡片：
  - **I'm a Student**（BookOpen 图标 + 「Learn English with expert tutors」）
  - **I'm a Tutor**（GraduationCap 图标 + 「Teach students worldwide」）
- 点击卡片跳转对应注册表单

#### 学生注册页 `/register/student`

| 字段 | 类型 | 规则 |
|------|------|------|
| Full Name | 文本输入 | 必填 |
| Email | 邮箱输入 | 必填，格式校验 |
| Password | 密码输入 | 必填，最低 8 位 |
| Confirm Password | 密码输入 | 必填，与 Password 一致 |
| Native Language | 下拉选择 | 可选 |
| Learning Goals | 多选 Chips | IELTS / Business / Conversation / Kids / Job Interview |

#### 外教注册页 `/register/teacher`

| 字段 | 类型 | 规则 |
|------|------|------|
| Full Name | 文本输入 | 必填 |
| Email | 邮箱输入 | 必填，格式校验 |
| Password | 密码输入 | 必填，最低 8 位 |
| Confirm Password | 密码输入 | 必填，与 Password 一致 |
| Country | 下拉选择 | 必填（Philippines / Nepal 等） |
| Timezone | 下拉选择 | 自动检测，可手动修改 |
| Teaching Specialties | 多选 Chips | 与现有标签体系一致 |
| Hourly Rate | 数字输入 | 必填，单位 $ |
| Trial Price | 数字输入 | 必填，单位 $ |
| Short Bio | Textarea | 必填，最多 300 字 |

---

### 11.5 学生端管理界面

#### StudentDashboard `/student/dashboard`

- 顶部欢迎语：「Good morning, {name} 👋」（根据当地时间动态变化）
- **数据卡片**（3张）：
  - Upcoming Lessons（数量）
  - Total Hours Learned
  - Favorite Tutors（收藏数）
- 近期课程快速列表（最近 3 条，附 Join Lesson 按钮）
- 快速入口卡：「Find New Tutor」→ `/teachers` 和「AI Match」→ `/ai-match`

#### StudentProfile `/student/profile`

- 头像区：首字母占位头像 + 上传入口（V2 实现真实上传）
- 基本信息编辑：姓名、邮箱（只读）、所在城市
- 学习目标多选 Chips
- 母语 / 目标英语级别下拉
- 修改密码入口（展开表单：旧密码 + 新密码 + 确认）

---

### 11.6 外教端管理界面

#### TeacherDashboard `/teacher/dashboard`

- **数据看板**（4张卡）：
  - Upcoming Lessons（本周数量）
  - Total Students（历史学生总数）
  - Average Rating（综合评分）
  - Monthly Earnings（本月收益 $）
- **待处理预约列表**（Pending 状态）：每条展示学生姓名 + 时间，附 Accept / Decline 按钮
- **今日课表时间轴**：按时间顺序展示当天所有课程

#### TeacherProfile `/teacher/profile`

- 头像上传区
- 基本信息：姓名、国家、时区、自我介绍（Textarea）
- 专长标签管理（多选 Chips，可增删）
- 时薪 / 试课价格数字输入
- 「Preview Public Profile」按钮 → 跳转 `/teachers/:id`

#### TeacherAvailability `/teacher/availability`

- **周视图日历**（7列，每列代表一天）
- 点击空白时间格 → 弹窗添加可用时间段
- 时间段颜色区分：
  - 绿色：已设置可用
  - 蓝色：已被学生预约
  - 灰色：不可用 / 已过期
- 批量操作：「Copy last week's schedule」一键复制上周排班

#### TeacherBookings `/teacher/bookings`

- **Tab 切换**：Upcoming / Completed / Cancelled
- 每条预约展示：学生姓名 + 课程类型 + 时间 + 状态徽章
- Upcoming 预约的操作按钮：
  - Join Lesson（视频入口）
  - Reschedule（V2 实现）
  - Cancel（确认弹窗后取消）

---

### 11.7 数据模型扩展

```typescript
// 新增 User 基础类型
interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher';
  avatar?: string;
  timezone: string;
  createdAt: string;
}

// 学生扩展模型
interface StudentProfile extends User {
  role: 'student';
  nativeLanguage?: string;
  learningGoals: string[];       // ["IELTS", "Business", ...]
  totalHours: number;
  favoriteTutorIds: string[];
}

// 外教扩展模型（与现有 Teacher 合并）
interface TeacherProfile extends User {
  role: 'teacher';
  country: string;
  countryCode: string;
  tags: string[];
  price: number;
  trialPrice: number;
  rating: number;
  reviewCount: number;
  intro: string;
  videoUrl: string;
  availableSlots: string[];
  monthlyEarnings: number;
}
```

---

### 11.8 Zustand Auth Store 设计

**新建文件**：`src/store/useAuthStore.ts`

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login(email: string, password: string): Promise<void>;
  register(data: RegisterData, role: 'student' | 'teacher'): Promise<void>;
  logout(): void;
  updateProfile(data: Partial<User>): Promise<void>;
  clearError(): void;
}

// persist 配置
// name: 'ai-tutor-auth'
// storage: localStorage
```

---

### 11.9 Navbar 改造方案

**文件**：`src/components/Navbar.tsx`

| 状态 | 右侧导航区显示 |
|------|----------------|
| 未登录 | 「Log in」文字按钮 + 「Sign up」主色按钮 |
| 学生登录后 | 头像（首字母圆形）+ 下拉菜单：Dashboard / My Courses / Logout |
| 外教登录后 | 头像（首字母圆形）+ 下拉菜单：Dashboard / My Profile / Logout |

---

### 11.10 后端 API 接口规划

**目录**：`src/server/`（基于已安装的 Express 4.21.2）

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/api/auth/register` | 注册（学生/外教） | 公开 |
| POST | `/api/auth/login` | 登录，返回 JWT | 公开 |
| POST | `/api/auth/refresh` | 刷新 Access Token | 需 Refresh Token |
| POST | `/api/auth/logout` | 登出，清除 Refresh Token | 需登录 |
| GET  | `/api/me` | 获取当前用户信息 | 需登录 |
| PUT  | `/api/me` | 更新用户基本信息 | 需登录 |
| GET  | `/api/teacher/bookings` | 外教查看预约列表 | 仅 teacher |
| PUT  | `/api/teacher/bookings/:id` | 接受/拒绝预约 | 仅 teacher |
| PUT  | `/api/teacher/availability` | 更新可用时间段 | 仅 teacher |

---

### 11.11 V2 Roadmap（认证相关）

| 功能 | V1 状态 | V2 计划 |
|------|---------|---------|
| 密码重置 | ❌ | 邮件验证码重置 |
| Google OAuth | ❌ | 一键 Google 登录 |
| 邮箱验证 | ❌ | 注册后发送验证邮件 |
| 管理员后台 | ✅ | 已实现（V1 提前落地） |
| 双因素认证 | ❌ | TOTP 2FA |
| 头像真实上传 | ❌ | 接入 S3 或 Cloudflare R2 |

---

## 十二、国际化（i18n）

> **新增日期**：2026-05-11  
> **需求背景**：目标用户以中文母语学习者为主，需支持中文 / English 一键切换，降低使用门槛。

---

### 12.1 技术方案

| 项目 | 选型 |
|------|------|
| i18n 框架 | react-i18next 15.x |
| 语言检测 | i18next-browser-languagedetector（优先读 localStorage，次选浏览器语言） |
| 持久化 | localStorage，key 为 `i18nextLng` |
| 支持语言 | `en`（英语，默认）/ `zh`（简体中文） |
| fallback | 语言缺失时回退到 `en` |

**新增文件**：

| 文件 | 说明 |
|------|------|
| `src/i18n.ts` | i18next 初始化，注册两种语言资源 |
| `src/locales/en.json` | 英文翻译，约 250 个 key |
| `src/locales/zh.json` | 中文翻译，与 en.json 结构完全对应 |
| `src/components/LanguageSwitcher.tsx` | 切换按钮，当前语言为中文时显示「EN」，反之显示「中」 |

---

### 12.2 翻译范围

**翻译**：所有静态 UI 文本，包括：
- Navbar 导航链接、角色徽章、按钮
- 所有页面标题、副标题、说明文字
- 表单 label、placeholder、校验错误信息
- 按钮文字、空状态提示、状态 Banner

**不翻译**（保留原文）：
- 外教姓名、自我介绍、学生评价
- 课程类型标签（IELTS、Business 等专有名词）
- 外教来源国名称
- 价格等数值

---

### 12.3 Key 分段结构

```
nav.*          导航栏
home.*         首页
teachers.*     外教列表页
teacherDetail.*  外教详情页
aiMatch.*      AI 匹配页
myCourses.*    我的课程页
auth.login.*   登录页
auth.register.*  注册选择页
auth.registerStudent.*  学生注册页
auth.registerTeacher.*  外教注册页
auth.errors.*  表单校验错误
student.dashboard.*  学生控制台
student.profile.*    学生个人资料
teacher.dashboard.*  外教控制台
teacher.profile.*    外教个人资料
teacher.availability.*  排班管理
teacher.bookings.*   预约管理
admin.*        管理员面板
teacherCard.*  外教卡片组件
common.*       公共文本（问候语、通用按钮）
```

---

### 12.4 LanguageSwitcher 位置

`Navbar` 右侧认证区域左边，桌面端和移动端均可见。  
样式：边框按钮（`border border-gray-200`），hover 变灰底，宽度固定不随语言变化抖动。

---

### 12.5 已覆盖页面

| 文件 | 状态 |
|------|------|
| `Navbar.tsx` | ✅ |
| `TeacherCard.tsx` | ✅ |
| `Home.tsx` | ✅ |
| `Teachers.tsx` | ✅ |
| `TeacherDetail.tsx` | ✅ |
| `AIMatch.tsx` | ✅ |
| `MyCourses.tsx` | ✅ |
| `auth/Login.tsx` | ✅ |
| `auth/Register.tsx` | ✅ |
| `auth/RegisterStudent.tsx` | ✅ |
| `auth/RegisterTeacher.tsx` | ✅ |
| `student/StudentDashboard.tsx` | ✅ |
| `student/StudentProfile.tsx` | ✅ |
| `teacher/TeacherDashboard.tsx` | ✅ |
| `teacher/TeacherProfile.tsx` | ✅ |
| `teacher/TeacherAvailability.tsx` | ✅ |
| `teacher/TeacherBookings.tsx` | ✅ |
| `admin/AdminDashboard.tsx` | ✅ |
