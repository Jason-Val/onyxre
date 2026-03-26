// SIMULATION SCRIPT
// Run this to test your webhook handlers locally or against Vercel
// Usage: node test_webhook.js <postId> [service: kie|creatomate] [URL_TO_TEST]

const postId = process.argv[2];
const service = process.argv[3] || 'kie';
const targetUrlParam = process.argv[4];

let targetUrl = targetUrlParam;
if (!targetUrl) {
  targetUrl = service === 'kie' 
    ? 'https://onyxre.vercel.app/api/webhooks/kie' 
    : 'https://onyxre.vercel.app/api/webhooks/creatomate';
}

if (!postId) {
  console.error("Please provide a postId: node test_webhook.js <postId>");
  process.exit(1);
}

const kiePayload = {
  data: {
    video_url: "https://creatomate.com/files/assets/eb8f9e61-6d7c-4c6e-8d5f-1ae6d4f7e2c9",
    status: "completed"
  }
};

const creatomatePayload = {
  status: "succeeded",
  url: "https://creatomate.com/renders/final-video-id.mp4"
};

async function testKie(index) {
  const url = `${targetUrl}?postId=${postId}&index=${index}`;
  console.log(`Testing KIE index ${index} -> ${url}`);
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(kiePayload)
  });
  
  const result = await res.json();
  console.log(`Response ${index}:`, JSON.stringify(result, null, 2));
}

async function testCreatomate() {
  const url = `${targetUrl}?postId=${postId}`;
  console.log(`Testing CREATOMATE -> ${url}`);
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(creatomatePayload)
  });
  
  const result = await res.json();
  console.log(`Creatomate Response:`, JSON.stringify(result, null, 2));
}

async function run() {
  if (service === 'kie') {
    console.log("Simulating 3 Kie.ai callbacks...");
    await testKie(0);
    await testKie(1);
    await testKie(2);
  } else {
    console.log("Simulating Creatomate completion...");
    await testCreatomate();
  }
  console.log("Done.");
}

run();
