Here is Claude's plan:
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
 完整后端搭建方案（English-AI-Tutor）

 Context

 当前项目是纯前端 Vite SPA，所有状态用 Zustand + localStorage。需要搭建后端解决以下问题：
 - 数据无服务端持久化（用户清缓存就丢）
 - 学生/老师不在同一台浏览器无法看到对方数据
 - Gemini API key 直接暴露在前端（vite.config.ts 注入 process.env，浏览器可见）
 - 视频/头像只用 URL.createObjectURL() 生成本地 blob，刷新即失效
 - 无密码哈希、无 JWT、无邮件通知、无定时任务（提醒、自动完成）
 - 无权限审计、无后台管理

 技术栈（已确认）：NestJS + TypeScript + Prisma + PostgreSQL，部署 Docker +
 云平台（Railway/Fly.io）。

 ---
 一、目录结构

 English-AI-tutor/
 ├── (现有前端 — Vite SPA)
 ├── server/                            # 新建 NestJS 后端
 │   ├── prisma/
 │   │   ├── schema.prisma
 │   │   ├── migrations/
 │   │   └── seed.ts
 │   ├── src/
 │   │   ├── main.ts
 │   │   ├── app.module.ts
 │   │   ├── common/                    # 全局 guards/pipes/interceptors/filters
 │   │   ├── auth/                      # 注册/登录/JWT/refresh
 │   │   ├── users/
 │   │   ├── teachers/                  # 老师 profile + availability
 │   │   ├── bookings/                  # 预约状态机
 │   │   ├── reviews/
 │   │   ├── ai/                        # Gemini 网关
 │   │   ├── notifications/             # 邮件 + WebSocket
 │   │   ├── uploads/                   # 文件上传/预签名 URL
 │   │   ├── admin/                     # 老师审核
 │   │   └── jobs/                      # BullMQ 定时任务（Phase 2）
 │   ├── test/                          # e2e
 │   ├── Dockerfile
 │   ├── docker-compose.yml             # pg + redis 本地
 │   ├── .env.example
 │   └── package.json
 └── shared/                            # 可选：共享 TS 类型
     └── types.ts

 为什么这样：保留前端独立部署，后端独立伸缩；前端将来若改 Next.js 也不影响。

 ---
 二、数据库 Schema（核心表）

 model User {
   id            String   @id @default(cuid())
   email         String   @unique
   passwordHash  String
   name          String
   role          Role     // STUDENT | TEACHER | ADMIN
   timezone      String
   avatarUrl     String?
   createdAt     DateTime @default(now())
   updatedAt     DateTime @updatedAt

   studentProfile  StudentProfile?
   teacherProfile  TeacherProfile?
   refreshTokens   RefreshToken[]
   bookingsAsStudent Booking[]  @relation("StudentBookings")
   bookingsAsTeacher Booking[]  @relation("TeacherBookings")
   reviewsWritten    Review[]   @relation("ReviewAuthor")
   favoriteTeachers  Favorite[]
 }

 model TeacherProfile {
   userId          String   @id
   user            User     @relation(fields: [userId], references: [id])
   country         String
   countryCode     String
   intro           String
   yearsExp        Int?
   education       String?
   hourlyRate      Decimal  @db.Decimal(10,2)
   trialPrice      Decimal  @db.Decimal(10,2)
   videoUrl        String?
   whatsapp        String?
   status          TeacherStatus  // PENDING | APPROVED | REJECTED
   ratingAvg       Decimal? @db.Decimal(3,2)  // 缓存
   reviewCount     Int      @default(0)
   submittedAt     DateTime @default(now())
   approvedAt      DateTime?
   rejectedAt      DateTime?

   tags            TeacherTag[]
   weeklySlots     WeeklySlot[]
   bookings        Booking[]
 }

 model WeeklySlot {
   id          String   @id @default(cuid())
   teacherId   String
   teacher     TeacherProfile @relation(fields: [teacherId], references: [userId])
   dayOfWeek   Int      // 0=Sun..6=Sat
   hour        Int      // 0..23
   @@unique([teacherId, dayOfWeek, hour])
 }

 model Booking {
   id              String   @id @default(cuid())
   studentId       String
   student         User     @relation("StudentBookings", fields: [studentId], references: [id])
   teacherId       String
   teacher         User     @relation("TeacherBookings", fields: [teacherId], references: [id])
   teacherProfile  TeacherProfile @relation(fields: [teacherId], references: [userId])
   slotTime        DateTime
   type            String   // "Trial Lesson" / "Regular" / ...
   status          BookingStatus  // PENDING | CONFIRMED | CANCELLED | COMPLETED
   meetingUrl      String?
   rejectionReason String?
   createdAt       DateTime @default(now())
   updatedAt       DateTime @updatedAt
   @@unique([teacherId, slotTime])  // 同时段不可双订
 }

 model Review { id, bookingId(unique), studentId, teacherId, rating, comment, createdAt }
 model Favorite { studentId, teacherId @@id([studentId, teacherId]) }
 model RefreshToken { id, userId, tokenHash, expiresAt, revokedAt? }
 model TeacherTag { teacherId, tag  @@id([teacherId, tag]) }
 model StudentProfile { userId, nativeLanguage?, learningGoals Json, totalHours Int, city? }
 model Notification { id, userId, type, payload Json, readAt?, createdAt }  // Phase 2

 关键设计：
 - Booking.@@unique([teacherId, slotTime]) 保证同一时段不会双重预约（数据库级原子约束）
 - WeeklySlot 存模板，availableSlots 由后端 query 时实时计算未来 4 周可用时段（template 减去已
 booking 的）
 - ratingAvg/reviewCount 缓存在 TeacherProfile，写 review 时事务更新
 - 软删用 deletedAt 字段（按需）

 ---
 三、API 端点（REST，前缀 /api/v1）

 ┌──────────┬──────────────────────────────────┬──────────────────────────────────────────────┐
 │  Domain  │           方法 + 路径            │                     说明                     │
 ├──────────┼──────────────────────────────────┼──────────────────────────────────────────────┤
 │ Auth     │ POST /auth/register              │ role 字段决定创建 student 还是 teacher       │
 ├──────────┼──────────────────────────────────┼──────────────────────────────────────────────┤
 │          │ POST /auth/login                 │ 返回 accessToken + 设置 refreshToken         │
 │          │                                  │ httpOnly cookie                              │
 ├──────────┼──────────────────────────────────┼──────────────────────────────────────────────┤
 │          │ POST /auth/refresh               │ 凭 cookie 换新 accessToken + 轮转            │
 │          │                                  │ refreshToken                                 │
 ├──────────┼──────────────────────────────────┼──────────────────────────────────────────────┤
 │          │ POST /auth/logout                │ 吊销 refreshToken                            │
 ├──────────┼──────────────────────────────────┼──────────────────────────────────────────────┤
 │          │ GET /auth/me                     │ 当前用户信息                                 │
 ├──────────┼──────────────────────────────────┼──────────────────────────────────────────────┤
 │ Users    │ PATCH /users/me                  │ 更新 profile（含 student/teacher 子表字段）  │
 ├──────────┼──────────────────────────────────┼──────────────────────────────────────────────┤
 │          │ POST /users/me/avatar            │ 上传头像                                     │
 ├──────────┼──────────────────────────────────┼──────────────────────────────────────────────┤
 │ Teachers │ GET /teachers                    │ 公开列表（支持 search/tag 筛选/分页）        │
 ├──────────┼──────────────────────────────────┼──────────────────────────────────────────────┤
 │          │ GET /teachers/:id                │ 详情（含 reviews、computed availableSlots）  │
 ├──────────┼──────────────────────────────────┼──────────────────────────────────────────────┤
 │          │ PUT /teachers/me/availability    │ 保存 weeklySlots                             │
 ├──────────┼──────────────────────────────────┼──────────────────────────────────────────────┤
 │          │ GET /teachers/me/bookings        │ 老师视角的预约列表（含                       │
 │          │                                  │ pending/confirmed/...）                      │
 ├──────────┼──────────────────────────────────┼──────────────────────────────────────────────┤
 │ Bookings │ POST /bookings                   │ 学生创建（事务校验 slotTime 是否冲突，状态写 │
 │          │                                  │  PENDING）                                   │
 ├──────────┼──────────────────────────────────┼──────────────────────────────────────────────┤
 │          │ GET /bookings                    │ 当前用户的预约（按 role 过滤）               │
 ├──────────┼──────────────────────────────────┼──────────────────────────────────────────────┤
 │          │ POST /bookings/:id/accept        │ 老师接受，body 含 meetingUrl（必填）         │
 ├──────────┼──────────────────────────────────┼──────────────────────────────────────────────┤
 │          │ POST /bookings/:id/reject        │ 老师拒绝，body 含 rejectionReason            │
 ├──────────┼──────────────────────────────────┼──────────────────────────────────────────────┤
 │          │ POST /bookings/:id/cancel        │ 学生或老师取消                               │
 ├──────────┼──────────────────────────────────┼──────────────────────────────────────────────┤
 │ Reviews  │ POST /reviews                    │ 课程完成后学生提交（事务更新 ratingAvg）     │
 ├──────────┼──────────────────────────────────┼──────────────────────────────────────────────┤
 │ AI       │ POST /ai/match                   │ 接受学生需求文本，调用 Gemini，返回推荐      │
 │          │                                  │ teacher IDs                                  │
 ├──────────┼──────────────────────────────────┼──────────────────────────────────────────────┤
 │ Admin    │ GET                              │ 待审核列表                                   │
 │          │ /admin/teachers?status=pending   │                                              │
 ├──────────┼──────────────────────────────────┼──────────────────────────────────────────────┤
 │          │ POST /admin/teachers/:id/approve │ 通过                                         │
 ├──────────┼──────────────────────────────────┼──────────────────────────────────────────────┤
 │          │ POST /admin/teachers/:id/reject  │ 驳回                                         │
 ├──────────┼──────────────────────────────────┼──────────────────────────────────────────────┤
 │ Uploads  │ POST /uploads/presign            │ 返回 S3/R2 预签名 URL（Phase 2）             │
 └──────────┴──────────────────────────────────┴──────────────────────────────────────────────┘

 统一约定：
 - 错误响应：{ statusCode, message, error }（NestJS 内置）
 - 列表分页：?page=1&pageSize=20，返回 { data, total, page, pageSize }
 - 时间字段：ISO 8601 UTC

 ---
 四、认证流程

 - 密码：bcrypt rounds=12
 - Access Token：JWT HS256，15 分钟，放 Authorization Bearer
 - Refresh Token：随机 256-bit，30 天，httpOnly + Secure + SameSite=Lax cookie，存哈希到 DB，每次
 refresh 轮转（旧的立即吊销）
 - 角色守卫：@Roles('TEACHER') + RolesGuard
 - 公开路由：@Public() 装饰器（默认全部需要登录）

 ---
 五、关键业务逻辑

 5.1 预约状态机（后端权威）

 [空闲时段]
    ↓ POST /bookings (学生)        事务：检查 @@unique([teacherId, slotTime])
 PENDING
    ├─ POST /accept (老师)         检查 booking.teacherId === user.id，写 meetingUrl
    │     ↓
    │  CONFIRMED ──→ 发送邮件 + WebSocket push 给学生
    │     ↓ (slotTime + duration < now)
    │  COMPLETED  (定时任务)
    │
    └─ POST /reject 或 POST /cancel
         ↓
      CANCELLED ──→ 发邮件 + slot 自动重新可用（因为它不在 WeeklySlot 模板里被占用）

 5.2 availableSlots 计算

 - 不存 availableSlots 字段（避免数据冗余）
 - GET /teachers/:id 实时计算：未来 4 周 × WeeklySlot 模板 × （减去 status IN [PENDING, CONFIRMED]
  的 Booking.slotTime）
 - 简单 + 一致

 5.3 AI 推荐网关

 - 前端 AIMatch.tsx 当前的本地 mock 改为 POST /ai/match { goals: string, level?: string }
 - 后端持 GEMINI_API_KEY（仅 .env），调用 @google/genai，返回 { teacherIds: string[], reasoning:
 string }
 - 配 rate limit（每用户每小时 10 次）

 ---
 六、Phased Implementation

 Phase 0 — Foundation（1-2 天）

 - nest new server → 安装 Prisma、class-validator、@nestjs/jwt、@nestjs/passport、bcrypt
 - 写 prisma/schema.prisma，跑 prisma migrate dev
 - docker-compose.yml：postgres + （Phase 2 时再加 redis）
 - 配置 ESLint/Prettier，pre-commit hook
 - .env.example：DATABASE_URL / JWT_SECRET / GEMINI_API_KEY / RESEND_API_KEY / CORS_ORIGIN

 Phase 1 — MVP Core（约 1 周）

 1. Auth 模块（register/login/refresh/logout/me + JWT/Roles guards）
 2. Users 模块（GET/PATCH me、student/teacher 子 profile）
 3. Teachers 模块（列表、详情、availability 增删改、availableSlots 计算）
 4. Bookings 模块（状态机、事务、@@unique 兜底）
 5. Reviews 模块
 6. Resend 邮件服务（预约创建、接受、拒绝、提醒）
 7. 种子脚本：把现有 src/data/teachers.json 4 位老师导入 DB
 8. 前端集成：
   - npm i @tanstack/react-query axios
   - 新建 src/lib/api.ts（axios + 拦截器自动 refresh）
   - 替换 useAuthStore → React Query mutations + 轻量 useAuth() hook（user 存内存）
   - 替换 useTeachersStore / useStore.bookedLessons → React Query
 查询（['teachers']、['bookings']）
   - 保留 userTimezone 在 localStorage（UI 偏好）
   - Vite .env.development：VITE_API_BASE_URL=http://localhost:3000/api/v1

 Phase 2 — Production Features（约 1-2 周）

 - 文件上传：Cloudflare R2 / S3 预签名 URL（视频/头像）
 - WebSocket（@nestjs/websockets + Socket.io）：预约状态变更推送给在线用户
 - BullMQ + Redis 定时任务：
   - 课前 24h / 1h 邮件提醒
   - 课程结束自动标记 COMPLETED
 - AI 网关（Gemini，rate-limited）
 - 管理后台 API（老师审核）
 - Notifications 表 + GET /notifications

 Phase 3 — Deployment（3-5 天）

 - 多阶段 Dockerfile（builder → runner，Alpine 镜像）
 - GitHub Actions：lint + test + build + Docker push
 - Railway/Fly.io 部署：
   - Postgres: Supabase 或 Neon（免费层 + 自动备份）
   - Redis: Upstash（serverless 计费）
   - 文件存储: Cloudflare R2（无出站费用）
   - 邮件: Resend（3k/月免费）
   - 监控: Sentry（错误）+ Logflare/Better Stack（日志）
 - 域名 + HTTPS（Cloudflare）

 ---
 七、安全清单

 - bcrypt 密码哈希（rounds 12）
 - JWT 短期 + refresh rotation
 - helmet 中间件
 - CORS 白名单（只允许前端域名）
 - @nestjs/throttler 全局 rate limit（默认 100/min/IP），登录 5/min/IP
 - class-validator 全局 ValidationPipe（whitelist + forbidNonWhitelisted）
 - Prisma 参数化查询天然防 SQL 注入
 - 用户输入 HTML 字段（intro/comment）经 sanitize-html 处理
 - 文件上传：白名单 MIME + 大小限制
 - httpOnly + Secure + SameSite cookie
 - 生产强制 HTTPS（reverse proxy 层）
 - 关键操作审计日志（老师审核、预约状态变更）

 ---
 八、测试策略

 - 单元测试（Vitest）：service 层业务逻辑（特别是预约状态机），mock Prisma
 - 集成测试（Supertest + @nestjs/testing）：覆盖关键 controller 流程
 - e2e：跑真实 DB（Docker testcontainer），覆盖：注册 → 学生预约 → 老师接受 → 完成 → 评价
 - 测试数据：prisma/seed.ts + 单独 test.sql snapshot

 ---
 九、需要改动的前端文件（Phase 1）

 ┌───────────────────────────────────────────┬─────────────────────────────────────────────────┐
 │                   文件                    │                      改动                       │
 ├───────────────────────────────────────────┼─────────────────────────────────────────────────┤
 │ src/store/useAuthStore.ts                 │ 改为对接 /auth/*，去掉 MOCK_USERS               │
 ├───────────────────────────────────────────┼─────────────────────────────────────────────────┤
 │ src/store/useStore.ts                     │ bookedLessons 移除，改用 React Query            │
 │                                           │ useBookings()                                   │
 ├───────────────────────────────────────────┼─────────────────────────────────────────────────┤
 │ src/store/useTeachersStore.ts             │ 移除种子数据，改用 React Query useTeachers()    │
 ├───────────────────────────────────────────┼─────────────────────────────────────────────────┤
 │ src/pages/TeacherDetail.tsx               │ handleBook 调 POST /bookings，乐观更新缓存      │
 ├───────────────────────────────────────────┼─────────────────────────────────────────────────┤
 │ src/pages/teacher/TeacherBookings.tsx     │ updateLesson 改为 POST /bookings/:id/accept 等  │
 │                                           │ API                                             │
 ├───────────────────────────────────────────┼─────────────────────────────────────────────────┤
 │ src/pages/teacher/TeacherAvailability.tsx │ save 调 PUT /teachers/me/availability           │
 ├───────────────────────────────────────────┼─────────────────────────────────────────────────┤
 │ src/pages/AIMatch.tsx                     │ 真实调 POST /ai/match                           │
 ├───────────────────────────────────────────┼─────────────────────────────────────────────────┤
 │ src/pages/teacher/TeacherProfile.tsx      │ 视频改为预签名上传到 R2                         │
 ├───────────────────────────────────────────┼─────────────────────────────────────────────────┤
 │ src/lib/api.ts （新增）                   │ axios 实例 + token 拦截器                       │
 ├───────────────────────────────────────────┼─────────────────────────────────────────────────┤
 │ src/hooks/useAuth.ts （新增）             │ 轻量认证 hook                                   │
 ├───────────────────────────────────────────┼─────────────────────────────────────────────────┤
 │ vite.config.ts                            │ 删除 GEMINI_API_KEY 注入，改用                  │
 │                                           │ VITE_API_BASE_URL                               │
 ├───────────────────────────────────────────┼─────────────────────────────────────────────────┤
 │ .env.development                          │ VITE_API_BASE_URL=http://localhost:3000/api/v1  │
 └───────────────────────────────────────────┴─────────────────────────────────────────────────┘

 ---
 十、关键风险与对策

 ┌──────────────────────────────┬──────────────────────────────────────────────────┐
 │             风险             │                       对策                       │
 ├──────────────────────────────┼──────────────────────────────────────────────────┤
 │ 预约同一时段双重创建         │ DB @@unique([teacherId, slotTime]) + Prisma 事务 │
 ├──────────────────────────────┼──────────────────────────────────────────────────┤
 │ Refresh token 泄露后被滥用   │ 轮转 + 设备指纹（可选）+ 主动吊销 API            │
 ├──────────────────────────────┼──────────────────────────────────────────────────┤
 │ 视频上传带宽消耗             │ 预签名直传 R2，后端不过流                        │
 ├──────────────────────────────┼──────────────────────────────────────────────────┤
 │ Gemini API key 泄露          │ 后端代理 + 限流 + 不返回原始 prompt              │
 ├──────────────────────────────┼──────────────────────────────────────────────────┤
 │ 时区错乱                     │ 数据库统一存 UTC，前端按 userTimezone 渲染       │
 ├──────────────────────────────┼──────────────────────────────────────────────────┤
 │ 旧 localStorage 缓存冲突迁移 │ 检测到 token 但 /auth/me 401 时清掉本地状态      │
 └──────────────────────────────┴──────────────────────────────────────────────────┘

 ---
 十一、Verification（端到端）

 1. 本地启动：cd server && docker-compose up -d && pnpm prisma migrate dev && pnpm seed && pnpm
 dev，前端 npm run dev
 2. 健康检查：curl http://localhost:3000/api/v1/health 返回 200
 3. 注册学生 + 登录：前端注册流程，DB 出现 User + StudentProfile
 4. 创建预约：选时段提交 → DB Booking.status=PENDING + 邮件已发送（Resend dashboard 可见）
 5. 老师接受：切到老师账号 → 接受 + 填腾讯会议链接 → DB status=CONFIRMED + meetingUrl 写入
 6. 学生查看：「我的课程」状态为已确认，弹框显示链接（已有功能复用）
 7. 拒绝场景：另一笔预约 → 拒绝 + reason → DB CANCELLED + rejectionReason
 8. 冲突测试：开两个浏览器同时抢同一时段 → 仅一笔成功，另一笔 409
 9. 跑测试：pnpm test + pnpm test:e2e 全绿
 10. Docker 构建：docker build -t tutor-api ./server && docker run -p 3000:3000 tutor-api 起得来
 11. 部署 preview：push 一个 branch → GitHub Action 自动跑 → Railway/Fly 预览环境就绪

 ---
 工作量估算

 - Phase 0：1-2 天（项目初始化、Prisma schema、Docker）
 - Phase 1：5-7 天（核心 API + 前端切换 + 邮件）
 - Phase 2：7-10 天（文件、WS、定时任务、AI、管理）
 - Phase 3：3-5 天（Docker、CI、部署、监控）
 - 总计：约 3-4 周（1 人全职）
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌