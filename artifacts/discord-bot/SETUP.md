# Member Grow Bot — Setup Guide
**Made by Stichachu13**

## Quick Start

### 1. Add your Discord Token
Open the `.env` file and replace the placeholder:
```
DISCORD_TOKEN=your_actual_bot_token_here
```

### 2. Run Locally
```bash
npm install
npm start
```

---

## Hosting on Railway

1. Push this folder to a GitHub repository
2. Go to [railway.app](https://railway.app) and create a new project from GitHub
3. Add your environment variable:
   - Key: `DISCORD_TOKEN`
   - Value: your bot token
4. Railway will auto-detect and run `node src/index.js`

**Optional env vars:**
```
DISCORD_TOKEN=your_token        # Required
OWNER_ID=your_discord_id        # For owner-only commands (!eval, !blacklist, !setstatus)
```

---

## Bot Setup (First Time in Your Server)

Run these as an admin after inviting the bot:

| Feature | Command |
|---------|---------|
| Welcome messages | `!setwelcome #channel` |
| Farewell messages | `!setfarewell #channel` |
| Auto role | `!setautorole @role` |
| Ticket system | `!ticketsetup #channel` |
| Logging | `!setlog #channel` |
| Leveling announcements | `!levelchannel #channel` |
| Starboard | `!setstarboard #channel` |
| AutoMod | `!antilink` / `!antispam` / etc. |
| Custom prefix | `!setprefix ?` |

---

## Command Categories (356 commands)

| Category | Commands | Description |
|----------|----------|-------------|
| Moderation | 38 | ban, kick, mute, warn, purge, lock... |
| Utility | 42 | ping, help, serverinfo, userinfo... |
| Fun | 42 | 8ball, coinflip, roast, trivia... |
| Economy | 27 | balance, daily, work, rob, shop... |
| Social | 28 | hug, kiss, slap, pat, dance... |
| Leveling | 18 | rank, xp, setlevel, levelroles... |
| Games | 12 | trivia, hangman, tictactoe, duel... |
| Polls | 11 | poll, quickpoll, suggest... |
| Tickets | 14 | ticketsetup, closeticket... |
| Giveaways | 10 | gcreate, gend, greroll... |
| Reaction Roles | 10 | rradd, rrcreate, rrverify... |
| Tags | 10 | tag, addtag, edittag... |
| AutoMod | 16 | antilink, antispam, badwords... |
| Logging | 11 | setlog, logevent, logsettings... |
| Starboard | 8 | setstarboard, starboardmin... |
| Welcome | 14 | setwelcome, setautorole... |
| Reminders | 6 | remind, reminders, delreminder... |
| Misc | 18 | binary, morse, passwordgen... |
| Info | 21 | botinfo, credits, changelog... |

---

## Default Prefix
`!` (change with `!setprefix`)

All embeds include **Bot made by Stichachu13** in the footer.
