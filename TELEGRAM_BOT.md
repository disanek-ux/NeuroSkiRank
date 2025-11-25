# Telegram Bot Integration Guide

This guide explains how to integrate NeuroSciRank with a Telegram Bot as a WebApp.

## What is a Telegram WebApp?

A Telegram WebApp is a web application that runs inside Telegram. Users can:
- Click a button in the bot to open your app
- Use the app inside Telegram without leaving the app
- Share results back to Telegram

## Quick Setup (5 minutes)

### Step 1: Create a Bot

1. Open Telegram
2. Search for **@BotFather**
3. Send `/newbot`
4. Follow the prompts:
   - **What should your bot be called?** → `NeuroSciRank` (or your name)
   - **Give your bot a username** → `neurosci_rank_bot` (must be unique, end with `_bot`)
5. You'll receive a **Token** - save it!

Example: `123456789:ABCdefGHIjklmnoPQRstuvWXYZ`

### Step 2: Set Menu Button

1. Send `/setmenubutton` to @BotFather
2. Select your bot from the list
3. Choose **"Web App"** option
4. Enter the app URL: `https://neurosci-rank.netlify.app`
5. Enter button label: `Open App`

### Step 3: Test Your Bot

1. Search for your bot in Telegram (e.g., `@neurosci_rank_bot`)
2. Click the **"Open App"** button
3. Your app should open inside Telegram! 🎉

## Advanced Setup

### Option 1: Add Welcome Message

Send `/start` command to @BotFather to add a welcome message:

```
/setdescription
Select your bot
Enter: "Discover and rank neuroscience research. Add your publications and see your impact!"
```

### Option 2: Add Bot Commands

Send `/setcommands` to @BotFather:

```
/setcommands
Select your bot
Enter:
start - Open the app
help - Get help
about - About NeuroSciRank
```

Then in your bot code, you can handle these commands.

### Option 3: Add Bot Avatar

Send `/setuserpic` to @BotFather to add a bot profile picture.

## Telegram WebApp Features

Your app automatically gets access to Telegram data:

```javascript
// In your app, you can access:
window.Telegram.WebApp.user // Current user info
window.Telegram.WebApp.initData // Verification data
window.Telegram.WebApp.close() // Close the app
window.Telegram.WebApp.showAlert("Message") // Show alert
```

However, NeuroSciRank uses its own authentication (Manus OAuth), so you don't need to use Telegram's user data.

## Sharing Results

Users can share their profile or ranking position back to Telegram:

```javascript
// Example: Share profile link
const shareText = `Check out my NeuroSciRank profile! https://neurosci-rank.netlify.app/users/123`;
window.Telegram.WebApp.shareToChat({
  text: shareText
});
```

## Troubleshooting

### Bot doesn't show "Open App" button

**Solution:**
1. Make sure you ran `/setmenubutton` correctly
2. Verify the URL is correct (must be HTTPS)
3. Try `/start` to see the bot menu
4. Restart Telegram

### App opens but shows blank page

**Solution:**
1. Check that your Netlify URL is correct
2. Verify frontend environment variables are set
3. Check browser console for errors (F12)
4. Try hard refresh (Ctrl+Shift+R)

### Can't access bot

**Solution:**
1. Make sure bot username is unique
2. Try searching for `@your_bot_username`
3. Check that bot is active (not deleted)

## Monetization (Optional)

Telegram supports in-app purchases through bots. You could add:
- Premium features
- Ad-free experience
- Advanced analytics

See [Telegram Bot API Documentation](https://core.telegram.org/bots/webapps) for details.

## Analytics

Track how users access your app:

1. **From Telegram:** Users click the menu button
2. **Direct:** Users visit the Netlify URL directly
3. **Mobile:** Telegram WebApp works on mobile too

You can track this with:
```javascript
// Check if running in Telegram
if (window.Telegram?.WebApp) {
  console.log("Running in Telegram");
  // Track in your analytics
}
```

## Best Practices

1. **Mobile-First Design:** Telegram is mostly mobile, so ensure responsive design ✅ (already done)
2. **Fast Loading:** Keep app lightweight for mobile users ✅
3. **Clear Navigation:** Users should understand how to use your app ✅
4. **Privacy:** Don't request unnecessary permissions
5. **Testing:** Test on actual Telegram (both mobile and desktop)

## Next Steps

1. ✅ Create bot with @BotFather
2. ✅ Set menu button to your Netlify URL
3. ✅ Test in Telegram
4. 🔄 Share bot link with friends
5. 🔄 Monitor usage and feedback
6. 🔄 Add more features based on user feedback

## Resources

- [Telegram Bot API](https://core.telegram.org/bots)
- [Telegram WebApp Documentation](https://core.telegram.org/bots/webapps)
- [BotFather Commands](https://core.telegram.org/bots#botfather)

---

## Example Bot Link

Once your bot is set up, share this link:

```
https://t.me/your_bot_username?start=app
```

Users can click this link to open your bot directly!

---

**Enjoy your Telegram WebApp! 🚀**
