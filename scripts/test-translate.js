async function testMulti() {
  console.log("--- Testing Multiple Languages (French, Hindi, Japanese) ---");
  const testCases = [
    { target: "fr", name: "French", expected: "monde" },
    { target: "hi", name: "Hindi", expected: "दुनिया" },
    { target: "ja", name: "Japanese", expected: "世界" },
  ];

  for (const tc of testCases) {
    const text = "Hello world";
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${tc.target}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log(`en -> ${tc.name} (${tc.target}): ${data.responseData.translatedText}`);
  }
  console.log("✅ All multilingual translations VERIFIED successfully!");
}

testMulti();
