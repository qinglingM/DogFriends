# DogFriends 短信登录部署

前端代码已接入 `sms-otp`。真实短信可用前仍需完成以下云端配置。

1. 创建或选择 DogFriends 自己的 Supabase 项目。
2. 将 `config.toml` 的 `project_id` 改为该项目 Ref，或运行：

   ```bash
   supabase link --project-ref <project-ref>
   ```

3. 配置函数 Secrets：

   ```bash
   supabase secrets set \
     ALIYUN_ACCESS_KEY_ID='<access-key-id>' \
     ALIYUN_ACCESS_KEY_SECRET='<access-key-secret>' \
     ALIYUN_SMS_SIGN_NAME_B64='<base64-sign-name>' \
     ALIYUN_SMS_TEMPLATE_CODE='<template-code>' \
     ALIYUN_OTP_HMAC_SECRET='<random-secret>' \
     ALLOWED_ORIGINS='http://localhost:8081,https://your-production-domain'
   ```

   `SUPABASE_URL`、`SUPABASE_ANON_KEY` 和 `SUPABASE_SERVICE_ROLE_KEY`
   通常由 Supabase 自动注入。

4. 执行数据库迁移并部署函数：

   ```bash
   supabase db push
   supabase functions deploy sms-otp --no-verify-jwt
   ```

5. 从 `expo-app/.env.example` 创建 `expo-app/.env.local`，填入项目 URL
   和 Anon/Publishable Key，然后重新启动 Expo。

阿里云模板参数必须包含 `code` 和 `min`。如模板只有 `code`，同步删除
函数 `TemplateParam` 中的 `min`。
