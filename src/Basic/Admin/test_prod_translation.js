(async () => {
  try {
    const url = 'https://jobito-api-production.up.railway.app/translations/batch';
    const body = JSON.stringify({
      texts: ["Name", "Info", "Block", "Suspend"],
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
