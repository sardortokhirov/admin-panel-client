# APK/Link Bot – Frontend Spec (New Admin Page)

Use this spec to build a **new, dedicated admin page** to control the APK/Link distribution bot. The bot distributes platform links and APK files in Telegram (private chats and groups). This page is the only place to configure the bot, its platforms, and keywords.

---

## 1. Base URL and auth

- **Base path:** `GET /api/apk-link-bot` (same origin as your existing API).
- **Auth:** Same Basic auth as the rest of the admin API.
  - Header: `Authorization: Basic <base64(username:password)>`
  - Use the same admin credentials you already use for other admin endpoints (e.g. users, etc.).
- **CORS:** Backend allows `*` for `CrossOrigin` on this controller.

---

## 2. API endpoints

All responses use JSON unless noted. On auth failure you get `401 Unauthorized` with body `"Unauthorized"`.

### 2.1 Bot config

**GET `/api/apk-link-bot/config`**

- Returns current bot config. Token is **masked** (e.g. `1234***5678`).
- **Response 200:** JSON
  ```json
  {
    "botTokenMasked": "1234***5678",
    "cooldownPrivateMinutes": 1440,
    "cooldownGroupMinutes": 60,
    "channelKeywordAllApk": "apk",
    "groupKeywordAllApk": "apk",
    "apkChannelChatId": -1001234567890,
    "apkChannelMessageId": 42,
    "apkChannelMessageLink": "https://t.me/c/1234567890/42",
    "mainApkChannelChatId": -1001234567890
  }
  ```
  - `channelKeywordAllApk`: keyword that in the **main channel** triggers the bot to send all APKs and save the message link. Admin sets this.
  - `groupKeywordAllApk`: keyword that in a **group** triggers the bot to send the stored APK channel link (all APKs in one go). Admin sets this.
  - `apkChannelChatId`, `apkChannelMessageId`, `apkChannelMessageLink`: **read-only**. Set by the bot when an admin posts the channel keyword in the main channel; this is the message link where users are redirected when they tap "APK" in private. Display `apkChannelMessageLink` as **"Main channel link"** (read-only). Any of these can be `null` if not yet set.
  - `mainApkChannelChatId`: **main channel for APK**. Only this channel may trigger "send all APKs" when the keyword is posted; other channels are ignored. Set via `PUT /config/main-apk-channel`. If `null`, the first channel where the keyword is posted becomes main automatically. Users tapping APK in private are redirected to `apkChannelMessageLink` (the message in this main channel).

**PUT `/api/apk-link-bot/config`**

- Update bot token, cooldowns, and/or channel/group keywords. **Token change takes effect only after app restart** (show a short note on the page). You cannot set `apkChannelChatId` / `apkChannelMessageId` via API; those are set by the bot when it posts in a channel.
- **Request body:** JSON
  ```json
  {
    "botToken": "123456:ABC-DEF...",
    "cooldownPrivateMinutes": 1440,
    "cooldownGroupMinutes": 60,
    "channelKeywordAllApk": "apk",
    "groupKeywordAllApk": "apk"
  }
  ```
  All fields optional; only sent fields are updated.
- **Response 200:** Same shape as GET (with masked token and read-only channel link fields).

**PUT `/api/apk-link-bot/config/main-apk-channel`**

- Set or clear the **main channel for APK**. Only this channel may trigger "send all APKs" when the channel keyword is posted; users tapping APK in private are redirected to the main channel link.
- **Request body:** JSON
  ```json
  { "mainApkChannelChatId": -1001234567890 }
  ```
  or to clear (allow any channel to become main on first keyword post):
  ```json
  { "mainApkChannelChatId": null }
  ```
- **Response 200:** Same shape as GET config (full config with masked token, `mainApkChannelChatId`, and `apkChannelMessageLink`).
- **Response 401:** Unauthorized.

---

### 2.2 Platforms (CRUD)

Platforms are the items users choose in the bot (e.g. "1xbet", "mostbet"). Each has one link URL and one APK (by Telegram `file_id` and/or `apk_url`).

**GET `/api/apk-link-bot/platforms`**

- **Response 200:** Array of platform objects
  ```json
  [
    {
      "id": 1,
      "name": "1xbet",
      "linkUrl": "https://example.com/1x",
      "apkFileId": "BQACAgIAAxkB...",
      "apkUrl": null,
      "sortOrder": 0
    }
  ]
  ```

**POST `/api/apk-link-bot/platforms`**

- Create platform.
- **Request body:** JSON
  ```json
  {
    "name": "1xbet",
    "linkUrl": "https://example.com/1x",
    "apkFileId": "BQACAgIAAxkB...",
    "apkUrl": null,
    "sortOrder": 0
  }
  ```
  - `name`, `linkUrl`: required for the bot to work.
  - `apkFileId`: Telegram file_id of the APK (admin gets it from BotFather or by sending file to bot and using API).
  - `apkUrl`: optional; if no `apkFileId`, bot can send this URL.
  - `sortOrder`: optional number; lower = higher in list (default 0).
- **Response 201:** Created platform object (same shape as in list).

**PUT `/api/apk-link-bot/platforms/{id}`**

- Update platform. `{id}` = path variable (e.g. `1`).
- **Request body:** Same as POST (all fields optional; only provided fields are updated).
- **Response 200:** Updated platform object.
- **Response 404:** Platform not found.

**DELETE `/api/apk-link-bot/platforms/{id}`**

- Delete platform and all its keywords.
- **Response 204:** No content.
- **Response 404:** Platform not found.

---

### 2.3 Keywords (per platform)

Keywords trigger the bot in **groups**: when someone sends a message that matches a keyword (after trim + lower-case), the bot replies with that platform’s link and APK.

**GET `/api/apk-link-bot/platforms/{platformId}/keywords`**

- List keywords for one platform.
- **Response 200:** Array
  ```json
  [
    { "id": 1, "keyword": "1xbet" },
    { "id": 2, "keyword": "1x" }
  ]
  ```
- **Response 404:** Platform not found.

**POST `/api/apk-link-bot/platforms/{platformId}/keywords`**

- Add keyword. Stored normalized (trim + lower-case).
- **Request body:** JSON
  ```json
  { "keyword": "1xbet" }
  ```
- **Response 201:** Created keyword
  ```json
  { "id": 1, "keyword": "1xbet" }
  ```
- **Response 400:** Invalid or duplicate keyword (e.g. empty or already exists for this platform).
- **Response 404:** Platform not found.

**DELETE `/api/apk-link-bot/platforms/{platformId}/keywords/{keyword}`**

- Remove one keyword. `{keyword}` is the exact stored keyword (after normalization it’s lower-case).
- **Response 204:** No content.
- **Response 404:** Keyword or platform not found.

---

### 2.4 Channels and Groups (invite links)

When the user taps **Group/Channel** in the bot, they see buttons that open invite links. Admin configures two separate lists: **channels** and **groups**. Each item has a name and an invite link (e.g. `https://t.me/joinchat/...` or `https://t.me/channelname`).

**Channels**

- **GET `/api/apk-link-bot/channels`** – list all channel invites. **Response 200:** Array of `{ "id": 1, "name": "...", "inviteLink": "https://t.me/...", "type": "CHANNEL", "sortOrder": 0 }`.
- **POST `/api/apk-link-bot/channels`** – create. **Request body:** `{ "name": "...", "inviteLink": "https://t.me/...", "sortOrder": 0 }`. **Response 201:** created object.
- **PUT `/api/apk-link-bot/channels/{id}`** – update. Same body as POST (fields optional). **Response 200:** updated object. **Response 404:** not found.
- **DELETE `/api/apk-link-bot/channels/{id}`** – delete. **Response 204.** **Response 404:** not found.

**Groups**

- **GET `/api/apk-link-bot/groups`** – list all group invites. Same response shape as channels, with `"type": "GROUP"`.
- **POST `/api/apk-link-bot/groups`** – create. Same request body. **Response 201:** created object.
- **PUT `/api/apk-link-bot/groups/{id}`** – update. **Response 200** / **404**.
- **DELETE `/api/apk-link-bot/groups/{id}`** – delete. **Response 204** / **404**.

---

## 3. Suggested page structure (single new page)

Create **one new page** (e.g. “APK/Link Bot” or “Link Bot”) with these sections:

1. **Bot config (top)**
   - Show: masked token, cooldown (private), cooldown (group).
   - Edit: form with Bot Token (password-style), Cooldown private (minutes), Cooldown group (minutes).
   - Note: “Changing the bot token requires an application restart to take effect.”
   - Buttons: Save / Cancel.

2. **Main channel for APK (same page)**
   - Short explanation: “Only this channel can trigger ‘send all APKs’ when the keyword is posted. Users tapping APK in private are redirected to the main channel link below.”
   - **Main channel Chat ID:** input (number; optional). Button to save (calls `PUT /api/apk-link-bot/config/main-apk-channel` with `{ "mainApkChannelChatId": <value> }`). Option to clear (send `null`) so the first channel that posts the keyword becomes main.
   - **Main channel link:** read-only. Show `apkChannelMessageLink` from GET config when present; if null, show “Not set (post the channel keyword in the main channel to generate).”
   - Admin can get the channel Chat ID e.g. by adding the bot to the channel and using a helper bot or docs.

3. **Platforms (main)**
   - List: table or cards with columns like Name, Link URL, APK (file_id/URL), Sort order, Actions (Edit, Delete).
   - Add: “Add platform” opens form/modal with name, linkUrl, apkFileId, apkUrl, sortOrder.
   - Edit: same form, pre-filled; PUT on save.
   - Delete: confirm then DELETE.

4. **Keywords (per platform)**
   - For each platform (or in platform edit view): “Keywords” section.
   - List keywords; “Add keyword” (single field + POST); delete (DELETE by keyword text).
   - Optional: short hint “In groups, when a user sends one of these words, the bot sends this platform’s link and APK.”

5. **Channels and Groups**
   - Two blocks side by side (e.g. **left: Channels**, **right: Groups**).
   - **Channels:** List of channel invites (name, invite link, sort order). Add / Edit / Delete using the channels API above.
   - **Groups:** List of group invites (name, invite link, sort order). Add / Edit / Delete using the groups API above.
   - In the bot, when the user taps “Group/Channel”, they see these as buttons (channels first, then groups); each button opens the invite link.

---

## 4. UX notes for frontend

- **Token:** Never show the raw token; backend only returns `botTokenMasked` on GET. On save you send full `botToken`; after save you can show the masked value again.
- **Cooldowns:** Integers, in **minutes** (e.g. 1440 = 24 hours). You can add labels like “Private chat cooldown (minutes)” and “Group cooldown (minutes)”.
- **Platform sort:** `sortOrder` controls order in the bot’s platform list; you can allow drag-and-drop or a number input.
- **APK:** Either `apkFileId` (Telegram file_id) or `apkUrl` (or both). Explain in UI that `apkFileId` is obtained when the APK is uploaded to Telegram (e.g. via BotFather or your bot).
- **Keywords:** Stored lower-case; duplicate keyword for same platform returns 400. Empty keyword should be rejected (backend may return 400).
- **Errors:** 401 = re-check auth. 404 = resource not found (e.g. wrong platform id). 400 = validation / duplicate; show message from response body if available.

---

## 5. Summary for frontend dev

- **New page:** One dedicated “APK/Link Bot” admin page.
- **API base:** `/api/apk-link-bot`, same auth as existing admin.
- **Sections:** (1) Bot config (token masked, two cooldowns, channel keyword, group keyword), (2) **Main channel for APK** (Main channel Chat ID input + save/clear, **Main channel link** read-only; same page), (3) Platforms CRUD, (4) Keywords per platform, (5) **Channels and Groups** (left: channels list, right: groups list; each with name + invite link + sort order; Add/Edit/Delete for both).
- **Important:** Token change requires app restart; cooldowns in minutes; keywords normalized to lower-case and unique per platform.

If you need more detail on any endpoint or field, use this doc and the backend controller/DTOs as the single source of truth.
