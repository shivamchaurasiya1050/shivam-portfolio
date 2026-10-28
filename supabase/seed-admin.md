# Create your admin login securely

Do **not** hardcode an email/password in frontend source or seed SQL. A password in a public file or Git repository can be stolen. Supabase Auth stores password hashes and handles login securely.

1. Open Supabase Dashboard → Authentication → Users.
2. Choose **Add user** / **Create new user**.
3. Enter your own email and create a strong, unique password. If available, confirm the user as verified for your own project.
4. Copy the exact lowercase email into `supabase/schema.sql`, replacing all instances of `YOUR_ADMIN_EMAIL@example.com`.
5. Run the SQL file in SQL Editor. If you already ran it before replacing the email, rerun the three admin policy statements after editing the email.
6. Sign in at `/admin` using that email and password.

The database policies are the real access control. Hiding the admin link or adding a frontend password is not security. Never use the Supabase service-role/secret key in browser code.

If you want repeatable local development, use a server-side Supabase seed for non-secret starter project data, and create the Auth admin through the dashboard or a trusted server-side admin API. Do not put a real password in a committed seed file.