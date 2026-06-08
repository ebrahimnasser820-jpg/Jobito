(async () => {
  try {
    const url = 'http://localhost:3000/translations/batch';
    const body = JSON.stringify({
      texts: ["Super Admin", "Operations Monitor", "User Management", "Technical Support", "Content Moderation", "Company Review", "System Requests"],
      target_lang: "ar"
    });
    console.log("Sending batch request to:", url);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });
    console.log("Response Status:", res.status);
    const data = await res.json();
    console.log("Response Data:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Test Request Failed:", err);
  }
})();
