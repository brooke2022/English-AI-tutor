# English-AI-Tutor Backend

NestJS + Prisma + PostgreSQL backend.

## Quickstart

```bash
# 1. 安装依赖
npm install

# 2. 启动 PostgreSQL
#    选项 A：本机已装 Docker Desktop
npm run db:up
#    选项 B：未装 Docker，可用 Homebrew 装本地 postgres
#      brew install postgresql@16 && brew services start postgresql@16
#      createdb tutor_dev && psql tutor_dev -c "CREATE USER tutor WITH PASSWORD 'tutorpass' SUPERUSER;"
#    选项 C：免费云数据库（Supabase / Neon），把连接串写到 .env 的 DATABASE_URL

# 3. 复制 env 并按需修改（默认值已可直接跑）
cp .env.example .env

# 4. 跑数据库迁移 + seed
npm run prisma:migrate
npm run prisma:seed

# 5. 启动开发服务器
npm run dev
```

API 监听 `http://localhost:4000/api/v1`。

健康检查：
```bash
curl http://localhost:4000/api/v1/health
# → { "status": "ok", "db": "up", ... }
```

## Demo 账号（密码 `password123`，admin 为 `admin123`）

| Email | Role |
|-------|------|
| `student@test.com` | STUDENT |
| `teacher@test.com` | TEACHER（绑定 seed 的第一位老师 Maria Santos）|
| `admin@tutorai.com` | ADMIN |

## 常用命令

| 命令 | 作用 |
|------|------|
| `npm run dev` | NestJS watch 模式启动 |
| `npm run prisma:studio` | 打开 Prisma Studio 图形化查看数据 |
| `npm run prisma:migrate` | 生成并应用 migration |
| `npm run prisma:seed` | 重新跑 seed |
| `npm run db:up` / `db:down` | 启停 postgres 容器 |
| `npm test` | 跑 Vitest 单测 |

## 实施阶段

参考 `/Users/brooke/.claude/plans/booking-workflow-tender-waffle.md`：
- ✅ **Phase 0** — 项目骨架（当前阶段）
- ⏳ Phase 1 — Auth + Users + Teachers + Bookings + Reviews + 邮件 + 前端集成
- ⏳ Phase 2 — 文件上传 + WebSocket + 定时任务 + AI 网关 + 管理后台
- ⏳ Phase 3 — Docker 部署 + CI + 监控
