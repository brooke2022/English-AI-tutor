# 部署指南（Phase 3）

完整的生产部署 runbook。覆盖 **Fly.io**（推荐，全球边缘）和 **Railway**（一键 GitHub 部署）两条路径。

---

## 一、托管服务准备清单

启动前确保已注册并拿到下列资源的连接串/Key（全部都有免费层）：

| 用途 | 推荐服务 | 备注 |
|------|----------|------|
| Postgres | [Supabase](https://supabase.com/) 或 [Neon](https://neon.tech/) | 复制 `DATABASE_URL` |
| Redis | [Upstash](https://upstash.com/) | 用 `rediss://` 串（TLS）|
| 对象存储 | [Cloudflare R2](https://developers.cloudflare.com/r2/) | 出站免费；创建桶 + S3 凭证 |
| 邮件 | [Resend](https://resend.com/) | 验证你的域名后取 API key |
| AI | [Google AI Studio](https://aistudio.google.com/) | 复制 Gemini API key |
| 错误监控 | [Sentry](https://sentry.io/) | 可选，Phase 4 接入 |

把每一项复制到 `server/.env.production.example` 的对应字段，整理出最终 `.env`。

---

## 二、Fly.io 部署（推荐）

```bash
# 0. 装 flyctl
brew install flyctl
fly auth login

# 1. 部署后端
cd server
fly launch --copy-config --no-deploy   # 读取 fly.toml；过程中会问要不要建 Postgres，选 N（我们用 Supabase）

# 2. 配置 secrets（一次性）
fly secrets set \
  DATABASE_URL="postgresql://..." \
  JWT_SECRET="$(openssl rand -base64 48)" \
  CORS_ORIGIN="https://tutor-web.fly.dev" \
  COOKIE_DOMAIN=".fly.dev" \
  REDIS_URL="rediss://..." \
  RESEND_API_KEY="..." \
  RESEND_FROM="notifications@yourdomain.com" \
  GEMINI_API_KEY="..." \
  S3_ENDPOINT="https://<account>.r2.cloudflarestorage.com" \
  S3_REGION="auto" \
  S3_BUCKET="tutor-uploads" \
  S3_ACCESS_KEY_ID="..." \
  S3_SECRET_ACCESS_KEY="..." \
  S3_PUBLIC_BASE_URL="https://pub-<id>.r2.dev"

# 3. 首次部署
fly deploy

# 4. 部署前端（另一个 app）
cd ..
fly launch --copy-config --no-deploy --name tutor-web
fly deploy --build-arg VITE_API_BASE_URL=https://tutor-api.fly.dev/api/v1
```

启动时 `Dockerfile` 的 CMD 会自动跑 `prisma migrate deploy` 应用所有 pending migration。

---

## 三、Railway 部署

```bash
# 1. 装 CLI
npm i -g @railway/cli
railway login

# 2. 把当前仓库链接到一个新 project
railway init

# 3. 创建后端服务（指向 server/ 目录）
railway up --service api --root server

# 4. 在 Railway dashboard：
#    - Settings → Service → Root Directory: server
#    - Variables → 粘贴 .env.production 的内容（推荐用 raw editor 一次性导入）
#    - Networking → Generate Public Domain

# 5. 创建前端服务（指向根目录）
railway up --service web
# 在 dashboard 设置 Build → Build Args:
#   VITE_API_BASE_URL=https://<api domain>/api/v1
```

`server/railway.json` 里已写好 healthcheckPath（`/api/v1/health`）和重启策略。

---

## 四、首次上线 Checklist

- [ ] 生成强 `JWT_SECRET`（`openssl rand -base64 48`），**绝对不能用 dev 默认值**
- [ ] `CORS_ORIGIN` 设为前端真实域名，**移除 localhost**
- [ ] `COOKIE_DOMAIN` 与前端共享根域（用 fly.dev 时设 `.fly.dev`，自定义域设根域）
- [ ] 验证 Resend 邮件发送域名（DNS 加 DKIM/SPF）
- [ ] R2 桶设置允许的 CORS（PUT 来源限制为后端域名）
- [ ] Supabase/Neon 启用 connection pooler（Prisma 走 pgbouncer 端口 6543）
- [ ] 部署后访问 `/api/v1/health` 返回 `{"status":"ok","db":"up"}`
- [ ] 跑一个端到端预约 → 接受 → 收到邮件 +「进入教室」按钮可用

---

## 五、回滚与运维

### 回滚到上一版本
```bash
# Fly
fly releases               # 看版本号
fly releases rollback v123 # 一键回滚

# Railway
# Dashboard → Deployments → 找到旧版本 → Redeploy
```

### 滚动迁移（schema 变更）
1. **向后兼容的 schema 变更**（加列、加表、加索引）：直接 `prisma migrate deploy`，部署即可
2. **破坏性变更**（删列、改类型、改非空）：
   - Step 1: 先发包含**双写**逻辑的代码（同时写新旧字段）
   - Step 2: 部署后跑数据回填
   - Step 3: 再发去掉旧字段的代码 + migration

### 灾备
- **数据库**：Supabase / Neon 自动每日快照，保留 7 天；定期 `pg_dump` 到 R2
- **R2 文件**：开启 R2 的 lifecycle，加版本控制
- **机密轮换**：`JWT_SECRET` 每 90 天轮换一次（轮换时 refresh token 全部失效，所有用户重新登录）

---

## 六、监控钩点（Phase 4 接入清单）

代码已经预留这些插桩点，Phase 4 部署 Sentry 时只需注入：

| 位置 | 已有 | 待加 |
|------|------|------|
| `server/src/main.ts` | NestJS exception filter（默认） | `Sentry.init()` |
| `server/src/jobs/jobs.service.ts` | logger.error 已埋 | Sentry breadcrumbs |
| 前端 `src/lib/api.ts` | axios 错误返回 | Sentry browser SDK + replays |
| `health/health.controller.ts` | DB 探活 | 加 Redis 探活、外部 API 探活 |

---

## 七、自定义域名

```bash
# Fly：
fly certs add api.yourdomain.com -a tutor-api
fly certs add app.yourdomain.com -a tutor-web
# 然后在 DNS 提供商加 CNAME 指向 <app>.fly.dev

# Railway：在 dashboard → Settings → Networking → Custom Domain
```

之后**记得**更新：
- 前端 `VITE_API_BASE_URL` 重新 build 一次
- 后端 `CORS_ORIGIN` + `COOKIE_DOMAIN`

---

## 八、常见故障排查

| 症状 | 原因 | 解决 |
|------|------|------|
| 登录后立即被踢 | `COOKIE_DOMAIN` 不匹配或 `secure=true` 但还在 http | 检查 cookie domain；本地用 `localhost` 不能设 secure |
| WebSocket 连接失败 | 反代未转发 upgrade header | nginx/CDN 需要 `proxy_http_version 1.1` 和 `Upgrade` header |
| `prisma migrate deploy` 报锁 | 多副本同时启动 | 在部署管道里加 single-replica migration step |
| Bookings 重复创建 | 并发请求绕过校验 | 已用 `@@unique([teacherId, slotTime])`，DB 层兜底 |
| 上传 PUT 403 | R2 CORS 没配 | R2 桶 → Settings → CORS Policy 加 PUT + 来源域 |
