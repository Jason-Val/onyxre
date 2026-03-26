// SIMULATION SCRIPT
// Run this to test your webhook handler locally or against Vercel
// Usage: node test_webhook.js <postId> <URL_TO_TEST>

const postId = process.argv[2];
const targetUrl = process.argv[3] || 'http://localhost:3000/api/webhooks/kie';

if (!postId) {
  console.error("Please provide a postId: node test_webhook.js <postId>");
  process.exit(1);
}

const payload = {
  data: {
    video_url: "https://creatomate.com/files/assets/eb8f9e61-6d7c-4c6e-8d5f-1ae6d4f7e2c9",
    status: "completed"
  }
};

async function testIndex(index) {
  const url = `${targetUrl}?postId=${postId}&index=${index}`;
  console.log(`Testing index ${index} -> ${url}`);
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const result = await res.json();
    console.log(`Response ${index}:`, JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(`Error index ${index}:`, err.message);
  }
}

async function run() {
  console.log("Simulating 3 callbacks...");
  await testIndex(0);
  await testIndex(1);
  await testIndex(2);
  console.log("Done.");
}

run();
